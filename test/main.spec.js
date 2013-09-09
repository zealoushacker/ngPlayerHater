describe('facts', function () {
  'use strict';

  var soundArguments;

  beforeEach(module('ngPlayerHater', function ($provide) {
    soundArguments = {url:'/mp3.mp3', title:'foo', artist:'bar'};
    spyOnInjection('PlayerHaterSound', $provide);
  }));

  it('creates a new song', inject(function (playerHater, PlayerHaterSound) {
    var song = playerHater.newSong(soundArguments);
    expect(song).toBeDefined();
    expect(PlayerHaterSound).toHaveBeenCalled();
    expect(PlayerHaterSound.mostRecentCall.args[0]).toBe(soundArguments.url);
  }));

  describe('#play', function () {

    it('accepts a song', inject(function (playerHater) {
      var song = playerHater.newSong(soundArguments);
      spyOn(song, 'play');
      playerHater.play(song);
      expect(playerHater.nowPlaying).toBe(song);
      expect(song.play).toHaveBeenCalled();
    }));

    it('creates a song when options are passed', inject(function (playerHater) {
      spyOn(playerHater, 'newSong').andCallThrough();
      playerHater.play(soundArguments);
      expect(playerHater.newSong).toHaveBeenCalled();
    }));

    it('plays the song it has created', inject(function (playerHater) {
      spyOn(playerHater, 'newSong').andReturn(jasmine.createSpyObj('sound', ['play']));
      playerHater.play(soundArguments);
      expect(playerHater.newSong().play).toHaveBeenCalled();
    }));

    it('is now playing the song that it has created', inject(function (playerHater) {
      playerHater.play(soundArguments);
      expect(playerHater.nowPlaying.url).toEqual(soundArguments.url);
      expect(playerHater.nowPlaying.title).toEqual(soundArguments.title);
      expect(playerHater.nowPlaying.artist).toEqual(soundArguments.artist);
    }));
  });
});