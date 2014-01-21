(function () {
  'use strict';
  var soundManager, Sound, $scope, $q;

  function Song(options) {
    if (arguments.length > 1) { // this is a composite song;
      var songs = Array.prototype.slice.call(arguments);
      angular.forEach(songs, function (song, index) {
        if (song.constructor !== Song && song.constructor !== SongList) {
          songs[index] = new Song(song);
        }
      });
      return new SongList(songs);
    } else {
      angular.forEach(options, function (value, key) {
        this[key] = value;
      }, this);
      this.paused = true;
      this._sound = new Sound(options.url);
      bindSound(this);
    }
  }

  Song.prototype.constructor = Song;

  function bindSound(self) {
    $scope.$watch(function () { return self._sound.paused }, function (paused) {
      self.paused = paused;
    });
    $scope.$watch(function () { return self._sound.position }, function (position) {
      self.position = position;
    });
    $scope.$watch(function () { return self._sound.duration }, function (duration) {
      self.duration = duration;
    });
  }

  function proxyToSound(method) {
    return function () {
      if (typeof this._sound !== 'undefined') {
        return this._sound[method].apply(this._sound, Array.prototype.slice.call(arguments));
      } else {
        return this.currentSound()[method].apply(this.currentSound(), Array.prototype.slice.call(arguments));
      }
    };
  }

  var methods = ['play', 'stop', 'resume', 'setPosition', 'pause', 'load'];
  for (var i = methods.length - 1; i >= 0; i -= 1) {
    Song.prototype[methods[i]] = proxyToSound(methods[i]);
  }

  function SongList(songs) {
    this._s = songs;
    this._sPos = 0;
    bindSongs(this);
  }

  SongList.prototype = Object.create(Song.prototype);
  SongList.prototype.constructor = SongList;

  SongList.prototype.currentSound = function () {
    return this._s[this._sPos];
  };

  SongList.prototype.play = function (options) {
    return this.load(options).then(function (self) {
      return Song.prototype.play.call(self, options);
    });
  };

  SongList.prototype.load = function (options) {
    options = options || {};
    if (typeof options.onfinish !== 'undefined') {
      var onfinish = options.onfinish;
      delete options.onfinish;
      this._of = this._of || [];
      this._of.push(onfinish);
    }
    var self = this;
    options.onfinish = function () {
      self._sPos += 1;
      if (self._s.length === self._sPos) {
        self._sPos = 0;
        if (self._of) {
          angular.forEach(self._of, function (callback) {
            callback.call(this, self);
          }, this);
        }
      } else {
        self.currentSound().play();
      }
    };
    var promises = [];
    angular.forEach(this._s, function (song) {
      promises.push(song.load(angular.copy(options)));
    });
    return $q.all(promises).then(function () {
      return self;
    });
  };

  SongList.prototype.setPosition = function (position) {
    var finished = false, returnValue;
    angular.forEach(this._s, function (song, index) {
      if (!finished) {
        if (song.duration >= position) {
          returnValue = song.setPosition(position);
          if (!this.currentSound().paused) {
            this.currentSound().pause();
            song.play();
          }
          this.currentSound().setPosition(0);
          this._sPos = index;
          finished = true;
        } else {
          position = position - song.duration;
        }
      }
    }, this);
    return returnValue;
  };

  function bindSongs(self) {
    $scope.$watch(function () { return self.currentSound().paused }, function (paused) {
      self.paused = paused;
    });
    $scope.$watch(function () {
        var sum = 0;
        angular.forEach(self._s, function (song, index) {
          if (index < self._sPos) {
            sum += song.duration;
          }
        });
        return sum + self.currentSound().position;
      }, function (position) {
        self.position = position;
      }
    );
    $scope.$watch(function () {
        var sum = 0;
        angular.forEach(self._s, function (song) {
          sum += song.duration;
        });
        return sum;
      }, function (duration) {
        self.duration = duration;
      }
    );
  }

  PlayerHaterService.$inject = ['phSoundManager', 'PlayerHaterSound', '$rootScope', '$q'];
  function PlayerHaterService(phSoundManager, PlayerHaterSound, $rootScope, q) {
    soundManager = phSoundManager;
    Sound = PlayerHaterSound;
    $scope = $rootScope;
    $q = q;
    var self = this;
    this.paused = true;
    $scope.$watch(function () {
      return (self.nowPlaying || {paused:true}).paused;
    }, function (paused) {
      self.paused = paused;
    });
  }

  PlayerHaterService.prototype.play = function (song) {
    if (typeof song === 'undefined') {
      return this.resume();
    }
    if (song.constructor !== Song && song.constructor !== SongList) {
      song = this.newSong(song);
    }
    if (typeof this.nowPlaying !== 'undefined') {
      this.nowPlaying.stop();
    }
    this.nowPlaying = song;
    this.nowPlaying.play();
    return this.nowPlaying;
  };

  PlayerHaterService.prototype.togglePlayback = function () {
    if (this.nowPlaying) {
      if (this.nowPlaying.paused) {
        return this.play();
      } else {
        return this.nowPlaying.pause();
      }
    }
  };

  PlayerHaterService.prototype.resume = function () {
    if (typeof this.nowPlaying !== 'undefined'){
      this.nowPlaying.resume();
    } else {
      throw 'No Song Loaded';
    }
  };

  PlayerHaterService.prototype.pause = function () {
    soundManager.pauseAll();
  };

  PlayerHaterService.prototype.newSong = function () {
    var song = Object.create(Song.prototype);
    song = Song.apply(song, Array.prototype.slice.apply(arguments)) || song;
    return song;
  };

  PlayerHaterService.prototype.seekTo = function (position) {
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

  angular.module('ngPlayerHater',['phSoundManager']).service('playerHater', PlayerHaterService);
})();