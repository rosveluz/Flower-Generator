const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

let previousExpression = null;

canvas.width = canvas.width;
canvas.height = canvas.height;

let avgColor;
let animationStarted = false;

let number = 0;
let angle = 0;

function getPetalCount(expression) {
    console.log("Expression received:", expression);
    switch (expression) {
        case 'sad':
        case 'angry':
        case 'disgusted':
            return 4;
        case 'neutral':
            return 7;
        case 'happy':
        case 'surprised':
            return Math.floor(Math.random() * 17) + 8;
        default:
            return 8;
    }
}

function getInverseColor(color) {
    let rgb = color.match(/\d+/g);
    return `rgb(${255 - rgb[0]}, ${255 - rgb[1]}, ${255 - rgb[2]})`;
}

function drawPetal(ctx, canvas, avgColor, angle, maxPetals) {
    ctx.globalCompositeOperation = 'multiply';

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const controlDistance = canvas.width / 3;
    const endPointDistance = canvas.width / 2 * 0.9;

    const controlX1 = centerX + controlDistance * Math.sin(angle + Math.PI / 6);
    const controlY1 = centerY + controlDistance * Math.cos(angle + Math.PI / 6);
    const controlX2 = centerX + controlDistance * Math.sin(angle - Math.PI / 6);
    const controlY2 = centerY + controlDistance * Math.cos(angle - Math.PI / 6);
    const endX = centerX + endPointDistance * Math.sin(angle);
    const endY = centerY + endPointDistance * Math.cos(angle);

    ctx.fillStyle = avgColor;
    ctx.strokeStyle = getInverseColor(avgColor);
    ctx.lineWidth = 16;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.quadraticCurveTo(controlX1, controlY1, endX, endY);
    ctx.quadraticCurveTo(controlX2, controlY2, centerX, centerY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    return angle + (2 * Math.PI) / maxPetals;
}

let maxPetals = 8;
let animationDelay = 200;
let lastTime = 0;

function animate(currentTime) {
    if (!animationStarted) {
        return;
    }

    if (!lastTime) {
        lastTime = currentTime;
    }

    if (currentTime - lastTime >= animationDelay) {
        if (number < maxPetals) {
            angle = drawPetal(ctx, canvas, avgColor, angle, maxPetals);
            number++;
            lastTime = currentTime;
        } else {
            animationStarted = false;
            return;
        }
    }

    requestAnimationFrame(animate);
}


export function startFlowerAnimation(avgColorRgb, expression) {
    console.log("About to start flower animation with expression:", expression);

    avgColor = avgColorRgb;

    if (expression === previousExpression) {
        return;
    }

    if (!animationStarted) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        number = 0;
        maxPetals = getPetalCount(expression);

        console.log("Number of petals to draw:", maxPetals); // Logging maxPetals here after determining it

        let angularSpacing = (2 * Math.PI) / maxPetals;
        let offsetAngle = (maxPetals % 2 === 1) ? angularSpacing / 2 : 0;

        angle = offsetAngle;  // Start drawing from this offset

        lastTime = 0;
        animationStarted = true;
        requestAnimationFrame(animate);
    }

    previousExpression = expression;
}
