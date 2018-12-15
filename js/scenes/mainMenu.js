/* globals Phaser WebFont */
class MainMenu extends Phaser.Scene { // eslint-disable-line no-unused-vars
  constructor() {
    super({ key: 'MainMenu' });
  }

  // init(data) {}

  preload() {
    this.load.script(
      'webfont',
      'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js',
    );
  }

  create() {
    this.mainlogo = this.add.image(128, 96, 'mainlogo');
    const startText = this.add.text(90, 150, 'PRESS START', {
      fontFamily: 'Arial Black',
      fontSize: 10,
      color: '#fff',
      stroke: '#da0050',
      strokeThickness: 4,
    });
    this.tweens.add({
      targets: startText,
      alpha: 0.3,
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });
    this.input.keyboard.on(
      'keydown_SPACE',
      function () {
        this.scene.start('l1w1');
      },
      this,
    );
  }

  update() { }
}
