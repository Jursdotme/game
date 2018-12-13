/* globals Phaser loadscreen MainMenu l1w1 */
const config = {
  type: Phaser.AUTO,
  width: 256,
  height: 192,
  antialias: false,
  plugins: {
    global: [
      {
        key: 'GameScalePlugin',
        plugin: Phaser.Plugins.GameScalePlugin,
        mapping: 'gameScale',
        data: {
          minWidth: 400,
          minHeight: 300,
          maxWidth: 1600,
          maxHeight: 1200,
          snap: 0,
        },
      },
    ],
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        y: 500,
      },
      debug: false,
    },
  },
  scene: [loadscreen, MainMenu, l1w1],
};

const game = new Phaser.Game(config); // eslint-disable-line no-unused-vars
