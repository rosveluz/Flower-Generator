let ctx; // Canvas 2D context
const canvas = document.getElementById('myCanvas');

function initCanvas2D() {
    ctx = canvas.getContext('2d');
    animate();
}

function animate() {
    requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('myCanvas');
    const video = document.getElementById('video'); 

    initCanvas2D();

    video.addEventListener('playing', async function() {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();

        if (detections.length > 0) {
            let expressions = detections[0].expressions;
            let maxExpression = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);

            let petalsCount;
            switch (maxExpression) {
                case 'sad':
                case 'angry':
                case 'disgusted':
                    petalsCount = 4;
                    break;
                case 'neutral':
                    petalsCount = Math.floor(Math.random() * 3) + 6;  // Random value between 6 and 8
                    break;
                case 'happy':
                case 'surprised':
                    petalsCount = Math.floor(Math.random() * 17) + 8;  // Random value between 8 and 24
                    break;

            }

            drawFlower(petalsCount, maxExpression);
        }

        setTimeout(arguments.callee, 2000);
    });
});


function drawScene() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawFlower(petalsCount, expression) {
    drawScene();
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const petalLength = 120;

    switch (expression) {
        case "happy":
            ctx.fillStyle = "yellow";
            break;
        case "sad":
            ctx.fillStyle = "blue";
            break;
        case "angry":
            ctx.fillStyle = "red";
            break;
        default:
            ctx.fillStyle = "gray";
    }

    for (let i = 0; i < petalsCount; i++) {
        const angle = (i * 360 / petalsCount) * (Math.PI / 180);
        const petalTipX = centerX + petalLength * Math.cos(angle);
        const petalTipY = centerY + petalLength * Math.sin(angle);

        const baseLeftX = centerX + (petalLength - 20) * Math.cos(angle - Math.PI / petalsCount);
        const baseLeftY = centerY + (petalLength - 20) * Math.sin(angle - Math.PI / petalsCount);

        const baseRightX = centerX + (petalLength - 20) * Math.cos(angle + Math.PI / petalsCount);
        const baseRightY = centerY + (petalLength - 20) * Math.sin(angle + Math.PI / petalsCount);

        // Draw petal using Bezier curves for a smoother appearance
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.bezierCurveTo(centerX, centerY, baseLeftX, baseLeftY, petalTipX, petalTipY);
        ctx.bezierCurveTo(petalTipX, petalTipY, baseRightX, baseRightY, centerX, centerY);
        ctx.closePath();
        ctx.fill();
    }

    console.log("Drawing flower with", petalsCount, "petals and expression", expression);
}

