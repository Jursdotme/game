class l1w1 extends Phaser.Scene {
	constructor(config) {
		super({ key: "l1w1" });
	}

	init(data) {}

	preload() {}
	create(data) {
		this.isPlayerDead = false;

		// load the map
		let map = this.make.tilemap({
			key: "l1w1"
		});

		// tiles for the ground layer
		var groundTiles = map.addTilesetImage("grassland");
		var backgroundTiles = map.addTilesetImage("background");

		// create the ground layer
		this.groundLayer = map.createDynamicLayer(
			"Ground Layer",
			groundTiles,
			0,
			0
		);
		// create the ground layer
		this.backgroundLayer = map.createDynamicLayer(
			"Background Layer",
			backgroundTiles,
			0,
			0
		);
		let deadlyLayer = map.createDynamicLayer(
			"Deadly Layer",
			groundTiles,
			0,
			0
		);

		// the player will collide with this layer
		this.groundLayer.setCollisionByProperty({
			collides: true
		});

		// set the boundaries of our game world
		this.physics.world.bounds.width = this.groundLayer.width;
		this.physics.world.bounds.height = this.groundLayer.height;

		/**
		 * Create Player
		 */
		// create the player sprite at the spawnpoint
		const spawnPoint = map.findObject(
			"Objects",
			obj => obj.name === "Spawn Point"
		);
		this.player = this.physics.add.sprite(
			spawnPoint.x,
			spawnPoint.y,
			"player"
		);

		this.player.setBounce(0.15); // our player will bounce from items
		this.player.setCollideWorldBounds(true); // don't go out of the map

		// Make player collide with the world
		this.physics.add.collider(this.groundLayer, this.player);

		/**
		 * CONTROLS
		 */
		// Add arrowkeys
		this.cursors = this.input.keyboard.createCursorKeys();

		/**
		 * CAMERA
		 */
		// set bounds so the camera won't go outside the game world¨
		this.cameras.main.setBounds(
			0,
			0,
			map.widthInPixels,
			map.heightInPixels
		);
		// make the camera follow the player
		this.cameras.main.startFollow(this.player);

		// set background color, so the sky is not black
		this.cameras.main.setBackgroundColor("#161c2a");

		/**
		 * ANIMATIONS
		 */

		// Create walking animation
		this.anims.create({
			key: "walk",
			frames: this.anims.generateFrameNumbers("player", {
				start: 0,
				end: 7
			}),
			frameRate: 20,
			repeat: -1
		});

		this.anims.create({
			key: "idle",
			frames: this.anims.generateFrameNumbers("player", {
				start: 8,
				end: 8
			}),
			frameRate: 12,
			repeat: -1
		});

		this.anims.create({
			key: "jumping",
			frames: this.anims.generateFrameNumbers("player", {
				start: 9,
				end: 12
			}),
			frameRate: 12,
			repeat: 0
		});

		this.anims.create({
			key: "walk_monster",
			frames: this.anims.generateFrameNumbers("monster", {
				start: 0,
				end: 7
			}),
			frameRate: 12,
			repeat: -1
		});

		/**
		 * CREATE MONSTER
		 */

		this.monsters = this.physics.add.group();

		this.monsters.addMultiple(
			map.createFromObjects("Monsters", "blob", { key: "monster" })
		);
		this.monsters.getChildren().forEach(function(enemy) {
			// You need to use the `body` methods because these are Sprites (not ArcadeSprites)

			enemy.body.setBounceX(1);
			enemy.body.setCollideWorldBounds(true);
			enemy.body.velocity.x = 0;
			enemy.anims.play("walk_monster", true);
		}, this);
		this.physics.add.collider(this.groundLayer, this.monsters);
	}
	update(time, delta) {
		/**
		 * PLAYER CONTROLS
		 */
		if (this.cursors.left.isDown) {
			// if the left arrow key is down
			this.player.body.setVelocityX(-80); // move left
			if (this.player.body.onFloor()) {
				this.player.anims.play("walk", true); // play walk animation
				this.player.flipX = true; // flip the sprite to the left
				this.player.direction = -1;
			}
		} else if (this.cursors.right.isDown) {
			// if the right arrow key is down
			this.player.body.setVelocityX(80); // move right
			if (this.player.body.onFloor()) {
				this.player.anims.play("walk", true); // play walk animation
				this.player.flipX = false; // use the original sprite looking to the right
				this.player.direction = 1;
			}
		} else if (this.player.body.onFloor()) {
			this.player.body.setVelocityX(0);
			this.player.anims.play("idle", true);
		}

		if (this.cursors.up.isDown && this.player.body.onFloor()) {
			if (!this.flipFlop) {
				this.player.body.setVelocityY(-260); // jump up
				this.flipFlop = true;
				this.player.anims.play("jumping", false);
			}
		}

		if (this.cursors.up.isUp) {
			this.flipFlop = false;
		}

		/**
		 * Monster activation
		 */

		this.monsters.getChildren().forEach(function(enemy) {
			if (
				Phaser.Math.Distance.Between(
					this.player.x,
					this.player.y,
					enemy.x,
					enemy.y
				) < 150 &&
				enemy.body.velocity.x == 0
			) {
				enemy.body.velocity.x = -40;
			}
		}, this);

		/**
		 * DEATH
		 */
		if (
			this.player.y + this.player.height > this.groundLayer.height ||
			this.physics.world.overlap(this.player, this.monsters)
		) {
			this.isPlayerDead = true;
		}

		if (this.isPlayerDead == true) {
			const cam = this.cameras.main;
			cam.shake(100, 0.05);
			cam.fade(250, 0, 0, 0);

			cam.once("camerafadeoutcomplete", () => {
				// this.player.destroy()
				this.scene.restart();
				this.player.anims.play("idle", true);
			});

			this.player.body.moves = false;
		}
	}
}
