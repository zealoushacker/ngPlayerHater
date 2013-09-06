/**
* ngPlayerHater v0.0.0
* 
* Copyright (c) 2013 Chris Rhoden, Public Radio Exchange. All Rights Reserved
* 
* Licensed with the MIT license.
* http://opensource.org/licenses/MIT
*/
!function() {
  var player = angular.module("ngPlayerHater", []);
  player.constant("playerHaterVersion", "0");
}();

!function() {
  angular.module("soundManager2", [ "soundManager2.service", "soundManager2.sound" ]);
}();

!function() {
  "use strict";
  var soundManager2Provider = {
    $get: getSoundManager,
    options: {
      url: "/assets",
      flashVersion: 9,
      preferFlash: false,
      debugMode: false
    }
  };
  function wrapper(promise) {
    return function wrap(functionName) {
      return function() {
        var args = Array.prototype.slice.call(arguments);
        return promise.then(function(obj) {
          return obj[functionName].apply(obj, args);
        });
      };
    };
  }
  function getSoundManager($q, $rootScope) {
    var deferred = $q.defer(), wrap = wrapper(deferred.promise), options = soundManager2Provider.options;
    function resolvePromise() {
      $rootScope.$apply(function() {
        deferred.resolve(window.soundManager);
        "function" === typeof soundManager2Provider.options.originalonready && soundManager2Provider.options.originalonready.call(null);
      });
    }
    if (!options._instrumented) {
      options._instrumented = true;
      options.originalonready = options.onready;
    }
    options.onready = resolvePromise;
    window.soundManager.setup(options);
    return {
      createSound: wrap("createSound"),
      canPlayLink: wrap("canPlayLink"),
      canPlayMIME: wrap("canPlayMIME"),
      canPlayURL: wrap("canPlayURL"),
      mute: wrap("mute"),
      pauseAll: wrap("pauseAll"),
      resumeAll: wrap("resumeAll"),
      stopAll: wrap("stopAll"),
      unmute: wrap("unmute")
    };
  }
  getSoundManager.$inject = [ "$q", "$rootScope" ];
  angular.module("soundManager2.service", [ "ng" ]).provider("SoundManager2", soundManager2Provider);
}();

!function() {
  "use strict";
  var soundManager2;
  function SoundFactory(SoundManager2) {
    soundManager2 = SoundManager2;
    return Sound;
  }
  SoundFactory.$inject = [ "SoundManager2" ];
  function Sound(url) {
    if ("undefined" === typeof url) throw "URL parameter is required";
    this.playing = false;
    this.loading = false;
    this.paused = false;
    this.duration = void 0;
    this.sound = soundManager2.createSound({
      url: url
    });
  }
  // A series of combinators that I wanted to use.
  function apply(method) {
    return function(recipient) {
      var args = Array.prototype.slice.call(arguments, 1);
      return "string" === typeof method ? recipient[method].apply(recipient, args) : method.apply(recipient, args);
    };
  }
  function reverseCurry(fun, lastArgs) {
    return function() {
      var args = Array.prototype.slice.call(arguments).concat(lastArgs);
      return fun.apply(this, args);
    };
  }
  function promised(property, application) {
    return function() {
      var args = Array.prototype.slice.call(arguments);
      return this[property].then(reverseCurry(application, args));
    };
  }
  var proxies = "destruct load mute pause play resume setPan setPosition setVolume stop toogleMute togglePause unload unmute".split(" ");
  for (var i = proxies.length - 1; i >= 0; i -= 1) Sound.prototype[proxies[i]] = promised("sound", apply(proxies[i]));
  angular.module("soundManager2.sound", [ "soundManager2.service" ]).factory("Sound", SoundFactory);
}();