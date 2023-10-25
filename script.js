/* start of script.js */
/* script.js */
import { startFlowerAnimation } from './flower.js';

const video = document.getElementById('video');

import { getAverageColor, rgbToColorName, rgbToLab } from './utils.js';

let detectedExpression = 'neutral';

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo);

function startVideo() {
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then(stream => {
        video.srcObject = stream;
        video.play();
      })
      .catch(err => console.error(err));
}





video.addEventListener('play', () => {
    console.log("Video is playing");
    const canvas = document.getElementById('face-detection');
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);
    faceapi.matchDimensions(document.getElementById('color-detection'), displaySize);
    
    const faceExpressionElement = document.getElementById('faceExpression');
    

    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        canvas.getContext('2d', { willReadFrequently: true }).clearRect(0, 0, canvas.width, canvas.height);
        
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        
        // Adjusted colorRegion logic for better face-shirt color distinction
        if (resizedDetections[0]) {
        const faceBox = resizedDetections[0].detection.box;

        if (resizedDetections[0] && resizedDetections[0].expressions) {
            const emotion = Object.keys(resizedDetections[0].expressions).reduce((a, b) => 
                resizedDetections[0].expressions[a] > resizedDetections[0].expressions[b] ? a : b
            );
            faceExpressionElement.innerText = emotion;
            detectedExpression = emotion; // Store the detected expression
        }

        const colorRegion = {
            x: faceBox.x / 1.5,
            y: faceBox.y + faceBox.height, // this should give you the y-coordinate of the bottom of the face box
            width: faceBox.width * 2,
            height: faceBox.height * 1.2 // taking 30% of the face height as our region of interest below the face
        };

        const avgColorRgb = getAverageColor(video, colorRegion);
        
        if (detectedExpression !== 'neutral') {
            startFlowerAnimation(avgColorRgb, detectedExpression); // <-- Start the flower animation
        }

        const avgColorName = rgbToColorName(...avgColorRgb.split('(')[1].split(')')[0].split(',').map(val => +val.trim()));
        document.getElementById('colorDetection').innerText = `${avgColorName}`;

        const colorContext = document.getElementById('color-detection').getContext('2d', { willReadFrequently: true });
        colorContext.strokeStyle = 'yellow'; 
        colorContext.strokeRect(colorRegion.x, colorRegion.y, colorRegion.width, colorRegion.height);
        }
  
        if (resizedDetections[0] && resizedDetections[0].expressions) {
            const emotion = Object.keys(resizedDetections[0].expressions).reduce((a, b) => 
                resizedDetections[0].expressions[a] > resizedDetections[0].expressions[b] ? a : b
            );
            faceExpressionElement.innerText = emotion;
        }
        
    }, 100);
});
/* end of script.js */

