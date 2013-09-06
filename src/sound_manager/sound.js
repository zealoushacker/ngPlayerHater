'use strict';

var mod = angular.module('soundManager2.sound', ['soundManager2.service']);

var soundManager2;

function SoundFactory(SoundManager2) {
  soundManager2 = SoundManager2;
  return Sound;
}

SoundFactory.$inject = ['SoundManager2'];

function Sound (url) {
  if (typeof url === 'undefined') {
    throw 'URL parameter is required';
  }
  this.playing  = false;
  this.loading  = false;
  this.paused   = false;
  this.duration = undefined;
  this.sound    = soundManager2.createSound({url:url});
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

mod.factory('Sound', SoundFactory);