import React from "react";
import ReactDOM from "react-dom";

import "./styles.css";
// import Root from "./views/Root";
// import DisplayGraph from "../src/components/DisplayGraph/index";
// import ChatGPTForExecGPT from "../src/components/ChatGPTForExecGPT";
import ChatGPTForKRAGENSim from "../src/components/ChatGPTForKRAGENSim";

ReactDOM.render(
  <React.StrictMode>
    {/* <Root /> */}
    {/* <DisplayGraph /> */}
    {/* <ChatGPTForExecGPT experiment={"execgpt"} /> */}
    <div
      id="main-page"
      className="flex flex-col overflow-auto"
      style={{
        backgroundImage: `linear-gradient(
                        rgba(0, 0, 0, 0.3), /* Black with 50% opacity */
                        rgba(0, 0, 0, 0.3)
                      ), url('/images/bg-masthead_darker_image.jpg')`,
        backgroundSize: "cover", // Cover the entire viewport
        backgroundRepeat: "no-repeat",
        height: "100vh", // Adjust this to your needs
        // backdropFilter: "blur(10px)",
      }}
    >
      <div className="flex flex-row h-screen overflow-y-hidden">
        <div className=" chartsbaseright">
          {/* <div id="dispnetgra" className={"show-contents"}>
            <DisplayGraph />
          </div> */}
        </div>

        <div
          className="slider w-1"
          // onMouseOver={moveSlidermakeBlack}
          // onMouseOut={makeOriginColor}
          // make the slider invisible
          style={{ display: "none" }}
        >
          <div />
          ""<br></br>
          ""<br></br>
          ""<br></br>
          ""<br></br>
          ""<br></br>
          ""<br></br>
        </div>

        <div
          id="chatgpt-space"
          // style={{ width: "49%" }}
          style={{ width: "100vw", height: "100vh" }}
          className="chatbaseleft bg-gray-950 pt-2 pl-2 pb-0"
          onMouseOver={(e) => {
            // console.log("moveSlidermakeBlack");
          }}
        >
          {/* <ChatGPTForExecGPT experiment={"execgpt"} /> */}
          <ChatGPTForKRAGENSim experiment={"kragensim"} />
        </div>
      </div>
    </div>
  </React.StrictMode>,
  document.getElementById("root")
);
