// capture.js

async function captureCanvasAndBackground(width = 1920, height = 1920) {
    const video = document.querySelector('video');
    const flowerCanvas = document.getElementById('myCanvas');
    const outputCanvas = document.createElement('canvas');
    const ctx = outputCanvas.getContext('2d');

    outputCanvas.width = width;
    outputCanvas.height = height;

    // Draw background video frame (scaled up)
    ctx.drawImage(video, 0, 0, width, height);

    // Draw flower canvas centered
    const ratio = Math.min(width / flowerCanvas.width, height / flowerCanvas.height);
    const x = (width - flowerCanvas.width * ratio) / 2;
    const y = (height - flowerCanvas.height * ratio) / 2;
    ctx.drawImage(flowerCanvas, x, y, flowerCanvas.width * ratio, flowerCanvas.height * ratio);

    return outputCanvas.toDataURL('image/png');
}

// ----------------- Countdown Logic ----------------- //

const captureButton = document.getElementById('counterButton');
const buttonText = document.getElementById('button-text');

captureButton.addEventListener('click', () => {
    startCountdown(3);
});

function startCountdown(seconds) {
    captureButton.disabled = true;
    let countdown = seconds;

    // Initial message
    buttonText.textContent = `Capturing in ${countdown}`;

    const countdownStep = () => {
        countdown--;

        if (countdown >= 0) {
            buttonText.textContent = `Capturing in ${countdown}`;
            setTimeout(countdownStep, 1000); // continue countdown
        } else {
            buttonText.textContent = 'Captured!';
            captureButton.disabled = false;

            // Generate low-res preview first
            captureCanvasAndBackground(720, 720).then((imageData) => {
                const modal = document.getElementById("imageModal");
                const modalImage = document.getElementById("modalPreview");

                modalImage.src = imageData;
                modalImage.alt = "Captured flower image";
                modalImage.style.width = "100%";
                modalImage.style.height = "auto";
                modalImage.style.maxHeight = "70vh";

                modal.classList.remove("hidden");

                // Store full resolution image separately for email
                captureCanvasAndBackground(1920, 1920).then((fullRes) => {
                    window.capturedImageData = fullRes;
                });
            });
        }
    };

    // Start countdown
    setTimeout(countdownStep, 1000);
}

// Close modal and reset session
const closeButton = document.querySelector('.close-modal');
closeButton.addEventListener('click', () => {
    const modal = document.getElementById('imageModal');
    modal.classList.add('hidden');

    // Reset UI
    const preview = document.getElementById('modalPreview');
    preview.src = '';
    preview.alt = '';

    const captureButton = document.getElementById('counterButton');
    const buttonText = document.getElementById('button-text');
    buttonText.textContent = 'Capture Timer';
    captureButton.disabled = false;

    // Optional: Clear global image data
    window.capturedImageData = null;

    // Optional: Reload page for full reset
    // location.reload();
});
