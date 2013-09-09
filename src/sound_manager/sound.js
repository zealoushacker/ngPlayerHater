(function(){
  'use strict';

  var soundManager2, timeout;

  function SoundFactory(phSoundManager, $timeout) {
    soundManager2 = phSoundManager;
    timeout = $timeout;
    return Sound;
  }

  function asyncDigest(fun) {
    return function () {
      var self = this;
      timeout(function () {
        fun.call(self);
      });
    };
  }

  function argsToArray(args, slice) {
    return Array.prototype.slice.call(args, slice);
  }

  function generateCallbacks(sound) {
    return {
      onload: asyncDigest(function () {
        DEBUG.instrument('onload', arguments);
        if (this.readyState === 1) {
          sound.loading  = true;
          sound.error    = false;
        } else if (this.readyState === 2) {
          sound.error    = true;
          sound.loading  = false;
        } else if (this.readyState === 3) {
          sound.loading  = false;
          sound.error    = false;
          sound.duration = this.duration;
        }
      }),
      onpause: asyncDigest(function () {
        DEBUG.instrument('onpause', arguments);
        sound.paused  = true;
        sound.playing = false;
      }),
      onplay: asyncDigest(function () {
        DEBUG.instrument('onplay', arguments);
        sound.paused = false;
      }),
      onresume: asyncDigest(function () {
        DEBUG.instrument('onresume', arguments);
        sound.paused = false;
      }),
      onid3: asyncDigest(function () {
        DEBUG.instrument('onid3', arguments);
        angular.copy(this.id3, sound.id3);
      }),
      whileloading: asyncDigest(function () {
        DEBUG.instrument('whileloading', arguments);
        sound.duration = this.durationEstimate;
      }),
      whileplaying: asyncDigest(function (){
        DEBUG.instrument('whileplaying', arguments);
        sound.position = this.position;
      })
    };
  }

  SoundFactory.$inject = ['phSoundManager', '$timeout'];

  function Sound (url) {
    if (typeof url === 'undefined') {
      throw 'URL parameter is required';
    }
    var options   = generateCallbacks(this);
    options.url   = url;
    this.playing  = false;
    this.loading  = false;
    this.paused   = true;
    this.error    = false;
    this.duration = undefined;
    this.position = undefined;
    this.id3      = {};
    this.sound    = soundManager2.createSound(options);
  }


  // A series of combinators that I wanted to use.
  function apply(method) {
    return function (recipient) {
      var args = argsToArray(arguments, 1);
      if (typeof method === 'string') {
        return recipient[method].apply(recipient, args);
      } else {
        return method.apply(recipient, args);
      }
    };
  }

  function reverseCurry(fun, lastArgs) {
    return function () {
      var args = argsToArray(arguments).concat(lastArgs);
      return fun.apply(this, args);
    };
  }

  function promised(property, application) {
    return function () {
      var args = argsToArray(arguments);
      return this[property].then(reverseCurry(application, args));
    };
  }

  var proxies = ('destruct load mute pause play resume setPan setPosition ' +
    'setVolume stop toogleMute togglePause unload unmute').split(' ');
  for (var i = proxies.length - 1; i >= 0; i -= 1) {
    Sound.prototype[proxies[i]] = promised('sound', apply(proxies[i]));
  }

  angular.module('phSoundManager.sound', ['phSoundManager.service']).factory('PlayerHaterSound', SoundFactory);
})();