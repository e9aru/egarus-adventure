/*jshint -W008 */

(function(STATES) {
  'use strict';

  STATES.win = function() {};
  STATES.win.prototype = {
    init: function() { console.debug('[ HELP ]') },
    preload: function() {},
    create: function() {
      drawTxt();

      game.input.onDown.add(function() {
        game.state.clearCurrentState();
        game.state.start('credits');
      });

      game.time.events.add(4000, showCredits).autoDestroy = true;
    },
    update: function() {},
    render: function() {}
  };

  var text;

  function drawTxt() {
    text = game.add.bitmapText(game.width * .5, game.height * .25, 'default', 'game over', CFG.bitmapText.default.size * 2.5);
    text.smoothed = false;
    text.tint = 0x666666;
    text.anchor.set(.5);

    text = game.add.bitmapText(game.width * .5, game.height * .5, 'default', 'congratulations', CFG.bitmapText.default.size * 2.5);
    text.smoothed = false;
    text.tint = 0xFFDD33;
    text.anchor.set(.5);

    text = game.add.bitmapText(game.width * .5, game.height * .6, 'default', 'you did it!', CFG.bitmapText.default.size);
    text.smoothed = false;
    text.anchor.set(.5, 0);

    text = game.add.bitmapText(game.width * .5, game.height * .6 + 20, 'default', 'egaru finally found a way out :)', CFG.bitmapText.default.size);
    text.smoothed = false;
    text.anchor.set(.5, 0);
  }

  function showCredits() {
    game.state.clearCurrentState();
    game.state.start('credits');
  }
})(STATES = STATES || {});