import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import Video from "./Video";
import {
  getViewedVideoStatement,
  getViewedVideoSegmentStatement,
  getRetriedVideoStatement,
} from "../utils/xapiUtils";
import { STATUS, PRACTICES } from "../config/const";
import { debugLog } from "../utils/debugUtil";

export default function Screen({
  id,
  actor,
  xapi,
  scorm,
  screen,
  onNextScreen,
  onPreviousScreen,
  totalScreens,
  status,
}) {
  const videoRef = useRef();
  const [canContinue, setCanContinue] = useState(false);
  const [progress, setProgress] = useState(0);
  const [viewed, setViewed] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [correctAlerts, setCorrectAlerts] = useState([]);
  const [incorrectAlerts, setIncorrectAlerts] = useState([]);
  const [unmarkedSegments, setUnmarkedSegments] = useState([]);
  const [viewedSegments, setViewedSegments] = useState(new Set());
  const [isViewingSegment, setIsViewingSegment] = useState(false);

  useEffect(() => {
    debugLog("Showing screen:", screen);
    const localSuspendDataString = localStorage.getItem("suspendData");
    const localSuspendData = localSuspendDataString
      ? JSON.parse(localSuspendDataString)
      : { screens: [] };
    setCorrectAlerts(localSuspendData.screens[id]?.correctAlerts || []);
    setIncorrectAlerts(localSuspendData.screens[id]?.incorrectAlerts || []);
    setUnmarkedSegments(localSuspendData.screens[id]?.unmarkedSegments || []);
    setViewedSegments(
      new Set(localSuspendData.screens[id]?.viewedSegments || []),
    );
    setViewed(localSuspendData.screens[id]?.viewed || false);
    const completedScreens = localSuspendData.screens.filter(
      (screen) => screen.completed,
    ).length;

    const progress =
      totalScreens > 0 ? (completedScreens / totalScreens) * 100 : 0;

    setProgress(progress);
  }, [screen]);

  useEffect(() => {
    if (canContinue === true) {
      const localSuspendDataString = localStorage.getItem("suspendData");
      const localSuspendData = localSuspendDataString
        ? JSON.parse(localSuspendDataString)
        : { screens: [] };
      const completedScreens = localSuspendData.screens.filter(
        (screen) => screen.completed,
      ).length;

      const progress =
        totalScreens > 0 ? (completedScreens / totalScreens) * 100 : 0;

      setProgress(progress);
      if (scorm && status !== STATUS.COMPLETED) {
        scorm.setScore(progress);
      }
    }
  }, [canContinue]);

  useEffect(() => {
    if (
      viewedSegments.size > 0 &&
      viewedSegments.size === unmarkedSegments.length
    ) {
      debugLog("All segments viewed, can continue...");
      const localSuspendDataString = localStorage.getItem("suspendData");
      const localSuspendData = localSuspendDataString
        ? JSON.parse(localSuspendDataString)
        : { screens: [] };
      localSuspendData.screens[id].completed = true;
      localStorage.setItem("suspendData", JSON.stringify(localSuspendData));
      if (scorm && status !== STATUS.COMPLETED) {
        scorm.setSuspendData(JSON.stringify(localSuspendData));
      }
      setCanContinue(true);
    }
  }, [viewedSegments]);

  const segmentIdentifier = (segment) => `${segment.start}-${segment.end}`;

  const checkAlerts = () => {
    const correctAlertsArray = [];
    const incorrectAlertsArray = [];
    const unmarkedSegmentsArray = [...screen.segments];
    const markedSegments = new Set();

    alerts.forEach((alert) => {
      const matchedSegment = screen.segments.find(
        (segment) => alert >= segment.start && alert <= segment.end,
      );

      if (matchedSegment) {
        if (!markedSegments.has(matchedSegment)) {
          correctAlertsArray.push({
            time: alert,
            title: matchedSegment.title,
          });
          markedSegments.add(matchedSegment);

          const index = unmarkedSegmentsArray.indexOf(matchedSegment);
          if (index > -1) {
            unmarkedSegmentsArray.splice(index, 1);
          }
        }
      } else {
        incorrectAlertsArray.push(alert);
      }
    });

    debugLog("Alerts: ", alerts);
    debugLog("Rights: ", correctAlertsArray);
    debugLog("Wrongs: ", incorrectAlertsArray);
    debugLog("Unmarked: ", unmarkedSegmentsArray);

    setCorrectAlerts(correctAlertsArray);
    setIncorrectAlerts(incorrectAlertsArray);
    setUnmarkedSegments(unmarkedSegmentsArray);
    setViewedSegments(new Set());

    const localSuspendDataString = localStorage.getItem("suspendData");
    const localSuspendData = localSuspendDataString
      ? JSON.parse(localSuspendDataString)
      : { screens: [] };
    localSuspendData.screens[id] = {
      correctAlerts: correctAlertsArray,
      incorrectAlerts: incorrectAlertsArray,
      unmarkedSegments: unmarkedSegmentsArray,
      viewed: true,
    };

    if (unmarkedSegmentsArray.length === 0) {
      debugLog("All segments marked, can continue...");
      localSuspendData.screens[id].completed = true;
      setCanContinue(true);
    } else {
      debugLog("Not all segments marked, can't continue...");
      localSuspendData.screens[id].completed = false;
      setCanContinue(false);
    }

    localStorage.setItem("suspendData", JSON.stringify(localSuspendData));
    if (scorm && status !== STATUS.COMPLETED) {
      scorm.setSuspendData(JSON.stringify(localSuspendData));
    }
  };

  const handleVideoEnded = () => {
    xapi.sendStatement({
      statement: getViewedVideoStatement(actor, screen.title),
    });
    debugLog("Checking alerts...");
    checkAlerts();
  };

  const handleSetAlert = (time) => {
    debugLog("Setting alert:", time);
    setAlerts((prev) => [...prev, time]);
  };

  const playSegment = (segment) => {
    debugLog("Playing segment:", segment);
    xapi.sendStatement({
      statement: getViewedVideoSegmentStatement(actor, screen.title, segment),
    });
    setIsViewingSegment(true);
    const { start, end } = segment;

    videoRef.current.currentTime = start;
    videoRef.current.play();

    const interval = setInterval(() => {
      if (videoRef.current.currentTime >= end) {
        debugLog("Segment ended");
        videoRef.current.pause();
        clearInterval(interval);
        setViewedSegments((prevViewedSegments) => {
          const newViewedSegments = new Set([...prevViewedSegments]);
          newViewedSegments.add(segmentIdentifier(segment));

          const localSuspendDataString = localStorage.getItem("suspendData");
          const localSuspendData = localSuspendDataString
            ? JSON.parse(localSuspendDataString)
            : { screens: [] };
          localSuspendData.screens[id] = {
            ...localSuspendData.screens[id],
            viewedSegments: [...newViewedSegments],
          };
          localStorage.setItem("suspendData", JSON.stringify(localSuspendData));
          if (scorm && status !== STATUS.COMPLETED) {
            scorm.setSuspendData(JSON.stringify(localSuspendData));
          }

          return newViewedSegments;
        });
        setIsViewingSegment(false);
      }
    }, 100);
  };

  const hardReset = () => {
    debugLog("Hard resetting...");
    reset();
    setCanContinue(false);
    setViewedSegments(new Set());
  };

  const reset = () => {
    debugLog("Resetting...");
    setAlerts([]);
    setCorrectAlerts({});
    setIncorrectAlerts({});
    setUnmarkedSegments({});
  };

  const handleRetry = () => {
    debugLog("Retrying...");
    xapi.sendStatement({
      statement: getRetriedVideoStatement(actor, screen.title),
    });
    reset();
    videoRef.current.currentTime = 0;
    videoRef.current.play();
  };

  const handleOnNextScreen = () => {
    hardReset();
    onNextScreen();
  };

  const handleOnPreviousScreen = () => {
    hardReset();
    onPreviousScreen();
  };

  return (
    <section id="screen">
      <p>{progress}%</p>
      <p>
        {id + 1}/{totalScreens}
      </p>
      <h1>{screen.title}</h1>
      <p>{screen.content}</p>
      <p>
        {screen.type === PRACTICES.GOOD &&
          `Identifica ${screen.segments.length} ${
            screen.segments.length > 1 ? "buenas prácticas" : "buena práctica"
          }. `}
        {screen.type === PRACTICES.BAD &&
          `Identifica ${screen.segments.length} ${
            screen.segments.length > 1 ? "malas prácticas" : "mala práctica"
          }. `}
        Cuando veas una de estas prácticas, pulsa en el botón Alerta.
      </p>

      <Video
        ref={videoRef}
        video={screen.video}
        onVideoEnded={handleVideoEnded}
        onRetry={handleRetry}
        onSetAlert={handleSetAlert}
        completed={canContinue}
        viewed={viewed}
      />

      {correctAlerts.length > 0 && (
        <div>
          <h3>¡Muy bien!</h3>
          <p>
            Has encontrado {correctAlerts.length}{" "}
            {correctAlerts.length === 1
              ? screen.type === PRACTICES.GOOD
                ? "buena práctica"
                : "mala práctica"
              : screen.type === PRACTICES.GOOD
                ? "buenas prácticas"
                : "malas prácticas"}
            :
          </p>
          <ul>
            {correctAlerts.map((alert, index) => (
              <li key={index}>
                {alert.title}
                <button
                  disabled={isViewingSegment}
                  onClick={() => playSegment(alert)}
                >
                  Ver situación
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(incorrectAlerts.length > 0 || unmarkedSegments.length > 0) && (
        <div>
          <h3>¡Ups!</h3>
          {incorrectAlerts.length > 0 && (
            <p>
              Has fallado {incorrectAlerts.length}
              {incorrectAlerts.length === 1 ? " vez" : " veces"}.
            </p>
          )}

          {unmarkedSegments.length > 0 && (
            <div>
              <p>
                Te{unmarkedSegments.length === 1 ? " ha" : " han"} faltado por
                identificar {unmarkedSegments.length}{" "}
                {unmarkedSegments.length === 1
                  ? screen.type === PRACTICES.GOOD
                    ? "buena práctica"
                    : "mala práctica"
                  : screen.type === PRACTICES.GOOD
                    ? "buenas prácticas"
                    : "malas prácticas"}
                :
              </p>

              <ul>
                {unmarkedSegments.map((segment, index) => (
                  <li
                    key={index}
                    className={
                      viewedSegments.has(segmentIdentifier(segment))
                        ? "viewed"
                        : ""
                    }
                  >
                    {segment.title}
                    <button
                      disabled={isViewingSegment}
                      onClick={() => playSegment(segment)}
                    >
                      Ver situación
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <button onClick={handleOnPreviousScreen}>Anterior</button>
      <button disabled={!canContinue} onClick={handleOnNextScreen}>
        Siguiente
      </button>
    </section>
  );
}

Screen.propTypes = {
  id: PropTypes.number.isRequired,
  actor: PropTypes.object.isRequired,
  scorm: PropTypes.object,
  xapi: PropTypes.object.isRequired,
  screen: PropTypes.object.isRequired,
  onNextScreen: PropTypes.func.isRequired,
  onPreviousScreen: PropTypes.func.isRequired,
  totalScreens: PropTypes.number.isRequired,
  status: PropTypes.string.isRequired,
};
