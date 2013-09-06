describe('Sound', function () {
  'use strict';

  beforeEach(module('soundManager2'));

  var soundManager = window.soundManager;
  var soundMethods = ('destruct load mute pause play resume setPan setPosition ' +
                     'setVolume stop toogleMute togglePause unload unmute').split(' ');
  var smSoundSpy;

  beforeEach(function () {
    smSoundSpy = jasmine.createSpyObj('sound', soundMethods);
    spyOn(soundManager, 'setup');
    spyOn(soundManager, 'createSound').andReturn(smSoundSpy);
  });

  function soundManagerLoaded () {
    inject(function ($rootScope) {
      soundManager.setup.mostRecentCall.args[0].onready();
      $rootScope.$digest();
    });
  }

  it('provides Sound constructor for injection', inject(function (Sound) {
    expect(Sound).toBeDefined();
  }));

  it('requires the url argument to be present', inject(function (Sound) {
    expect(function() { Sound.call({}) }).toThrow();
  }));

  describe('newly created', function () {
    var url, sound;

    beforeEach(inject(function(Sound) {
      url = '/mp3.mp3';
      sound = new Sound(url);
    }));

    it('is not playing', function () {
      expect(sound.playing).toBe(false);
    });

    it('is not loading', function () {
      expect(sound.loading).toBe(false);
    });

    it('is not paused', function () {
      expect(sound.paused).toBe(false);
    });

    it('has an undefined duration', function () {
      expect(sound.duration).not.toBeDefined();
    });

    describe('after soundManager is loaded', function () {
      beforeEach(soundManagerLoaded);

      function flush() {
        inject(function ($rootScope) {
          $rootScope.$digest();
        });
      }

      it('attempts to create a sound', function () {
        expect(soundManager.createSound).toHaveBeenCalled();
      });

      it('passes through its url to createSound', function () {
        expect(soundManager.createSound.mostRecentCall.args[0].url).toBe(url);
      });

      for (var i = soundMethods.length - 1; i >= 0; i -= 1) {
        /* jshint loopfunc: true */
        (function (method) {
          it('calls ' + method + ' through to the underlying sound', function () {
            sound[method].call(sound);
            flush();
            expect(smSoundSpy[method]).toHaveBeenCalled();
          });

          it('passes parameters through to the underlying sound for ' + method, function () {
            sound[method].call(sound, 'foo');
            flush();
            expect(smSoundSpy[method].mostRecentCall.args[0]).toEqual('foo');
          });
        }(soundMethods[i]));
      }

      it('does not expose the onPosition or clearOnPosition methods', function () {
        expect(sound.onPosition).toBeUndefined();
        expect(sound.clearOnPosition).toBeUndefined();
      });
    });
  });
});