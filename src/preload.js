/*jshint -W008 */

function PRELOAD() {
  'use strict';

  console.debug('[ PRELOAD ASSETS ]');

  game.load.bitmapFont('default', './assets/font.png', './assets/font.xml');
}

function LOAD() {
  console.debug('[ LOAD ASSETS ]');

  game.load.bitmapFont('blood', './assets/font_blood.png', './assets/font_blood.xml');

  game.load.spritesheet('tileset', './assets/tileset.png', 48, 48);
  game.load.spritesheet('player', './assets/player.png', 48, 48);
  game.load.spritesheet('crate', './assets/crate.png', 48, 48);
  game.load.spritesheet('corps', './assets/corps.png', 8, 8);
  game.load.spritesheet('items', './assets/items.png', 28, 48);
  game.load.spritesheet('icons', './assets/icons.png', 24, 24);

  game.load.audio('dead', './assets/dead.ogg');
  game.load.audio('step', './assets/step.ogg');
  game.load.audio('jump', './assets/jump.ogg');
  game.load.audio('level', './assets/level.ogg');
  game.load.audio('menu1', './assets/menu1.ogg');
  game.load.audio('menu2', './assets/menu2.ogg');
  game.load.audio('pickup', './assets/pickup.ogg');

  game.load.json('test', './levels/test.json');
  game.load.json('menu', './levels/menu.json');
  game.load.json('level1', './levels/level1.json');
  game.load.json('level2', './levels/level2.json');
  game.load.json('level3', './levels/level3.json');
  game.load.json('level4', './levels/level4.json');
  game.load.json('level5', './levels/level5.json');
  game.load.json('level6', './levels/level6.json');
  game.load.json('level7', './levels/level7.json');
  game.load.json('level8', './levels/level8.json');
  game.load.json('level9', './levels/level9.json');
  game.load.json('level10', './levels/level10.json');
  game.load.json('level11', './levels/level11.json');
  game.load.json('level12', './levels/level12.json');
  game.load.json('level13', './levels/level13.json');
  game.load.json('level14', './levels/level14.json');
  game.load.json('level15', './levels/level15.json');

  this.loadBar = null;

  this.loadStart = function() {
    game.stage.backgroundColor = 0x111111;
    loadBar = game.add.graphics(0, 0);
  };

  this.loadComplete = function() {
    // game.ext.currLvlIndex = 11;
    // game.state.start('level');
    game.state.start('menu');
  };

  this.fileComplete = function(progress, cacheKey, success, totalLoaded, totalFiles) {
    console.log("File Complete: " + progress + "% - " + totalLoaded + " out of " + totalFiles);

    loadBar.beginFill(0xFFFFFF);
    loadBar.drawRect(.5 * (game.width - (game.width * progress / 100)), game.height * .5 - 4, game.width * progress / 100, 8);
    loadBar.endFill();
  };

  game.load.onLoadStart.add(loadStart, this);
  game.load.onFileComplete.add(fileComplete, this);
  game.load.onLoadComplete.add(loadComplete, this);

  game.load.start();
  game.ext.load();
}