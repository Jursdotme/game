var config = {
	type: Phaser.AUTO,
	width: 256,
	height: 192,
	pixelArt: true,
	plugins: {
		global: [
			{
				key: "GameScalePlugin",
				plugin: Phaser.Plugins.GameScalePlugin,
				mapping: "gameScale",
				data: {
					minWidth: 400,
					minHeight: 300,
					maxWidth: 1600,
					maxHeight: 1200,
					snap: 0
				}
			}
		]
	},
	physics: {
		default: "arcade",
		arcade: {
			gravity: {
				y: 500
			},
			debug: false
		}
	},
	scene: {
		key: "main",
		preload: preload,
		create: create,
		update: update
	}
};

var game = new Phaser.Game(config);

var map;
var player;
var cursors;
var groundLayer;
var killLayer;
var lives = 3;
var text;
var isPlayerDead = false;

function removeLife() {
	lives--;

	if (currentHealth === 0) {
		//  Uh oh, we're dead
		sprite.player.reset(400, 300);
	}
}

function preload() {
	// map made with Tiled in JSON format
	this.load.tilemapTiledJSON("map", "assets/1-1.json");
	// tiles in spritesheet
	this.load.spritesheet("grassland", "assets/grassland.png", {
		frameWidth: 16,
		frameHeight: 16
	});

	// player spritesheet
	this.load.spritesheet("player", "assets/dude.png", {
		frameWidth: 11,
		frameHeight: 25
	});

	// player spritesheet
	this.load.spritesheet("monster", "assets/monster.png", {
		frameWidth: 16,
		frameHeight: 16
	});

	// hud spritesheet
	this.load.spritesheet("hud", "assets/hud.png", {
		frameWidth: 16,
		frameHeight: 16
	});

	this.load.image("pressstart", "assets/Hoshi.png");
}

function touchMonster(player, monster) {
	isPlayerDead = true;
}

function create() {
	isPlayerDead = false;
	// load the map
	map = this.make.tilemap({
		key: "map"
	});

	// tiles for the ground layer
	var groundTiles = map.addTilesetImage("grassland");

	// create the ground layer
	groundLayer = map.createDynamicLayer("Ground Layer", groundTiles, 0, 0);
	deadlyLayer = map.createDynamicLayer("Deadly Layer", groundTiles, 0, 0);

	// the player will collide with this layer
	groundLayer.setCollisionByProperty({
		collides: true
	});

	// set the boundaries of our game world
	this.physics.world.bounds.width = groundLayer.width;
	this.physics.world.bounds.height = groundLayer.height;

	// const debugGraphics = this.add.graphics().setAlpha(0.75)
	// groundLayer.renderDebug(debugGraphics, {
	//     tileColor: null, // Color of non-colliding tiles
	//     collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
	//     faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
	// })

	/**
	 * Health bar
	 */
	var font_config = {
		image: "pressstart",
		width: 8,
		height: 8,
		chars: Phaser.GameObjects.RetroFont.TEXT_SET2,
		//charsPerRow: 95,
		spacing: {
			x: 1,
			y: 1
		}
	};

	this.cache.bitmapFont.add(
		"pressstart",
		Phaser.GameObjects.RetroFont.Parse(this, font_config)
	);
	text = this.add
		.bitmapText(10, 10, "pressstart", "LIVES")
		.setScrollFactor(0);

	/**
	 * Create Player
	 */
	// create the player sprite at the spawnpoint
	const spawnPoint = map.findObject(
		"Objects",
		obj => obj.name === "Spawn Point"
	);
	player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, "player");

	player.setBounce(0.15); // our player will bounce from items
	player.setCollideWorldBounds(true); // don't go out of the map

	// Make player collide with the world
	this.physics.add.collider(groundLayer, player);

	/**
	 * CONTROLS
	 */
	// Add arrowkeys
	cursors = this.input.keyboard.createCursorKeys();

	/**
	 * CAMERA
	 */
	// set bounds so the camera won't go outside the game world¨
	this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
	// make the camera follow the player
	this.cameras.main.startFollow(player);

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
	this.physics.add.collider(groundLayer, this.monsters);
	this.physics.add.overlap(player, this.monsters, killplayer);
}
function update(time, delta) {
	/**
	 * PLAYER CONTROLS
	 */
	if (cursors.left.isDown) {
		// if the left arrow key is down
		player.body.setVelocityX(-80); // move left
		if (player.body.onFloor()) {
			player.anims.play("walk", true); // play walk animation
			player.flipX = true; // flip the sprite to the left
			direction = -1;
		}
	} else if (cursors.right.isDown) {
		// if the right arrow key is down
		player.body.setVelocityX(80); // move right
		if (player.body.onFloor()) {
			player.anims.play("walk", true); // play walk animation
			player.flipX = false; // use the original sprite looking to the right
			direction = 1;
		}
	} else if (player.body.onFloor()) {
		player.body.setVelocityX(0);
		player.anims.play("idle", true);
	}

	if (cursors.up.isDown && player.body.onFloor()) {
		if (!flipFlop) {
			player.body.setVelocityY(-260); // jump up
			flipFlop = true;
			player.anims.play("jumping", false);
		}
	}

	if (cursors.up.isUp) {
		flipFlop = false;
	}

	/**
	 * Monster activation
	 */

	this.monsters.getChildren().forEach(function(enemy) {
		if (
			Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y) <
				150 &&
			enemy.body.velocity.x == 0
		) {
			enemy.body.velocity.x = -40;
		}
	}, this);

	/**
	 * DEATH
	 */

	if (
		player.y + player.height > groundLayer.height ||
		this.physics.world.overlap(player, this.lava)
	) {
		// Flag that the player is dead so that we can stop update from running in the future
		isPlayerDead = true;
	}

	if (isPlayerDead == true) {
		const cam = this.cameras.main;
		cam.shake(100, 0.05);
		cam.fade(250, 0, 0, 0);

		cam.once("camerafadeoutcomplete", () => {
			// this.player.destroy()
			this.scene.restart();
			this.player.anims.play("idle", true);
		});

		player.body.moves = false;
	}
}

function killplayer() {
	isPlayerDead = true;
}
