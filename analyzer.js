FFTANALYSER = function() {
	
	const audio = document.getElementById("audio");
	
	const samplingFreq = 44100;
	const context = new AudioContext({sampleRate:samplingFreq});
	let src = context.createMediaElementSource(audio);
	const analyser = context.createAnalyser();
	
	var bufferLength;
	
	function init() {
		src.connect(analyser);
		analyser.connect(context.destination);
		setSize(8192);
	}
	
	function setSize(size) {		
		if(size && (size & (size - 1)) === 0) {
			analyser.fftSize = size;
			analyser.maxDecibels = -18.0;
			bufferLength = analyser.frequencyBinCount;
		}
		else {
			alert("FFT size is required to be a power of two.");
		}
	}
	
	function getsize() {
		return bufferLength;
	}
	
	function getData() {
		var dataArray = new Uint8Array(bufferLength);
		analyser.getByteFrequencyData(dataArray);
		return dataArray;
	}
	
	window.onload = function() {
		// FFTANALYSER.init();
		// resizeApp();
	}
	
	return {
		init:init,
		setSize:setSize,
		getSize:getsize,
		getData:getData
	}
}();
