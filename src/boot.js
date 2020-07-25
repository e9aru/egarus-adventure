/*jshint -W008 */

var STATES = STATES || {}, CFG = {}, game;

(function(STATES) {
  'use strict';

  CFG = {
    walkthroughUrl: 'https://www.youtube.com/playlist?list=PL8StVPlqTqItD9l1czGU0hiON36HlxgLG',
    skipAmmount: 2,
    levelsAmmount: 15,
    color: {
      green: 0x26C300,
      red: 0xFF0000,
      mana: 0x6699DD
    },
    name: 'egaru',
    storage: {
      name: 'heroicode.egaru'
    },
    bitmapText: {
      default: {
        size: 24
      },
      blood: {
        size: 96
      }
    }
  };

  game = new Phaser.Game(624, 480, Phaser.AUTO, '', {
    preload: PRELOAD,
    create: create
  });

  function create() {
    game.ext = {
      tick: 0,
      currLvlIndex: 1,
      progress: {}, // load will overwrite it
      save: function() {
        game.ext.progress = {
          level: Math.max(game.ext.progress.level, game.ext.currLvlIndex),
          skips: game.ext.progress.skips
        };

        UTILS.storage.set(CFG.storage.name, game.ext.progress);
      },
      load: function() {
        game.ext.progress = UTILS.storage.get(CFG.storage.name);

        if (typeof game.ext.progress.skips === 'undefined') game.ext.progress.skips = CFG.skipAmmount;
      },
      wipeProgress: function() {
        UTILS.storage.remove(CFG.storage.name);
        game.ext.currLvlIndex = 1;
        game.ext.skips = CFG.skipAmmount;
        game.ext.progress = {};
        game.ext.load();
      },
      tileLegend: {
        empty: [1],
        emptyRandom: [37, 38, 39],
        spawn: [2],
        exit: [3],
        ground: [4],
        groundRandom: [4, 34, 35, 36]
      }
    };

    game.time.desiredFps = 55;
    game.time.advancedTiming = true;

    game.canvas.oncontextmenu = function (e) { e.preventDefault() };
    game.state.onStateChange.add(function() { game.sound.stopAll() });

    game.state.add('credits', STATES.credits);
    game.state.add('level', STATES.level);
    game.state.add('menu', STATES.menu);
    game.state.add('newgame', STATES.newgame);
    game.state.add('help', STATES.help);
    game.state.add('win', STATES.win);

    LOAD();
  }
})(STATES = STATES || {});