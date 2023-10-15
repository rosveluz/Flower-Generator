/* script.js */
const video = document.getElementById('video');

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo);

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  );
}

function getAverageColor(src, region) {
    const colorCanvas = document.getElementById('color-detection');
    const context = colorCanvas.getContext('2d');
    context.drawImage(src, 0, 0, src.width, src.height);

    // Ensuring the values are valid
    region.x = Math.max(0, Math.round(region.x));
    region.y = Math.max(0, Math.round(region.y));
    region.width = Math.round(region.width);
    region.height = Math.round(region.height);

    try {
        const data = context.getImageData(region.x, region.y, region.width, region.height).data;

        let red = 0, green = 0, blue = 0, count = 0;

        for (let i = 0; i < data.length; i += 4) {
            red += data[i];
            green += data[i + 1];
            blue += data[i + 2];
            count++;
        }

        red = Math.round(red / count);
        green = Math.round(green / count);
        blue = Math.round(blue / count);

        return `rgb(${red}, ${green}, ${blue})`;
    } catch (err) {
        console.error('Error getting image data:', err);
    }
}

function rgbToColorName(r, g, b) {
    const colors = {
        "White": [255, 255, 255],
        "Black": [0, 0, 0],
        "Red": [255, 0, 0],
        "Green": [0, 255, 0],
        "Blue": [0, 0, 255],
        "Yellow": [255, 255, 0],
        "Magenta": [255, 0, 255],
        "Cyan": [0, 255, 255],
        "Purple": [128, 0, 128],
        "Pink": [255, 192, 203],
        "Orange": [255, 165, 0],
        "Brown": [165, 42, 42],
        "Gray": [128, 128, 128],
        "LightGreen": [144, 238, 144],
        "DarkBlue": [0, 0, 139],
        "Lavender": [230, 230, 250],
        "Olive": [128, 128, 0],
        "Beige": [245, 245, 220],
        "Maroon": [128, 0, 0],
        "Navy": [0, 0, 128],
        
        // "LightGray": [211, 211, 211],
        // "Silver": [192, 192, 192],
        // "DarkGray": [169, 169, 169],
        // "SlateGray": [112, 128, 144],
        // "DimGray": [105, 105, 105],
        // "Gainsboro": [220, 220, 220],
        // "AshGray": [178, 190, 181],

        // Off-White shades
        "Snow": [255, 250, 250],
        "Honeydew": [240, 255, 240],
        "MintCream": [245, 255, 250],
        "Azure": [240, 255, 255],
        "Ivory": [255, 255, 240],
        "FloralWhite": [255, 250, 240],
        "AntiqueWhite": [250, 235, 215],
        "Linen": [250, 240, 230],
        "LavenderBlush": [255, 240, 245],

        // Additional Reds
        "Crimson": [220, 20, 60],
        "DarkRed": [139, 0, 0],
        "FireBrick": [178, 34, 34],
        "LightCoral": [240, 128, 128],
        "IndianRed": [205, 92, 92],

        // Additional Blues
        "RoyalBlue": [65, 105, 225],
        "MediumBlue": [0, 0, 205],
        "SkyBlue": [135, 206, 235],
        "SteelBlue": [70, 130, 180],
        "PowderBlue": [176, 224, 230],

        // Additional Greens
        "ForestGreen": [34, 139, 34],
        "DarkGreen": [0, 100, 0],
        "SeaGreen": [46, 139, 87],
        "LightGreen": [144, 238, 144],
        "LimeGreen": [50, 205, 50],
        "PaleGreen": [152, 251, 152],
        "MediumSeaGreen": [60, 179, 113]
    };

    let closestColor = "Unknown";
    let minDistance = Infinity;

    for (const colorName in colors) {
        const color = colors[colorName];
        const distance = Math.sqrt((r - color[0]) ** 2 + (g - color[1]) ** 2 + (b - color[2]) ** 2);

        if (distance < minDistance) {
            minDistance = distance;
            closestColor = colorName;
        }
    }

    return closestColor;
}

video.addEventListener('play', () => {
    const canvas = document.getElementById('face-detection');
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);
    faceapi.matchDimensions(document.getElementById('color-detection'), displaySize);
    
    const faceExpressionElement = document.getElementById('faceExpression');
    

    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        
        // Color detection logic
        if (resizedDetections[0]) {
            const faceBox = resizedDetections[0].detection.box;
            const colorRegion = {
                x: faceBox.x / 1.5,
                y: faceBox.y + faceBox.height, // this should give you the y-coordinate of the bottom of the face box
                width: faceBox.width * 2,
                height: faceBox.height * 1.2 // taking 30% of the face height as our region of interest below the face
            };
            
            const avgColorRgb = getAverageColor(video, colorRegion);
            const avgColorName = rgbToColorName(...avgColorRgb.split('(')[1].split(')')[0].split(',').map(val => +val.trim()));
            document.getElementById('colorDetection').innerText = `${avgColorName}`;
            // document.getElementById('colorDetection').style.backgroundColor = avgColorRgb;

            const colorContext = document.getElementById('color-detection').getContext('2d');
            colorContext.strokeStyle = 'yellow';  // or any color you prefer for the box
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
