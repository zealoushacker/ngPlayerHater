(function () {
  'use strict';
  var Sound;

  function Song(options) {
    angular.forEach(options, function (value, key) {
      this[key] = value;
    }, this);
    this._sound = new Sound(options);
  }

  Song.prototype.play = function () {
    return this._sound.play();
  };

  function PlayerHaterService(PlayerHaterSound) {
    Sound = PlayerHaterSound;
  }

  PlayerHaterService.prototype.play = function (song) {
    if (song.constructor !== Song) {
      song = this.newSong(song);
    }
    this.nowPlaying = song;
    this.nowPlaying.play();
  };

  PlayerHaterService.prototype.newSong = function (songArguments) {
    return new Song(songArguments);
  };

  PlayerHaterService.$inject = ['PlayerHaterSound'];

  angular.module('ngPlayerHater',['phSoundManager']).service('playerHater', PlayerHaterService);
})();