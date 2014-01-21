describe('facts', function () {
  'use strict';

  var soundArguments;

  beforeEach(module('ngPlayerHater', function ($provide) {
    soundArguments = {url:'/mp3.mp3', title:'foo', artist:'bar'};
    spyOnInjection('PlayerHaterSound', $provide);
  }));

  it('is paused while the now playing song is paused', inject(function(playerHater) {
    expect(playerHater.paused).toBe(true);
    var song = playerHater.newSong(soundArguments);
    playerHater.play(song);
    song._sound.paused = true;
    expect(playerHater.paused).toBe(true);
  }));

  it('can make a multipart song', inject(function (playerHater) {
    var song = playerHater.newSong(soundArguments, angular.copy(soundArguments));
    expect(song).toBeDefined();
  }));

  it('can accept songs as part of the multipart song', inject(function (playerHater) {
    var song = playerHater.newSong(soundArguments);
    var songList = playerHater.newSong(song, soundArguments);
    expect(songList).toBeDefined();
  }));

  it('plays the first song in a multipart', inject(function (playerHater, $q) {
    var song = playerHater.newSong(soundArguments);
    spyOn(song, 'play');
    var songList = playerHater.newSong(song, soundArguments);
    songList.load = function () { return $q.when(songList); };
    songList.play();
    flush();
    expect(song.play).toHaveBeenCalled();
  }));

  it('sets the position by skipping to the correct sound', inject(function (playerHater) {
    var song = playerHater.newSong(soundArguments);
    song._sound.duration = 10;
    var songTwo = playerHater.newSong(soundArguments);
    songTwo._sound.duration = 55;
    var songList = playerHater.newSong(song, songTwo, soundArguments);
    songList.setPosition(5);
    flush();
    expect(songList.currentSound()).toBe(song);
    songList.setPosition(13);
    flush();
    expect(songList.currentSound()).toBe(songTwo);
  }));

  it('has a position that is a sum of the pieces behind it', inject(function (playerHater) {
    var song = playerHater.newSong(soundArguments);
    song._sound.duration = 10;
    var songtwo = playerHater.newSong(soundArguments);
    songtwo._sound.position = 3;
    var songList = playerHater.newSong(song, songtwo);
    songList._sPos = 1;
    flush();
    expect(songList.position).toBe(13);
  }));

  it('is not paused when the now playing song is not paused', inject(function(playerHater) {
    playerHater.play(soundArguments);
    playerHater.nowPlaying._sound.paused = false;
    flush();
    expect(playerHater.paused).toBe(false);
  }));

  it('stops the now playing song when a new song is played', inject(function(playerHater) {
    var song = playerHater.play(soundArguments);
    spyOn(song, 'stop');
    playerHater.play(soundArguments);
    expect(song.stop).toHaveBeenCalled();
  }));

  it('pauses all songs when pause is called', inject(function(phSoundManager, playerHater) {
    spyOn(phSoundManager, 'pauseAll');
    playerHater.pause();
    expect(phSoundManager.pauseAll).toHaveBeenCalled();
  }));

  it('creates a new song', inject(function (playerHater, PlayerHaterSound) {
    var song = playerHater.newSong(soundArguments);
    expect(song).toBeDefined();
    expect(PlayerHaterSound).toHaveBeenCalled();
    expect(PlayerHaterSound.mostRecentCall.args[0]).toBe(soundArguments.url);
  }));

  describe('#play', function () {

    it('returns the song', inject(function (playerHater) {
      expect(playerHater.play(soundArguments)).toBe(playerHater.nowPlaying);
    }));

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

    it('resumes playback if no url is passed and there is a paused song loaded', inject(function (playerHater) {
      spyOn(playerHater, 'resume');
      playerHater.play(soundArguments);
      expect(playerHater.resume).not.toHaveBeenCalled();
      playerHater.play();
      expect(playerHater.resume).toHaveBeenCalled();
    }));
  });

  describe('#resume', function () {
    it('calls the now playing songs resume method', inject(function (playerHater) {
      playerHater.play(soundArguments);
      spyOn(playerHater.nowPlaying._sound, 'resume');
      expect(playerHater.nowPlaying._sound.resume).not.toHaveBeenCalled();
      playerHater.resume();
      expect(playerHater.nowPlaying._sound.resume).toHaveBeenCalled();
    }));

    it('throws an error when there is no currently loaded song', inject(function (playerHater) {
      expect(function () {
        playerHater.resume();
      }).toThrow('No Song Loaded');
    }));
  });

  describe('#seekTo', function () {
    it('calls the now playing songs setPosition method', inject(function (playerHater) {
      var song = playerHater.play(soundArguments);
      spyOn(song, 'setPosition');
      playerHater.seekTo(514);
      expect(song.setPosition.mostRecentCall.args[0]).toBe(514);
    }));
  });

  describe('#togglePlayback', function () {
    it('calls resume when nowPlaying is paused', inject(function (playerHater) {
      var spy = jasmine.createSpyObj('song', ['resume']);
      spy.paused = true;
      playerHater.nowPlaying = spy;
      playerHater.togglePlayback();
      expect(spy.resume).toHaveBeenCalled();
    }));

    it('calls pause when nowPlaying is playing', inject(function (playerHater) {
      var spy = jasmine.createSpyObj('song', ['pause']);
      spy.paused = false;
      playerHater.nowPlaying = spy;
      playerHater.togglePlayback();
      expect(spy.pause).toHaveBeenCalled();
    }));

    it('does not throw an error if nothing is playing', inject(function (playerHater) {
      playerHater.togglePlayback();
    }));
  });

  // describe('makeSongClass', function () {
  //   it('returns a new Song class when no arguments are passed', inject(function(playerHater) {
  //     expect(playerHater.makeSongClass().prototype.play).toBeDefined();
  //   }));

  //   it('extends the passed argument with Song when a class is passed', inject(function(playerHater) {
  //     var MyThing = function () {
  //       this.foo = 'bar';
  //     };

  //     var Sc = playerHater.makeSongClass(MyThing);

  //     expect(new Sc().play).toBeDefined();
  //     expect(new Sc().foo).toEqual('bar');
  //   }));

  //   it('handles class methods on passed functions', inject(function (playerHater) {
  //     var MyThing = function () {

  //     };

  //     MyThing.find = function (){};

  //     var Sc = playerHater.makeSongClass(MyThing);

  //     expect(Sc.find).toBeDefined();
  //   }));
  // });

  describe('Songs', function () {
    var song;

    beforeEach(inject(function (playerHater) {
      song = playerHater.newSong({url:'/mp3.mp3', title: 'Wishes'});
    }));

    it('sets its position based on the sounds position', function () {
      song._sound.position = 222;
      flush();
      expect(song.position).toBe(222);
    });

    it('sets its duration based on the sounds duration', function () {
      song._sound.duration = 617;
      flush();
      expect(song.duration).toBe(617);
    });

    it('calls through to its sounds setPosition', function () {
      spyOn(song._sound, 'setPosition');
      song.setPosition(215);
      expect(song._sound.setPosition.mostRecentCall.args[0]).toBe(215);
    });
  });
});