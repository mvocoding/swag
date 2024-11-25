(function () {
    let video = null;
    let stream = null;
    let mediaRecorder = null;
    let recordedBlobs = [];

    function createPopup() {
        // Create popup HTML structure
        const popupHTML = `
            <div id="popup" style="position: fixed; top: 10%; left: 50%; transform: translateX(-50%); width: 75%; height: 75%; background-color: white; z-index: 1000; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-radius: 8px; padding: 16px; display: flex; flex-direction: column; align-items: flex-start; overflow-y: auto;">
                <div style="width: 100%; text-align: right;">
                    <button id="closePopup" style="background: none; border: none; font-size: 20px; cursor: pointer;">&times;</button>
                </div>
                <h2 style="margin-bottom: 8px; font-size: 24px;">$PFBI - PumpFun Bureau of Investigation</h2>
                <p style="margin-bottom: 16px; font-size: 16px;">
                    I created a small extension to record all the livestreams on PumpFun. All the videos will be recorded and posted on X for future investigation.
                </p>
                <div style="display: flex; flex-direction: column; gap: 16px; width: 100%;">
                    <div style="display: flex; gap: 12px;">
                        <button id="startRecording" style="padding: 10px 20px; background-color: #34d399; color: white; border: none; border-radius: 4px; cursor: pointer; transition: background-color 0.3s;">
                            Start Recording
                        </button>
                        <button id="stopRecording" style="padding: 10px 20px; background-color: #f87171; color: white; border: none; border-radius: 4px; cursor: pointer; transition: background-color 0.3s;" disabled>
                            Stop Recording
                        </button>
                        <button id="downloadVideo" style="padding: 10px 20px; background-color: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; transition: background-color 0.3s;" disabled>
                            Download Video
                        </button>
                    </div>
                    <div id="videoPreviewContainer" style="margin-top: 16px; display: none;">
                        <h3 style="font-size: 20px; margin-bottom: 8px;">Recorded Video Preview</h3>
                        <video id="videoPreview" style="width: 100%; height: auto;" controls></video>
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
        });

        document.getElementById("startRecording").addEventListener("click", () => {
            startRecording();
            document.getElementById("startRecording").disabled = true;
            document.getElementById("stopRecording").disabled = false;
        });

        document.getElementById("stopRecording").addEventListener("click", () => {
            stopRecording();
            document.getElementById("stopRecording").disabled = true;
            document.getElementById("downloadVideo").disabled = false;
            showRecordedVideo();
        });

        document.getElementById("downloadVideo").addEventListener("click", () => {
            startDownload();
        });

        // Add hover effects for all buttons
        const buttons = popupContainer.querySelectorAll("button");
        buttons.forEach(button => {
            button.addEventListener("mouseover", () => {
                button.style.backgroundColor = "#1e3a8a"; // Darker shade
            });
            button.addEventListener("mouseout", () => {
                if (button.id === "startRecording") button.style.backgroundColor = "#34d399";
                else if (button.id === "stopRecording") button.style.backgroundColor = "#f87171";
                else if (button.id === "downloadVideo") button.style.backgroundColor = "#3b82f6";
            });
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
        videoPreviewContainer.style.display = "block";
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
