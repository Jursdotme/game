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

    this.cameras.main.setBackgroundColor('#364c3a');
    this.parallax1 = this.add.tileSprite(128, 96, 256, 256, 'parallax', 0);
    this.parallax1.setScrollFactor(0.8, 0.8);
    this.parallax1.setDepth(-1);

    this.parallax2 = this.add.tileSprite(128, 96, 256, 256, 'parallax', 1);
    this.parallax2.setScrollFactor(0.6, 0.6);
    this.parallax2.setDepth(-2);

    this.parallax3 = this.add.tileSprite(128, 96, 256, 256, 'parallax', 2);
    this.parallax3.setScrollFactor(0.4, 0.4);
    this.parallax3.setDepth(-3);
    const tween = this.tweens.addCounter({
      from: 1,
      to: 2,
      duration: 5000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  update() {
    this.parallax1.tilePositionX = this.parallax1.tilePositionX + 0.6;
    this.parallax2.tilePositionX = this.parallax2.tilePositionX + 0.4;
    this.parallax3.tilePositionX = this.parallax3.tilePositionX + 0.2;
  }
}
