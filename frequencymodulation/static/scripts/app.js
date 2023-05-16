isRunning = false;

var carrier = null;
var carrierGain = null;
var modulator = null;
var modulatorGain = null;
var audioCtx = null;
var analyser = null;
var analyserData = null;

const drawSampleRate = 44100.0;
const numSamplesToDraw = drawSampleRate / 40.0;

const TAU = 2 * Math.PI;

var needsRedrawing = false;
var spectrumLowerBound = 0;
var spectrumUpperBound = 10000;

const highlightColor = "255, 191, 15"

window.addEventListener("resize", resizeCanvasses, false);

function resizeCanvasses() {
	let graphContainers = document.getElementsByClassName("graph-container");
	for (let i = 0; i < graphContainers.length; i++) {
		let c = graphContainers.item(i);
		let graph = c.getElementsByTagName('canvas')[0];

		graph.width = c.clientWidth;
		graph.height = c.clientHeight;

		graph.style.clientWidth = "100%";
		graph.style.clientWidth = "100%";
	}

	needsRedrawing = true;
	drawAll();
}


function drawCarrier() {
	const canvas = document.getElementById("carrier-graph");
	if (!(canvas.getContext)) {
		// Canvas un-supported
		return;
	}
	const ctx = canvas.getContext("2d");
	
	const amp = carrierGain.gain.value;
	const freq = carrier.frequency.value;

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.beginPath();

	ctx.lineWidth = 2;

	for (let i = 0; i < numSamplesToDraw; ++i) {
		let x = i * canvas.width / numSamplesToDraw;
		let t = (i - (numSamplesToDraw / 2)) / drawSampleRate;
		let y = Math.sin(t * 2 * Math.PI * freq);
		y *= canvas.height * 0.5 * 0.9;
		y *= amp;
		y += canvas.height * 0.5;
		if (i === 0) {
			ctx.moveTo(x,y);
		} else {
			ctx.lineTo(x,y);
		}
	}
	ctx.stroke()
}

function drawModulator() {
	const canvas = document.getElementById("modulator-graph");
	if (!(canvas.getContext)) {
		// Canvas un-supported
		return;
	}
	const ctx = canvas.getContext("2d");

	// Spikes at each integer ratio, with spikes at higher integers being less powerful.
	const freqRatio = Math.max(modulator.frequency.value / carrier.frequency.value, 0.5);
	const similarityScore = Math.pow((1 - Math.abs(((freqRatio + 1.5) % 1) - 0.5) * 2), 6) / freqRatio;

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	const f = "rgba(" + highlightColor + ", " + similarityScore + ")"; // pick a better color.
	ctx.fillStyle = f;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	const amp = modulatorGain.gain.value / carrier.frequency.value;
	const freq = modulator.frequency.value;


	ctx.beginPath();

	ctx.lineWidth = 2;

	for (let i = 0; i < numSamplesToDraw; ++i) {
		let x = i * canvas.width / numSamplesToDraw;
		let t = (i - (numSamplesToDraw / 2)) / drawSampleRate;
		let y = Math.sin(t * 2 * Math.PI * freq);
		y *= canvas.height * 0.5 * 0.25;
		y *= amp;
		y += canvas.height * 0.5;
		if (i == 0) {
			ctx.moveTo(x,y);
		} else {
			ctx.lineTo(x,y);
		}
	}

	ctx.stroke();
}

function drawWaveform() {
	const canvas = document.getElementById("waveform-graph");
	if (!(canvas.getContext)) {
		// Canvas un-supported
		return;
	}
	const ctx = canvas.getContext("2d");
	
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.beginPath();

	 ctx.lineWidth = 2;

	const carrF = carrier.frequency.value;
	const carrAmp = carrierGain.gain.value;
	const modF = modulator.frequency.value;
	const modAmp = modulatorGain.gain.value / modF;

	for (let i = 0; i < numSamplesToDraw; ++i) {
		let x = i * canvas.width / numSamplesToDraw;

		let t = (i - (numSamplesToDraw / 2)) / drawSampleRate;
		let y = carrAmp * Math.sin(carrF * TAU * t + modAmp * Math.sin(modF * TAU * t));

		y *= canvas.height * 0.5 * 0.9;
		y *= carrAmp;
		y += canvas.height * 0.5;
		if (i == 0) {
			ctx.moveTo(x,y);
		} else {
			ctx.lineTo(x,y);
		}
	}

	ctx.stroke();
}

