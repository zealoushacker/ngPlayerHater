'use strict';

var soundManager2, timeout;

function SoundFactory(SoundManager2, $timeout) {
  soundManager2 = SoundManager2;
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

function generateCallbacks(sound) {
  return {
    onload: asyncDigest(function () {
      if (this.readyState === 1) {
        sound.loading = true;
        sound.error   = false;
      } else if (this.readyState === 2) {
        sound.error   = true;
        sound.loading = false;
      } else if (this.readyState === 3) {
        sound.loading = false;
        sound.error   = false;
      }
    }),
    onpause: asyncDigest(function () {
      sound.paused  = true;
      sound.playing = false;
    }),
    onplay: asyncDigest(function () {
      sound.paused = false;
    }),
    onresume: asyncDigest(function () {
      sound.paused = false;
    }),
    onid3: asyncDigest(function () {
      angular.copy(this.id3, sound.id3);
    })
  };
}

SoundFactory.$inject = ['SoundManager2', '$timeout'];

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
  this.id3      = {};
  this.sound    = soundManager2.createSound(options);
}


// A series of combinators that I wanted to use.
function apply(method) {
  return function (recipient) {
    var args = Array.prototype.slice.call(arguments, 1);
    if (typeof method === 'string') {
      return recipient[method].apply(recipient, args);
    } else {
      return method.apply(recipient, args);
    }
  };
}

function reverseCurry(fun, lastArgs) {
  return function () {
    var args = Array.prototype.slice.call(arguments).concat(lastArgs);
    return fun.apply(this, args);
  };
}

function promised(property, application) {
  return function () {
    var args = Array.prototype.slice.call(arguments);
    return this[property].then(reverseCurry(application, args));
  };
}

var proxies = ('destruct load mute pause play resume setPan setPosition ' +
  'setVolume stop toogleMute togglePause unload unmute').split(' ');
for (var i = proxies.length - 1; i >= 0; i -= 1) {
  Sound.prototype[proxies[i]] = promised('sound', apply(proxies[i]));
}

angular.module('soundManager2.sound', ['soundManager2.service']).factory('Sound', SoundFactory);