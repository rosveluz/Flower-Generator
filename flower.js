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
    const petalLength = 180;

    switch (expression) {
        case "happy":
            ctx.fillStyle = "rgba(255, 255, 0, 0.4)";
            break;
        case "sad":
            ctx.fillStyle = "rgba(255, 0, 255, 0.4)";
            break;
        case "angry":
            ctx.fillStyle = "rgba(255, 0, 0, 0.4)";
            break;
        default:
            ctx.fillStyle = "rgba(0, 255, 0, 0.4)";
    }

    for (let i = 0; i < petalsCount; i++) {
        const angle = (i * 360 / petalsCount) * (Math.PI / 180);
        
        const baseWidth = petalLength * 0.3; // The width at the base of the petal
        const tipWidth = petalLength * 0.1;  // The width at the tip of the petal

        const midX = centerX + 0.5 * petalLength * Math.cos(angle);
        const midY = centerY + 0.5 * petalLength * Math.sin(angle);

        ctx.beginPath();

        // Upper half of the petal
        ctx.ellipse(midX, midY, baseWidth, tipWidth, angle, Math.PI, 2 * Math.PI, false);

        // Lower half of the petal
        ctx.ellipse(midX, midY, baseWidth, tipWidth, angle, 0, Math.PI, false);

        ctx.closePath();
        ctx.fill();
    }

    console.log("Drawing flower with", petalsCount, "petals and expression", expression);
}

function drawSingleOvalPetal() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const angle = 0; // just for testing a single petal
    const petalLength = 180;
    
    const baseWidth = petalLength * 0.7; // The width at the base of the petal
    const tipWidth = petalLength * 0.1;  // The width at the tip of the petal

    const midX = centerX + 0.5 * petalLength * Math.cos(angle);
    const midY = centerY + 0.5 * petalLength * Math.sin(angle);

    const tipX = centerX + petalLength * Math.cos(angle);
    const tipY = centerY + petalLength * Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);

    // Upper half of the petal
    ctx.ellipse(midX, midY, baseWidth, tipWidth, angle, Math.PI, 2 * Math.PI, false);

    // Lower half of the petal
    ctx.ellipse(midX, midY, baseWidth, tipWidth, angle, 0, Math.PI, false);

    ctx.closePath();
    ctx.fill();
}

drawSingleOvalPetal();



