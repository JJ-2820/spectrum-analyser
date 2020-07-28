window.onload = function() {
	resizeApp();
};

const visLayer = document.getElementById("cnvLayer1");
const uiLayer = document.getElementById("cnvLayer2");
const textLayer = document.getElementById("cnvLayer3");
const file = document.getElementById("file-input");
const audio = document.getElementById("audio");
const ctx1 = visLayer.getContext("2d");
const ctx2 = uiLayer.getContext("2d");
const ctx3 = textLayer.getContext("2d");

var WIDTH;
var HEIGHT;
var barWidth;
var x = []; //Array of precomputed x values
var y = []; //Array of y values from FFTANALYZER

window.addEventListener("resize", resizeApp);
// canvas.addEventListener('mousemove', function(evt) {
// 		var mousePos = getMousePos(ctx1, evt);
// 		var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
// 		writeMessage(canvas, message);
// 	}, false);

file.onchange = function(){
	const files = this.files;
    console.log('FILES[0]: ', files[0])
    audio.src = URL.createObjectURL(files[0]);
    FFTANALYSER.init();
	resizeApp();
	audio.play();
	main();
}

function resizeApp() {
	var playerHeight = document.getElementById('audio').scrollHeight;
	visLayer.width = window.innerWidth;
	visLayer.height = window.innerHeight - playerHeight;
	uiLayer.width = window.innerWidth;
	uiLayer.height = window.innerHeight - playerHeight;
	textLayer.width = window.innerWidth;
	textLayer.height = window.innerHeight - playerHeight;
	WIDTH = visLayer.width;
	HEIGHT = visLayer.height;

	var h;
	h = window.innerHeight - playerHeight;
	audio.style.marginTop = h.toString() + "px";
	h = window.innerHeight - playerHeight + 9;
	file.style.marginTop = h.toString() + "px";

	document.documentElement.style.overflow = 'hidden';  // firefox, chrome
	document.body.scroll = "no"; // ie only

	x = new Float32Array(computeLogX());
	y = new Uint8Array(FFTANALYSER.getData());
	drawMarginals();
}

function main() {
	
	function draw() {
		requestAnimationFrame(draw);
		clear(ctx1);
		lineGraph();

		//Draw x-axis margin
		ctx1.fillStyle = 'rgba(0, 0, 0, 0.5)';
		ctx1.fillRect(0, HEIGHT - 24, WIDTH, 24, 24);
	}
	draw();
}

function binGraph() {

	var barHeight;
	var hue;
	y = FFTANALYSER.getData();

	for (var i = 0; i < x.length; i++) {
		barHeight = HEIGHT * (y[i] / 255);
		barWidth = (WIDTH / x.length);
		if (barWidth < 1.0) {barWidth = 1.0};
		
		hue = y[i];
		ctx1.fillStyle = `hsl(${hue},100%,50%)`;
		ctx1.fillRect(x[i],(HEIGHT - barHeight), barWidth, barHeight);
	}
}

function lineGraph() {

	var barHeight;
	var hue;
	y = FFTANALYSER.getData();
	var previousX = 0;
	var previousY = 0;

	ctx1.beginPath();

	for (var i = 1; i < x.length; i++) {
		barHeight = HEIGHT * (y[i] / 255);
		var startY = HEIGHT * (y[i] / 255);
		var endY = HEIGHT * (y[i - 1] / 255);

		ctx1.moveTo(x[i], (HEIGHT - startY));
		ctx1.lineTo(previousX, (HEIGHT - endY));

		previousX = x[i];
		previousY = y[i];
	}

	var gradient = ctx1.createLinearGradient(0, HEIGHT, 0, 0);
	gradient.addColorStop("0.166", `rgba(35,210,255,1)`);
	gradient.addColorStop("0.333", `rgba(74,104,247,1)`);
	gradient.addColorStop("0.50", `rgba(133,80,255,1)`);
	gradient.addColorStop("0.666", `rgba(198,59,243,1)`);
	gradient.addColorStop("0.833", `rgba(250,84,118,1)`);
	gradient.addColorStop("1.0", `rgba(255,223,67,1)`);
	ctx1.closePath();
	ctx1.strokeStyle = gradient;
	ctx1.stroke();
	ctx1.fillStyle = gradient;
	ctx1.fill();
}

function drawMarginals() {

	var prev = 0;

	for (var i = 0; i < x.length; i++) {
		//Draw marginals
		if (i >= (prev * 2.0)) {
			
			var Hz = Math.round(i * 44100 / 8192);
			prev = i;
			
			ctx2.font = "12px Sans-Serif";
			ctx2.fillStyle = 'white';
			ctx2.textAlign = "center";
			ctx2.fillText(Hz + "Hz", x[i], HEIGHT - 6);
		}
	}
}

function computeLogX() {
	var logX = [];
	var fftSize = FFTANALYSER.getSize();
	for (var i = 0; i < fftSize; i++) {
		var nyquist = 22050.0000;
		var logMax = Math.log10(nyquist / 15);
		var log = Math.log10((i / 15) * nyquist / fftSize);
		logX.push(log / logMax * WIDTH);
	}
	return logX;
}

function setPixel(context, x, y, h) {
	context.fillStyle = `hsl(${h}, 100%, 50%)`;
	context.fillRect(x, y, 1, 1);
}

function lerp(a, b, t) {
	return a + (b - a) * t;
}

function clear(context) {
	context.fillStyle = 'rgba(25,25,25,1.0)';
	context.fillRect(0, 0, WIDTH, HEIGHT);
}

function gradFill(context) {
	var gradient = context.createLinearGradient(0, 0, WIDTH, 0);
	gradient.addColorStop("0", `hsl(${0},100%,50%)`);
	gradient.addColorStop("1", `hsl(${255},100%,50%)`);
	context.fillStyle = gradient;
	context.fillRect(0, 0, WIDTH, HEIGHT);
}

function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}
