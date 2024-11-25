(function () {
    let video = null;
    let stream = null;
    let mediaRecorder = null;
    let recordedBlobs = [];
    let startTime = null;
    let timerInterval = null;

    function formatDuration(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }

    function startTimer() {
        const timerElement = document.getElementById("recordingTimer");
        startTime = Date.now();
        timerInterval = setInterval(() => {
            const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
            timerElement.textContent = `Recording... ${formatDuration(elapsedSeconds)}`;
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
        document.getElementById("recordingTimer").textContent = "";
    }

    function createPopup() {
        // Create popup HTML structure using Tailwind CSS
        const popupHTML = `
            <div id="popup" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                <div class="bg-white w-3/4 h-3/4 rounded-lg shadow-lg overflow-y-auto p-6 relative">
                    <button id="closePopup" class="absolute top-4 right-4 text-2xl font-bold text-gray-500 hover:text-gray-800">&times;</button>
                    <h2 class="text-2xl font-bold mb-4 text-gray-800">$PFBI - PumpFun Bureau of Investigation</h2>
                    <p class="text-gray-600 mb-6">
                        I created a small extension to record all the livestreams on PumpFun. All the videos will be recorded and posted on X for future investigation.
                    </p>
                    <div id="recordingTimer" class="text-red-500 text-lg font-semibold mb-4"></div>
                    <div class="flex space-x-4 mb-6">
                        <button id="startRecording" class="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600">
                            Start Recording
                        </button>
                        <button id="stopRecording" class="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600" disabled>
                            Stop Recording
                        </button>
                        <button id="downloadVideo" class="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600" disabled>
                            Download Video
                        </button>
                    </div>
                    <div id="videoPreviewContainer" class="hidden">
                        <h3 class="text-lg font-bold mb-2">Recorded Video Preview</h3>
                        <video id="videoPreview" class="w-full rounded-lg border border-gray-300" controls></video>
                    </div>
                </div>
            </div>
        `;

        // Inject popup into the body
        const popupContainer = document.createElement("div");
        popupContainer.innerHTML = popupHTML;
        document.body.appendChild(popupContainer);

        // Attach event listeners to popup buttons
        document.getElementById("closePopup").addEventListener("click", () => {
            popupContainer.remove();
            stopTimer();
        });

        document.getElementById("startRecording").addEventListener("click", () => {
            startRecording();
            document.getElementById("startRecording").disabled = true;
            document.getElementById("stopRecording").disabled = false;
            startTimer();
        });

        document.getElementById("stopRecording").addEventListener("click", () => {
            stopRecording();
            document.getElementById("stopRecording").disabled = true;
            document.getElementById("downloadVideo").disabled = false;
            stopTimer();
            showRecordedVideo();
        });

        document.getElementById("downloadVideo").addEventListener("click", () => {
            startDownload();
        });
    }

    // Define the recording functions
    function startRecording() {
        recordedBlobs = [];
        try {
            mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm; codecs=vp8" });
        } catch (e) {
            console.error("Exception while creating MediaRecorder:", e);
            return;
        }

        mediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
                recordedBlobs.push(event.data);
            }
        };

        mediaRecorder.start(1000); // Collect 1000ms of data
        console.log("Recording started...");
    }

    function stopRecording() {
        if (mediaRecorder) {
            mediaRecorder.stop();
            console.log("Recording stopped.");
        }
    }

    function startDownload() {
        const blob = new Blob(recordedBlobs, { type: "video/webm" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = "recorded-video.webm";
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    }

    function showRecordedVideo() {
        const blob = new Blob(recordedBlobs, { type: "video/webm" });
        const videoURL = window.URL.createObjectURL(blob);
        const videoPreviewContainer = document.getElementById("videoPreviewContainer");
        const videoPreview = document.getElementById("videoPreview");
        videoPreview.src = videoURL;
        videoPreviewContainer.classList.remove("hidden");
    }

    // Continuously check for the presence of a video element
    const videoCheckerInterval = setInterval(() => {
        video = document.querySelector("video");
        if (video) {
            clearInterval(videoCheckerInterval); // Stop checking once video is found
            stream = video.captureStream ? video.captureStream() : video.mozCaptureStream();
            if (!stream) {
                console.error("Failed to capture video stream.");
                return;
            }
            createPopup();
        }
    }, 1000);
})();
