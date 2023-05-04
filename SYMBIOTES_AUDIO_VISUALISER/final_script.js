const container = document.getElementById("container");
const canvas = document.getElementById("canvas1");
const file = document.getElementById("fileupload");
const recordBtn = document.getElementById("recordBtn");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let audioSource;
let analyser;
let audioCtx;
let mediaRecorder;
let chunks = [];

file.addEventListener("change", function () {
  console.log(this.files);
  const files = this.files;
  const audio1 = document.getElementById("audio1");
  audio1.src = URL.createObjectURL(files[0]);
  audio1.load();

  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  } else {
    audioCtx = new AudioContext();
  }

  audio1.play();

  if (!audioSource) {
      audioSource = audioCtx.createMediaElementSource(audio1);
      analyser = audioCtx.createAnalyser();
      audioSource.connect(analyser);
      analyser.connect(audioCtx.destination);
    }
  analyser.fftSize = 2048;

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  const barWidth = (canvas.width/2) / bufferLength;
  let barHeight;
  let x;

  function animate() {
    x = 0;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    analyser.getByteFrequencyData(dataArray);
    drawVisualiser1(bufferLength, x, barWidth, barHeight, dataArray);
    drawVisualiser2(bufferLength, x, barWidth, barHeight, dataArray);
    drawVisualiser3(bufferLength, x, barWidth, barHeight, dataArray);
    requestAnimationFrame(animate);
  }

  animate();
});

if (recordBtn) {
recordBtn.addEventListener("click", function() {
  if (!navigator.mediaDevices.getUserMedia) {
    console.log("getUserMedia not supported on your browser!");
    return;
  }

  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(function(stream) {
      if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume();
      } else {
        audioCtx = new AudioContext();
      }
      audioSource = audioCtx.createMediaStreamSource(stream);
      analyser = audioCtx.createAnalyser();
      audioSource.connect(analyser);
      analyser.connect(audioCtx.destination);
      mediaRecorder = new MediaRecorder(stream);
      analyser.fftSize = 2048;

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  const barWidth = (canvas.width/2) / bufferLength;
  let barHeight;
  let x;

  function animate() {
    x = 0;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    analyser.getByteFrequencyData(dataArray);
    drawVisualiser1(bufferLength, x, barWidth, barHeight, dataArray);
    drawVisualiser2(bufferLength, x, barWidth, barHeight, dataArray);
    drawVisualiser3(bufferLength, x, barWidth, barHeight, dataArray);
    requestAnimationFrame(animate);
  }

  animate();
      mediaRecorder.ondataavailable = function(e) {
        chunks.push(e.data);
      };
      mediaRecorder.onstop = function(e) {
        const blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
        const audioURL = URL.createObjectURL(blob);
        const audio2 = document.getElementById("audio2");
        audio2.src = audioURL;
        audio2.load();
        audio2.play();
      };
      mediaRecorder.start();
    })
    .catch(function(err) {
      console.log("getUserMedia error: " + err);
    });

});
} else{
    console.error("recordBtn not found.");
}


const ctx = canvas.getContext("2d");

//bar visualiser
function drawVisualiser1(bufferLength, x, barWidth, barHeight, dataArray) {
  for (let i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i];
    const red = i * barHeight / 10;
    const blue = i * barWidth+10;
    const green = barHeight / 3;
    ctx.fillStyle = 'rgb(' + red + ',' + blue + ',' + green + ')';
    ctx.fillRect(canvas.width/2 - x, canvas.height - barHeight, barWidth, barHeight);
    x += barWidth;
  }
    
  for (let i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i];
    const red = i * barHeight / 10;
    const blue = i * barWidth+10;
    const green = barHeight / 3;
    ctx.fillStyle = 'rgb(' + red + ',' + blue + ',' + green + ')';
    ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
    x += barWidth;
  }
}

//spiral visulaiser
function drawVisualiser2(bufferLength, x, barWidth, barHeight, dataArray) {
  for (let i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i];
    ctx.save();
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.rotate(i+Math.PI*2/bufferLength);
    const red = i * barHeight / 10;
    const blue = i * barWidth+10;
    const green = barHeight / 3;
    ctx.fillStyle = 'rgb(' + red + ',' + blue + ',' + green + ')';
    ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
    x += barWidth;
    ctx.restore();
  }
}

function drawVisualiser3(bufferLength, x, barWidth, barHeight, dataArray) {
  // draw the circular line
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 10, 0, 2 * Math.PI);
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.stroke();

  for (let i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i];
    if (barHeight >= 200) {
      // generate random bubble coordinates within the circle
      const angle = Math.random() * Math.PI * 2;
      const radius = (canvas.width / 10) * Math.sqrt(Math.random());
      const bubbleX = canvas.width / 2 + radius * Math.cos(angle);
      const bubbleY = canvas.height / 2 + radius * Math.sin(angle);

      // draw the bubble
      ctx.beginPath();
      ctx.arc(bubbleX, bubbleY, 10, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fill();
    }
  }
}