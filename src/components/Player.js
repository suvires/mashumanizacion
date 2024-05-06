import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import Welcome from "./Welcome";
import Screen from "./Screen";
import Finish from "./Finish";
import {
  getStartedCourseStatement,
  getQuittedCourseStatement,
  getFinishedCourseStatement,
} from "../utils/xapiUtils";
import { debugLog } from "../utils/debugUtil";
import screens from "../data/screens.json";
import { STATUS } from "../config/const";

export default function Player({
  userName,
  actor,
  initialStatus,
  initialSuspendData,
  xapi,
  scorm,
}) {
  const refSessionTime = useRef(0);
  const [currentScreen, setCurrentScreen] = useState(null);
  const [status, setStatus] = useState(initialStatus);
  const [timerActive, setTimerActive] = useState(true);

  useEffect(() => {
    debugLog("Initializing Player...");
    debugLog("Sending get started course statement...");
    xapi.sendStatement({
      statement: getStartedCourseStatement(actor),
    });

    let initialScreen;

    if (!initialSuspendData?.screens) {
      initialScreen = -1;
    } else {
      const lastCompletedIndex = initialSuspendData.screens.reduce(
        (acc, screen, index) => {
          return screen.completed ? index : acc;
        },
        -1,
      );

      if (lastCompletedIndex + 1 === screens.length) {
        initialScreen = -2;
      } else {
        initialScreen = lastCompletedIndex + 1;
      }
    }

    setCurrentScreen(initialScreen);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (timerActive) {
        refSessionTime.current += 1;
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    window.onbeforeunload = async () => {
      xapi.sendStatement({
        statement: getQuittedCourseStatement(actor, refSessionTime.current),
      });
    };
    return () => {
      window.onbeforeunload = null;
    };
  }, [refSessionTime]);

  // useEffect(() => {
  //   const localSuspendDataString = localStorage.getItem("suspendData");
  //   const localSuspendData = localSuspendDataString
  //     ? JSON.parse(localSuspendDataString)
  //     : { screens: [] };

  //   const completedScreens = localSuspendData.screens.filter(
  //     (screen) => screen.completed,
  //   ).length;

  //   const totalScreens = screens.length;

  //   const progress =
  //     totalScreens > 0 ? (completedScreens / totalScreens) * 100 : 0;

  //   setProgress(progress);
  //   if (scorm && status !== STATUS.COMPLETED) {
  //     scorm.setScore(progress);
  //   }
  // }, [currentScreen]);

  const handleNextScreen = () => {
    if (currentScreen === screens.length - 1) {
      if (status !== STATUS.COMPLETED) {
        setStatus(STATUS.COMPLETED);
        localStorage.setItem("status", STATUS.COMPLETED);
        xapi.sendStatement({
          statement: getFinishedCourseStatement(actor),
        });
        if (scorm) {
          scorm.setStatus(STATUS.COMPLETED);
          scorm.setSessionTime(refSessionTime.current);
          scorm.terminate();
        }
        debugLog("Setting timer to inactive...");
        setTimerActive(false);
      }
      setCurrentScreen(-2);
    } else {
      setCurrentScreen((prevScreen) => prevScreen + 1);
    }
  };

  const handlePreviousScreen = () => {
    setCurrentScreen((prevScreen) => prevScreen - 1);
  };

  const handleGoToScreen = (screen) => {
    setCurrentScreen(screen);
  };

  return (
    <main>
      {currentScreen === -1 && (
        <Welcome onNextScreen={handleNextScreen} userName={userName} />
      )}
      {currentScreen === -2 && (
        <Finish goToScreen={handleGoToScreen} userName={userName} />
      )}
      {currentScreen >= 0 && screens[currentScreen] && (
        <Screen
          id={currentScreen}
          scorm={scorm}
          actor={actor}
          xapi={xapi}
          screen={screens[currentScreen]}
          onNextScreen={handleNextScreen}
          onPreviousScreen={handlePreviousScreen}
          totalScreens={screens.length}
          status={status}
        />
      )}
    </main>
  );
}

Player.propTypes = {
  userName: PropTypes.string.isRequired,
  actor: PropTypes.object.isRequired,
  initialSuspendData: PropTypes.object.isRequired,
  initialStatus: PropTypes.string.isRequired,
  xapi: PropTypes.object.isRequired,
  scorm: PropTypes.object,
};
