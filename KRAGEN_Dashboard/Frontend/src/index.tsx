import React, { useState } from "react";
import ReactDOM from "react-dom";
import "./styles.css";

import ChatGPTForKRAGENLoc from "./components/ChatGPTForKRAGENLoc";
// import AlertExplainPurpose from "./components/AlertExplainPurpose";
// import * as Sentry from "@sentry/react";

import VISPROG from "./components/visProgram/VISPROG";

import ErrorBoundary from "./components/ErrorBoundary";

// Set up global error handler
window.onerror = function (message, source, lineno, colno, error) {
  // Add error logging logic here
  console.log("Captured in window.onerror:", message);
  // Return true to prevent default browser handling
  return true;
};

function App() {
  const [isAlertOpen, setIsAlertOpen] = useState(true);

  return (
    <div
      id="main-page"
      className="flex flex-col overflow-auto"
      style={{
        backgroundImage: `linear-gradient(
                        rgba(0, 0, 0, 0.3),
                        rgba(0, 0, 0, 0.3)
                      ), url('/images/bg-masthead_darker_image.jpg')`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        height: "100vh",
      }}
    >
      <div className="flex flex-row h-screen overflow-y-hidden">
        <div className="chartsbaseright bg-gray-950 pt-2 pl-2 pb-0"></div>
        <div
          id="chatgpt-space"
          style={{ width: "100vw", height: "100vh" }}
          className="chatbaseleft bg-gray-950 pt-2 pl-2 pb-0"
        >
          {/* <ChatGPTForKRAGENSim experiment={"kragensim"} /> */}

          <ChatGPTForKRAGENLoc experiment={"kragenloc"} />
          <VISPROG />
        </div>
      </div>
    </div>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById("root")
);
