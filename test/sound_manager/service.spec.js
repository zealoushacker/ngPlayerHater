describe('soundManager2', function () {
  'use strict';
  
  beforeEach(module('phSoundManager'));

  var soundManager = window.soundManager;

  beforeEach(function () {
    spyOn(soundManager, 'setup');
    spyOn(soundManager, 'createSound');
    spyOn(soundManager, 'canPlayLink');
    spyOn(soundManager, 'canPlayMIME');
    spyOn(soundManager, 'canPlayURL');
    spyOn(soundManager, 'mute');
    spyOn(soundManager, 'pauseAll');
    spyOn(soundManager, 'resumeAll');
    spyOn(soundManager, 'stopAll');
    spyOn(soundManager, 'unmute');
  });

  function soundManagerLoaded () {
    inject(function ($timeout) {
      soundManager.setup.mostRecentCall.args[0].onready();
      $timeout.flush();
    });
  }

  it('defines soundManager2 for injection', inject(function (phSoundManager) {
    expect(phSoundManager).toBeDefined();
  }));

  it('calls through to the configured onready', function () {
    var executed = false;
    module('phSoundManager', function (phSoundManagerProvider) {
      phSoundManagerProvider.options.onready = function () {
        executed = true;
      };
    });
    inject(function (phSoundManager) {
      if (phSoundManager) {
        expect(executed).toBe(false);
        soundManagerLoaded();
        expect(executed).toBe(true);
      }
    });
  });

  it('calls setup on soundManager', function () {
    inject(function (phSoundManager) {
      phSoundManager.createSound();
      expect(soundManager.setup).toHaveBeenCalled();
    });
  });

  it('defers sound creation until soundmanager is loaded', inject(function (phSoundManager) {
    phSoundManager.createSound(null);
    expect(soundManager.createSound).not.toHaveBeenCalled();
  }));
  
  it('promises sounds', inject(function (phSoundManager) {
    var args = {url:'/test.mp3'};
    phSoundManager.createSound(args);
    soundManagerLoaded();
    expect(soundManager.createSound.mostRecentCall.args[0]).toBe(args);
  }));

  it('checks to see if you can play a link', inject(function (phSoundManager) {
    phSoundManager.canPlayLink('foo');
    soundManagerLoaded();
    expect(soundManager.canPlayLink.mostRecentCall.args[0]).toBe('foo');
  }));

  it('checks to see if you can play a MIME type', inject(function (phSoundManager) {
    phSoundManager.canPlayMIME('foo');
    soundManagerLoaded();
    expect(soundManager.canPlayMIME.mostRecentCall.args[0]).toBe('foo');
  }));

  it('checks to see if you can play a URL', inject(function (phSoundManager) {
    phSoundManager.canPlayURL('foo');
    soundManagerLoaded();
    expect(soundManager.canPlayURL.mostRecentCall.args[0]).toBe('foo');
  }));

  it('mutes all sounds', inject(function (phSoundManager) {
    phSoundManager.mute();
    soundManagerLoaded();
    expect(soundManager.mute).toHaveBeenCalled();
  }));

  it('pauses all sounds', inject(function (phSoundManager) {
    phSoundManager.pauseAll();
    soundManagerLoaded();
    expect(soundManager.pauseAll).toHaveBeenCalled();
  }));

  it('resumes all sounds', inject(function (phSoundManager) {
    phSoundManager.resumeAll();
    soundManagerLoaded();
    expect(soundManager.resumeAll).toHaveBeenCalled();
  }));

  it('stops all sounds', inject(function (phSoundManager) {
    phSoundManager.stopAll();
    soundManagerLoaded();
    expect(soundManager.stopAll).toHaveBeenCalled();
  }));

  it('unmutes all sounds', inject(function (phSoundManager) {
    phSoundManager.unmute();
    soundManagerLoaded();
    expect(soundManager.unmute).toHaveBeenCalled();
  }));
});