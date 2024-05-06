import React, { useEffect, useState, useRef } from "react";
import Login from "./components/Login";
import Player from "./components/Player";
import ScormWrapper from "./lib/ScormWrapper";
import XAPI from "@xapi/xapi";
import { STATUS } from "./config/const";
import { debugLog } from "./utils/debugUtil";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLogged, setIsLogged] = useState(false);
  const userNameRef = useRef(null);
  const initialSuspendDataRef = useRef(null);
  const initialStatusRef = useRef(null);
  const actorRef = useRef(null);
  const xapiRef = useRef(
    new XAPI({
      endpoint: process.env.REACT_APP_LRS_ENDPOINT,
      auth: XAPI.toBasicAuth(
        process.env.REACT_APP_LRS_USERNAME,
        process.env.REACT_APP_LRS_PASSWORD,
      ),
    }),
  );
  const scormRef = useRef(null);

  const initializeApp = async () => {
    debugLog("is SCORM?", process.env.REACT_APP_SCORM_VERSION || false);
    if (process.env.REACT_APP_SCORM_VERSION) {
      await initializeScorm();
    } else {
      await loadDataFromLocalStorage();
    }
    setIsLoading(false);
  };

  const initializeScorm = async () => {
    debugLog("Initializing SCORM...");
    scormRef.current = new ScormWrapper();
    await scormRef.current.initialize();
    debugLog("SCORM initialized:", scormRef.current);
    await loadDataFromScorm();
  };

  const loadDataFromScorm = async () => {
    debugLog("Loading data from SCORM package...");
    const scormUserName = await scormRef.current.getUserName();
    localStorage.setItem("userName", scormUserName);
    debugLog("SCORM username:", scormUserName);
    const scormUserId = await scormRef.current.getUserId();
    debugLog("SCORM user id:", scormUserId);
    const scormStatus = await scormRef.current.getStatus();
    localStorage.setItem("status", scormStatus);
    debugLog("SCORM status:", scormStatus);
    const scormSuspendData = (await scormRef.current.getSuspendData()) || "{}";
    localStorage.setItem("suspendData", scormSuspendData);
    debugLog("SCORM suspend data:", scormSuspendData);
    debugLog("Data loaded from SCORM");
    userNameRef.current = scormUserName;
    initialSuspendDataRef.current = JSON.parse(scormSuspendData);
    initialStatusRef.current = scormStatus;
    actorRef.current = {
      objectType: "Agent",
      name: scormUserName,
      account: {
        homePage: window.location.origin,
        name: scormUserId,
      },
    };
    debugLog("XAPI actor:", actorRef.current);
    debugLog("Setting isLogged to true...");
    setIsLogged(true);
  };

  const loadDataFromLocalStorage = () => {
    debugLog("Loading data from local storage...");
    const localUserName = localStorage.getItem("userName");
    const localEmail = localStorage.getItem("email");
    const localStatus = localStorage.getItem("status");
    const localSuspendDataString = localStorage.getItem("suspendData");
    const localSuspendData = localSuspendDataString
      ? JSON.parse(localSuspendDataString)
      : {};
    if (localUserName && localEmail) {
      debugLog("Local storage username:", localUserName);
      debugLog("Local storage email:", localEmail);
      debugLog("Local storage status:", localStatus);
      debugLog("Local storage suspend data:", localSuspendData);
      debugLog("Data loaded from local storage");
      userNameRef.current = localUserName;
      initialSuspendDataRef.current = localSuspendData || {};
      initialStatusRef.current = localStatus || STATUS.INCOMPLETE;
      actorRef.current = {
        objectType: "Agent",
        name: localUserName,
        mbox: "mailto:" + localEmail,
      };
      debugLog("XAPI actor:", actorRef.current);
      debugLog("Setting isLogged to true...");
      setIsLogged(true);
    } else {
      debugLog("No data found in local storage");
    }
  };

  const handleLogin = (data) => {
    debugLog("Processing data from login form...");
    debugLog("Form username:", data.userName);
    debugLog("Form email:", data.email);
    userNameRef.current = data.userName;
    actorRef.current = {
      objectType: "Agent",
      name: data.userName,
      mbox: "mailto:" + data.email,
    };
    debugLog("XAPI actor:", actorRef.current);
    initialStatusRef.current = STATUS.INCOMPLETE;
    localStorage.setItem("userName", data.userName);
    debugLog("New username saved to local storage");
    localStorage.setItem("email", data.email);
    debugLog("New email saved to local storage");
    localStorage.setItem("status", STATUS.INCOMPLETE);
    initialSuspendDataRef.current = {};
    localStorage.setItem("suspendData", "");
    debugLog("New status saved to local storage as incomplete");
    debugLog("Setting isLogged to true...");
    setIsLogged(true);
  };

  useEffect(() => {
    debugLog("Initializing App...");
    initializeApp();
    return () => debugLog("Unmounting App component...");
  }, []);

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {!isLoading && !isLogged && <Login onLogin={handleLogin} />}
      {!isLoading && isLogged && (
        <Player
          userName={userNameRef.current}
          actor={actorRef.current}
          initialSuspendData={initialSuspendDataRef.current}
          initialStatus={initialStatusRef.current}
          xapi={xapiRef.current}
          scorm={scormRef.current}
        />
      )}
    </div>
  );
}
