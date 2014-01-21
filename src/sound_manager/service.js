(function(){
  'use strict';

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


  getSoundManager.$inject = ['$q', '$timeout'];
  function getSoundManager($q, $timeout) {
    var deferred = $q.defer(),
      wrap = wrapper(deferred.promise),
      options = soundManager2Provider.options;

    function resolvePromise() {
      $timeout(function () {
        deferred.resolve(window.soundManager);
        if (typeof soundManager2Provider.options.originalonready === 'function') {
          soundManager2Provider.options.originalonready.call(null);
        }
      });
    }

    resolvePromise._shim = true;

    if (typeof options.onready !== 'undefined' && !options.onready._shim) {
      options.originalonready = options.onready;
    } else {
      options.originalonready = undefined;
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

  angular.module('phSoundManager.service', ['ng']).provider('phSoundManager', soundManager2Provider);
})();