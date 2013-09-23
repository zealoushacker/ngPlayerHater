(function () {
  'use strict';
  var soundManager, Sound, $scope;

  function Song(options) {
    angular.forEach(options, function (value, key) {
      this[key] = value;
    }, this);
    this.paused = true;
    this._sound = new Sound(options.url);
    bindSound(this);
  }

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
      return this._sound[method].apply(this._sound, Array.prototype.slice.call(arguments));
    };
  }

  var methods = ['play', 'stop', 'resume', 'setPosition'];
  for (var i = methods.length - 1; i >= 0; i -= 1) {
    Song.prototype[methods[i]] = proxyToSound(methods[i]);
  }

  function PlayerHaterService(phSoundManager, PlayerHaterSound, $rootScope) {
    soundManager = phSoundManager;
    Sound = PlayerHaterSound;
    $scope = $rootScope;
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
    if (song.constructor !== Song) {
      song = this.newSong(song);
    }
    if (typeof this.nowPlaying !== 'undefined') {
      this.nowPlaying.stop();
    }
    this.nowPlaying = song;
    this.nowPlaying.play();
    return this.nowPlaying;
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

  PlayerHaterService.prototype.newSong = function (songArguments) {
    return new Song(songArguments);
  };

  PlayerHaterService.prototype.seekTo = function (position) {
    return this.nowPlaying.setPosition(position);
  };

  PlayerHaterService.prototype.makeSongClass = function (klass) {
    if (typeof klass === 'undefined') {
      klass = function SongType () {
        Song.apply(this, arguments);
      };
      klass.prototype = angular.copy(Song.prototype);
      return klass;
    } else if (typeof klass === 'function') {
      var klasss = function SongType () {
        klass.apply(this, arguments);
        var self = this;
        $scope.$watch(function() { return self.url }, function (url) {
          if (typeof url !== 'undefined') {
            self._sound = new Sound(url);
          } else {
            self._sound = undefined;
          }
        });
        bindSound(this);
      };
      angular.extend(klasss, klass);
      angular.extend(klasss.prototype, klass.prototype);
      angular.extend(klasss.prototype, Song.prototype);
      return klasss;
    }
  };

  PlayerHaterService.$inject = ['phSoundManager', 'PlayerHaterSound', '$rootScope'];

  angular.module('ngPlayerHater',['phSoundManager']).service('playerHater', PlayerHaterService);
})();