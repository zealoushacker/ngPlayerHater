describe('PlayerHaterSound', function () {
  'use strict';

  beforeEach(module('phSoundManager'));

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

  it('provides Sound constructor for injection', inject(function (PlayerHaterSound) {
    expect(PlayerHaterSound).toBeDefined();
  }));

  it('requires the url argument to be present', inject(function (PlayerHaterSound) {
    expect(function() { PlayerHaterSound.call({}) }).toThrow();
  }));

  describe('newly created', function () {
    var url, sound;

    beforeEach(inject(function (PlayerHaterSound) {
      url = '/mp3.mp3';
      sound = new PlayerHaterSound(url);
    }));

    it('is not playing', function () {
      expect(sound.playing).toBe(false);
    });

    it('is not loading', function () {
      expect(sound.loading).toBe(false);
    });

    it('is paused', function () {
      expect(sound.paused).toBe(true);
    });

    it('has an undefined duration', function () {
      expect(sound.duration).not.toBeDefined();
    });

    it('has an empty id3 tag', function () {
      expect(sound.id3).toEqual({});
    });

    describe('after soundManager is loaded', function () {
      beforeEach(soundManagerLoaded);

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

      describe('soundManager lifecycle', function () {
        var callbacks;

        beforeEach(function () {
          callbacks = soundManager.createSound.mostRecentCall.args[0];
        });

        function flush() {
          inject(function ($timeout) {
            $timeout.flush();
          });
        }

        it('passes an onload callback', function () {
          expect(callbacks.onload).toBeDefined();
        });

        it('sets loading when onload is called with readyState 1', function () {
          callbacks.onload.call({readyState:1});
          expect(sound.loading).toBe(false);
          flush();
          expect(sound.loading).toBe(true);
          expect(sound.error).toBe(false);
        });

        it('sets loading to false and error to true with readyState 2', function () {
          callbacks.onload.call({readyState:2});
          flush();
          expect(sound.loading).toBe(false);
          expect(sound.error).toBe(true);
        });

        it('sets loading to false and error to false with readyState 3', function () {
          callbacks.onload.call({readyState:3});
          flush();
          expect(sound.loading).toBe(false);
          expect(sound.error).toBe(false);
        });

        it('passes an onpause callback', function () {
          expect(callbacks.onpause).toBeDefined();
        });

        it('is paused when the onpause callback is called', function () {
          sound.paused = false;
          callbacks.onpause();
          expect(sound.paused).toBe(false);
          flush();
          expect(sound.paused).toBe(true);
        });

        it('is not playing when the onpause callback is called', function () {
          sound.playing = true;
          callbacks.onpause();
          expect(sound.playing).toBe(true);
          flush();
          expect(sound.playing).toBe(false);
        });

        it('passes an onplay callback', function () {
          expect(callbacks.onplay).toBeDefined();
        });

        it('is not paused when the onplay callback is called', function () {
          callbacks.onplay();
          expect(sound.paused).toBe(true);
          flush();
          expect(sound.paused).toBe(false);
        });

        it('passes an onresume callback', function () {
          expect(callbacks.onresume).toBeDefined();
        });

        it('is not paused when the onresume callback is called', function () {
          callbacks.onresume();
          expect(sound.paused).toBe(true);
          flush();
          expect(sound.paused).toBe(false);
        });

        it('passes an onid3 callback', function () {
          expect(callbacks.onid3).toBeDefined();
        });

        it('copies the id3 property when onid3 is called', function () {
          callbacks.onid3.call({id3:{artist:'PRINCE'}});
          expect(sound.id3).toEqual({});
          flush();
          expect(sound.id3.artist).toEqual('PRINCE');
        });
      });
    });
  });
});