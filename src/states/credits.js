/*jshint -W008 */

(function(STATES) {
  'use strict';

  STATES.credits = function() {};
  STATES.credits.prototype = {
    init: function() { console.debug('[ CREDITS ]') },
    preload: function() {},
    create: function() {
      game.input.onDown.add(function() {
        game.state.clearCurrentState();
        game.state.start('menu');
      });
      drawCredits();
    },
    update: function() {},
    render: function() {}
  };

  var text;

  function drawCredits() {
    text = game.add.bitmapText(game.width * .5, 10, 'default', 'game made by', CFG.bitmapText.default.size);
    text.smoothed = false;
    text.anchor.set(.5, 0);

    text = game.add.bitmapText(game.width * .5, 50, 'default', 'e9aru', CFG.bitmapText.default.size * 2);
    text.smoothed = false;
    text.tint = CFG.color.green;
    text.anchor.set(.5, 0);

    text = game.add.bitmapText(game.width - 8, 140, 'default', 'e9aru.io', CFG.bitmapText.default.size);
    text.smoothed = false;
    text.tint = 0x999999;
    text.anchor.set(1, 1);

    text = game.add.bitmapText(game.width - 8, 170, 'default', '@e9aru', CFG.bitmapText.default.size);
    text.smoothed = false;
    text.tint = 0x999999;
    text.anchor.set(1, 1);

    text = game.add.bitmapText(game.width * .5, 220, 'default', 'Thank you\nfor playing', CFG.bitmapText.default.size * 3.4);
    text.smoothed = false;
    text.anchor.set(.5, 0);
    text.align = 'center';
    text.tint = 0xFF3366;

    text = game.add.bitmapText(game.width * .5, game.height - 10, 'default', '[ click anywhere to go back ]', CFG.bitmapText.default.size);
    text.smoothed = false;
    text.anchor.set(.5, 1);
    text.tint = 0x666666;
  }
})(STATES = STATES || {});