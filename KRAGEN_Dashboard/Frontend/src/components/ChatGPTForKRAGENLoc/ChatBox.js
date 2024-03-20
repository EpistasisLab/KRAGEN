import React, { useState, useEffect, useContext } from "react";
import ResizableDiv from "./ResizableDiv";
import { AllContext } from "./context/AllContext";
import DisplayGraph from "../DisplayGraph";

import { BiHome } from "react-icons/bi";
// import { getTokenUsage, insertTokenUsage } from "../apiService";
import CircularProgress from "@mui/material/CircularProgress";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";

import ErrorBoundary from "../ErrorBoundary";

// Primary Chat Window
const ChatBox = () => {
  const {
    chatInput,
    setChatInput,
    handleSubmit,
    readyToDisplayGOT,
    chatInputForGOT,
    chatCurrentTempId,
    gotLoaded,
    setGotLoaded,
    dataset,
    setDataset,
    setReadyToDisplayGOT,
    dataReady,
    setDataReady,
    gotQuestion,
    setGotQuestion,
    gotAnswer,
    setGotAnswer,
  } = useContext(AllContext);

  const [toggleDisplayGraph, settoggleDisplayGraph] = useState(true);

  const [hasZip, setHasZip] = useState(false);
  const [zipUrl, setZipUrl] = useState(null);
  const [zipFileName, setZipFileName] = useState(null);
  const [hasZipIndexMessage, setHasZipIndexMessage] = useState(null);
  const [isHiddenGOT, setIsHiddenGOT] = useState(true);

  const [booleanWarningMessage, setBooleanWarningMessage] = useState(false);

  // boolean for token usage limit
  const [booleanTokenUsageLimit, setBooleanTokenUsageLimit] = useState(false);

  // // gotloaded
  // const [gotLoaded, setGotLoaded] = useState(false);

  // toggleDisplayGraph
  const handletoggleDisplayGraph = () => {
    // console.log("toggleDisplayGraph", toggleDisplayGraph);
    settoggleDisplayGraph(!toggleDisplayGraph); // 현재 toggleDisplayGraph 상태를 반전시킵니다.
  };

  useEffect(() => {
    if (readyToDisplayGOT) {
      // find button under chatSubmitFormID id
      // let chatsubmitform = document.getElementById("chatSubmitFormID");
      // console.log("chatsubmitform", chatsubmitform);
      let button = document
        .getElementById("chatSubmitFormID")
        .querySelector(".submit");

      // make the button unvisible
      button.style.display = "none";
    }
  }, [readyToDisplayGOT]);

  // temperal limit for token usage
  let token_limit = 3000;

  return (
    <>
      <section className="chatboxForGOT relative">
        {/* 2 current */}
        <div className="chat-input-containerForGOT flex items-center">
          <div className="chat-input-holderForGOT flex-grow">
            <form
              id="chatSubmitFormID"
              className="chatSubmitForm"
              onSubmit={async (e) => {
                // onMouseOver={handleMouseOverTokenUsageInfo}
                e.preventDefault();
                let blockSubmit = false;

                console.log("blockSubmit", blockSubmit);

                // when blockSubmit is false, submit the form
                if (blockSubmit === false) {
                  await handleSubmit(e);
                  // console.log("submit-e.target", e.target);
                  // find .submit using querySelector in e.target
                  let submitButton = e.target.querySelector(".submit");
                  // console.log("submit-e.target.querySelector", submitButton);
                  submitButton.disabled = true;
                }
                // when booleanTokenUsageLimit is true, show warning message
                else {
                  let submitButton = e.target.querySelector(".submit");
                  // console.log("submit-e.target.querySelector", submitButton);
                  submitButton.disabled = true;
                }
              }}
            >
              <input
                rows="1"
                value={chatInput}
                onChange={(e) => {
                  const input = e.target.value;
                  // console.log("input-length", input.length);

                  if (input.length <= 800 || input.length > 0) {
                    e.target.parentNode.querySelector(
                      ".submit"
                    ).disabled = false;
                    setChatInput(input);
                  }

                  if (input.length > 800 || input.length === 0) {
                    e.target.parentNode.querySelector(
                      ".submit"
                    ).disabled = true;
                  }
                }}
                onMouseOver={(e) => {
                  e.target.disabled = false;
                }}
                id="chat-input-textarea-id"
                className="chat-input-textarea"
                placeholder="Type your message here. "
                disabled={false}
                autoComplete="off"
              ></input>
              {booleanTokenUsageLimit ? (
                <button
                  id="chatsubmitbutton"
                  className="submit"
                  type="submit"
                  disabled={true}
                >
                  <BlockOutlinedIcon />
                  Submit Disabled: Token Limit Reached
                </button>
              ) : (
                <>
                  <div className="ico">
                    <button
                      id="chatsubmitbutton"
                      className="submit "
                      type="submit"
                      disabled={true}
                    >
                      <SendOutlinedIcon />
                    </button>
                  </div>
                  <div className="ico">
                    <button
                      type="button"
                      onClick={() => (window.location.href = "/Home")} // Change to '/Home' or '/' as needed
                      title="Home"
                    >
                      <BiHome /> {/* Use the home icon */}
                    </button>
                  </div>
                </>
              )}
            </form>

            <div
              id="showQuestionID"
              className="showQuestion overflow-y-auto max-w-full text-3xl bg-opacity-50 rounded border-2 border-black p-5 m-5"
              style={{
                width: "300px",
                height: "200px",
                display: "none",
                overflowY: "scroll",
                opacity: "0.8",
                // make cursor pointer
                cursor: "pointer",
                // display: "none",
              }}
              onMouseOver={(e) => {
                // change color of div to make it look like blurred
                e.target.style.opacity = "1";
              }}
              onMouseOut={(e) => {
                // change color of div to make it look like blurred
                e.target.style.opacity = "0.8";
              }}
            >
              <p style={{ fontSize: "1.3rem" }}>
                {`Question: List the body parts/anatomy which over-express both the genes METTL5 and STYXL2 `}
              </p>
              <p style={{ fontSize: "1.1rem" }}>
                {`Answer: heart, adrenal gland`}
              </p>
            </div>
          </div>
        </div>

        {gotQuestion && gotAnswer && (
          <ResizableDiv gotQuestion={gotQuestion} gotAnswer={gotAnswer} />
        )}

        <div
          id="dispnetgra"
          className="show-contents"
          style={
            toggleDisplayGraph
              ? {}
              : { opacity: 0, pointerEvents: "none", userSelect: "none" }
          }
        >
          <ErrorBoundary>
            <DisplayGraph
              chatInputForGOT={chatInputForGOT}
              readyToDisplayGOT={readyToDisplayGOT}
              setReadyToDisplayGOT={setReadyToDisplayGOT}
              chatCurrentTempId={chatCurrentTempId}
              setGotLoaded={setGotLoaded}
              dataReady={dataReady}
              setDataReady={setDataReady}
              dataset={dataset}
              setDataset={setDataset}
              gotQuestion={gotQuestion}
              setGotQuestion={setGotQuestion}
              gotAnswer={gotAnswer}
              setGotAnswer={setGotAnswer}
            />
          </ErrorBoundary>
        </div>

        {gotLoaded === false && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <CircularProgress />
          </div>
        )}
      </section>
    </>
  );
};

export default ChatBox;
