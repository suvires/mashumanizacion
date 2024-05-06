import { debugLog } from "../utils/debugUtil";

class ScormWrapper {
  constructor(version = "1.2") {
    if (version !== "1.2" && version !== "2004") {
      throw new Error("Invalid SCORM version. Allowed values are 1.2 or 2004");
    }
    this.version = version;
    this.apiHandle = null;
    this.isInitialized = false;
  }

  async initialize() {
    debugLog("Initializing SCORM...");
    debugLog("SCORM version: ", this.version);
    this.apiHandle = await this.findApi(window);
    if (!this.apiHandle && window.top && window.top.opener) {
      this.apiHandle = await this.findApi(window.top.opener);
    }

    if (!this.apiHandle) {
      debugLog("Unable to find SCORM API");
      return false;
    }
    debugLog("API found: ", this.apiHandle);

    const initMethod = this.version === "1.2" ? "LMSInitialize" : "Initialize";
    this.isInitialized = await this.apiHandle[initMethod]("");
    return this.isInitialized;
  }

  async findApi(win) {
    let attempts = 0;
    const limit = 500;

    while (attempts < limit) {
      if (this.version === "1.2" && win.API) {
        return win.API;
      } else if (this.version === "2004" && win.API_1484_11) {
        return win.API_1484_11;
      } else if (win.parent && win.parent !== win) {
        win = win.parent;
      }
      attempts++;
    }

    return null;
  }

  async terminate() {
    debugLog("isInitialized terminate: ", this.isInitialized);
    if (!this.isInitialized) return;
    const termMethod = this.version === "1.2" ? "LMSFinish" : "Terminate";
    const response = await this.apiHandle[termMethod]("");
    debugLog("terminate: ", response);
  }

  async getStatus() {
    return await this.getValue(
      this.version === "1.2"
        ? "cmi.core.lesson_status"
        : "cmi.completion_status",
    );
  }

  async setStatus(status) {
    await this.setValue(
      this.version === "1.2"
        ? "cmi.core.lesson_status"
        : "cmi.completion_status",
      status,
    );
  }

  async getSuspendData() {
    const suspendData = await this.getValue(
      this.version === "1.2" ? "cmi.suspend_data" : "cmi.location",
    );
    return suspendData;
  }

  async setSuspendData(suspendData) {
    await this.setValue(
      this.version === "1.2" ? "cmi.suspend_data" : "cmi.location",
      suspendData,
    );
  }

  async getScore() {
    const score = await this.getValue(
      this.version === "1.2" ? "cmi.core.score.raw" : "cmi.score.raw",
    );
    return score;
  }

  async setScore(score) {
    await this.setValue(
      this.version === "1.2" ? "cmi.core.score.raw" : "cmi.score.raw",
      score,
    );
  }

  async setSessionTime(sessionTime) {
    if (this.version === "1.2") {
      sessionTime = await this.convertSecondsToSCORM12Time(sessionTime);
    } else {
      sessionTime = await this.convertSecondsToSCORM2004Time(sessionTime);
    }
    debugLog("setSessionTime: ", sessionTime);
    await this.setValue(
      this.version === "1.2" ? "cmi.core.session_time" : "cmi.session_time",
      sessionTime,
    );
  }

  async getTotalTime() {
    const time = await this.getValue(
      this.version === "1.2" ? "cmi.core.total_time" : "cmi.total_time",
    );
    if (this.version === "1.2") {
      debugLog("getTotalTime: ", time);
      return time ? await this.convertSCORM12TimeToSeconds(time) : 0;
    } else {
      return time ? await this.convertSCORM2004TimeToSeconds(time) : 0;
    }
  }

  async getUserName() {
    const userName = await this.getValue(
      this.version === "1.2" ? "cmi.core.student_name" : "cmi.learner_name",
    );
    return userName;
  }

  async getUserId() {
    const userId = await this.getValue(
      this.version === "1.2" ? "cmi.core.student_id" : "cmi.learner_id",
    );
    return userId;
  }

  async convertSecondsToSCORM12Time(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedHours = ("000" + hours).slice(-4);
    const formattedMinutes = ("0" + minutes).slice(-2);
    const formattedSeconds = ("0" + remainingSeconds).slice(-2);
    return formattedHours + ":" + formattedMinutes + ":" + formattedSeconds;
  }

  async convertSecondsToSCORM2004Time(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedHours = ("000" + hours).slice(-4);
    const formattedMinutes = ("0" + minutes).slice(-2);
    const formattedSeconds = ("0" + remainingSeconds).slice(-2);
    return (
      "PT" +
      formattedHours +
      "H" +
      formattedMinutes +
      "M" +
      formattedSeconds +
      "S"
    );
  }

  async convertSCORM12TimeToSeconds(time) {
    const timeArray = time.split(":");
    const hours = parseInt(timeArray[0], 10);
    const minutes = parseInt(timeArray[1], 10);
    const seconds = parseInt(timeArray[2].split(".")[0], 10);
    return hours * 3600 + minutes * 60 + seconds;
  }

  async convertSCORM2004TimeToSeconds(time) {
    const timeString = time.replace("PT", "");
    const hours = timeString.includes("H")
      ? parseInt(timeString.split("H")[0], 10)
      : 0;
    const minutes = timeString.includes("M")
      ? parseInt(timeString.split("H")[1].split("M")[0], 10)
      : 0;
    const seconds = timeString.includes("S")
      ? parseInt(timeString.split("M")[1].split("S")[0], 10)
      : 0;
    return hours * 3600 + minutes * 60 + seconds;
  }

  async getValue(parameter) {
    debugLog("isInitialized getValue: ", this.isInitialized);
    if (!this.isInitialized) return null;
    const getValueMethod = this.version === "1.2" ? "LMSGetValue" : "GetValue";
    const value = await this.apiHandle[getValueMethod](parameter);
    debugLog("getValue: ", parameter, value);
    return value;
  }

  async setValue(parameter, value) {
    debugLog("isInitialized setValue: ", this.isInitialized);
    if (!this.isInitialized) return;
    const setValueMethod = this.version === "1.2" ? "LMSSetValue" : "SetValue";
    const response = await this.apiHandle[setValueMethod](parameter, value);
    debugLog("setValue: ", parameter, value, response);
    await this.commit();
  }

  async commit() {
    debugLog("isInitialized commit ", this.isInitialized);
    if (!this.isInitialized) return;
    const commitMethod = this.version === "1.2" ? "LMSCommit" : "Commit";
    const response = await this.apiHandle[commitMethod]("");
    debugLog("commit: ", response);
  }

  async getLastError() {
    if (!this.isInitialized) return "0";

    const getLastErrorMethod =
      this.version === "1.2" ? "LMSGetLastError" : "GetLastError";
    return await this.apiHandle[getLastErrorMethod]();
  }

  async getErrorString(errorCode) {
    if (!this.isInitialized) return "";

    const getErrorStringMethod =
      this.version === "1.2" ? "LMSGetErrorString" : "GetErrorString";
    return await this.apiHandle[getErrorStringMethod](errorCode);
  }

  async getDiagnostic(errorCode) {
    if (!this.isInitialized) return "";

    const getDiagnosticMethod =
      this.version === "1.2" ? "LMSGetDiagnostic" : "GetDiagnostic";
    return await this.apiHandle[getDiagnosticMethod](errorCode);
  }
}

export default ScormWrapper;
