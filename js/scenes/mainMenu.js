class MainMenu extends Phaser.Scene {
	constructor(config) {
		super({ key: "MainMenu" });
	}

	init(data) {}
	preload() {
		this.load.script(
			"webfont",
			"https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"
		);
	}
	create(data) {
		this.mainlogo = this.add.image(128, 96, "mainlogo");

		var add = this.add;
		var input = this.input;

		WebFont.load({
			google: {
				families: [
					"Freckle Face",
					"Finger Paint",
					"Nosifer",
					"Creepster"
				]
			},
			active: function() {
				add.text(90, 150, "Press start", {
					fontFamily: "Creepster",
					fontSize: 16,
					color: "#da0050"
				}).setShadow(2, 2, "#601203", 2, false, true);
				add.text(
					250,
					450,
					"Waves flung themselves\nat the blue evening.",
					{
						fontFamily: "Finger Paint",
						fontSize: 40,
						color: "#5656ee"
					}
				);
			}
		});
		this.input.keyboard.on(
			"keydown_SPACE",
			function(event) {
				this.scene.start("l1w1");
			},
			this
		);
	}
	update(time, delta) {}
}
