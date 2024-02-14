import React, { useState } from "react";
import ReactDOM from "react-dom";
import "./styles.css";
// import Root from "./views/Root";
// import DisplayGraph from "./components/DisplayGraph/index";
// import ChatGPTForExecGPT from "./components/ChatGPTForExecGPT";
import ChatGPTForKRAGENSim from "./components/ChatGPTForKRAGENSim";
// import AlertExplainPurpose from "./components/AlertExplainPurpose";

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
        <div className="chartsbaseright"></div>
        <div
          id="chatgpt-space"
          style={{ width: "100vw", height: "100vh" }}
          className="chatbaseleft bg-gray-950 pt-2 pl-2 pb-0"
        >
          <ChatGPTForKRAGENSim experiment={"kragensim"} />
        </div>
      </div>
    </div>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
