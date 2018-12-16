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
      key: 'shooting',
      frames: this.anims.generateFrameNumbers('player', {
        start: 13,
        end: 13,
      }),
      frameRate: 12,
      repeat: 10,
    });

    this.anims.create({
      key: 'walk_blob',
      frames: this.anims.generateFrameNumbers('monster', {
        start: 0,
        end: 7,
      }),
      frameRate: 12,
      repeat: -1,
    });

    this.anims.create({
      key: 'death_blob',
      frames: this.anims.generateFrameNumbers('monster', {
        start: 8,
        end: 15,
      }),
      frameRate: 20,
      repeat: 0,
    });

    this.anims.create({
      key: 'baseball',
      frames: this.anims.generateFrameNumbers('bullets', {
        start: 0,
        end: 3,
      }),
      frameRate: 12,
      repeat: -1,
    });
    this.anims.create({
      key: 'basketball',
      frames: this.anims.generateFrameNumbers('bullets', {
        start: 4,
        end: 7,
      }),
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: 'bowlingball',
      frames: this.anims.generateFrameNumbers('bullets', {
        start: 8,
        end: 11,
      }),
      frameRate: 12,
      repeat: -1,
    });
  }

  setWeapon(weapon) {
    this.player.weapon = weapon;
  }

  killPlayer() {
    this.isPlayerDead = true;
  }

  damageEnemy(bullet, enemy) {
    enemy.setTintFill('0xffffff');
    enemy.health -= bullet.damage;
    if (enemy.health < 1) {
      enemy.body.setAllowGravity(false).setVelocity(0, 0);
      this.enemies.remove(enemy, false, false);
      enemy.anims.play('death_blob', false);
      enemy.on('animationcomplete', () => {
        enemy.destroy(); // Remove forever
      }, this);
    }

    bullet.setActive(false).setVisible(false); // Put back in pool
    bullet.y = -200;

    setTimeout(() => {
      enemy.clearTint();
    }, 30);
  }

  killEnemy(bullet, enemy) {
    this.enemies.remove(enemy, false, true);
    enemy.destroy(); // Remove forever
  }

  destroyBullet(bullet) {
    bullet.setActive(false).setVisible(false); // Put back in pool
    bullet.y = -200;
  }

  isEnemyDead(enemy) {
    if (enemy.active === true) {
      return true;
    }
    return false;
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
    this.player.weapon = 'baseball';

    this.player.setBounce(0.15); // our player will bounce from items
    this.player.setCollideWorldBounds(true); // don't go out of the map

    /**
     * CREATE MONSTER
     */

    this.enemies = this.physics.add.group();

    this.enemies.addMultiple(
      map.createFromObjects('Enemies', 'blob', { key: 'monster' }),
    );
    this.enemies.getChildren().forEach((enemy) => {
      // You need to use the `body` methods because these are Sprites (not ArcadeSprites)
      enemy.body.setBounceX(1);
      enemy.body.setCollideWorldBounds(true);
      enemy.body.velocity.x = 0;
      enemy.anims.play('walk_blob', true);
      enemy.health = 3;
    }, this);

    /**
     * Create bullets
     */
    this.bullets = this.physics.add.group({ allowGravity: false });
    this.bullets.maxSize = 5;

    /**
     * CONTROLS
     */
    // Add arrowkeys
    this.cursors = this.input.keyboard.createCursorKeys();

    // Add spacebar
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.keyOne = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.keyTwo = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this.keyThree = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);

    /**
     * CAMERA
     */
    // set bounds so the camera won't go outside the game world¨
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // make the camera follow the player
    this.cameras.main.startFollow(this.player);


    /**
     * Check collisions
     */
    // Make player collide with the world
    this.physics.add.collider(this.groundLayer, this.player);

    // Kill bullets on world collide
    this.physics.add.collider(this.groundLayer, this.bullets);

    // Make monsters collide with world
    this.physics.add.collider(this.groundLayer, this.enemies);

    // Check overlap with Deadly tiles
    this.physics.add.overlap(this.player, this.foreground);

    // check overlap with monsters
    this.physics.add.overlap(this.player, this.enemies, this.killPlayer, this.isEnemyDead, this);

    // Shoot monster
    this.physics.add.overlap(this.bullets, this.enemies, this.damageEnemy, null, this);


    /**
     * Parallax Background
     */
    // set background color, so the sky is not black
    this.cameras.main.setBackgroundColor('#364c3a');
    this.parallax1 = this.add.tileSprite(0, 128, map.widthInPixels * 1.8, map.heightInPixels, 'parallax', 0);
    this.parallax1.setScrollFactor(0.8, 0.8);
    this.parallax1.setDepth(-1);

    this.parallax2 = this.add.tileSprite(0, 128, map.widthInPixels * 1.6, map.heightInPixels, 'parallax', 1);
    this.parallax2.setScrollFactor(0.6, 0.6);
    this.parallax2.setDepth(-2);

    this.parallax3 = this.add.tileSprite(0, 128, map.widthInPixels * 1.4, map.heightInPixels, 'parallax', 2);
    this.parallax3.setScrollFactor(0.4, 0.4);
    this.parallax3.setDepth(-3);

    /**
     * Set weapon config
     */
    this.weapons = [
      {
        name: 'baseball', damage: 1, velocityX: 300, velosityY: 0, bounce: 0, gravity: false,
      },
      {
        name: 'basketball', damage: 2, velocityX: 150, velosityY: -150, bounce: 0.8, gravity: true,
      },
      {
        name: 'bowlingball', damage: 3, velocityX: 100, velosityY: 0, bounce: 0, gravity: true,
      },
    ];
  }

  shootBullet() {
    const bullet = this.bullets.getFirstDead(true, this.player.x, this.player.y, 'bullets', 0);
    bullet.setActive(true).setVisible(true);

    const activeWeapon = this.player.weapon;
    bullet.play(activeWeapon);
    const activeWeaponObj = this.weapons.find(weapon => weapon.name === activeWeapon);
    bullet.damage = activeWeaponObj.damage;
    let activeWeaponVelocityX = activeWeaponObj.velocityX;

    // Check player direction
    if (this.player.flipX !== false) {
      console.log('Hello');
      activeWeaponVelocityX = -activeWeaponObj.velocityX;
    }
    bullet.body
      .setAllowGravity(activeWeaponObj.gravity)
      .setVelocity(activeWeaponVelocityX, activeWeaponObj.velosityY)
      .setBounceY(activeWeaponObj.bounce);
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
        this.player.direction = -1;
      }
      this.player.flipX = true; // flip the sprite to the left
    } else if (this.cursors.right.isDown) {
      // if the right arrow key is down
      this.player.body.setVelocityX(80); // move right
      if (this.player.body.onFloor()) {
        this.player.anims.play('walk', true); // play walk animation
        this.player.direction = 1;
      }
      this.player.flipX = false; // use the original sprite looking to the right
    } else if (this.player.body.onFloor()) {
      this.player.body.setVelocityX(0);
      this.player.anims.play('idle', true);
    }

    if (this.cursors.up.isDown && this.player.body.onFloor()) {
      if (!this.flipFlopJump) {
        this.player.body.setVelocityY(-260); // jump up
        this.flipFlopJump = true;
        this.player.anims.play('jumping', false);
      }
    }

    if (this.cursors.up.isUp) {
      this.flipFlopJump = false;
    }
    if (this.spaceKey.isUp) {
      this.flipFlopShoot = false;
    }

    if (this.spaceKey.isDown) {
      this.player.anims.play('shooting', false);
      if (!this.flipFlopShoot) {
        this.flipFlopShoot = true;
        this.shootBullet();
      }
    }

    if (this.keyOne.isDown) {
      this.setWeapon('baseball');
    }

    if (this.keyTwo.isDown) {
      this.setWeapon('basketball');
    }

    if (this.keyThree.isDown) {
      this.setWeapon('bowlingball');
    }

    /**
     * Monster activation
     */

    this.enemies.getChildren().forEach(function (enemy) {
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
     * Bullet recycler
     */

    this.bullets.getChildren().forEach(function (bullet) {
      if (
        Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          bullet.x,
          bullet.y,
        ) > 256
        || bullet.body.velocity.x === 0
      ) {
        bullet.setActive(false).setVisible(false);
        bullet.x = -64;
        bullet.y = -64;

        // console.log(bullet);
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
