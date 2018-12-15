/* globals Phaser */
class l1w1 extends Phaser.Scene { // eslint-disable-line no-unused-vars
  constructor() {
    super({ key: 'l1w1' });
  }

  // init(data) {}

  preload() {
    /**
     * ANIMATIONS
     */
    // Create walking animation
    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('player', {
        start: 0,
        end: 7,
      }),
      frameRate: 20,
      repeat: -1,
    });

    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('player', {
        start: 8,
        end: 8,
      }),
      frameRate: 12,
      repeat: -1,
    });

    this.anims.create({
      key: 'jumping',
      frames: this.anims.generateFrameNumbers('player', {
        start: 9,
        end: 12,
      }),
      frameRate: 12,
      repeat: 0,
    });

    this.anims.create({
      key: 'walk_monster',
      frames: this.anims.generateFrameNumbers('monster', {
        start: 0,
        end: 7,
      }),
      frameRate: 12,
      repeat: -1,
    });

    this.anims.create({
      key: 'baseball',
      frames: this.anims.generateFrameNumbers('bullets', {
        start: 0,
        end: 4,
      }),
      frameRate: 12,
      repeat: -1,
    });
  }

  killPlayer() {
    console.log('splat');
    this.isPlayerDead = true;
  }

  create() {
    this.isPlayerDead = false;

    // load the map
    const map = this.make.tilemap({
      key: 'l1w1',
    });

    // tiles for the ground layer
    const groundTiles = map.addTilesetImage('grassland');

    const backgroundTiles = map.addTilesetImage('grassland');

    // create the ground layer
    this.groundLayer = map.createStaticLayer(
      'Ground Layer',
      groundTiles,
      0,
      0,
    );

    // create the backgroundground layer
    this.backgroundLayer = map.createStaticLayer(
      'Background Layer',
      backgroundTiles,
      0,
      0,
    );

    // Create foreground layer
    this.foreground = map.createStaticLayer(
      'Foreground Layer',
      groundTiles,
      0,
      0,
    );

    this.foreground.setDepth(10);

    const deadlyTiles = this.foreground.getTilesWithin() // all tiles
      .filter(tile => tile.properties.deadly).map(x => x.index);
    const deadlyTilesId = [...(new Set(deadlyTiles))];

    this.foreground.setTileIndexCallback(deadlyTilesId, this.killPlayer, this);

    // the player will collide with this layer
    this.groundLayer.setCollisionByProperty({
      collides: true,
    });

    // set the boundaries of our game world
    this.physics.world.bounds.width = this.groundLayer.width;
    this.physics.world.bounds.height = this.groundLayer.height;

    /**
     * Create Player
     */
    // create the player sprite at the spawnpoint
    const spawnPoint = map.findObject(
      'Objects',
      obj => obj.name === 'Spawn Point',
    );
    this.player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'player');

    this.player.setBounce(0.15); // our player will bounce from items
    this.player.setCollideWorldBounds(true); // don't go out of the map

    /**
     * CREATE MONSTER
     */

    this.monsters = this.physics.add.group();

    this.monsters.addMultiple(
      map.createFromObjects('Monsters', 'blob', { key: 'monster' }),
    );
    this.monsters.getChildren().forEach((enemy) => {
      // You need to use the `body` methods because these are Sprites (not ArcadeSprites)

      enemy.body.setBounceX(1);
      enemy.body.setCollideWorldBounds(true);
      enemy.body.velocity.x = 0;
      enemy.anims.play('walk_monster', true);
    }, this);


    /**
     * Create bullets
     */
    this.bullets = this.physics.add.group();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    /**
     * CONTROLS
     */
    // Add arrowkeys
    this.cursors = this.input.keyboard.createCursorKeys();

    /**
     * CAMERA
     */
    // set bounds so the camera won't go outside the game world¨
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // make the camera follow the player
    this.cameras.main.startFollow(this.player);

    // set background color, so the sky is not black
    this.cameras.main.setBackgroundColor('#161c2a');

    /**
     * Check collisions
     */
    // Make player collide with the world
    this.physics.add.collider(this.groundLayer, this.player);

    // Make monsters collide with world
    this.physics.add.collider(this.groundLayer, this.monsters);

    // Check overlap with Deadly tiles
    this.physics.add.overlap(this.player, this.foreground);

    // check overlap with monsters
    this.physics.add.overlap(this.player, this.monsters, this.killPlayer, null, this);
  }

  update() {
    /**
     * PLAYER CONTROLS
     */
    if (this.cursors.left.isDown) {
      // if the left arrow key is down
      this.player.body.setVelocityX(-80); // move left
      if (this.player.body.onFloor()) {
        this.player.anims.play('walk', true); // play walk animation
        this.player.flipX = true; // flip the sprite to the left
        this.player.direction = -1;
      }
    } else if (this.cursors.right.isDown) {
      // if the right arrow key is down
      this.player.body.setVelocityX(80); // move right
      if (this.player.body.onFloor()) {
        this.player.anims.play('walk', true); // play walk animation
        this.player.flipX = false; // use the original sprite looking to the right
        this.player.direction = 1;
      }
    } else if (this.player.body.onFloor()) {
      this.player.body.setVelocityX(0);
      this.player.anims.play('idle', true);
    }

    if (this.cursors.up.isDown && this.player.body.onFloor()) {
      if (!this.flipFlop) {
        this.player.body.setVelocityY(-260); // jump up
        this.flipFlop = true;
        this.player.anims.play('jumping', false);
      }
    }

    if (this.cursors.up.isUp) {
      this.flipFlop = false;
    }

    if (this.spaceKey.isDown) {

    }

    /**
     * Monster activation
     */

    this.monsters.getChildren().forEach(function (enemy) {
      if (
        Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          enemy.x,
          enemy.y,
        ) < 150
        && enemy.body.velocity.x === 0
      ) {
        enemy.body.velocity.x = -40;
      }
    }, this);

    /**
     * DEATH
     */

    if (this.isPlayerDead === true) {
      const cam = this.cameras.main;
      cam.shake(25, 0.02);
      cam.fade(250, 0, 0, 0);
      cam.once('camerafadeoutcomplete', () => {
        // this.player.destroy();
        this.scene.restart();

        // this.player.anims.play("idle", true);
      });

      this.player.body.moves = false;
    }
  }
}