function drawGuidebars(incr, strength) {

	const canvas = document.getElementById("spectrum-graph");
	const ctx = canvas.getContext("2d");

// hzStep: pixels per hz.
	const hzStep = canvas.width / (spectrumUpperBound - spectrumLowerBound);

	ctx.fillStyle = "rgba(" + highlightColor + ", " + strength * 0.3 + ")";
	let startHz = Math.floor(spectrumLowerBound / (incr * 2)) * incr * 2;
	for (let i = startHz; i < spectrumUpperBound; i += incr * 2) {
		ctx.fillRect((i - spectrumLowerBound) * hzStep, 0, incr * hzStep, canvas.height);
	}
}

function drawSpectrum() {
	const canvas = document.getElementById("spectrum-graph");
	if (!(canvas.getContext)) {
		// Canvas un-supported
		return;
	}
	const ctx = canvas.getContext("2d");

	for (let i = 0; i < 4; ++i) {
		analyser.getByteFrequencyData(analyserData);

	}

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.beginPath();


	if (carrier.frequency.value < 50) {
		incr = 1000;
	} else {
		incr = carrier.frequency.value;
	}

	let staticIncr = 1000;
	let dynamicIncr = carrier.frequency.value;

	const transBandLow = 30;
	const transBandHi = 160;

	let staticStrength = 0;
	if (carrier.frequency.value < transBandLow) {
		staticStrength = 1;
	}
	if (carrier.frequency.value < transBandHi) {
		staticStrength = (transBandHi - carrier.frequency.value) / (transBandHi - transBandLow);
	}
	let dynamicStrength = 1 - staticStrength;

	if (dynamicStrength != 0) {
		drawGuidebars(dynamicIncr, dynamicStrength);
	}
	if (staticStrength != 0) {
		drawGuidebars(staticIncr, staticStrength);
	}

	const lowLine = (spectrumLowerBound / audioCtx.sampleRate) * (analyserData.length * 2);
	const highLine = (spectrumUpperBound / audioCtx.sampleRate) * (analyserData.length * 2);
	// Number of fft lines per pixel
	const lineStep = (highLine - lowLine) / canvas.width;


	ctx.fillStyle = "rgba(247, 59, 59, 0.5)";
	ctx.strokeStyle = "black";
	ctx.lineWidth = 2;

	ctx.beginPath();
	ctx.moveTo(0, canvas.height);
	for (let x = 0; x < canvas.width; ++x) {
		let lo = Math.floor(lowLine + lineStep * x);
		let hi = Math.floor(lowLine + lineStep * (x + 1));
		let m = -1;
		for (let j = Math.max(0, lo); j < Math.min(hi, analyserData.length); ++j) {
			m = Math.max(analyserData[j], m);
		}
		if (m >= 0) {
			let y = canvas.height - ((m / 256) * canvas.height);
			ctx.lineTo(x,y)
		}
	}
	ctx.lineTo(canvas.width, canvas.height);
	ctx.fill();
	ctx.stroke();
}

function drawAll() {
	if (!isRunning) {
		return;
	}
	if (needsRedrawing) {
		drawCarrier();
		drawModulator();
		drawWaveform();
		needsRedrawing = false;
	}
	drawSpectrum();
}

function startPlayback() {
	if (isRunning) {
		return;
	}
	if (!window.AudioContext) {
		if (!window.webkitAudioContext) {
			alert("Your browser sucks because it does NOT support any AudioContext!");
			return;
		}
	}

	// create web audio api context
	const AudioContext = window.AudioContext || window.webkitAudioContext;
	audioCtx = new AudioContext();

	carrier = audioCtx.createOscillator();
	carrier.frequency.value = 220;
	carrier.type = "sine";
	carrierGain = audioCtx.createGain();
	carrierGain.gain.value = 0.1;
	carrier.connect(carrierGain);

	analyser = audioCtx.createAnalyser();
	analyser.fftSize = 8192;

	analyserData = new Uint8Array(analyser.frequencyBinCount);

	carrierGain.connect(analyser);
	analyser.connect(audioCtx.destination);

	modulator = audioCtx.createOscillator();
	modulatorGain = audioCtx.createGain();
	modulator.connect(modulatorGain);
	modulatorGain.connect(carrier.frequency);


	carrier.start();
	modulator.start();

	carrierFreqSliderMoved();
	carrierAmpSliderMoved();
	modulatorFreqSliderMoved();
	modulatorAmpSliderMoved();

	// start a timer to redraw all of the canvasses 20 times per second.
	setInterval(drawAll, 50);

	isRunning = true;
	needsRedrawing = true;

	document.getElementById("play-button").disabled = true;
	document.getElementById("pause-button").disabled = false;

}

function pausePlayback() {
	document.getElementById("play-button").disabled = false;
	document.getElementById("pause-button").disabled = true;

	carrier.stop();
	modulator.stop();
	isRunning = false;
}


function sliderToFreq(pos, doround=true) {
	let f = Math.pow(10.0, pos);
	if (doround) {
		return Math.round((f + Number.EPSILON) * 100) / 100;
	} else {
		return f;
	}
}

