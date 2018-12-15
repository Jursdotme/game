/* globals Phaser */
class loadscreen extends Phaser.Scene { // eslint-disable-line no-unused-vars
  constructor() {
    super({ key: 'loadscreen' });
  }

  init() { }

  preload() {
    // map made with Tiled in JSON format
    this.load.tilemapTiledJSON('l1w1', 'assets/l1w1.json');

    // tiles in spritesheet
    this.load.spritesheet('grassland', 'assets/grassland.png', {
      frameWidth: 16,
      frameHeight: 16,
    });

    // Load Background art
    this.load.spritesheet('background', 'assets/background.png', {
      frameWidth: 16,
      frameHeight: 16,
    });

    // Load Projectiles
    this.load.spritesheet('bullets', 'assets/projectiles.png', {
      frameWidth: 8,
      frameHeight: 8,
      spacing: 1,
      margin: 1,
    });

    // player spritesheet
    this.load.spritesheet('player', 'assets/dude.png', {
      frameWidth: 11,
      frameHeight: 25,
      spacing: 1,
      margin: 1,
    });

    // player spritesheet
    this.load.spritesheet('monster', 'assets/monster.png', {
      frameWidth: 16,
      frameHeight: 16,
    });

    // hud spritesheet
    this.load.spritesheet('hud', 'assets/hud.png', {
      frameWidth: 16,
      frameHeight: 16,
    });

    this.load.image('mainlogo', 'assets/full-logo.png');

    this.load.script(
      'webfont',
      'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js',
    );
  }

  create() {
    this.scene.start('MainMenu');
  }

  update() { }
}
