(function () {
  'use strict';
  var Sound, $scope;

  function Song(options) {
    var self = this;
    angular.forEach(options, function (value, key) {
      this[key] = value;
    }, this);
    this.paused = true;
    var sound = this._sound = new Sound(options.url);
    $scope.$watch(function () { return sound.paused }, function (paused) {
      self.paused = paused;
    });
  }

  function proxyToSound(method) {
    return function () {
      return this._sound[method].apply(this._sound, Array.prototype.slice.call(arguments));
    };
  }

  var methods = ['play', 'stop'];
  for (var i = methods.length - 1; i >= 0; i -= 1) {
    Song.prototype[methods[i]] = proxyToSound(methods[i]);
  }

  Song.prototype.play = function () {
    return this._sound.play();
  };

  Song.prototype.stop = function () {
    return this._sound.stop();
  };

  function PlayerHaterService(PlayerHaterSound, $rootScope) {
    Sound = PlayerHaterSound;
    $scope = $rootScope;
    var self = this;
    this.paused = true;
    $scope.$watch(function () {
      return self.nowPlaying.paused;
    }, function (paused) {
      self.paused = paused;
    });
  }

  PlayerHaterService.prototype.play = function (song) {
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

  PlayerHaterService.prototype.newSong = function (songArguments) {
    return new Song(songArguments);
  };

  PlayerHaterService.$inject = ['PlayerHaterSound', '$rootScope'];

  angular.module('ngPlayerHater',['phSoundManager']).service('playerHater', PlayerHaterService);
})();