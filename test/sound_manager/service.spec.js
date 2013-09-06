describe('soundManager2', function () {
  'use strict';
  
  beforeEach(module('soundManager2'));

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
    inject(function ($rootScope) {
      soundManager.setup.mostRecentCall.args[0].onready();
      $rootScope.$digest();
    });
  }

  it('defines soundManager2 for injection', inject(function (SoundManager2) {
    expect(SoundManager2).toBeDefined();
  }));

  it('calls through to the configured onready', function () {
    var executed = false;
    module('soundManager2', function (SoundManager2Provider) {
      SoundManager2Provider.options.onready = function () {
        executed = true;
      };
    });
    inject(function (SoundManager2) {
      if (SoundManager2) {
        expect(executed).toBe(false);
        soundManagerLoaded();
        expect(executed).toBe(true);
      }
    });
  });

  it('calls setup on soundManager', function () {
    inject(function (SoundManager2) {
      SoundManager2.createSound();
      expect(soundManager.setup).toHaveBeenCalled();
    });
  });

  it('defers sound creation until soundmanager is loaded', inject(function (SoundManager2) {
    SoundManager2.createSound(null);
    expect(soundManager.createSound).not.toHaveBeenCalled();
  }));
  
  it('promises sounds', inject(function (SoundManager2) {
    var args = {url:'/test.mp3'};
    SoundManager2.createSound(args);
    soundManagerLoaded();
    expect(soundManager.createSound.mostRecentCall.args[0]).toBe(args);
  }));

  it('checks to see if you can play a link', inject(function (SoundManager2) {
    SoundManager2.canPlayLink('foo');
    soundManagerLoaded();
    expect(soundManager.canPlayLink.mostRecentCall.args[0]).toBe('foo');
  }));

  it('checks to see if you can play a MIME type', inject(function (SoundManager2) {
    SoundManager2.canPlayMIME('foo');
    soundManagerLoaded();
    expect(soundManager.canPlayMIME.mostRecentCall.args[0]).toBe('foo');
  }));

  it('checks to see if you can play a URL', inject(function (SoundManager2) {
    SoundManager2.canPlayURL('foo');
    soundManagerLoaded();
    expect(soundManager.canPlayURL.mostRecentCall.args[0]).toBe('foo');
  }));

  it('mutes all sounds', inject(function (SoundManager2) {
    SoundManager2.mute();
    soundManagerLoaded();
    expect(soundManager.mute).toHaveBeenCalled();
  }));

  it('pauses all sounds', inject(function (SoundManager2) {
    SoundManager2.pauseAll();
    soundManagerLoaded();
    expect(soundManager.pauseAll).toHaveBeenCalled();
  }));

  it('resumes all sounds', inject(function (SoundManager2) {
    SoundManager2.resumeAll();
    soundManagerLoaded();
    expect(soundManager.resumeAll).toHaveBeenCalled();
  }));

  it('stops all sounds', inject(function (SoundManager2) {
    SoundManager2.stopAll();
    soundManagerLoaded();
    expect(soundManager.stopAll).toHaveBeenCalled();
  }));

  it('unmutes all sounds', inject(function (SoundManager2) {
    SoundManager2.unmute();
    soundManagerLoaded();
    expect(soundManager.unmute).toHaveBeenCalled();
  }));
});