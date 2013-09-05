describe('facts', function () {
  'use strict';

  beforeEach(module('ngPlayerHater'));

  it('handles things', inject(function (playerHaterVersion) {
    expect(playerHaterVersion).toEqual('0');
  }));
});