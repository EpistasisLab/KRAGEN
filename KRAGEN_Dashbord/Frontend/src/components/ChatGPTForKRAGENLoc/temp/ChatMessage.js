import AISVGLogo from "./AISVGLogo";
// import Codecompletion from "../WebAICore/CodeCompletion";

import React, { useState } from "react";

// Primary Chat Window

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
                        document.getElementsByClassName("chat-logForGOT");

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
                            document.getElementsByClassName("chat-logForGOT");

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
                          document.getElementsByClassName("chat-logForGOT");

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
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
