import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

const FaceCamera = ({ onFaceDetected }) => {
    const videoRef = useRef();
    const canvasRef = useRef();
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [livenessMessage, setLivenessMessage] = useState("Loading AI...");
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = '/models'; // Ensure these files exist in public/models
            try {
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL), // Load expression model
                ]);
                setModelsLoaded(true);
                setLivenessMessage("Position your face & Smile to verify!");
            } catch (err) {
                console.error("Failed to load models", err);
                setLivenessMessage("Error loading AI models");
            }
        };
        loadModels();
    }, []);

    const startVideo = () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setLivenessMessage("Camera not supported. secure context (HTTPS) required.");
            return;
        }

        navigator.mediaDevices.getUserMedia({ video: {} })
            .then((stream) => {
                videoRef.current.srcObject = stream;
            })
            .catch((err) => {
                console.error("Error accessing camera:", err);
                setLivenessMessage("Camera permission denied or error.");
            });
    };

    useEffect(() => {
        if (modelsLoaded) {
            startVideo();
        }
    }, [modelsLoaded]);

    const handleVideoPlay = () => {
        const interval = setInterval(async () => {
            if (!videoRef.current || isVerified) {
                if (isVerified) clearInterval(interval);
                return;
            }

            try {
                if (videoRef.current && videoRef.current.readyState === 4) {
                    const detections = await faceapi.detectAllFaces(
                        videoRef.current,
                        new faceapi.TinyFaceDetectorOptions()
                    ).withFaceLandmarks().withFaceDescriptors().withFaceExpressions();

                    if (detections.length > 0) {
                        const detection = detections[0];
                        const expressions = detection.expressions;

                        // Liveness Check: Require a Smile (Happy > 0.5)
                        if (expressions.happy > 0.5) {
                            setIsVerified(true);
                            setLivenessMessage("Verified! Processing...");
                            onFaceDetected(detection.descriptor);
                        } else {
                            setLivenessMessage("Please SMILE to verify liveness 😊");
                        }

                        // Visual feedback
                        if (canvasRef.current) {
                            const canvas = canvasRef.current;
                            const displaySize = { width: videoRef.current.width, height: videoRef.current.height };
                            faceapi.matchDimensions(canvas, displaySize);
                            const resizedDetections = faceapi.resizeResults(detections, displaySize);
                            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
                            faceapi.draw.drawDetections(canvas, resizedDetections);
                        }
                    }
                }
            } catch (err) {
                console.error("Face Detection Error", err);
            }
        }, 500); // Check every 500ms
        return () => clearInterval(interval);
    };

    return (
        <div className="relative w-full max-w-md mx-auto aspect-video bg-black rounded-lg overflow-hidden border-2 border-indigo-500 shadow-lg">
            {!modelsLoaded && <div className="absolute inset-0 flex items-center justify-center text-white z-10 bg-black/50">{livenessMessage}</div>}

            <video
                ref={videoRef}
                autoPlay
                muted
                onPlay={handleVideoPlay}
                width="640"
                height="480"
                className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

            <div className={`absolute bottom-0 left-0 right-0 p-2 text-center font-bold transition-colors ${isVerified ? 'bg-green-500 text-white' : 'bg-black/60 text-yellow-300'}`}>
                {livenessMessage}
            </div>
        </div>
    );
};

export default FaceCamera;
