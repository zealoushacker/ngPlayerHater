/**
*
* ngPlayerHater v0.0.1
* 
* Copyright (c) 2013 Chris Rhoden, Public Radio Exchange. All Rights Reserved
* 
* Licensed with the MIT license.
* http://opensource.org/licenses/MIT
*/
!function() {
  "use strict";
  var Sound;
  function Song(options) {
    angular.forEach(options, function(value, key) {
      this[key] = value;
    }, this);
    this._sound = new Sound(options.url);
  }
  Song.prototype.play = function() {
    return this._sound.play();
  };
  function PlayerHaterService(PlayerHaterSound) {
    Sound = PlayerHaterSound;
  }
  PlayerHaterService.prototype.play = function(song) {
    song.constructor !== Song && (song = this.newSong(song));
    this.nowPlaying = song;
    this.nowPlaying.play();
  };
  PlayerHaterService.prototype.newSong = function(songArguments) {
    return new Song(songArguments);
  };
  PlayerHaterService.$inject = [ "PlayerHaterSound" ];
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
  function getSoundManager($q, $rootScope) {
    var deferred = $q.defer(), wrap = wrapper(deferred.promise), options = soundManager2Provider.options;
    function resolvePromise() {
      $rootScope.$apply(function() {
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
  getSoundManager.$inject = [ "$q", "$rootScope" ];
  angular.module("phSoundManager.service", [ "ng" ]).provider("phSoundManager", soundManager2Provider);
}();

!function() {
  "use strict";
  var soundManager2, timeout;
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
        if (1 === this.readyState) {
          sound.loading = true;
          sound.error = false;
        } else if (2 === this.readyState) {
          sound.error = true;
          sound.loading = false;
        } else if (3 === this.readyState) {
          sound.loading = false;
          sound.error = false;
        }
      }),
      onpause: asyncDigest(function() {
        sound.paused = true;
        sound.playing = false;
      }),
      onplay: asyncDigest(function() {
        sound.paused = false;
      }),
      onresume: asyncDigest(function() {
        sound.paused = false;
      }),
      onid3: asyncDigest(function() {
        angular.copy(this.id3, sound.id3);
      })
    };
  }
  SoundFactory.$inject = [ "phSoundManager", "$timeout" ];
  function Sound(url) {
    if ("undefined" === typeof url) throw "URL parameter is required";
    var options = generateCallbacks(this);
    options.url = url;
    this.playing = false;
    this.loading = false;
    this.paused = true;
    this.error = false;
    this.duration = void 0;
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