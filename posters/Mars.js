let PALETTES, COLORS, STROKE, BG;

/* Enable to make a canvas suitable for A2 paper */
const PRINT_MODE = true;

/* Get a random palette or choose a specific one from palettes.json */
const RANDOM_PALETTE = false;
const PALETTE_NAME = "mars";

/* Choose a random color from the palette for each line */
const RANDOM_STROKE = false;

/* Each line has its own color from the palette */
const PALETTED_STROKE = true;

/* How big the circle will be */
const RADIUS = size(320);

/* How many independent lines will be drawn each frame */
const LINE_COUNT = 500;

/* How swiftly the lines will move around (lower is slower) */
const NOISE_SPEED = 0.05;

/* How opaque the lines will be, lower means more transparent */
/* Lower will be smoother, but also takes longer to fill the circle */
const OPACITY = 0.15;
const STROKE_WEIGHT = size(0.5);

/* Enable to use randomness instead of noise to select line locations */
/* This effectively overrides the remaining config */
const IS_RANDOM = false;

/* Experimental: mirrors lines through the center */
const IS_SYMMETRICAL = false;

/* If not IS_RANDOM: noise will naturally lean towards an angle */
/* Enable this to vary where the angle is, or disable and specify your own */
const RANDOM_BIASED_ANGLE = true;
let BIASED_ANGLE = Math.PI / 2;

/* If not IS_RANDOM: this value effectively says how strong the bias is */
/* A lower value means the bias is strong, higher means near-random lines */
const NOISE_RANDOMNESS = 0.9;

/*

  CONFIG END

*/

// Helper function to scale sizes with print mode
function size(original) {
	return PRINT_MODE ? (original * 4960) / 1000 : original;
}

let fontRegular;
function preload() {
	PALETTES = loadJSON("/palettes.json");
	fontRegular = loadFont("../assets/GothamPro-Black.ttf");
}

function setup() {
	const cnv = PRINT_MODE ? createCanvas(4960, 7016) : createCanvas(1000, 1000);
	cnv.mouseClicked(clickOnSave);
	pixelDensity(1);

	/* Get colors from the palettes */
	const PALETTE_KEYS = Object.keys(PALETTES);
	const RANDOM_PALETTE_NAME =
		PALETTE_KEYS[(PALETTE_KEYS.length * Math.random()) << 0];
	const PALETTE = !RANDOM_PALETTE
		? PALETTES[PALETTE_NAME]
		: PALETTES[RANDOM_PALETTE_NAME];
	if (RANDOM_PALETTE) {
		console.log("Palette name: ", RANDOM_PALETTE_NAME);
	}

	colorMode(HSL);
	COLORS = PALETTE["colors"].map((col) => color(col));
	BG = color(PALETTE.bg);

	/* Sketch-specific setup */
	strokeWeight(STROKE_WEIGHT);
	STROKE = random(COLORS);
	STROKE.setAlpha(OPACITY);
	stroke(STROKE);
	background(BG);

	RANDOM_BIASED_ANGLE && (BIASED_ANGLE = random(TWO_PI));
	noiseDetail(4, NOISE_RANDOMNESS);

	textSize(800);
	textFont(fontRegular);
	textAlign(CENTER);
}

function drawWord(word) {
	fill(0, 102, 153, 51);
	text(word, width / 2, 500);
}

function draw() {
	translate(0, 1200);
	drawWord("MARS");

	/* Moves the origin of the coordinate system to the center of the canvas */
	/* Rotate based on the bias angle, be that random or not */
	translate(0, 0);
	translate(width / 2, height / 2.5);
	rotate(BIASED_ANGLE);

	/* For every line to be rendered each frame */
	for (let i = 0; i < LINE_COUNT; i++) {
		/* Select two random or noised angles on the circle */
		let a1, a2;
		if (IS_RANDOM) {
			a1 = random(TWO_PI);
			a2 = random(TWO_PI);
		} else if (IS_SYMMETRICAL) {
			a1 =
				TWO_PI * noise(0, frameCount * NOISE_SPEED) + (i * TWO_PI) / LINE_COUNT;
			a2 =
				TWO_PI * noise(1, frameCount * NOISE_SPEED) + (i * TWO_PI) / LINE_COUNT;
		} else {
			a1 = TWO_PI * noise(i, frameCount * NOISE_SPEED);
			a2 = TWO_PI * noise(i + LINE_COUNT, frameCount * NOISE_SPEED);
		}

		/* Use the two angles to determine two points on the circle */
		const x1 = RADIUS * cos(a1);
		const y1 = RADIUS * sin(a1);
		const x2 = RADIUS * cos(a2);
		const y2 = RADIUS * sin(a2);

		/* If random, choose a new color for each line */
		if (RANDOM_STROKE) {
			const randomColor = random(COLORS);
			randomColor.setAlpha(OPACITY);
			stroke(randomColor);
		} else if (PALETTED_STROKE) {
			const palettedColor = COLORS[i % COLORS.length];
			palettedColor.setAlpha(OPACITY);
			stroke(palettedColor);
		}

		/* Draw a line between the two points */
		line(x1, y1, x2, y2);
	}
}

function clickOnSave() {
	saveCanvas();
}