function clampFreq(f) {
	return Math.max(1.0, Math.min(f, 10000.0));
}

function freqToSlider(f) {
	return (Math.log(f) / Math.log(10.0))
}

function carrierFreqSliderMoved() {

	let slider = document.getElementById("carrier_freq");
	let textinput = document.getElementById("carrier_freq_text");
	let f = sliderToFreq(Number(slider.value));
	textinput.value = sliderToFreq(Number(slider.value));
	carrier.frequency.value = f;
	modulatorAmpSliderMoved();
	needsRedrawing = true;
}

function carrierAmpSliderMoved() {
	let slider = document.getElementById("carrier_amp");
	let textinput = document.getElementById("carrier_amp_text");

	textinput.value = slider.value;
	carrierGain.gain.value = Number(slider.value);

	needsRedrawing = true;
}

function carrierFreqTextChanged() {
	let slider = document.getElementById("carrier_freq");
	let textinput = document.getElementById("carrier_freq_text");

	let f = Number(textinput.value);
	if (!isNaN(f)) {
		slider.value = freqToSlider(clampFreq(f));
		textinput.value = clampFreq(f);
		carrier.frequency.value = clampFreq(f);
		modulatorAmpSliderMoved();
		needsRedrawing = true;
	}
}

function carrierAmpTextChanged() {
	let slider = document.getElementById("carrier_amp");
	let textinput = document.getElementById("carrier_amp_text");

	let n = Number(textinput.value);
	if (!isNaN(n)) {
		let a = Math.max(0.0, Math.min(n, 10.0));
		slider.value = a;
		textinput.value = a;
		carrierGain.gain.value = a;

		needsRedrawing = true;

	}
}

function modulatorFreqSliderMoved() {
	let slider = document.getElementById("modulator_freq");
	let textinput = document.getElementById("modulator_freq_text");

	let f = sliderToFreq(Number(slider.value));
	textinput.value = sliderToFreq(Number(slider.value));
	modulator.frequency.value = f;

	needsRedrawing = true;
}

function modulatorAmpSliderMoved() {
	let slider = document.getElementById("modulator_amp");
	let textinput = document.getElementById("modulator_amp_text");

	textinput.value = slider.value;
	modulatorGain.gain.value = Number(slider.value) * carrier.frequency.value;

	needsRedrawing = true;

}

function modulatorFreqTextChanged() {
	let slider = document.getElementById("modulator_freq");
	let textinput = document.getElementById("modulator_freq_text");

	let f = Number(textinput.value);
	if (!isNaN(f)) {
		slider.value = freqToSlider(clampFreq(f));
		textinput.value = clampFreq(f);
		modulator.frequency.value = clampFreq(f);

		needsRedrawing = true;
	}
}

function modulatorAmpTextChanged() {
	let slider = document.getElementById("modulator_amp");
	let textinput = document.getElementById("modulator_amp_text");

	let n = Number(textinput.value);
	if (!isNaN(n)) {
		let a = Math.max(0.0, Math.min(n, 10.0));
		slider.value = a;
		textinput.value = a;
		modulatorGain.gain.value = a * carrier.frequency.value;

		needsRedrawing = true;
	}
}

function lowerSpectrumBoundsChanged() {
	let low = document.getElementById("lower-spectrum-bound");
	let hi = document.getElementById("upper-spectrum-bound");
	let lower = Number(low.value);
	let upper = Number(hi.value);
	const lowest = 0;
	const highest = audioCtx.sampleRate / 2;
	if (!isNaN(lower) && !isNaN(upper)) {
		lower = Math.max(lowest, Math.min(lower, highest));
		spectrumLowerBound = lower;
		low.value = lower;

		if (upper < lower) {
			spectrumUppperBound = lower;
			hi.value = lower;
		}
	}
}

function upperSpectrumBoundsChanged() {
	let low = document.getElementById("lower-spectrum-bound");
	let hi = document.getElementById("upper-spectrum-bound");
	let lower = Number(low.value);
	let upper = Number(hi.value);
	const lowest = 0;
	const highest = audioCtx.sampleRate / 2;
	if (!isNaN(lower) && !isNaN(upper)) {
		upper = Math.max(lowest, Math.min(upper, highest));
		spectrumUpperBound = upper;
		hi.value = upper;
		if (upper < lower) {
			spectrumLowerBound = upper;
			low.value = upper;
		}
	}
}


window.onload = function appInit() {
	resizeCanvasses();
	let low = document.getElementById("lower-spectrum-bound");
	let hi = document.getElementById("upper-spectrum-bound");
	low.value = spectrumLowerBound;
	hi.value = spectrumUpperBound;
	drawGuidebars(1000, 1);
}
