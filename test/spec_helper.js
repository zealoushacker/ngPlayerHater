/*jshint unused: false */
(function () {
  'use strict';

  window.flush = function () {
    inject(function ($rootScope, $timeout, $browser) {
      $rootScope.$digest();
      if ($browser.deferredFns.length) {
        $timeout.flush();
      }
    });
  };

  window.spyOnInjection = function (injection, $provide) {
    if (typeof $provide === 'undefined') {
      /* jshint camelcase: false */
      inject(function (_$provide_) {
        $provide = _$provide_;
      });
    }
    $provide.decorator(injection, function ($delegate) {
      return jasmine.createSpy(injection).andCallFake(function () {
        var $this = this;
        if (typeof this.length === 'undefined') {
          $this = Object.create($delegate.prototype);
        }
        var args = Array.prototype.slice.call(arguments);
        $delegate.apply($this, args);
        return $this;
      });
    });
  };
})();