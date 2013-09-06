'use strict';

var mod = angular.module('soundManager2.service', ['ng']);

var soundManager2Provider = {
  $get: getSoundManager,
  options: {
    url: '/assets',
    flashVersion: 9,
    preferFlash: false,
    debugMode: false
  }
};

function wrapper(promise) {
  return function wrap(functionName) {
    return function () {
      var args = Array.prototype.slice.call(arguments);
      return promise.then(function (obj) {
        return obj[functionName].apply(obj, args);
      });
    };
  };
}

function getSoundManager($q, $rootScope) {
  var deferred = $q.defer(),
    wrap = wrapper(deferred.promise),
    options = soundManager2Provider.options;

  function resolvePromise() {
    $rootScope.$apply(function () {
      deferred.resolve(window.soundManager);
      if (typeof soundManager2Provider.options.originalonready === 'function') {
        soundManager2Provider.options.originalonready.call(null);
      }
    });
  }

  if (!options._instrumented) {
    options._instrumented = true;
    options.originalonready = options.onready;
  }
  options.onready = resolvePromise;

  window.soundManager.setup(options);

  return {
    createSound: wrap('createSound'),
    canPlayLink: wrap('canPlayLink'),
    canPlayMIME: wrap('canPlayMIME'),
    canPlayURL:  wrap('canPlayURL'),
    mute:        wrap('mute'),
    pauseAll:    wrap('pauseAll'),
    resumeAll:   wrap('resumeAll'),
    stopAll:     wrap('stopAll'),
    unmute:      wrap('unmute')
  };
}

getSoundManager.$inject = ['$q', '$rootScope'];

mod.provider('SoundManager2', soundManager2Provider);