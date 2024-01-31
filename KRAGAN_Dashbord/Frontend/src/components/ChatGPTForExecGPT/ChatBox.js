import AISVGLogo from "./AISVGLogo";
// import Codecompletion from "../WebAICore/CodeCompletion";

import React, { useState, useEffect, useContext } from "react";
// import { xf } from 'react';

import { AllContext } from "./context/AllContext";
import DisplayGraph from "../DisplayGraph";

// import AudioToText from "../WebAICore/AudioToText";

// import './style.css';

// import Prism from "prismjs";
// import "prismjs/themes/prism.css";
// import "../../../node_modules/prismjs/

// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faThumbsUp } from '@fortawesome/free-solid-svg-icons'

// import * as labApi from '../../../../../tests/integration/jest/labApi.js';
// // import * as util from "./util/testUtils";
// var fs = require("../../../node_modules/fs/lib/index.js");
// import * as fs from 'fs/promises';
// import * as fs from 'fs';
// import FormData from 'form-data';

// class CustomFile extends File {
//     constructor(blobParts, filename, options) {
//       super(blobParts, filename, options);
//       this.path = options.path;
//     }
//   }

// Primary Chat Window
const ChatBox = () => {
  const {
    chatLog,
    setChatInput,
    handleSubmit,
    chatInput,
    modeForChatOrCodeRunning,
    setModeForChatOrCodeRunning,
    // datasetId,
    // experimentId,
    updateAfterRuningCode,
    modeForTabluerData,
    setModeForTabluerData,
    booleanPackageInstall,
    setBooleanPackageInstall,
    submitErrorWithCode,
    showCodeRunningMessageWhenClickRunBtn,
    getChatMessageByExperimentId,
    chatCurrentTempId,
    getSpecificChatbyChatId,
    patchChatToDB,
    checkCodePackages,
    disableReadingInput,
    enableReadingInput,
    autoScrollDown,
    nomoreBlinking,
    makeBlinking,
    savedChatIDs,
    handleSubmitFromEditor,
    handleSubmitForAudioToText,
    readyToDisplayGOT,
    setReadyToDisplayGOT,
  } = useContext(AllContext);

  const [hasZip, setHasZip] = useState(false);
  const [zipUrl, setZipUrl] = useState(null);
  const [zipFileName, setZipFileName] = useState(null);
  const [hasZipIndexMessage, setHasZipIndexMessage] = useState(null);

  const [isHiddenGOT, setIsHiddenGOT] = useState(true);

  useEffect(() => {
    console.log("readyToDisplayGOT", readyToDisplayGOT);
    if (readyToDisplayGOT) {
      // find button under chatSubmitFormID id
      let chatsubmitform = document.getElementById("chatSubmitFormID");
      console.log("chatsubmitform", chatsubmitform);
      let button = document
        .getElementById("chatSubmitFormID")
        .querySelector(".submit");
      console.log("button", button);
      // make the button unvisible
      button.style.display = "none";
    }
  }, [readyToDisplayGOT]);
  // function autoScrollDownToBottomWithEditor() {
  //   let scrollToTheBottomChatLog = document.getElementById("chatgpt-space");

  //   scrollToTheBottomChatLog.scrollTop = scrollToTheBottomChatLog.scrollHeight;
  // }
  const callEditor = (e) => {
    // find element which has className "code-input-area"

    // console.log("callEditor");

    // let codeInputArea =
    //   e.target.parentElement.parentElement.parentElement.parentElement.getElementsByClassName(
    //     "code-input-area"
    //   )[0];

    let codeInputArea = document.getElementsByClassName("code-input-area")[0];

    console.log("codeInputArea", codeInputArea);

    if (codeInputArea.style.display === "block") {
      codeInputArea.style.display = "none";
      autoScrollDown();
      return;
    } else if (codeInputArea.style.display === "none") {
      codeInputArea.style.display = "block";
      autoScrollDown();
      return;
    }
  };

  function getPackagesFromEditor(tempCode) {
    const packages = [];

    const lines = tempCode.split("\n");
    for (const line of lines) {
      const words = line.trim().split(/\s+/);
      if (words[0] === "import" || words[0] === "from") {
        const parts = words[1].split(".");
        packages.push(parts[0]);
      }
    }

    return packages;
  }

  function extractCodeFromEditor(message) {
    // console.log("message-extractCodeFromMess", message)
    if (message === undefined) {
      return "";
    }
    let code = "";
    const regex = /```([^`]*)```/g;
    const matches = message.matchAll(regex);

    for (const match of matches) {
      // console.log("match-extractCodeFromMess", match)
      //check if the first 6 characters are python
      if (match[1].substring(0, 6) === "python") {
        //remove the first 6 characters
        match[1] = match[1].substring(6);
      }
      // console.log("python code:",match[1]);
      code = match[1];
    }

    return code;
  }

  async function installPackages(packagesArray, e) {
    // POST http://localhost:5080/execapi/v1/executions/install
    // Content-Type: application/json

    // {
    //     "command": "install",
    //     "packages": packagesArray
    // }

    // packagesArray = ["seaborn", "plotly", "matplotlib", "pandas", "numpy"];

    console.log("installPackages-packagesArray", packagesArray);

    let resultFromInstallingPackages = await fetch(
      `http://127.0.0.1:5050/execapi/v1/packages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // command: "install",
          packages: packagesArray,
        }),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        // // console.log("installPackages-response-data-result", data['result'])
        console.log("resultFromInstallingPackages-response-data", data);
        return data;
      })
      .catch((error) => {
        console.log("installPackages-fetch-error", error);
        return error;
      });
  }

  async function runExtractedCode(code) {
    let resultFromRuningCode = await fetch(
      `http://127.0.0.1:5050/execapi/v1/executions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          src_code: code,
          // dataset_id: datasetId,
          // experiment_id: experimentId,
        }),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        console.log("star-1. runExtractedCode", data);
        return data;
      })
      .catch((error) => {
        console.log("runExtractedCode-fetch-error", error);
        return error;
      });

    return resultFromRuningCode;
  }

  return (
    <>
      <section className="chatbox">
        <div className="chat-log">
          {chatLog.map((message, index) => (
            <ChatMessage
              message={message}
              // datasetId={datasetId}
              // experimentId={experimentId}
              updateAfterRuningCode={updateAfterRuningCode}
              modeForTabluerData={modeForTabluerData}
              setModeForTabluerData={setModeForTabluerData}
              booleanPackageInstall={booleanPackageInstall}
              setBooleanPackageInstall={setBooleanPackageInstall}
              submitErrorWithCode={submitErrorWithCode}
              showCodeRunningMessageWhenClickRunBtn={
                showCodeRunningMessageWhenClickRunBtn
              }
              getChatMessageByExperimentId={getChatMessageByExperimentId}
              chatCurrentTempId={chatCurrentTempId}
              getSpecificChatbyChatId={getSpecificChatbyChatId}
              patchChatToDB={patchChatToDB}
              checkCodePackages={checkCodePackages}
              disableReadingInput={disableReadingInput}
              enableReadingInput={enableReadingInput}
              autoScrollDown={autoScrollDown}
              hasZip={hasZip}
              setHasZip={setHasZip}
              zipUrl={zipUrl}
              setZipUrl={setZipUrl}
              hasZipIndexMessage={hasZipIndexMessage}
              setHasZipIndexMessage={setHasZipIndexMessage}
              zipFileName={zipFileName}
              setZipFileName={setZipFileName}
              nomoreBlinking={nomoreBlinking}
              makeBlinking={makeBlinking}
              savedChatIDs={savedChatIDs}
              installPackages={installPackages}
              runExtractedCode={runExtractedCode}
            />
          ))}
        </div>

        {/* <div className="chat-input-container">
          <div className="chat-input-holder">
            <form
              id="chatSubmitFormID"
              className="chatSubmitForm"
              onSubmit={handleSubmit}
            >
              <input
                rows="1"
                value={chatInput}
                onChange={(e) => {
                  const input = e.target.value;
                  console.log("input-length", input.length);

                  if (input.length <= 800) {
                    // document.querySelector(".submit").disabled = false;
                    // find child who has className .submit from  current e.target
                    e.target.parentNode.querySelector(
                      ".submit"
                    ).disabled = false;
                    setChatInput(input);
                  }

                  if (input.length > 800) {
                    // make the submit button disabled
                    e.target.parentNode.querySelector(
                      ".submit"
                    ).disabled = true;
                  }
                }}
                id="chat-input-textarea-id"
                className="chat-input-textarea"
                placeholder="Type your message here. "
                disabled={false}
              ></input>
              <button className="submit" type="submit" disabled={false}>
                Submit
              </button>

              <div
                className="call-editor"
                // type="submit"
                disabled={false}
                onClick={callEditor}
              >
                Editor
              </div>
            </form>
          </div>
          <div className="audio-to-text pr-3 pb-1">
            <AudioToText
              setChatInput={setChatInput}
              handleSubmitForAudioToText={handleSubmitForAudioToText}
            />
          </div>
        </div> */}

        {/* 2 current */}
        <div className="chat-input-container flex items-center">
          <div className="chat-input-holder flex-grow">
            <form
              id="chatSubmitFormID"
              className="chatSubmitForm"
              onSubmit={handleSubmit}
            >
              <input
                rows="1"
                value={chatInput}
                onChange={(e) => {
                  const input = e.target.value;
                  console.log("input-length", input.length);

                  if (input.length <= 800) {
                    e.target.parentNode.querySelector(
                      ".submit"
                    ).disabled = false;
                    setChatInput(input);
                  }

                  if (input.length > 800) {
                    e.target.parentNode.querySelector(
                      ".submit"
                    ).disabled = true;
                  }
                }}
                id="chat-input-textarea-id"
                className="chat-input-textarea"
                // placeholder="Type your message here. "
                placeholder="Please ask your question here. "
                disabled={false}
              ></input>
              <button className="submit" type="submit" disabled={false}>
                Submit
              </button>
            </form>

            <div
              id="showQuestionID"
              className="showQuestion overflow-y-auto max-w-full text-3xl bg-white bg-opacity-50 rounded border-2 border-black p-5 m-5"
              style={{
                width: "300px", // 가로 너비 설정
                height: "200px", // 세로 높이 설정
                display: "none", // 스크롤 바 확인을 위해 display를 block으로 설정
                overflowY: "scroll", // y축 스크롤 바 항상 표시
                opacity: "0.8",
                // make cursor pointer
                cursor: "pointer",
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

          {/* webml components */}
          {/* <div className="additional-buttons">
            <div className="call-editor" onClick={callEditor}>
              Editor
            </div>
            <div className="audio-to-text">
              <AudioToText
                setChatInput={setChatInput}
                handleSubmitForAudioToText={handleSubmitForAudioToText}
              />
            </div>
            <div id="stopSpeaking" className="stop-speaking">
              Stop Speaking
            </div>
          </div> */}
        </div>

        {/* unvisible */}
        <div id="dispnetgra" className={"show-contents"}>
          <DisplayGraph
            readyToDisplayGOT={readyToDisplayGOT}
            // setReadyToDisplayGOT={setReadyToDisplayGOT}
          />
        </div>

        {/* 2' */}
        {/* <div className="chat-input-holder flex flex-col sm:flex-row flex-grow">
          <form
            id="chatSubmitFormID"
            className="chatSubmitForm flex flex-col w-full"
            onSubmit={handleSubmit}
          >
            <input
              rows="1"
              value={chatInput}
              onChange={(e) => {
                const input = e.target.value;
                console.log("input-length", input.length);

                if (input.length <= 800) {
                  e.target.parentNode.querySelector(".submit").disabled = false;
                  setChatInput(input);
                }

                if (input.length > 800) {
                  e.target.parentNode.querySelector(".submit").disabled = true;
                }
              }}
              id="chat-input-textarea-id"
              className="chat-input-textarea"
              placeholder="Type your message here. "
              disabled={false}
            ></input>
            <button className="submit" type="submit" disabled={false}>
              Submit
            </button>

            <div className="call-editor" onClick={callEditor}>
              Editor
            </div>
            <div className="audio-to-text pr-3 sm:absolute sm:right-0 sm:mr-3">
              <AudioToText
                setChatInput={setChatInput}
                handleSubmitForAudioToText={handleSubmitForAudioToText}
              />
            </div>
          </form>
        </div> */}

        {/* 3 */}

        {/* <div className="chat-input-container flex items-center">
          <div className="chat-input-holder flex-grow">
            <form
              id="chatSubmitFormID"
              className="chatSubmitForm"
              onSubmit={handleSubmit}
            >
              <input
                rows="1"
                value={chatInput}
                onChange={(e) => {
                  const input = e.target.value;
                  console.log("input-length", input.length);

                  if (input.length <= 800) {
                    e.target.parentNode.querySelector(
                      ".submit"
                    ).disabled = false;
                    setChatInput(input);
                  }

                  if (input.length > 800) {
                    e.target.parentNode.querySelector(
                      ".submit"
                    ).disabled = true;
                  }
                }}
                id="chat-input-textarea-id"
                className="chat-input-textarea"
                placeholder="Type your message here. "
                disabled={false}
              ></input>
              <button className="submit" type="submit" disabled={false}>
                Submit
              </button>

              <div className="call-editor" onClick={callEditor}>
                Editor
              </div>

              <div
                className="audio-to-text pr-3 pb-1"
                onClick={(e) => {
                  e.stopPropagation();
                  // other logic here...
                }}
              >
                <AudioToText
                  setChatInput={setChatInput}
                  handleSubmitForAudioToText={handleSubmitForAudioToText}
                />
              </div>
            </form>
          </div>
        </div> */}

        {/* 4 */}
        {/* <div className="chat-input-container flex flex-wrap items-center">
          <div className="chat-input-holder flex-grow min-w-1/2">
            <form
              id="chatSubmitFormID"
              className="chatSubmitForm"
              onSubmit={handleSubmit}
            >
              <input
                rows="1"
                value={chatInput}
                onChange={(e) => {
                  const input = e.target.value;
                  console.log("input-length", input.length);

                  if (input.length <= 800) {
                    e.target.parentNode.querySelector(
                      ".submit"
                    ).disabled = false;
                    setChatInput(input);
                  }

                  if (input.length > 800) {
                    e.target.parentNode.querySelector(
                      ".submit"
                    ).disabled = true;
                  }
                }}
                id="chat-input-textarea-id"
                className="chat-input-textarea"
                placeholder="Type your message here. "
                disabled={false}
              ></input>
              <button className="submit" type="submit" disabled={false}>
                Submit
              </button>

              <div className="call-editor" onClick={callEditor}>
                Editor
              </div>
            </form>
          </div>
          <div className="audio-to-text pr-3 min-w-1/2">
            <AudioToText
              setChatInput={setChatInput}
              handleSubmitForAudioToText={handleSubmitForAudioToText}
            />
          </div>
        </div> */}
      </section>

      <div className="code-input-area" style={{ display: "none" }}>
        {/* <Codecompletion
          getPackagesFromEditor={getPackagesFromEditor}
          // extractedCode={extractedCode}
          savedChatIDs={savedChatIDs}
          chatCurrentTempId={chatCurrentTempId}
          getChatMessageByExperimentId={getChatMessageByExperimentId}
          patchChatToDB={patchChatToDB}
          extractCodeFromEditor={extractCodeFromEditor}
          showCodeRunningMessageWhenClickRunBtn={
            showCodeRunningMessageWhenClickRunBtn
          }
          disableReadingInput={disableReadingInput}
          checkCodePackages={checkCodePackages}
          installPackages={installPackages}
          runExtractedCode={runExtractedCode}
          makeBlinking={makeBlinking}
          updateAfterRuningCode={updateAfterRuningCode}
          nomoreBlinking={nomoreBlinking}
          enableReadingInput={enableReadingInput}
          handleSubmitFromEditor={handleSubmitFromEditor}
        /> */}
      </div>
    </>
  );
};

// Individual Chat Message
const ChatMessage = ({
  key,
  message,
  datasetId,
  experimentId,
  updateAfterRuningCode,
  modeForTabluerData,
  setModeForTabluerData,
  booleanPackageInstall,
  setBooleanPackageInstall,
  submitErrorWithCode,
  showCodeRunningMessageWhenClickRunBtn,
  getChatMessageByExperimentId,
  chatCurrentTempId,
  getSpecificChatbyChatId,
  patchChatToDB,
  checkCodePackages,
  disableReadingInput,
  enableReadingInput,
  autoScrollDown,
  hasZip,
  setHasZip,
  zipUrl,
  setZipUrl,
  hasZipIndexMessage,
  setHasZipIndexMessage,
  zipFileName,
  setZipFileName,
  nomoreBlinking,
  makeBlinking,
  savedChatIDs,
  installPackages,
  runExtractedCode,
}) => {
  let codeIncluded = checkIncludeCode(message.message);
  let extractedCode = extractCodeFromMess(message.message);

  const [isExpanded, setIsExpanded] = useState(false);

  // const [tabluerData, setTabluerData] = useState([]);

  const handleDoubleClick = () => {
    // console.log("handleDoubleClick")
    setIsExpanded(!isExpanded);
  };

  // async function runExtractedCode(code) {
  //   let resultFromRuningCode = await fetch(
  //     `http://127.0.0.1:5050/execapi/v1/executions`,
  //     {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         src_code: code,
  //         // dataset_id: datasetId,
  //         // experiment_id: experimentId,
  //       }),
  //     }
  //   )
  //     .then((response) => response.json())
  //     .then((data) => {
  //       console.log("star-1. runExtractedCode", data);
  //       return data;
  //     })
  //     .catch((error) => {
  //       console.log("runExtractedCode-fetch-error", error);
  //       return error;
  //     });

  //   return resultFromRuningCode;
  // }

  function checkIncludeCode(message) {
    if (message !== undefined) {
      // console.log("message-checkIncludeCode", message)
      let codeIncluded = false;
      if (message.includes("```python")) {
        codeIncluded = true;
      }
      return codeIncluded;
    } else {
      let codeIncluded = false;
      return codeIncluded;
    }
  }

  function extractCodeFromMess(message) {
    // console.log("message-extractCodeFromMess", message)
    if (message === undefined) {
      return "";
    }
    let code = "";
    const regex = /```([^`]*)```/g;
    const matches = message.matchAll(regex);

    for (const match of matches) {
      // console.log("match-extractCodeFromMess", match)
      //check if the first 6 characters are python
      if (match[1].substring(0, 6) === "python") {
        //remove the first 6 characters
        match[1] = match[1].substring(6);
      }
      // console.log("python code:",match[1]);
      code = match[1];
    }

    return code;
  }

  // async function installPackages(packagesArray, e) {
  //   // POST http://localhost:5080/execapi/v1/executions/install
  //   // Content-Type: application/json

  //   // {
  //   //     "command": "install",
  //   //     "packages": packagesArray
  //   // }

  //   // packagesArray = ["seaborn", "plotly", "matplotlib", "pandas", "numpy"];

  //   console.log("installPackages-packagesArray", packagesArray);

  //   let resultFromInstallingPackages = await fetch(
  //     `http://127.0.0.1:5050/execapi/v1/packages`,
  //     {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         // command: "install",
  //         packages: packagesArray,
  //       }),
  //     }
  //   )
  //     .then((response) => response.json())
  //     .then((data) => {
  //       // // console.log("installPackages-response-data-result", data['result'])
  //       console.log("resultFromInstallingPackages-response-data", data);
  //       return data;
  //     })
  //     .catch((error) => {
  //       console.log("installPackages-fetch-error", error);
  //       return error;
  //     });
  // }

  function findTheLastCodeMessageFromHTML(element) {
    // extract all text from element
    let text = element.innerText;

    return text;
  }

  function booleanErrorMessageorNot(line) {
    if (
      line.includes("Errno") ||
      line.includes("Error") ||
      line.includes("No module named") | line.includes("invalid syntax") ||
      line.includes("not")
    ) {
      return true;
    } else {
      return false;
    }
  }

  function checkStatus(response) {
    console.log("checkStatus-response", response);
    if (response.status >= 400) {
      //console.log(`error: ${response.error}`)
      let error = new Error(
        `${response.status}: ${response.statusText} : ${response.url}`
      );
      error.response = response;
      throw error;
    } else {
      return response;
    }
  }

  function getPackagesFromTempCode(tempCode) {
    const packages = [];

    const lines = tempCode.split("\n");
    for (const line of lines) {
      const words = line.trim().split(/\s+/);
      if (words[0] === "import" || words[0] === "from") {
        const parts = words[1].split(".");
        packages.push(parts[0]);
      }
    }

    return packages;
  }

  let hasZipVar = false;
  let zipUrlVar = "";
  let zipNameVar = "";
  let hasZipIndexMessageVar = 0;

  const goToUploadDatasets = (href, fileName) => {
    // split the href to get the file id
    let hrefSplit = href.split("/");
    let fileId = hrefSplit[hrefSplit.length - 1];
    window.location.hash =
      "/upload_datasets" + `?fileId=${fileId}&fileName=${fileName}`;
  };

  return (
    <div className={`chat-message ${message.user === "gpt" && "alirogpt"}`}>
      <div className="chat-message-center">
        <div className={`avatar ${message.user === "gpt" && "alirogpt"}`}>
          {message.user === "gpt" ? (
            <AISVGLogo />
          ) : (
            <div className="font-bold">You</div>
          )}
        </div>
        {/* origin */}
        {/* <div className="message">
                        {message.message}
                </div>  */}

        {/* In this case, it shows normal string message. */}
        {/* if code is false then show  */}
        {codeIncluded === false ? (
          // non code message
          <div className="message-noncode">
            {/* origin */}
            {/* {message.message} */}

            {/* v7 */}
            {message.message.split(/\n/).map((line, index) => {
              // non code message which includes image
              if (
                (line.includes(".png") && line.includes("http")) ||
                (line.includes(".jpg") && line.includes("http"))
              ) {
                // create a new instance of JSZip
                // const zip = new zip();
                // console.log("1-if", line)
                return (
                  <a href={line.substring(line.indexOf("http"))} download>
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        paddingBottom: "100%",
                      }}
                    >
                      <svg
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                        }}
                      >
                        <image
                          href={line.substring(line.indexOf("http"))}
                          height="100%"
                          width="100%"
                        />
                      </svg>
                    </div>
                  </a>
                );
              }
              // non code message which includes csv or tsv
              else if (
                (line.includes(".csv") && line.includes("http")) ||
                (line.includes(".tsv") && line.includes("http"))
              ) {
                // console.log("2-if", line)
                return (
                  <div>
                    {/* show me preview of the file  */}

                    {/* make below unvisible */}
                    <a
                      style={{
                        marginRight: "10px",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                      onClick={async (e) => {
                        if (
                          e.target.parentElement.parentElement.children[3].style
                            .display === "none"
                        ) {
                          e.target.parentElement.parentElement.children[3].style.display =
                            "block";
                        } else {
                          e.target.parentElement.parentElement.children[3].style.display =
                            "none";
                        }

                        const url = line.substring(line.indexOf("http"));
                      }}
                    >
                      Preview file
                    </a>

                    <a href={line.substring(line.indexOf("http"))} download>
                      <b style={{ color: "#87CEEB" }}>
                        Download {line.substring(0, line.indexOf(","))}
                      </b>
                    </a>

                    {/* generating experiment button */}
                    <a
                      style={{
                        marginLeft: "10px",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                      onClick={async (e) => {
                        e.preventDefault();

                        // split the innerText using " "
                        let fileName =
                          e.target.parentElement.children[1].children[0].innerText.split(
                            " "
                          )[1];

                        goToUploadDatasets(
                          e.target.parentElement.children[1].href,
                          fileName
                        );
                      }}
                    >
                      Generate experiment
                    </a>
                  </div>
                );
              } else if (line.includes(".zip") && line.includes("http")) {
                hasZipVar = true;
                zipUrlVar = line.substring(line.indexOf("http"));
                zipNameVar = line.substring(0, line.indexOf(","));
                hasZipIndexMessageVar = index;
              }

              // if the message includes "The tabular data is:" , set modeForTabluerData to true
              // this let us know that the next line is tabluer data
              else if (
                line.includes("The tabular data is:") &&
                modeForTabluerData === false
              ) {
                // console.log("3-if", line)
                setModeForTabluerData(true);
              }
              // Tabluer data is here. It previews the data by showing top 10 rows.
              else if (modeForTabluerData === true && index == 4) {
                // console.log("4-if", line)

                // check there is \t or not to check the file is csv or tsv
                if (line.includes("\t")) {
                  line = line.replace(/\t/g, ",");
                }
                console.log("4-if-replace", line);
                // line = line.replace(/_/g, "\n");
                // line = line.replace(/_(?=\d)/g, "\n");
                line = line.replace(/`/g, "\n");

                // const lastCommaIndex = line.lastIndexOf(",");
                // const lastUnderscoreIndex = line.lastIndexOf("_");
                // if (lastUnderscoreIndex > lastCommaIndex) {
                // line = line.substring(0, lastUnderscoreIndex) + "\n" + line.substring(lastUnderscoreIndex + 1);
                // }

                // console.log("4-if-replace", line)
                // make line as array
                const rows = line.split("\n");
                const data = rows.map((row) => row.split(","));

                return (
                  <div
                    className="previewTable"
                    style={{
                      overflowX: "auto",
                      overflowY: "auto",
                      backgroundColor: "#343a40",
                      borderRadius: "10px",
                      padding: "10px",
                      marginTop: "10px",
                      display: "none",
                    }}
                  >
                    <table
                      style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                      <thead>
                        <tr>
                          {data[0] &&
                            data[0].map((column) => (
                              <th
                                style={{
                                  textAlign: "center",
                                  border: "1px solid rgba(255, 255, 255, 0.5)",
                                }}
                              >
                                {column}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.length > 11
                          ? data.slice(1, 11).map((row) => (
                              <tr>
                                {row.map((cell) => (
                                  <td
                                    style={{
                                      textAlign: "center",
                                      border:
                                        "1px solid rgba(255, 255, 255, 0.5)",
                                    }}
                                  >
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))
                          : data.slice(1, data.length - 1).map((row) => (
                              <tr>
                                {row.map((cell) => (
                                  <td
                                    style={{
                                      textAlign: "center",
                                      border:
                                        "1px solid rgba(255, 255, 255, 0.5)",
                                    }}
                                  >
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                      </tbody>
                    </table>
                  </div>
                );
              }

              // this is for the normal message
              // in this case, there are 2 types of message
              // 1. message with "Errno" in it
              // 2. message without "Errno" in it
              else if (!line.includes("The tabular data is:")) {
                if (!line.includes("This is the end of the tabular data.")) {
                  // if line includes "Errno" show below
                  // error message check
                  if (
                    line.includes("Errno") ||
                    line.includes("Error") ||
                    line.includes("No module named") |
                      line.includes("invalid syntax")
                  ) {
                    return (
                      <div id="justmessage">
                        <span style={{ color: "" }}>{line}</span>
                        <br />
                        <button
                          id="runbutton"
                          className="run-code-button submit"
                          onClick={async (e) => {
                            let tempText = findTheLastCodeMessageFromHTML(
                              e.target.parentElement.parentElement.parentElement
                                .parentElement.parentElement.children[
                                e.target.parentElement.parentElement
                                  .parentElement.parentElement.parentElement
                                  .children.length - 2
                              ]
                            );

                            let tempCode = extractCodeFromMess(tempText);

                            // console.log("code-findTheLastCodeMessageFromHTML", tempCode)

                            disableReadingInput();

                            await submitErrorWithCode(e, tempCode);

                            enableReadingInput();

                            autoScrollDown();

                            // call openai api to generate code based on current code and error message
                            // let resp = await runExtractedCode(extractedCode, datasetId,experimentId);

                            // updateAfterRuningCode(e, resp)
                          }}
                        >
                          Submit error
                        </button>
                      </div>
                    );
                  } else {
                    // if (line==="Please wait while I am thinking..")
                    if (line === "..") {
                      return (
                        <div id="justmessage">
                          {line}
                          <span className="blinking">.</span>
                        </div>
                      );
                    }

                    if (
                      line ===
                      "Please wait while I am running your code on Aliro.."
                    ) {
                      return (
                        <div id="justmessage">
                          {line}
                          <span className="blinking">.</span>
                        </div>
                      );
                    } else {
                      return <div id="justmessage">{line}</div>;
                    }
                  }
                }
              }

              // gif, image, video
              // else if(line.includes(".gif") ){

              // }

              // length of message.message.split(/\n/)

              // if(index === message.message.split(/\n/).length-1 && hasZip){
              //     return (

              //             <a href={zipUrl} download>
              //                 <b style={{color: '#87CEEB'}}>Download {zipFileName}</b>
              //             </a>

              //     );
              // }

              if (
                index === message.message.split(/\n/).length - 1 &&
                hasZipVar
              ) {
                hasZipVar = false;
                return (
                  <a href={zipUrlVar} download>
                    <b style={{ color: "#87CEEB" }}>Download {zipNameVar}</b>
                  </a>
                );
              }
            })}
          </div>
        ) : (
          // code message
          // make in css message display:flex cancel
          <div className="message-code code">
            {message.message.split(/\n/).map((line, index) => {
              if (index === 0) {
                return <div className="message-nonEditable">{line}</div>;
              }
            })}

            {/* code contents */}
            {/* make background color of this div black */}
            <div
              className="code-editable"
              style={{
                width: "100%",
                overflowX: "auto",
                backgroundColor: "#343a40",
                borderRadius: "10px",
                padding: "10px",
                marginTop: "10px",
              }}
              onDoubleClick={(e) => {
                console.log("Double click code");

                e.target.parentElement.parentElement.parentElement.contentEditable = true;
                e.target.parentElement.parentElement.parentElement.focus();

                // e.target.parentElement.parentElement.parentElement.onkeydown
                e.target.parentElement.parentElement.parentElement.onkeydown =
                  async function (e) {
                    // enter key is not allowed
                    if (e.keyCode === 27) {
                      console.log("e.keyCode === 27 esc key");
                      // console.log("e.target.innerText", e.target.innerText)

                      let tempChatCodeExplain =
                        e.target.parentElement.getElementsByClassName(
                          "message-nonEditable"
                        )[0].innerText;

                      let tempUpdatedCodewithChat =
                        tempChatCodeExplain +
                        "\n" +
                        "```python" +
                        "\n" +
                        e.target.innerText +
                        "\n" +
                        "```";

                      // console.log("tempUpdatedCodewithChat", tempUpdatedCodewithChat)

                      e.preventDefault();
                      e.target.contentEditable = false;
                      e.target.focus();

                      console.log("inner-text", e.target.innerText);

                      // update extractedCode let
                      extractedCode = extractCodeFromMess(e.target.innerText);
                      console.log("extractedCode-test-27", extractedCode);

                      // modify the code to the chatlog
                      // should i update the chatlog?

                      // post updated code to the DB
                      // postChatNameToDB(tempString)

                      // POST http://localhost:5080/chatapi/v1/chatlogs
                      // Content-Type: application/json

                      // {
                      //     "_chat_id" : "645028384f4513a0b9459e53",
                      //     "message" : "Hello there from my desk!",
                      //     "message_type" : "text",
                      //     "who" : "user"
                      // }

                      // experimentId

                      // GET http://localhost:5080/chatapi/v1/chats/experiment/${experimentId}
                      let chatids_list = await savedChatIDs();
                      console.log("chatids_list-chatbox", chatids_list);
                      let data = await getChatMessageByExperimentId(
                        chatids_list[chatCurrentTempId - 1]
                      );

                      // filter the data using _experiment_id
                      // let filteredData = data.filter(
                      //   (item) => item._experiment_id === experimentId
                      // );

                      let filteredData = data;

                      // get div class name "chat-log"
                      let chatLog_divs =
                        document.getElementsByClassName("chat-log");

                      let temp_index_chat = 0;

                      console.log(
                        "e.target.parentElement.parentElement.parentElement",
                        e.target.parentElement.parentElement.parentElement
                      );

                      for (
                        let i = 0;
                        i < chatLog_divs[0].children.length;
                        i++
                      ) {
                        if (
                          chatLog_divs[0].children[i] ===
                          e.target.parentElement.parentElement.parentElement
                        ) {
                          console.log("choi-i", i);
                          temp_index_chat = i;
                        }
                      }

                      console.log("edited-temp_index_chat", temp_index_chat);

                      console.log(
                        "edited-filteredData",
                        filteredData["chatlogs"]
                      );

                      // please get the last temp_index_chat th element from filteredData["chatlogs"]

                      console.log(
                        "edited-last",
                        filteredData["chatlogs"][
                          filteredData["chatlogs"].length - temp_index_chat - 1
                        ]
                      );
                      // filteredData["chatlogs"][filteredData["chatlogs"].length - temp_index_chat]

                      // let chatByChatId = await getSpecificChatbyChatId(
                      //   chatCurrentTempId
                      // );

                      // console.log("chatByChatId-chatByChatId", chatByChatId);

                      console.log(
                        "edited-tempUpdatedCodewithChat",
                        tempUpdatedCodewithChat
                      );

                      let idInChatTap =
                        filteredData["chatlogs"][
                          filteredData["chatlogs"].length - temp_index_chat - 1
                        ]["id"];

                      console.log("idInChatTap", idInChatTap);

                      // update the code
                      await patchChatToDB(
                        chatids_list[chatCurrentTempId - 1],
                        idInChatTap,
                        tempUpdatedCodewithChat,
                        "text",
                        "gpt"
                      );
                    }
                  };
              }}
            >
              <pre style={{ margin: 0 }}>
                <code
                  style={{
                    whiteSpace: "pre-wrap",
                    wordWrap: "break-word",
                    color: "deepskyblue",
                  }}
                >
                  {/* <code className='language-python'> */}

                  {message.message.split(/\n/).map((line, index) => {
                    if (index !== 0) {
                      if (line.includes("```python") || line.includes("```")) {
                        //   return null; // return null to render nothing
                        return (
                          // non visible
                          <div
                            className="line-editable"
                            style={{ display: "none" }}
                          >
                            {line}
                          </div>
                        );
                      } else {
                        return <div className="line-editable">{line}</div>;
                      }
                    }
                  })}
                </code>
              </pre>
            </div>
            {message.message.split(/\n/).map((line, index) => {
              if (line.includes("not installed") && index === 0) {
                return (
                  <div>
                    <button
                      id="installpackagesbutton"
                      className="run-code-button submit"
                      onClick={async (e) => {
                        let currentEvent = e;
                        let packageIncludedString =
                          currentEvent.target.parentElement.parentElement.getElementsByClassName(
                            "message-nonEditable"
                          )[0].textContent;

                        let tempCode =
                          e.target.parentElement.parentElement.getElementsByClassName(
                            "code-editable"
                          )[0].innerText;

                        console.log("installandrun-tempCode", tempCode);

                        // get package from the tempCode
                        let packagesFromTempCode =
                          getPackagesFromTempCode(tempCode);

                        console.log(
                          "packagesFromTempCode",
                          packagesFromTempCode
                        );

                        if (currentEvent) {
                          let tempChatCodeExplain =
                            e.target.parentElement.parentElement.getElementsByClassName(
                              "message-nonEditable"
                            )[0].innerText;

                          let tempCode =
                            e.target.parentElement.parentElement.getElementsByClassName(
                              "code-editable"
                            )[0].innerText;

                          let tempUpdatedCodewithChat =
                            tempChatCodeExplain +
                            "\n" +
                            "```python" +
                            "\n" +
                            tempCode +
                            "\n" +
                            "```";

                          // console.log("tempUpdatedCodewithChat", tempUpdatedCodewithChat)

                          let tempElement =
                            e.target.parentElement.parentElement.parentElement
                              .parentElement;

                          e.preventDefault();
                          e.target.contentEditable = false;
                          e.target.focus();

                          // update extractedCode let
                          extractedCode = extractCodeFromMess(
                            e.target.parentElement.parentElement.getElementsByClassName(
                              "code-editable"
                            )[0].innerText
                          );

                          // post updated code to the DB
                          // postChatNameToDB(tempString)

                          // POST http://localhost:5080/chatapi/v1/chatlogs
                          // Content-Type: application/json

                          // {
                          //     "_chat_id" : "645028384f4513a0b9459e53",
                          //     "message" : "Hello there from my desk!",
                          //     "message_type" : "text",
                          //     "who" : "user"
                          // }

                          // experimentId
                          let chatids_list = await savedChatIDs();
                          console.log(
                            "run-chatid",
                            chatids_list[chatCurrentTempId - 1]
                          );

                          // GET http://localhost:5080/chatapi/v1/chats/experiment/${experimentId}
                          let data = await getChatMessageByExperimentId(
                            chatids_list[chatCurrentTempId - 1]
                          );

                          // filter the data using _experiment_id
                          // let filteredData = data.filter(
                          //   (item) => item._experiment_id === experimentId
                          // );

                          let filteredData = data;

                          // get div class name "chat-log"
                          let chatLog_divs =
                            document.getElementsByClassName("chat-log");

                          let temp_index_chat = 0;

                          console.log("tempElement", tempElement);

                          for (
                            let i = 0;
                            i < chatLog_divs[0].children.length;
                            i++
                          ) {
                            if (chatLog_divs[0].children[i] === tempElement) {
                              console.log("choi-i", i);
                              temp_index_chat = i;
                            }
                          }

                          // let chatByChatId = await getSpecificChatbyChatId(
                          //   filteredData[chatCurrentTempId - 1]["_id"]
                          // );

                          // // update the code
                          // await patchChatToDB(
                          //   chatByChatId.chatlogs[temp_index_chat]["_id"],
                          //   tempUpdatedCodewithChat,
                          //   "text",
                          //   "gpt"
                          // );

                          let idInChatTap =
                            filteredData["chatlogs"][
                              filteredData["chatlogs"].length -
                                temp_index_chat -
                                1
                            ]["id"];

                          console.log("idInChatTap", idInChatTap);

                          // update the code
                          await patchChatToDB(
                            chatids_list[chatCurrentTempId - 1],
                            idInChatTap,
                            tempUpdatedCodewithChat,
                            "text",
                            "gpt"
                          );
                        }

                        console.log("installpackagesbutton-click");

                        // let packageIncludedString = currentEvent.target.parentElement.parentElement.getElementsByClassName("message-nonEditable")[0].textContent;

                        console.log(
                          "packageIncludedString",
                          packageIncludedString
                        );

                        const packageNamesString =
                          packageIncludedString.substring(
                            0,
                            packageIncludedString.indexOf("package")
                          );

                        // // console.log("packageNamesString", packageNamesString)

                        // remove space in the packageNamesString

                        let packageNamesStringNospace =
                          packageNamesString.replace(/\s/g, "");
                        let packageNames = packageNamesStringNospace.split(",");

                        console.log("packageNames", packageNames);

                        // combine packageNames with packagesFromTempCode

                        packageNames =
                          packageNames.concat(packagesFromTempCode);

                        console.log("packageNamesCombined", packageNames);

                        // remove duplicate
                        packageNames = [...new Set(packageNames)];

                        console.log("packageNamesCombinedUnique", packageNames);

                        extractedCode = tempCode
                          .replace(/```python/g, "")
                          .replace(/```/g, "");

                        console.log("INS-extractedCode", extractedCode);

                        await showCodeRunningMessageWhenClickRunBtn(
                          currentEvent
                        );

                        disableReadingInput();

                        // checkCodePackages
                        let packagesNotInstalled = await checkCodePackages(
                          packageNames
                        );

                        console.log(
                          "install-packagesNotInstalled",
                          packagesNotInstalled
                        );

                        // doubleCheckPackagesWithLLM(packagesNotInstalled);

                        let resp_installPackages = "";
                        if (packagesNotInstalled.length != 0) {
                          // call install function
                          resp_installPackages = await installPackages(
                            packagesNotInstalled
                          );
                        }
                        console.log(
                          "resp_installPackages",
                          resp_installPackages
                        );

                        // makeBlinking();

                        let resp_runExtractedCode = await runExtractedCode(
                          extractedCode
                        );

                        // nomoreBlinking();

                        makeBlinking();

                        console.log(
                          "resp_runExtractedCode",
                          resp_runExtractedCode
                        );

                        // e.target.textContent = "Installed";

                        // use setchatlog function to update the chatlog
                        // update to the db and refer updateAfterRuningCode function
                        updateAfterRuningCode(
                          currentEvent,
                          resp_runExtractedCode
                        );

                        nomoreBlinking();

                        enableReadingInput();

                        // showCodeRunningMessageWhenClickRunBtn have autoScrollDown function
                        // autoScrollDown();
                      }}
                    >
                      ▶️ Install and Run
                    </button>
                  </div>
                );
              } else if (!line.includes("not installed") && index === 0) {
                // // console.log("temp-button-installed-line", line)
                return (
                  <div>
                    <button
                      id="runbutton"
                      className="run-code-button submit"
                      onClick={async (e) => {
                        let currentEvent = e;

                        let tempChatCodeExplain =
                          e.target.parentElement.parentElement.getElementsByClassName(
                            "message-nonEditable"
                          )[0].innerText;

                        console.log("tempChatCodeExplain", tempChatCodeExplain);

                        let tempCode =
                          e.target.parentElement.parentElement.getElementsByClassName(
                            "code-editable"
                          )[0].innerText;

                        console.log("run-tempCode", tempCode);

                        // get package from the tempCode
                        let packagesFromTempCode =
                          getPackagesFromTempCode(tempCode);

                        console.log(
                          "teresa-packagesFromTempCode",
                          packagesFromTempCode
                        );

                        let tempUpdatedCodewithChat =
                          tempChatCodeExplain +
                          "\n" +
                          "```python" +
                          "\n" +
                          tempCode +
                          "\n" +
                          "```";

                        console.log(
                          "tempUpdatedCodewithChat",
                          tempUpdatedCodewithChat
                        );

                        let tempElement =
                          e.target.parentElement.parentElement.parentElement
                            .parentElement;

                        e.preventDefault();
                        e.target.contentEditable = false;
                        e.target.focus();

                        // update extractedCode let
                        extractedCode = extractCodeFromMess(
                          e.target.parentElement.parentElement.getElementsByClassName(
                            "code-editable"
                          )[0].innerText
                        );

                        // modify the code to the chatlog
                        // should i update the chatlog?

                        // post updated code to the DB
                        // postChatNameToDB(tempString)

                        // POST http://localhost:5080/chatapi/v1/chatlogs
                        // Content-Type: application/json

                        // {
                        //     "_chat_id" : "645028384f4513a0b9459e53",
                        //     "message" : "Hello there from my desk!",
                        //     "message_type" : "text",
                        //     "who" : "user"
                        // }

                        // experimentId

                        // GET http://localhost:5080/chatapi/v1/chats/experiment/${experimentId}
                        let chatids_list = await savedChatIDs();

                        console.log(
                          "iii-chatids_list[chatCurrentTempId - 1]",
                          chatids_list[chatCurrentTempId - 1]
                        );
                        let data = await getChatMessageByExperimentId(
                          chatids_list[chatCurrentTempId - 1]
                        );

                        console.log("clicked-data", data);

                        // filter the data using _experiment_id
                        // let filteredData = data.filter(
                        //   (item) => item._experiment_id === experimentId
                        // );

                        let filteredData = data;

                        // get div class name "chat-log"
                        let chatLog_divs =
                          document.getElementsByClassName("chat-log");

                        let temp_index_chat = 0;

                        console.log("tempElement", tempElement);

                        for (
                          let i = 0;
                          i < chatLog_divs[0].children.length;
                          i++
                        ) {
                          if (chatLog_divs[0].children[i] === tempElement) {
                            console.log("choi-i", i);
                            temp_index_chat = i;
                          }
                        }

                        // let chatByChatId = await getSpecificChatbyChatId(
                        //   chatCurrentTempId
                        // );

                        // console.log("chatByChatId", chatByChatId);
                        console.log(
                          "iii-chatids_list[chatCurrentTempId - 1]",
                          chatids_list[chatCurrentTempId - 1]
                        );

                        console.log(
                          "iii-filteredData[chatlogs]",
                          filteredData["chatlogs"]
                        );
                        let idInChatTap =
                          filteredData["chatlogs"][
                            filteredData["chatlogs"].length -
                              temp_index_chat -
                              1
                          ]["id"];

                        console.log("idInChatTap", idInChatTap);

                        console.log(
                          "lastlast-chatids_list[chatCurrentTempId - 1]",
                          chatids_list[chatCurrentTempId - 1]
                        );

                        // update the code
                        await patchChatToDB(
                          // chatCurrentTempId,
                          chatids_list[chatCurrentTempId - 1],
                          idInChatTap,
                          tempUpdatedCodewithChat,
                          "text",
                          "gpt"
                        );

                        extractedCode = tempCode
                          .replace(/```python/g, "")
                          .replace(/```/g, "");

                        console.log("INS-extractedCode", extractedCode);

                        await showCodeRunningMessageWhenClickRunBtn(
                          currentEvent
                        );

                        disableReadingInput();

                        // console.log("run-packagesFromTempCode", packagesFromTempCode)

                        let packagesNotInstalled = await checkCodePackages(
                          packagesFromTempCode
                        );

                        console.log(
                          "run-packagesNotInstalled",
                          packagesNotInstalled
                        );

                        // if packagesNotInstalled is not empty
                        // install packages

                        if (packagesNotInstalled.length != 0) {
                          console.log("package not empty");
                          console.log(
                            "packagesNotInstalled package not empty",
                            packagesNotInstalled
                          );
                          let resp_installPackages = await installPackages(
                            packagesNotInstalled
                          );
                        }

                        // makeBlinking();

                        // let resp = await runExtractedCode(
                        //   extractedCode,
                        //   datasetId,
                        //   experimentId
                        // );

                        let resp = await runExtractedCode(extractedCode);

                        // nomoreBlinking();

                        makeBlinking();
                        await updateAfterRuningCode(currentEvent, resp);
                        nomoreBlinking();

                        enableReadingInput();

                        // showCodeRunningMessageWhenClickRunBtn have autoScrollDown function
                        // autoScrollDown();
                      }}
                    >
                      ▶️ Run
                    </button>
                  </div>
                );
              }
            })}

            {/* Run button */}
            {/* if booleanPackageInstall is false, show run button */}
            {/* if booleanPackageInstall is true, show install button */}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBox;
