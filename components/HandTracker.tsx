import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { Camera, AlertCircle } from 'lucide-react';

interface HandTrackerProps {
  onHandUpdate: (isOpen: boolean, openness: number) => void;
  onDetectionStateChange: (detected: boolean) => void;
}

const HandTracker: React.FC<HandTrackerProps> = ({ onHandUpdate, onDetectionStateChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef<number | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);

  useEffect(() => {
    let mounted = true;

    const setupMediaPipe = async () => {
      try {
        // Use standard jsdelivr CDN for better compatibility
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );
        
        if (!mounted) return;

        landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });

        startCamera();
      } catch (err: any) {
        console.error("Error initializing MediaPipe:", err);
        let errorMsg = "Failed to load hand tracking.";
        
        // Handle specific storage error
        if (err?.message?.includes('Access to storage') || err?.name === 'SecurityError') {
            errorMsg = "Storage access blocked. Please disable 'Block third-party cookies' or use a non-private window.";
        }
        
        setError(errorMsg);
        setLoading(false);
      }
    };

    setupMediaPipe();

    return () => {
      mounted = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (landmarkerRef.current) landmarkerRef.current.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('loadeddata', predictWebcam);
      }
      setLoading(false);
    } catch (err) {
      console.error("Camera error:", err);
      setError("Camera access denied.");
      setLoading(false);
    }
  };

  const predictWebcam = () => {
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;

    if (!video || !landmarker) return;

    const detectFrame = () => {
      if (video.currentTime > 0 && !video.paused && !video.ended) {
        try {
            const result = landmarker.detectForVideo(video, performance.now());
            
            if (result.landmarks && result.landmarks.length > 0) {
            onDetectionStateChange(true);
            const landmarks = result.landmarks[0];
            
            // Calculate distance between Thumb Tip (4) and Index Tip (8)
            const thumbTip = landmarks[4];
            const indexTip = landmarks[8];
            const wrist = landmarks[0];
            const indexMCP = landmarks[5]; // Index knuckle

            // Reference scale: Distance between wrist and Index Knuckle
            const refScale = Math.hypot(
                indexMCP.x - wrist.x, 
                indexMCP.y - wrist.y
            );

            const pinchDist = Math.hypot(
                thumbTip.x - indexTip.x,
                thumbTip.y - indexTip.y
            );

            // Normalize: 0.2 (pinch) to 1.2 (spread) approximately
            const normalized = Math.min(Math.max((pinchDist / refScale - 0.2) / 1.0, 0), 1);
            
            onHandUpdate(true, normalized);
            } else {
            onDetectionStateChange(false);
            onHandUpdate(false, 0);
            }
        } catch (e) {
            console.warn("Detection error:", e);
        }
      }
      requestRef.current = requestAnimationFrame(detectFrame);
    };

    detectFrame();
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 overflow-hidden rounded-xl border border-white/20 shadow-2xl bg-black/50 backdrop-blur-sm transition-all duration-300 w-32 h-24 sm:w-48 sm:h-36 group ${error ? 'border-red-500/50' : ''}`}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-white/50 text-xs">
            Loading AI...
          </div>
        )}
        {error && (
           <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 text-[10px] text-center p-2 leading-tight bg-black/80">
             <AlertCircle className="w-4 h-4 mb-1" />
             {error}
           </div>
        )}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover transform scale-x-[-1] opacity-60 group-hover:opacity-100 transition-opacity ${loading || error ? 'invisible' : 'visible'}`}
        />
        {!loading && !error && (
            <div className="absolute top-2 left-2 flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <Camera className="w-3 h-3 text-white/70" />
            </div>
        )}
    </div>
  );
};

export default HandTracker;