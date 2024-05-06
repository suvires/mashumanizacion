import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

// window.API = (function () {
//   const data = {
//     "cmi.core.student_id": "000000",
//     "cmi.core.student_name": "Student, Joe",
//     "cmi.core.lesson_location": "",
//     "cmi.core.lesson_status": "not attempted",
//   };
//   return {
//     LMSInitialize: function () {
//       return "true";
//     },
//     LMSCommit: function () {
//       return "true";
//     },
//     LMSFinish: function () {
//       return "true";
//     },
//     LMSGetValue: function (model) {
//       return data[model] || "";
//     },
//     LMSSetValue: function (model, value) {
//       data[model] = value;
//       return "true";
//     },
//     LMSGetLastError: function () {
//       return "0";
//     },
//     LMSGetErrorString: function (errorCode) {
//       return "No error";
//     },
//     LMSGetDiagnostic: function (errorCode) {
//       return "No error";
//     },
//   };
// })();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
