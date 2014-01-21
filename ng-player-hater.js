/**
*
* ngPlayerHater v0.0.6
* 
* Copyright (c) 2013 Chris Rhoden, Public Radio Exchange. All Rights Reserved
* 
* Licensed with the MIT license.
* http://opensource.org/licenses/MIT
*/
!function() {
  var DEBUG;
  !function() {
    "use strict";
    DEBUG = {
      log: function() {
        console.log.apply(console, [ "ngPlayerHater @ " + new Date() ].concat(Array.prototype.slice.call(arguments)));
      },
      instrument: function(method, args) {
        var msg = method + "(";
        args.length && (msg += args.join(", "));
        msg += ")";
        this.log.call(this, "=> " + msg);
      }
    };
  }();
  !function() {
    "use strict";
    var soundManager, Sound, $scope, $q;
    function Song(options) {
      if (arguments.length > 1) {
        // this is a composite song;
        var songs = Array.prototype.slice.call(arguments);
        angular.forEach(songs, function(song, index) {
          song.constructor !== Song && song.constructor !== SongList && (songs[index] = new Song(song));
        });
        return new SongList(songs);
      }
      angular.forEach(options, function(value, key) {
        this[key] = value;
      }, this);
      this.paused = true;
      this._sound = new Sound(options.url);
      bindSound(this);
    }
    Song.prototype.constructor = Song;
    function bindSound(self) {
      $scope.$watch(function() {
        return self._sound.paused;
      }, function(paused) {
        self.paused = paused;
      });
      $scope.$watch(function() {
        return self._sound.position;
      }, function(position) {
        self.position = position;
      });
      $scope.$watch(function() {
        return self._sound.duration;
      }, function(duration) {
        self.duration = duration;
      });
    }
    function proxyToSound(method) {
      return function() {
        return "undefined" !== typeof this._sound ? this._sound[method].apply(this._sound, Array.prototype.slice.call(arguments)) : this.currentSound()[method].apply(this.currentSound(), Array.prototype.slice.call(arguments));
      };
    }
    var methods = [ "play", "stop", "resume", "setPosition", "pause", "load" ];
    for (var i = methods.length - 1; i >= 0; i -= 1) Song.prototype[methods[i]] = proxyToSound(methods[i]);
    function SongList(songs) {
      this._s = songs;
      this._sPos = 0;
      bindSongs(this);
    }
    SongList.prototype = Object.create(Song.prototype);
    SongList.prototype.constructor = SongList;
    SongList.prototype.currentSound = function() {
      return this._s[this._sPos];
    };
    SongList.prototype.play = function(options) {
      return this.load(options).then(function(self) {
        return Song.prototype.play.call(self, options);
      });
    };
    SongList.prototype.load = function(options) {
      options = options || {};
      if ("undefined" !== typeof options.onfinish) {
        var onfinish = options.onfinish;
        delete options.onfinish;
        this._of = this._of || [];
        this._of.push(onfinish);
      }
      var self = this;
      options.onfinish = function() {
        self._sPos += 1;
        if (self._s.length === self._sPos) {
          self._sPos = 0;
          self._of && angular.forEach(self._of, function(callback) {
            callback.call(this, self);
          }, this);
        } else self.currentSound().play();
      };
      var promises = [];
      angular.forEach(this._s, function(song) {
        promises.push(song.load(angular.copy(options)));
      });
      return $q.all(promises).then(function() {
        return self;
      });
    };
    SongList.prototype.setPosition = function(position) {
      var finished = false, returnValue;
      angular.forEach(this._s, function(song, index) {
        if (!finished) if (song.duration >= position) {
          returnValue = song.setPosition(position);
          if (!this.currentSound().paused) {
            this.currentSound().pause();
            song.play();
          }
          this.currentSound().setPosition(0);
          this._sPos = index;
          finished = true;
        } else position -= song.duration;
      }, this);
      return returnValue;
    };
    function bindSongs(self) {
      $scope.$watch(function() {
        return self.currentSound().paused;
      }, function(paused) {
        self.paused = paused;
      });
      $scope.$watch(function() {
        var sum = 0;
        angular.forEach(self._s, function(song, index) {
          index < self._sPos && (sum += song.duration);
        });
        return sum + self.currentSound().position;
      }, function(position) {
        self.position = position;
      });
      $scope.$watch(function() {
        var sum = 0;
        angular.forEach(self._s, function(song) {
          sum += song.duration;
        });
        return sum;
      }, function(duration) {
        self.duration = duration;
      });
    }
    PlayerHaterService.$inject = [ "phSoundManager", "PlayerHaterSound", "$rootScope", "$q" ];
    function PlayerHaterService(phSoundManager, PlayerHaterSound, $rootScope, q) {
      soundManager = phSoundManager;
      Sound = PlayerHaterSound;
      $scope = $rootScope;
      $q = q;
      var self = this;
      this.paused = true;
      $scope.$watch(function() {
        return (self.nowPlaying || {
          paused: true
        }).paused;
      }, function(paused) {
        self.paused = paused;
      });
    }
    PlayerHaterService.prototype.play = function(song) {
      if ("undefined" === typeof song) return this.resume();
      song.constructor !== Song && song.constructor !== SongList && (song = this.newSong(song));
      "undefined" !== typeof this.nowPlaying && this.nowPlaying.stop();
      this.nowPlaying = song;
      this.nowPlaying.play();
      return this.nowPlaying;
    };
    PlayerHaterService.prototype.togglePlayback = function() {
      if (this.nowPlaying) return this.nowPlaying.paused ? this.play() : this.nowPlaying.pause();
    };
    PlayerHaterService.prototype.resume = function() {
      if ("undefined" === typeof this.nowPlaying) throw "No Song Loaded";
      this.nowPlaying.resume();
    };
    PlayerHaterService.prototype.pause = function() {
      soundManager.pauseAll();
    };
    PlayerHaterService.prototype.newSong = function() {
      var song = Object.create(Song.prototype);
      song = Song.apply(song, Array.prototype.slice.apply(arguments)) || song;
      return song;
    };
    PlayerHaterService.prototype.seekTo = function(position) {
      return this.nowPlaying.setPosition(position);
    };
    // PlayerHaterService.prototype.makeSongClass = function (klass) {
    //   if (typeof klass === 'undefined') {
    //     klass = function SongType () {
    //       Song.apply(this, arguments);
    //     };
    //     klass.prototype = angular.copy(Song.prototype);
    //     return klass;
    //   } else if (typeof klass === 'function') {
    //     var klasss = function SongType () {
    //       klass.apply(this, arguments);
    //       var self = this;
    //       $scope.$watch(function() { return self.url }, function (url) {
    //         if (typeof url !== 'undefined') {
    //           self._sound = new Sound(url);
    //         } else {
    //           self._sound = undefined;
    //         }
    //       });
    //       bindSound(this);
    //     };
    //     angular.extend(klasss, klass);
    //     angular.extend(klasss.prototype, klass.prototype);
    //     angular.extend(klasss.prototype, Song.prototype);
    //     return klasss;
    //   }
    // };
    angular.module("ngPlayerHater", [ "phSoundManager" ]).service("playerHater", PlayerHaterService);
  }();
  angular.module("phSoundManager", [ "phSoundManager.service", "phSoundManager.sound" ]);
  !function() {
    "use strict";
    var soundManager2Provider = {
      $get: getSoundManager,
      options: {
        url: "/assets",
        flashVersion: 9,
        preferFlash: false,
        debugMode: false
      }
    };
    function wrapper(promise) {
      return function wrap(functionName) {
        return function() {
          var args = Array.prototype.slice.call(arguments);
          return promise.then(function(obj) {
            return obj[functionName].apply(obj, args);
          });
        };
      };
    }
    getSoundManager.$inject = [ "$q", "$timeout" ];
    function getSoundManager($q, $timeout) {
      var deferred = $q.defer(), wrap = wrapper(deferred.promise), options = soundManager2Provider.options;
      function resolvePromise() {
        $timeout(function() {
          deferred.resolve(window.soundManager);
          "function" === typeof soundManager2Provider.options.originalonready && soundManager2Provider.options.originalonready.call(null);
        });
      }
      resolvePromise._shim = true;
      options.originalonready = "undefined" === typeof options.onready || options.onready._shim ? void 0 : options.onready;
      options.onready = resolvePromise;
      window.soundManager.setup(options);
      return {
        createSound: wrap("createSound"),
        canPlayLink: wrap("canPlayLink"),
        canPlayMIME: wrap("canPlayMIME"),
        canPlayURL: wrap("canPlayURL"),
        mute: wrap("mute"),
        pauseAll: wrap("pauseAll"),
        resumeAll: wrap("resumeAll"),
        stopAll: wrap("stopAll"),
        unmute: wrap("unmute")
      };
    }
    angular.module("phSoundManager.service", [ "ng" ]).provider("phSoundManager", soundManager2Provider);
  }();
  !function() {
    "use strict";
    var soundManager2, timeout;
    SoundFactory.$inject = [ "phSoundManager", "$timeout" ];
    function SoundFactory(phSoundManager, $timeout) {
      soundManager2 = phSoundManager;
      timeout = $timeout;
      return Sound;
    }
    function asyncDigest(fun) {
      return function() {
        var self = this;
        timeout(function() {
          fun.call(self);
        });
      };
    }
    function argsToArray(args, slice) {
      return Array.prototype.slice.call(args, slice);
    }
    function generateCallbacks(sound) {
      return {
        onload: asyncDigest(function() {
          DEBUG.instrument("onload", arguments);
          if (1 === this.readyState) {
            sound.loading = true;
            sound.error = false;
          } else if (2 === this.readyState) {
            sound.error = true;
            sound.loading = false;
          } else if (3 === this.readyState) {
            sound.loading = false;
            sound.error = false;
            sound.duration = this.duration;
          }
        }),
        onpause: asyncDigest(function() {
          DEBUG.instrument("onpause", arguments);
          sound.paused = true;
          sound.playing = false;
        }),
        onplay: asyncDigest(function() {
          DEBUG.instrument("onplay", arguments);
          sound.paused = false;
        }),
        onresume: asyncDigest(function() {
          DEBUG.instrument("onresume", arguments);
          sound.paused = false;
        }),
        onid3: asyncDigest(function() {
          DEBUG.instrument("onid3", arguments);
          angular.copy(this.id3, sound.id3);
        }),
        whileloading: asyncDigest(function() {
          DEBUG.instrument("whileloading", arguments);
          sound.duration = this.durationEstimate;
        }),
        whileplaying: asyncDigest(function() {
          DEBUG.instrument("whileplaying", arguments);
          sound.position = this.position;
        })
      };
    }
    function Sound(url) {
      if ("undefined" === typeof url) throw "URL parameter is required";
      var options = generateCallbacks(this);
      options.url = url;
      this.playing = false;
      this.loading = false;
      this.paused = true;
      this.error = false;
      this.duration = void 0;
      this.position = void 0;
      this.id3 = {};
      this.sound = soundManager2.createSound(options);
    }
    // A series of combinators that I wanted to use.
    function apply(method) {
      return function(recipient) {
        var args = argsToArray(arguments, 1);
        return "string" === typeof method ? recipient[method].apply(recipient, args) : method.apply(recipient, args);
      };
    }
    function reverseCurry(fun, lastArgs) {
      return function() {
        var args = argsToArray(arguments).concat(lastArgs);
        return fun.apply(this, args);
      };
    }
    function promised(property, application) {
      return function() {
        var args = argsToArray(arguments);
        return this[property].then(reverseCurry(application, args));
      };
    }
    var proxies = "destruct load mute pause play resume setPan setPosition setVolume stop toogleMute togglePause unload unmute".split(" ");
    for (var i = proxies.length - 1; i >= 0; i -= 1) Sound.prototype[proxies[i]] = promised("sound", apply(proxies[i]));
    angular.module("phSoundManager.sound", [ "phSoundManager.service" ]).factory("PlayerHaterSound", SoundFactory);
  }();
}();