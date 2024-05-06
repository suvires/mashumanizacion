import React, { forwardRef, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { debugLog } from "../utils/debugUtil";

const Video = forwardRef(
  ({ video, onRetry, onVideoEnded, onSetAlert, completed, viewed }, ref) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [videoEnded, setVideoEnded] = useState(false);
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
      setVideoEnded(completed || viewed);
    }, [completed, viewed]);

    useEffect(() => {
      setIsPlaying(false);
    }, [video]);

    const handlePlayerButton = () => {
      if (videoEnded) {
        ref.current.currentTime = 0;
        setVideoEnded(false);
      }
      if (isPlaying) {
        ref.current.pause();
      } else {
        ref.current.play();
      }
      setIsPlaying(!isPlaying);
    };

    const handledOnVideoEnded = () => {
      debugLog("Video ended");
      setVideoEnded(true);
      setIsPlaying(false);
      onVideoEnded();
    };

    const handleAlertButton = () => {
      const currentTime = ref.current.currentTime;
      onSetAlert(currentTime);
      debugLog("Showing alert...");
      setShowAlert(true);
      setTimeout(() => {
        debugLog("Hiding alert...");
        setShowAlert(false);
      }, 1000);
    };

    const handleRetry = () => {
      onRetry();
      setVideoEnded(false);
      setIsPlaying(true);
    };

    useEffect(() => {
      debugLog("Setting videoEnded to false");
      setVideoEnded(false);
    }, [video]);

    return (
      <div>
        {showAlert && <div>¡Alerta!</div>}
        <video
          ref={ref}
          src={`./assets/videos/${video}`}
          onEnded={handledOnVideoEnded}
          onContextMenu={(e) => e.preventDefault()}
        />
        {!videoEnded && (
          <button
            className={isPlaying ? "pause" : "play"}
            onClick={handlePlayerButton}
          >
            <span className="visually-hidden">
              {isPlaying ? "Pausa" : "Play"}
            </span>
          </button>
        )}
        {videoEnded && (
          <button onClick={handleRetry}>
            <span className="visually-hidden">Reintentar</span>
          </button>
        )}
        <button disabled={!isPlaying} onClick={handleAlertButton}>
          Alerta
        </button>
      </div>
    );
  },
);

Video.displayName = "Video";

Video.propTypes = {
  video: PropTypes.string,
  onVideoEnded: PropTypes.func,
  onRetry: PropTypes.func,
  onSetAlert: PropTypes.func,
  completed: PropTypes.bool,
  viewed: PropTypes.bool,
};

export default Video;
