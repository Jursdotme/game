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

    WebFont.load({
      google: {
        families: ['Freckle Face', 'Finger Paint', 'Nosifer', 'Creepster'],
      },
      active() {
        this.add
          .text(90, 150, 'Press start', {
            fontFamily: 'Creepster',
            fontSize: 16,
            color: '#da0050',
          })
          .setShadow(2, 2, '#601203', 2, false, true);
        this.add.text(
          250,
          450,
          'Waves flung themselves\nat the blue evening.',
          {
            fontFamily: 'Finger Paint',
            fontSize: 40,
            color: '#5656ee',
          },
        );
      },
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
