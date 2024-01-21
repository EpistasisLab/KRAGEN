import React from "react";
import ReactDOM from "react-dom";

import "./styles.css";
// import Root from "./views/Root";
import DisplayGraph from "../src/components/DisplayGraph/index";
import ChatGPTForExecGPT from "../src/components/ChatGPTForExecGPT";

ReactDOM.render(
  <React.StrictMode>
    {/* <Root /> */}
    {/* <DisplayGraph /> */}
    {/* <ChatGPTForExecGPT experiment={"execgpt"} /> */}
    <div className="flex h-screen">
      
      <div className="w-1/2">
          {/* ChatGPTForExecGPT 컴포넌트 */}
          <ChatGPTForExecGPT experiment={"execgpt"} />
      </div>

      {/* DisplayGraph 컴포넌트 */}
      <div className="w-1/2">
          <DisplayGraph />
      </div>
  </div>

  </React.StrictMode>,
  document.getElementById("root"),
);
