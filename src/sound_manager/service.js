var sm2 = angular.module('soundManager2', ['ng']);

sm2.factory('SoundManager2', function ($q, $rootScope) {
  var deferred = $q.defer(),
    setup = deferred.promise;

  function resolvePromise() {
    $rootScope.$apply(function () {
      deferred.resolve(window.soundManager);
    });
  }

  function createSound(options) {
    return setup.then(function (soundManager) {
      return soundManager.createSound(options);
    });
  }

  function canPlayLink(link) {
    return setup.then(function (soundManager) {
      return soundManager.canPlayLink(link);
    });
  }

  function canPlayMIME(mime) {
    return setup.then(function (soundManager) {
      return soundManager.canPlayMIME(mime);
    });
  }

  function canPlayURL(url) {
    return setup.then(function (soundManager) {
      return soundManager.canPlayURL(url);
    });
  }

  function mute() {
    return setup.then(function (soundManager) {
      soundManager.mute();
    });
  }

  function pauseAll() {
    return setup.then(function (soundManager) {
      soundManager.pauseAll();
    });
  }

  function resumeAll() {
    return setup.then(function (soundManager) {
      soundManager.resumeAll();
    });
  }

  function stopAll() {
    return setup.then(function (soundManager) {
      soundManager.stopAll();
    });
  }

  function unmute() {
    return setup.then(function (soundManager) {
      soundManager.unmute();
    })
  }

  window.soundManager.setup({
    url: '/assets',
    flashVersion: 9,
    preferFlash: false,
    debugMode: false,
    onready: resolvePromise
  });

  return {
    createSound: createSound,
    canPlayLink: canPlayLink,
    canPlayMIME: canPlayMIME,
    canPlayURL:  canPlayURL,
    mute:        mute,
    pauseAll:    pauseAll,
    resumeAll:   resumeAll,
    stopAll:     stopAll,
    unmute:      unmute
  };
});