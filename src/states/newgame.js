/*jshint -W008 */

(function(STATES) {
  'use strict';

  STATES.newgame = function() {};
  STATES.newgame.prototype = {
    init: function() { console.debug('[ NEWGAME ]') },
    preload: function() {},
    create: function() {
      question = game.add.bitmapText(game.width * .5, game.height * .5, 'default', 'starting new game will erase\nall saved progress data.\ndo you still want to do this?', CFG.bitmapText.default.size * 1.5);
      question.smoothed = false;
      question.align = 'center';
      question.anchor.set(.5);

      [
        ['yes', function() {
          game.ext.wipeProgress();
          game.state.clearCurrentState();
          game.state.start('level');
         }],
        ['hell no!', function() {
          game.state.clearCurrentState();
          game.state.start('menu');
        }]
      ].map(function(e, index) {
        button = game.add.bitmapText(game.width * .25 + (game.width * .5) * index, question.y + question.height + 20, 'default', e[0], CFG.bitmapText.default.size);
        button.anchor.set(.5, 0);
        question.smoothed = false;
        button.inputEnabled = true;
        button.events.onInputDown.addOnce(function() { e[1]() });
        button.events.onInputOver.add(function() { this.tint = CFG.color.green }, button);
        button.events.onInputOut.add(function() { this.tint = 0xFFFFFF }, button);
      });
    },
    update: function() {},
    render: function() {}
  };

  var question, button;
})(STATES = STATES || {});