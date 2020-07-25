/*jshint -W008 */

(function(STATES) {
  'use strict';

  STATES.menu = function() {};
  STATES.menu.prototype = {
    init: function() { console.debug('[ MENU ]') },
    preload: function() {},
    create: function() {
      // Groups
      front = game.add.group();
      createScene();

      // Mask
      mask = game.add.graphics(0, 0);
      mask.beginFill(0x000000);
      mask.drawRect(0, 0, game.width, game.world.height);
      mask.endFill();
      mask.alpha = .4;

      // Generate buttons
      buttons = [
        // ['help', 'help'], // TODO: Help / controls
        ['select lvl', selectLevelMode],
        ['walkthrough', function() {
          var win = window.open(CFG.walkthroughUrl, '_blank');
          win.focus();
        }],
        ['credits', function() {
          game.state.clearCurrentState();
          game.state.start('credits');
        }],
        ['help', function() {
          game.state.clearCurrentState();
          game.state.start('help');
        }]
      ];
      // No save data
      if (game.ext.progress.level) {
        buttons.unshift(
          ['continue #' + game.ext.progress.level, function() {
            game.state.clearCurrentState();
            game.ext.currLvlIndex = game.ext.progress.level;
            game.state.start('level');
          }],
          ['new game', function() {
            game.state.clearCurrentState();
            game.state.start('newgame');
          }]
        );
      } else {
        buttons.unshift(
          ['continue', null],
          ['new game', function() { game.state.start('level') }]
        );
      }

      buttons.map(function(e, index) { createButton(
        10,
        608 + index * CFG.bitmapText.default.size * 1.1,
        e[0],
        e[1], null,
        index
      ) });

      // Title
      title = game.add.bitmapText(10, 394, 'default', CFG.name.replace('3', '0'), CFG.bitmapText.default.size * 3);
      title.alpha = 0;
      title.smoothed = false;
      title.tint = CFG.color.green;
      title.ext = { tween: game.add.tween(title).to({ alpha: 1 }, 3000, 'Linear', true) };

      // Music
      game.sound.play('menu1', .8, false).onStop.add(function() {
        game.sound.play('menu2', .8, true);
      });

      // Sound control
      soundControl = game.add.sprite(game.width - 8, 8, 'icons');
      soundControl.smoothed = false;
      soundControl.anchor.set(1, 0);
      soundControl.inputEnabled = true;
      soundControl.frame = +game.sound.mute;
      soundControl.fixedToCamera = true;
      soundControl.events.onInputDown.add(function() {
        game.sound.mute = !game.sound.mute;
        soundControl.frame = +game.sound.mute;
      });

      game.world.bringToTop(front);
    },
    update: function() {},
    render: function() {}
  };

  var button, title, buttons, soundControl, cage, level, tile, mask, egaru, door, doorTxt, front;

  function createButton(x, y, txt, onClick, centered, index) {
    button = game.add.bitmapText(x, y, 'default', txt, CFG.bitmapText.default.size);

    button.smoothed = false;
    button.anchor.set(centered ? .5 : 0, .5);
    if (onClick) {
      button.inputEnabled = true;
      button.events.onInputOver.add(function() { this.tint = CFG.color.green }, button);
      button.events.onInputOut.add(function() { this.tint = 0xFFFFFF }, button);
      button.events.onInputDown.add(function() {
        onClick();
      }, button);
    } else {
      button.tint = 0x666666;
    }

    return button;
  }

  function createScene() {
    level = game.cache.getJSON('menu');

    // world
    game.world.setBounds(0, 0, game.width, level.height * level.tileheight);

    // Tiles
    level.layers.forEach(function(l) {
      l.data.forEach(function(e, index) {
        if (!e) return;
        tile = game.add.sprite(index % level.width * level.tilewidth, Math.floor(index / level.width) * level.tileheight, 'tileset', e-1);
      });
    });

    // Create doors
    for (var i = 1; i <= CFG.levelsAmmount; i++) {
      door = game.add.sprite(i * 48 - (i > 4 ? 192 : 0), i > 4 ? 192 : 48, 'tileset', game.ext.progress.level < i ? game.ext.tileLegend.spawn[0] - 1 : game.ext.tileLegend.exit[0] - 1);

      if (game.ext.progress.level >= i || i === 1) {
        front.add(door);
        door.inputEnabled = true;
        door.events.onInputDown.addOnce(playLevel);
        door.ext = { level: i };

        doorTxt = game.add.bitmapText(door.x + door.width * .5, door.y + 8, 'default', i + '', CFG.bitmapText.default.size);

        doorTxt.smoothed = false;
        doorTxt.anchor.set(.6, 1);
        doorTxt.inputEnabled = true;
        doorTxt.events.onInputDown.addOnce(playLevel);
        doorTxt.ext = { level: i };
        front.add(doorTxt);
      }
    }

    // Back to menu text
    front.add(createButton(456, 96, 'back to menu', defaultMode, true));

    // Spawn egaru
    egaru = game.add.sprite(528, 480, 'player');
    egaru.animations.add('panic', [9, 10, 9, 11], 16, true);
    egaru.animations.play('panic');
    egaru.scale.x = -1;

    // Move camera
    game.camera.y = 384;
  }

  function selectLevelMode() {
    moveCamera(0, 800);
  }

  function defaultMode() {
    moveCamera(384, 400);
  }

  function moveCamera(offset, time) {
    game.add.tween(game.camera).to({ y: offset }, time, 'Quart.easeIn', true);
  }

  function playLevel(door) { console.log(door);
    game.ext.currLvlIndex = door.ext.level;
    game.state.clearCurrentState();
    game.state.start('level');
  }
})(STATES = STATES || {});