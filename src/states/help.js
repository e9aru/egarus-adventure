/*jshint -W008 */

(function(STATES) {
  'use strict';

  STATES.help = function() {};
  STATES.help.prototype = {
    init: function() { console.debug('[ HELP ]') },
    preload: function() {},
    create: function() {
      game.input.onDown.add(function() {
        game.state.clearCurrentState();
        game.state.start('menu');
      });
      drawHelp();
    },
    update: function() {},
    render: function() {}
  };

  var text;

  function drawHelp() {
    text = game.add.bitmapText(10, 10, 'default', 'help egaru to find way out of scary dunjon\nby avoiding traps and finding exit doors.\nuse egaru powers, he can clone himself and\ndo slow motion.', CFG.bitmapText.default.size);
    text.smoothed = false;
    text.anchor.set(0, 0);

    text = game.add.bitmapText(game.width * .5, 180, 'default', 'controls', CFG.bitmapText.default.size * 2);
    text.anchor.set(.5, 0);
    text.smoothed = false;
    text.align = 'center';
    text.tint = 0x3366FF;

    text = game.add.bitmapText(game.width * .5 - 20, 240, 'default', 'arrow keys\nup / spacebar\nesc\nc\nk\nx', CFG.bitmapText.default.size);
    text.smoothed = false;
    text.align = 'right';
    text.tint = 0xAACCFF;
    text.anchor.set(1, 0);

    text = game.add.bitmapText(game.width * .5 + 20, 240, 'default', 'move\njump\nback to menu\nclone\nsuicide\nslow motion', CFG.bitmapText.default.size);
    text.smoothed = false;

    text = game.add.bitmapText(game.width * .5, game.height - 10, 'default', '[ click anywhere to go back ]', CFG.bitmapText.default.size);
    text.smoothed = false;
    text.anchor.set(.5, 1);
    text.tint = 0x666666;
  }
})(STATES = STATES || {});