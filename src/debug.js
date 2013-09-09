var DEBUG;

(function () {
  'use strict';
  if (typeof DEBUG_MODE === 'undefined' || DEBUG_MODE) {
    DEBUG = {
      log: function () { console.log.apply(console, ['ngPlayerHater @ ' + new Date()].concat(Array.prototype.slice.call(arguments))) },
      instrument: function (method, args) {
        var msg = method + '(';
        if (args.length) {
          msg += args.join(', ');
        }
        msg += ')';
        this.log.call(this, '=> ' + msg);
      }
    };
  } else {
    DEBUG = {
      log: function () {},
      instrument: function () {}
    };
  }
}());