/*jshint -W008 */

(function(STATES) {
  'use strict';

  STATES.level = function() {};
  STATES.level.prototype = {
    init: function () { console.debug('[ LEVEL ]') },
    preload: function() {},
    create: function() {
      // Physics
      game.physics.arcade.gravity.y = 1200;

      // Background
      bg = game.add.tileSprite(0, 0, game.world.width, game.world.height, 'tileset', 0);

      // Back tiles group
      back = game.add.group();

      // Decorators (eg. bloodText)
      decorators = game.add.group();

      // Creature group
      creatures = game.add.physicsGroup(Phaser.Physics.ARCADE);
      creatures.ext = {
        addAnimations: function(creature) {
          if (creature.name === 'player' || creature.name === 'clone') {
            creature.animations.add('idle', [0, 1], 1, true)._speed = 1;
            creature.animations.add('run', [2, 3, 4, 5], 8, true)._speed = 8;
            creature.animations.add('jump', [6, 7, 8], 16, false)._speed = 16;
            creature.animations.add('panic', [9, 10, 9, 11], 16, true)._speed = 16;
          }
        }
      };

      // Items group
      items = game.add.physicsGroup(Phaser.Physics.ARCADE);

      // Corps
      corps = game.add.physicsGroup(Phaser.Physics.ARCADE);
      corps.ext = { maxFlesh: 1000};

      // Destructable
      destructable = game.add.physicsGroup(Phaser.Physics.ARCADE);

      // Spikes
      spikes = game.add.physicsGroup(Phaser.Physics.ARCADE);

      // Solid tiles group
      solid = game.add.physicsGroup(Phaser.Physics.ARCADE);

      // Front tiles group
      front = game.add.group();


      // player
      player = creatures.create(0, 0, 'player');
      player.name = 'player';
      player.ext = {
        _speed: 180,
        speed: 180,
        jumpTimer: 0,
        stepTimer: 0,
        isOnTile: 0,
        isOnTileTimer: 0,
        maxClones: 0,
        maxMana: 100,
        mana: 100,
        updateAnimations: function() {
          for (var a in player.animations._anims) {
            player.animations._anims[a].speed = player.animations._anims[a]._speed;
          }
        }
      };

      creatures.ext.addAnimations(player);

      player.anchor.set(.5);

      player.checkWorldBounds = true;
      player.body.bounce.y = .2;
      player.body.setSize(40, 44);
      player.events.onOutOfBounds.add(onPlayerKill);

      // Camera
      game.camera.follow(player);

      // Inputs
      inputs = {
        cursors: game.input.keyboard.createCursorKeys(),
        k: game.input.keyboard.addKey(Phaser.KeyCode.K),
        c: game.input.keyboard.addKey(Phaser.KeyCode.C),
        x: game.input.keyboard.addKey(Phaser.KeyCode.X),
        space: game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR),
        esc: game.input.keyboard.addKey(Phaser.KeyCode.ESC),
        enabled: true
      };
      inputs.k.onDown.add(onPlayerSuicide, this);
      inputs.c.onDown.add(onPlayerClone, this);
      inputs.x.onUp.add(onPlayerSlomo, this);
      inputs.x.onHoldCallback = onPlayerSlomo;
      inputs.space.onDown.add(onPlayerJump, this);
      inputs.esc.onDown.add(function() {
        game.state.clearCurrentState();
        game.state.start('menu');
      }, this);

      // GUI Layer
      gui = game.add.group();
      gui.fixedToCamera = true;
      gui.smoothed = false;
      gui.ext = {
        update: function() {
          gui.ext.level.text = 'Level: ' + game.ext.currLvlIndex;

          gui.ext.clones.ext.update();
          gui.ext.mana.update();
        }
      };
      gui.ext.clones = game.add.bitmapText(8, 8, 'default', '', CFG.bitmapText.default.size);
      gui.ext.clones.smoothed = false;
      gui.ext.clones.ext = {
        update: function() {
          gui.ext.clones.text = player.ext.maxClones  ? 'Available clones: ' + (player.ext.maxClones - creatures.filter(function(c) { return c.name === 'clone' }).list.length) : '';
        }
      };
      gui.add(gui.ext.clones);

      gui.ext.level = game.add.bitmapText(game.camera.width - 8, 8, 'default', '', CFG.bitmapText.default.size);
      gui.ext.level.smoothed = false;
      gui.ext.level.anchor.set(1, 0);
      gui.ext.level.inputEnabled = true;
      gui.ext.level.events.onInputDown.add(skipLvl, this);
      gui.add(gui.ext.level);

      gui.ext.skip = game.add.bitmapText(game.camera.width - 8, 32, 'default', 'skip level x ' + game.ext.progress.skips, CFG.bitmapText.default.size * .55);
      gui.ext.skip.smoothed = false;
      gui.ext.skip.anchor.set(1, 0);
      gui.ext.skip.inputEnabled = true;
      gui.ext.skip.events.onInputDown.add(skipLvl, this);
      gui.add(gui.ext.skip);

      // not add unpause to gui group - zindexes, it'll be bringed to front by game.world.brongToTop couple of lines below
      gui.ext.unpause = game.add.bitmapText(game.width * .5, game.height * .5, 'default', 'click anywhere to resume game', CFG.bitmapText.default.size);
      gui.ext.unpause.fixedToCamera = true;
      gui.ext.unpause.smoothed = false;
      gui.ext.unpause.exists = 0;
      gui.ext.unpause.anchor.set(.5);

      gui.ext.pause = game.add.sprite(8, game.height - 8, 'icons');
      gui.ext.pause.events.onInputDown.add(function() { game.paused = true });
      gui.ext.pause.inputEnabled = true;
      gui.ext.pause.anchor.set(0, 1);
      gui.ext.pause.frame = 2;
      gui.add(gui.ext.pause);

      gui.ext.mute = game.add.sprite(42, game.height - 8, 'icons');
      gui.ext.mute.anchor.set(0, 1);
      gui.ext.mute.inputEnabled = true;
      gui.ext.mute.frame = +game.sound.mute;
      gui.ext.mute.events.onInputDown.add(function() {
        game.sound.mute = !game.sound.mute;
        gui.ext.mute.frame = +game.sound.mute;
      });
      gui.add(gui.ext.mute);

      gui.ext.home = game.add.sprite(76, game.height - 8, 'icons');
      gui.ext.home.frame = 4;
      gui.ext.home.anchor.set(0, 1);
      gui.ext.home.inputEnabled = true;
      gui.ext.home.events.onInputDown.add(function() {
        game.state.clearCurrentState();
        game.state.start('menu');
      });
      gui.add(gui.ext.home);

      gui.ext.mana = {
        bar: game.add.graphics(game.width * .5, game.height - 8),
        // text
        update: function() {
          gui.ext.mana.bar.clear();
          gui.ext.mana.bar.beginFill(CFG.color.mana);
          gui.ext.mana.bar.drawRect(-8, -8, (game.width * .5 * player.ext.mana / player.ext.maxMana), 8);
          gui.ext.mana.bar.endFill();
        }
      };

      gui.ext.mana.bar.lineWidth = 0;
      gui.add(gui.ext.mana.bar);

      // GUI:Mask
      mask = game.add.graphics(0, 0);
      mask.fixedToCamera = true;
      mask.ext = {
        draw: function(callback) {
          mask.ext.draw._t = mask.beginFill(0x000000);
          mask.drawRect(0, 0, game.width, game.height);
          mask.endFill();

          delete mask.ext.draw._t;
          if (callback) callback();
        },
        fadeOut: function(callback, alpha) {
          alpha = alpha || 0;

          mask.ext.fadeOut._t = game.add.tween(mask).to({ alpha: alpha }, 1000, 'Linear', true).onComplete.add(function() {
            delete mask.ext.fadeOut._t;
            if (callback) callback();
          });
        },
        fadeIn: function(callback) {

          mask.ext.fadeIn._t = game.add.tween(mask).to({ alpha: 1 }, 400, 'Linear', true).onComplete.add(function() {
            delete mask.ext.fadeIn._t;
            if (callback) callback();
          });
        }
      };
      mask.ext.draw();

      // Music
      game.sound.play('level', .6, true);

      // Pause & resume
      game.world.bringToTop(gui.ext.unpause);
      game.onPause.add( function() {
        mask.alpha = .5;
        gui.ext.pause.frame = 3;
        gui.ext.unpause.exists = 1;
      });
      game.onResume.add(function() {
        mask.alpha = 0;
        gui.ext.pause.frame = 2;
        gui.ext.unpause.exists = 0;
      });
      game.input.onDown.add(function(e) {
        if (!game.paused) return;
        game.paused = false;
      });

      // Load world & Generate tiles
      // Regular level names should be levelN, eg. level1
      game.ext.currLvlIndex = game.ext.currLvlIndex || game.ext.progress.level || 1;
      game.time.events.add(1, function() {
        // level = loadLevel('13');
        level = loadLevel(game.ext.currLvlIndex);
      }).autoDestroy = true;
    },
    update: function() {
      game.ext.tick++;

      // groups collision
      game.physics.arcade.collide([creatures, corps, destructable], solid);
      game.physics.arcade.collide([creatures, destructable], creatures);

      // groups overlaps
      game.physics.arcade.overlap(player, items, function(p, i) {
        // Overlap only once
        i.exists = false;
        i.ext.onPickup();
      }, null, this);

      player.body.velocity.x = 0;

      // player
      if (inputs.enabled) {
        player.ext.animation = player.body.touching.down ? 'idle' : 'jump';

        // Fall from heigh = kill
        if (player.body.touching.down && player.body.speed > 1100) onPlayerKill();

        // Spikes = kill (overlap without physics)
        game.physics.arcade.overlap(player, spikes, function(p, i) {
          onPlayerKill();
        }, null, this);

        // All inputs callback
        // Moves & jump
        if (inputs.cursors.left.isDown) {
          player.ext.animation = player.body.touching.down ? 'run' : 'jump';
          player.scale.x = -1; // Flip sprite trick

          if (!player.body.touching.left) player.body.velocity.x = -player.ext.speed / game.time.slowMotion;
        }

        if (inputs.cursors.right.isDown) {
          player.ext.animation = player.body.touching.down ? 'run' : 'jump';
          player.scale.x = 1; // Flip sprite trick

          if (!player.body.touching.right) player.body.velocity.x = player.ext.speed / game.time.slowMotion;
        }

        if (inputs.cursors.up.isDown) onPlayerJump();

        // Update isOnTile
        if (level && level.ext.layers.back && game.ext.tick % 4 === 0) {
          player.ext.isOnTile = level.ext.layers.back.data[Math.floor(player.y / level.tileheight) * level.width + Math.floor(player.x / level.tilewidth)];
        }
        // Found exit
        if (inputs.enabled && game.ext.tileLegend.exit.indexOf(player.ext.isOnTile) !== -1) onExit();

        // Stick to wall fix
        if (player.ext.animation !== 'jump' && game.physics.arcade.forceX) game.physics.arcade.forceX = false;
        if (player.ext.animation === 'jump' && !game.physics.arcade.forceX) game.physics.arcade.forceX = true;

        // SFX for animations and other stuff after animation is finally picked
        switch (player.ext.animation) {
          default: //'idle'
            break;
          case 'run':
            if (game.time.time > player.ext.stepTimer) {
              player.ext.stepTimer = game.time.time + 400;
              game.sound.play('step', .3);
            }

            break;
        }

        // Update animation
        if (player.animations.currentAnim.name !== player.ext.animation) player.animations.play(player.ext.animation);

      }

      if (game.ext.tick % 4 === 0) {
        // run timerStack stuff
        timerStack.forEach(function(e, index) {
          if (e[0] <= game.time.time) timerStack.splice(index, 1)[0][1]();
        });
      }
    },
    render: function() {
      // game.debug.body(player);
      // game.debug.bodyInfo(player, 16, 24);
      // if (timerStack.length) game.debug.text(timerStack[0][0] - game.time.time, 16, 48);
      // game.debug.text(game.time.fps, 10, 100);
    }
  };


  //gropus
  var back, solid, gui, creatures, items, corps, decorators, destructable, spikes, front;
  var bg, level, player, inputs, bloodText, item, tile, tileMap, mask, music, crate;
  var timerStack = [];

  function loadLevel(lvl, callback) {
    // Check if gameover
    if (lvl > CFG.levelsAmmount) {
      game.state.clearCurrentState();
      game.state.start('win');
      return;
    }


    level = game.cache.getJSON('level' + lvl);
    level.ext = {
      spawn: {x: 0, y: 0},
      layers: {}
    };

    // Extract layers
    level.layers.forEach(function(e) {
      level.ext.layers[e.name] = e;
    });

    // Update world and bg dimension
    game.world.setBounds(0, 0, level.width * level.tilewidth, level.height * level.tileheight);
    bg.width = game.world.width;
    bg.height = game.world.height;

    // Background
    if (level.ext.layers.back) level.ext.layers.back.data.map(function(e, index) {
      if (!e) return;

      tile = back.create(index % level.width * level.tilewidth, Math.floor(index / level.width) * level.tileheight, 'tileset', e-1);

      // Spawn tile, move player here
      if (game.ext.tileLegend.spawn.indexOf(e) !== -1) {
        level.ext.spawn.x = index % level.width * level.tilewidth + level.tilewidth * .5;
        level.ext.spawn.y = Math.floor(index / level.width) * level.tileheight + level.tileheight * .5;
        return;
      }

      // Add randomnes to dirt tile
      if (game.ext.tileLegend.ground.indexOf(e) !== -1) {
        tile.frame = Math.random() > .5 ? tile.frame : game.rnd.pick(game.ext.tileLegend.groundRandom) - 1;
        return;
      }

      // Add randomnes to empty tile (bg)
      if (game.ext.tileLegend.empty.indexOf(e) !== -1 && Math.random() > .5) {
        tile.frame = game.rnd.pick(game.ext.tileLegend.emptyRandom) - 1;
        return;
      }
    });

    // Spikes - no physics
    if (level.ext.layers.spikes) level.ext.layers.spikes.data.map(function(e, index) {
      if (e === 0) return;

      tile = spikes.create(index % level.width * level.tilewidth, Math.floor(index / level.width) * level.tileheight, 'tileset', e-1);

      tile.body.allowGravity = false;
      tile.body.immovable = true;
      tile.body.setSize(40, 40, 4, 4);
      tile.name = 'spike';
    });

    // Solid tiles (collide, immovable)
    if (level.ext.layers.solid) level.ext.layers.solid.data.map(function(e, index) {
      if (e === 0) return;

      tile = solid.create(index % level.width * level.tilewidth, Math.floor(index / level.width) * level.tileheight, 'tileset', e-1);

      tile.body.allowGravity = false;
      tile.body.immovable = true;
      tile.name = 'solid';
    });

    // Front tiles
    if (level.ext.layers.front) level.ext.layers.front.data.map(function(e, index) {
      if (e === 0) return;

      tile = front.create(index % level.width * level.tilewidth, Math.floor(index / level.width) * level.tileheight, 'tileset', e-1);
    });

    // Desctructable tiles
    if (level.ext.layers.destructable) level.ext.layers.destructable.data.map(function(e, index) {
      if (e === 0) return;

      tile = destructable.create(index % level.width * level.tilewidth, Math.floor(index / level.width+1) * level.tileheight, 'crate', e-1);

      tile.body.allowGravity = false;
      tile.body.immovable = true;

      tile.anchor.set(0, 1);
      tile.name = 'crate';

      tile.animations.add('dead', [1, 2, 3, 4, 5], 20, false);
    });

    // Create items
    if (level.ext.layers.items && level.ext.layers.items.objects.length) level.ext.layers.items.objects.map(function(e) {
      item = items.create(Math.floor((e.x + e.width * .5) / 48) * 48 + e.width * .5, Math.ceil((e.y + e.height * .5) / 48) * 48, 'items', 0);
      item.name = 'mutator';
      item.animations.add('idle', [0, 1, 2, 3, 4, 5], 8, true);
      item.animations.play('idle');
      item.anchor.set(.5, 1);
      item.ext = {
        onPickup: function() {
          game.sound.play('pickup', .5);
          player.ext.maxClones++;
          gui.ext.update();
          item.kill();
          items.remove(item);
        }
      };

      item.body.immovable = true;
      item.body.allowGravity = false;
    });

    // Draw BloodTexts
    if (level.ext.layers.bloodTexts && level.ext.layers.bloodTexts.objects.length) level.ext.layers.bloodTexts.objects.map(function(e) {

      e.name.split('\\n').map(function(line, index) {
        bloodText = game.add.bitmapText(
          Math.round(e.x),
          0,
          'blood',
          line.toUpperCase(),
          Math.round(Math.min(CFG.bitmapText.blood.size, e.height))
        );
        bloodText.y = Math.round(e.y) + index * bloodText.fontSize * .6;
        bloodText.smoothed = false;
        bloodText.alpha = .6;
        bloodText.tint = 0x880000;
        bloodText.rotation = Phaser.Math.degToRad(Math.round(e.rotation));
        decorators.add(bloodText);
      });
    });

    // Move player
    player.x = level.ext.spawn.x;
    player.y = level.ext.spawn.y;

    // Update players mana pool
    if (game.ext.currLvlIndex === 1) player.ext.mana = player.ext.maxMana = 0;

    // Update gui
    gui.ext.update();

    // Fade out mask
    mask.ext.fadeOut();

    return level;
  }

  function restartLevel(time) {
    time = time || 400;

    if (!game.sound.mute) game.add.tween(game.sound)
      .to({volume: 0}, 400, 'Linear', true)
      .onComplete.addOnce(function() {
        game.sound.stopAll();
        game.sound.volume = 1;
      });

    game.time.events.add(time - 400, function() {
      mask.ext.fadeIn(function() {
        timerStack.length = 0;
        game.state.restart();
      });
    }).autoDestroy = true;
  }

  function onExit() {
    inputs.enabled = false;
    game.ext.currLvlIndex++;

    // Save game
    game.ext.save();

    restartLevel();
  }

  function onKill(u, callback) {
    var flesh;

    u.exists = false;

    for (var i = 0; i < 12; i++) {
      flesh = corps.create(u.x, u.y, 'corps', i%6);
      flesh.ext = {random: (Math.round(Math.random()*400) + 800) * (Math.random() > .5 ? -1 : 1)};

      // Clean if 2many flesh
      if (corps.children.length > corps.ext.maxFlesh) {
        corps.children[0].kill();
        corps.remove(corps.children[0]);
      }

      flesh.anchor.set(.5);

      // flesh.body.setSize(8, 8);
      flesh.body.bounce.x = .4;
      flesh.body.bounce.y = .5;
      flesh.body.mass = .3;

      flesh.body.velocity.y = -(200 + Math.round(Math.random() * 300));
      flesh.body.velocity.x = (Math.round(Math.random() * 300)) * (Math.random() > .5 ? -1 : 1);
      flesh.body.drag.x = 100;

      flesh.body.angularVelocity = flesh.ext.random;
      flesh.body.angularDrag = Math.abs(flesh.ext.random);
    }

    game.sound.play('dead', .3);

    if (u.alive) u.kill();
    creatures.remove(u);

    if (callback) callback();
  }

  function onPlayerKill() {
    inputs.enabled = false;
    onKill(player, function() { restartLevel(4000) });
  }

  function onPlayerSuicide() {
    if (player.alive && player.body.touching.down && inputs.enabled) {
      inputs.enabled = false;

      onSuicide(player, function() { restartLevel(4000) });
    }
  }

  function onCloneKill(u) {
    onSuicide(u, function() {
      var velocity = u.ext.explosionPower;
      var distance;

      // Bump player
      distance = Phaser.Math.distance(u.x, u.y, player.x, player.y);
      if (distance < u.ext.explosionDistance) {
        player.body.velocity.x = (u.x < player.x ? 1 : -1) * velocity;
        player.body.velocity.y = (u.y < player.y ? 1 : -1) * velocity * 1.2;
      }

      // Bump crates
      destructable.forEach(function(e) {
        distance = Phaser.Math.distance(u.x, u.y, e.x + e.width * .5, e.y - e.height * .5);

        if (e.body.immovable && distance < 72) {
          e.body.checkCollision.left = false;
          e.body.checkCollision.right = false;
          e.body.setSize(e.body.width, 0);
          e.body.allowGravity = true;
          e.body.immovable = false;
          e.animations.play('dead');
        }
      });

      distance = null;
      velocity = null;

      gui.ext.update();
    });
  }

  function onSuicide(u, callback) {
    timerStack.push([game.time.time + game.time.slowMotion * (u.ext.explosionDelay || 1000), function() { onKill(u, callback) }]);

    u.animations.play('jump');
    game.time.events.add(300, function() {
      u.animations.play('panic');
    }).autoDestroy = true;
  }

  function onPlayerClone() {
    if (inputs.enabled && player.ext.maxClones > creatures.filter(function(c) { return c.name === 'clone' }).list.length) {
      var clone = creatures.create(player.x, player.y, 'player');
      clone.name = 'clone';
      clone.anchor.set(.5);
      clone.scale.x = player.scale.x;

      // Copy some animations
      creatures.ext.addAnimations(clone);

      clone.ext = {
        explosionDistance: 200,
        explosionPower: 300,
        explosionDelay: 1500
      };

      clone.body.setSize(38, 48);
      clone.body.mass = .5;

      onCloneKill(clone);

      gui.ext.update();
    }
  }

  function onPlayerJump() {
    if (player.body.touching.down && game.time.time > player.ext.jumpTimer) {
      player.body.velocity.y = -500;
      player.ext.jumpTimer = game.time.time + 100;
      game.sound.play('jump', .3);
      player.ext.animation = 'jump';
    }
  }

  function onPlayerSlomo(e) {
    if (player.ext.mana > 0) {
      if (e.isDown) {
        // start
        if (e.repeats === 1) {
          player.ext.updateAnimations();
          updateTimerStack(3);
          doSlomo(3);
        }
        // hold
        player.ext.mana--;
        gui.ext.mana.update();
      return;
      }
    }

    // Animations
    player.ext.updateAnimations();

    // timerStack
    updateTimerStack(1);

    doSlomo(1);
  }

  function doSlomo(val) {
    if (val !== game.time.slowMotion || timerStack.length) {
      game.time.slowMotion = val;
      player.ext.speed = player.ext._speed * val;
    }

    player.animations.currentAnim.speed = player.animations.currentAnim._speed / val;

    game.sound._sounds.forEach(function(e) {
      if (e._sound.playbackRate.value !== val) e._sound.playbackRate.value = 1 / val;
    });
  }

  function updateTimerStack(val) {
    timerStack.forEach(function(e) {
      e[0] = game.time.time + (e[0] - game.time.time) * val / game.time.slowMotion;
    });
  }

  function skipLvl() {
    if (game.ext.progress.skips > 0) {
      game.ext.progress.skips--;
      game.ext.currLvlIndex++;
      game.ext.save();
      restartLevel();
    }
  }
})(STATES = STATES || {});