import React, { useState, useEffect, useContext } from "react";

import { ThemeContext } from "./context/ThemeContext";

import { AllContext } from "./context/AllContext";

// import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";

import Tooltip from "@mui/material/Tooltip";
export default function SideMenu() {
  const {
    currentModel,
    setCurrentModel,
    models,
    handleTemp,
    temperature,
    clearChat,
    chatLog,
    setChatLog,
    chatCurrentTempId,
    setChatCurrentTempId,
    numChatBox,
    setNumChatBox,
    lanModelReset,
    setLanModelReset,
    limitNumChatBox,
    currentExpId,
    setCurrentExpId,
    tapTitles,
    setTapTitles,
    setTapTitlesFunc,
    getChatMessageByExperimentId,
    getSpecificChatbyChatId,
    getAllChatsFromDB,
    postChats,
    postInChatlogsToDB,
    deleteSpecificChat,
    patchSpecificChat,
    experiment,
    setTemperature,
    preSetPrompt,
    setPreSetPrompt,
    savedChatIDs,
    current_chatTapID,
    setCurrent_chatTapID,
    createChatID,
    setReadyToDisplayGOT,
    chatInput,
  } = useContext(AllContext);

  const [chatids, setChatids] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      checkNumChatBox();
      setBoldUnderlineAndInitTraIc();
      setCurrentExpId(numChatBox);

      await setTapTitlesFunc(numChatBox);
    };

    fetchData();
  }, [window.location.href, numChatBox]);

  const [openaiApiState, setopenaiApiState] = useState(0);

  //
  async function getAllChatsAndGetSpecificChatBasedOnExpID(
    clickedChatBoxNum, // "+ New Chat" or real chat id
    // countClickedChatBoxID, // total number of chatboxs
    totChat, // total number of chatboxs
    setChatLog
  ) {
    // console.log("setChatLog", setChatLog);
    // let experimentID = experiment.data._id;

    // let experimentID = countClickedChatBoxID;

    // experimentID = 2;

    let data = 0;

    if (clickedChatBoxNum !== "+ New Chat") {
      data = await getChatMessageByExperimentId(clickedChatBoxNum);
    }

    console.log("choi-data-chatlogs", data["chatlogs"]);

    // filter data based on experiment id
    // let dataFiltered = data.filter(function (el) {
    //   return el._experiment_id == experimentID;
    // });

    // let dataFiltered = data;

    // data=dataFiltered;
    console.log("clickedChatBoxNum", clickedChatBoxNum);

    // when user click + + New Chat button
    if (clickedChatBoxNum === "+ New Chat") {
      // POST http://localhost:5080/chatapi/v1/chats
      // Content-Type: application/json

      // {
      //     "title" : "`${experimentID}`",
      //     "_experiment_id": "641e7a67c3386b002e521705",
      //     "_dataset_id": "63f6e4947c5f93004a3e3ca7"
      // }

      let new_chatid = await createChatID();

      await postInChatlogsToDB(
        new_chatid["chat_id"],
        "How can I help you today?",
        "text",
        "gpt"
      );

      let current_chatids_list = await savedChatIDs();
      console.log("current_chatids_list", current_chatids_list);
      setChatids(current_chatids_list);

      // await postInChatlogsToDBWithExeId(experimentID, data['_id'], "How can I help you today?", "text", "gpt","")

      let chatLogNew = [
        {
          user: "gpt",
          message: "How can I help you today?",
        },
      ];
      setChatLog(chatLogNew);
    }
    // when user click existing chat button
    else {
      // console.log("else-countClickedChatBoxID", countClickedChatBoxID);
      // data = await getSpecificChatbyChatId(countClickedChatBoxID);

      // data = await getChatMessageByExperimentId(countClickedChatBoxID);

      // revese

      // console.log("else-data", data);

      // let chatLogNew = [
      //     {
      //         user: "gpt",
      //         message: "How can I help you today?"
      //     }
      // ]

      let chatLogNew = [];

      for (let i = 0; i < data["chatlogs"].length; i++) {
        // chatLogNew = [
        //     ...chatLogNew, {
        //         user: data["chatlogs"][i]["who"],
        //         message: data["chatlogs"][i]["message"]
        //     }
        // ]

        if (data["chatlogs"][i]["who"] == "user") {
          chatLogNew = [
            ...chatLogNew,
            {
              user: data["chatlogs"][i]["who"],
              message: data["chatlogs"][i]["message"],
            },
          ];
        } else if (data["chatlogs"][i]["who"] == "gpt") {
          chatLogNew = [
            ...chatLogNew,
            {
              user: data["chatlogs"][i]["who"],
              message: data["chatlogs"][i]["message"],
              // message: data["chatlogs"][i]["message"].split(/\n/).map(line => <div key={line}>{line}</div>)
            },
          ];
        }
      }
      // reverse chatLogNew
      chatLogNew = chatLogNew.reverse();
      setChatLog(chatLogNew);
    }
  }

  async function checkClickedChatboxTab(e) {
    // first, clear the context of the chat completions endpoint. (refer to the jay's message on slack)
    // in the openai api, is there a way to clear the context of the chat completions endpoint?
    // Yes, in the OpenAI API, you can clear the context of the chat completions endpoint by sending an empty string as the value for the context parameter.
    // For example, if you're using the Python client, you can make a request to the completions method with an empty string as the context parameter like this:

    // In getAllChatsAndGetSpecificChatBasedOnExpID function, in the case where data[clickedChatBoxNum] == undefined,
    // clear the context of the chat completions endpoint. And then, post with "How can I help you today?" to the openai api (chat/completions).

    // second, feed current chatlog of clicked chatbox to the chat completions endpoint.

    // In getAllChatsAndGetSpecificChatBasedOnExpID function, in the case where data[clickedChatBoxNum] != undefined, // clear the context of the chat completions endpoint. And then, post with chatlog of clicked chatbox to the openai api (chat/completions).

    console.log("checkClickedChatboxTab-e.target", e.target);

    if (e.target.childNodes[0].nodeValue === "+ New Chat") {
      var countClickedChatBoxID = numChatBox + 1;
      // console.log("countClickedChatBoxID", countClickedChatBoxID);
    } else {
      console.log("e.target", e.target);
      console.log("e.target.parentNode", e.target.parentNode);
      var siblings = e.target.parentNode.parentNode.childNodes;

      console.log("siblings", siblings);

      // console.log("siblings", siblings);

      for (let i = 1; i < siblings.length; i++) {
        // console.log("siblings[i]",siblings[i])

        if (e.target.parentNode === siblings[i]) {
          siblings[i].style.fontWeight = "bold";
          // siblings[i].style.textDecoration = "underline";
          var countClickedChatBoxID = i - 2;
        } else {
          siblings[i].style.fontWeight = "normal";
          // siblings[i].style.textDecoration = "none";
        }
      }

      // var currentClickedChatBoxID = parseInt(e.target.childNodes[1].nodeValue);
      var currentClickedChatBoxID = parseInt(
        e.target.childNodes[2].childNodes[0].childNodes[1].nodeValue
      );

      // Add 1 to currentClickedChatBoxID
      countClickedChatBoxID = currentClickedChatBoxID + 1;
      console.log("ttt-countClickedChatBoxID", countClickedChatBoxID);
    }
    // first chatbox is 1, second chatbox is 2, third chatbox is 3, etc.

    let chatids_list = await savedChatIDs();

    console.log("countClickedChatBoxID", countClickedChatBoxID);
    setChatCurrentTempId(countClickedChatBoxID);

    // user clicks chatbox tap
    console.log("e.target.childNodes.length", e.target.childNodes.length);
    if (e.target.childNodes.length === 3) {
      var clickedChatBoxNum =
        e.target.childNodes[2].childNodes[0].childNodes[1].nodeValue;

      console.log("clickedChatBoxNum", clickedChatBoxNum);
    }

    // user clicks + New Chat
    else if (e.target.childNodes.length === 1) {
      var clickedChatBoxNum = e.target.childNodes[0].nodeValue;
      console.log("user clicks + New Chat", clickedChatBoxNum);
    }

    let savedChatIDs_list = await savedChatIDs();
    // getAllChatsAndGetSpecificChat(clickedChatBoxNum, setChatLog);

    console.log("last-savedChatIDs_list", savedChatIDs_list);

    console.log(
      "savedChatIDs_list[clickedChatBoxNum",
      savedChatIDs_list[clickedChatBoxNum]
    );

    let addingNewChatbuttonOrRealChatID = 0;
    if (savedChatIDs_list[clickedChatBoxNum] === undefined) {
      addingNewChatbuttonOrRealChatID = "+ New Chat";
    } else {
      addingNewChatbuttonOrRealChatID = savedChatIDs_list[clickedChatBoxNum];
    }

    console.log("------------------");
    console.log("cck-savedChatIDs_list", savedChatIDs_list);
    console.log("cck-clickedChatBoxNum", clickedChatBoxNum);
    console.log(
      "cck-savedChatIDs_list[clickedChatBoxNum]",
      savedChatIDs_list[clickedChatBoxNum]
    );

    console.log("cck-countClickedChatBoxID", countClickedChatBoxID);

    await getAllChatsAndGetSpecificChatBasedOnExpID(
      addingNewChatbuttonOrRealChatID, // "+ New Chat" or real chat id
      numChatBox, //total number of chatboxs
      setChatLog
    );
    // make lanModelReset true
    setLanModelReset(true);
    return countClickedChatBoxID;
  }

  function clearAllTrashIcons(nodes) {
    Array.from(nodes.childNodes)
      .slice(3)
      .forEach((node) => {
        node.childNodes[1].style.display = "none";
        // console.log("node.childNodes[1]", node.childNodes[1]);
        // node.childNodes[1].innerHTML = "🗑️";
        node.childNodes[1].innerHTML = `
        <svg
                    width="22"
                    height="18"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="10"
                      cy="10"
                      r="7"
                      stroke="white"
                      stroke-width="1.5"
                      fill="none"
                    />

                    <rect x="6" y="9" width="8" height="2" fill="white" />
                  </svg>
`;
      });
  }

  function clearAllCheckIcons(nodes) {
    Array.from(nodes.childNodes)
      .slice(3)
      .forEach((node) => {
        node.childNodes[2].style.display = "none";
        node.childNodes[2].innerHTML = "🖋";
        // node.childNodes[2].innerHTML = "";
      });
  }

  // This function is to check if the number of chat boxes is equal to or greater than the limit, and if so, make the + New Chat button not clickable
  function checkNumChatBox() {
    if (numChatBox + 1 > limitNumChatBox) {
      document.getElementById("newchatbuttonForGOT").style.pointerEvents =
        "none";
    } else {
      document.getElementById("newchatbuttonForGOT").style.pointerEvents =
        "auto";
    }
  }

  function changeTrashToCheck(node, reverse) {
    // if node.innerHTML is not empty, then below works
    if (node && typeof node.innerHTML !== "undefined") {
      // console.log("node.innerHTML", node.innerHTML);
      if (reverse === true) {
        node.innerHTML = `
<svg width="22" height="18" xmlns="http://www.w3.org/2000/svg">
                  <circle
                    cx="10"
                    cy="10"
                    r="7"
                    stroke="white"
                    stroke-width="1.5"
                    fill="none"
                  />

                  <rect x="6" y="9" width="8" height="2" fill="white" />
                </svg>
`;
      } else {
        node.innerHTML = "✔︎";
        // // console.log("node.innerHTML",node.innerHTML)
      }
    }
  }

  function changePenToCheck(node, reverse) {
    // console.log("Pennode", node);
    if (reverse === true) {
      node.innerHTML = "🖋";
      // node.innerHTML = "";
      // // console.log("node.innerHTML",node.innerHTML)
    } else {
      node.innerHTML = "✔︎";
      // node.innerHTML = "";
      // // console.log("node.innerHTML",node.innerHTML)
    }
  }

  async function removeCorChat(e) {
    if (e.target.parentNode.childNodes[1].innerHTML === "✔︎") {
      if (e.target.parentNode.childNodes[0].childNodes.length === 2) {
        // var textClickedChatBox = e.target.parentNode.childNodes[0].childNodes[1].childNodes[0].textContent;

        alert(
          "Error: You cannot delete the chatbox tap. Please name the chatbox tap first."
        );
        throw new Error(
          "Error: You cannot delete the chatbox tap. Please name the chatbox tap first."
        );

        // receive the error message in the console
      } else if (e.target.parentNode.childNodes[0].childNodes.length === 3) {
        var textClickedChatBox =
          e.target.parentNode.childNodes[0].childNodes[2].childNodes[0]
            .textContent;
      }

      // parse textClickedChatBox with _
      var textClickedChatBoxIdString = textClickedChatBox.split("_")[1];

      // convert textClickedChatBoxIdString to integer
      var textClickedChatBoxId = parseInt(textClickedChatBoxIdString);

      //new
      let chatids_list = await savedChatIDs();
      console.log("chatids_list", chatids_list);
      console.log("removed chatids_list:", chatids_list[textClickedChatBoxId]);
      await deleteSpecificChat(chatids_list[textClickedChatBoxId]);

      // new
      chatids_list.splice(textClickedChatBoxId, 1);

      // new
      if (chatids_list.length > 0) {
        // let data = await getSpecificChatbyChatId(
        //   chatids_list[chatids_list.length - 1]
        // );

        let data = await getAllChatsFromDB(
          chatids_list[chatids_list.length - 1]
        );

        // make data reverse
        console.log("make data reverse", data);

        // make data["chatlogs"] reverse
        data["chatlogs"] = data["chatlogs"].reverse();

        let chatLogNew = [];

        for (let i = 0; i < data["chatlogs"].length; i++) {
          chatLogNew = [
            ...chatLogNew,
            {
              user: data["chatlogs"][i]["who"],
              message: data["chatlogs"][i]["message"],
            },
          ];
        }

        setChatLog(chatLogNew);
        setNumChatBox(numChatBox - 1);
        setChatCurrentTempId(numChatBox - 1);
        // new
        // setCurrent_chatTapID(new_chat_id["chat_id"]);
        // setTapTitlesFunc(new_chat_id["chat_id"]);
      } else {
        // When chatids_list.length == 0, if user remove the chatbox_0, it will reset the chatbox_0 with How can I help you today? by gpt. And this should be posted to the DB with the experimentId.

        // new
        let new_chat_id = await createChatID();
        console.log("new_chat_id", new_chat_id["chat_id"]);
        let chatids_list = await savedChatIDs();
        console.log("chatids_list", chatids_list);

        if (chatids_list.length === 0) {
          // POST http://localhost:5080/chatapi/v1/chatlogs
          // Content-Type: application/json
          // {
          //     "_chat_id" : "642076d7262c19d0be23448b",
          //     "message" : "How are you?",
          //     "message_type" : "text",
          //     "who" : "gpt"
          // }

          await postInChatlogsToDB(
            new_chat_id["chat_id"],
            "How can I help you today?",
            "text",
            "gpt"
          );

          // await postInChatlogsToDBWithExeId(experimentId, "How can I help you today?", "text", "gpt","")
        }

        let chatLogNew = [
          {
            user: "gpt",
            message: "How can I help you today?",
          },
        ];
        setChatLog(chatLogNew);
        setNumChatBox(1);
        setChatCurrentTempId(1);
        // new
        // setCurrent_chatTapID(new_chat_id["chat_id"]);
        setTapTitlesFunc();
      }

      // if the chatbox tap was only one, when user remove the chat, it will remove from the DB, but the chatbox will show "How can I help you today?"

      // if the chatbox tap was more than one, when user remove the chat, it will remove from the DB, and the chatbox will show the left chatbox tap or the right chatbox tap.
    }
  }

  function setBoldUnderlineAndInitTraIc() {
    //get div with class name sidemenu
    let sidemenu = document.getElementsByClassName("chatboxtapForGOT");

    // length of sidemenu
    let sidemenuLength = sidemenu.length;

    console.log("sidemenuLength", sidemenuLength);

    if (sidemenuLength > 0) {
      for (let i = 0; i < sidemenu.length - 1; i++) {
        sidemenu[i].style.fontWeight = "normal";
      }
      sidemenu[sidemenu.length - 1].style.fontWeight = "bold";

      // Trash emoji for each chatboxtap
      for (let i = 0; i < sidemenu.length; i++) {
        // console.log("sidemenu[i].childNodes", sidemenu[i].childNodes);
        // trash emoji
        sidemenu[i].childNodes[1].style.display = "none";
        // pen emoji
        sidemenu[i].childNodes[2].style.display = "none";
      }
      // trash emoji for the last chatboxtap
      sidemenu[sidemenu.length - 1].childNodes[1].style.display = "block";
      // pen emoji for each chatboxtap
      sidemenu[sidemenu.length - 1].childNodes[2].style.display = "block";
    }
  }

  async function postChatNameToDB(chatboxtapname, chattabid) {
    // get current url
    let url = window.location.href;
    let urlSplit = url.split("/");
    // let experimentID = experiment.data._id;

    // GET http://localhost:5080/chatapi/v1/chats
    // let data = await getChatMessageByExperimentId(chattabid);
    // filter data based on experiment id
    // let dataFiltered = data.filter(function (el) {
    //   return el._experiment_id == experimentID;
    // });

    // console.log("data---777", data);

    // let dataFiltered = data;

    // console.log("dataFiltered---777", dataFiltered["chatlogs"][0][]);

    // PATCH http://localhost:5080/chatapi/v1/chats/640bd7290674aa751483658b
    // Content-Type: application/json

    // {
    //     "title" : chatboxtapname,
    //     "_experiment_id": experimentID,
    //     "_dataset_id": experimentID
    // }

    await patchSpecificChat(
      chattabid,
      chatboxtapname
      // experimentID,
      // experimentID
    );

    setTapTitles({
      taptitles: tapTitles.taptitles.map((title, index) => {
        if (index === chatCurrentTempId - 1) {
          return chatboxtapname;
        }
        return title;
      }),
    });
  }
  function checkConnectionOpenAIandSet() {
    fetch("http://127.0.0.1:5050/openai/v1/connections", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
      if (!response.ok) {
        // throw new Error(`HTTP error: ${response.status}`);
        // alert("Connection to OpenAI is not established")

        // when it render, in the case where the connection is not established, we will require user to input the API key in the box.
        var modal = document.getElementsByClassName("modal")[0];
        modal.style.display = "block";
      } else if (openaiApiState > 0) {
        // let oak = document.getElementById("oak");
        // oak.style.fontWeight = "bold";

        const apiDisconnButton = document.getElementById("apiDisconnButton");
        if (apiDisconnButton) {
          apiDisconnButton.style.pointerEvents = "auto";
        }
      } else {
        document.getElementById("expertChatGPT").style.backgroundColor =
          "#1056c0";
        var modal = document.getElementsByClassName("modal")[0];
        // make it unvisible
        modal.style.display = "none";
        setopenaiApiState((openaiApiState) => openaiApiState + 1);

        let apiDisconnButton = document.getElementById("apiDisconnButton");
        apiDisconnButton.style.pointerEvents = "auto";
      }
    });
  }

  async function disconnetOpenAI() {
    // DELETE http://localhost:5080/openai/v1/connections

    await fetch("http://127.0.0.1:5050/openai/v1/connections", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
      if (!response.ok) {
        // throw new Error(`HTTP error: ${response.status}`);
        alert("Failed to disconnect from OpenAI API");
      } else {
        console.log("disconnect-response", response);
        alert("Successfully disconnected from OpenAI API");
        // document.getElementById("expertChatGPT").style.backgroundColor = "#d3d3d3";
      }
    });
  }

  return (
    <div className="divsidemenuForGOT">
      <aside className="sidemenuForGOT">
        {/* <div className="side-menu-button" onClick={() => setNumChatBox(numChatBox + 1)}> */}
        {/* <div className="side-menu-button" 
                > */}
        <button
          id="openPopupBtn"
          className="side-menu-buttonForGOT"
          style={{ display: "none" }}
          onClick={() => {
            console.log("77-openPopupBtn is clicked");
            const popupContainer = document.getElementById("popupContainer");

            popupContainer.style.display = "block";

            const popupContent = document.getElementById("popupContent");

            popupContent.style.display = "block";
          }}
        >
          <ManageAccountsRoundedIcon fontSize="small" />
          Settings
        </button>

        <div
          id="popupContainer"
          className="popup-container"
          onClick={() => {
            console.log("77-popupContainer is clicked");
            const popupContainer = document.getElementById("popupContainer");

            const popupContent = document.getElementById("popupContent");

            if (popupContent.style.display != "block") {
              popupContainer.style.display = "none";
            }

            console.log(
              "77-document.getElementById(popupContent).style.display",
              document.getElementById("popupContent").style.display
            );
          }}
        >
          {/* make close box for popupContent */}
          <div id="popupContent" className="popup-content">
            {/* <!-- Your code snippet here --> */}
            <div
              className="models"
              // style={{
              //     display: 'none'
              // }}
            >
              <button
                className="close-button"
                onClick={() => {
                  document.getElementById("popupContent").style.display =
                    "none";
                  document.getElementById("popupContainer").style.display =
                    "none";
                }}
              >
                x
              </button>

              <label className="side-label">Model</label>

              <select
                // active if model is select is currentModel
                value={currentModel}
                className="select-models"
                onChange={(e) => {
                  setCurrentModel(e.target.value);
                }}
              >
                {models && models.length ? (
                  models.map((model, index) => (
                    <option key={model.id} value={model.id}>
                      {model.id}
                    </option>
                  ))
                ) : (
                  <option key={"text-davinci-003"} value={"text-davinci-003"}>
                    {"text-davinci-003"}
                  </option>
                )}
              </select>

              <span className="info">
                The model parameter determines the underlying algorithm and
                configuration employed by the system to generate the response.
              </span>

              <label className="side-label">Temperature</label>
              <input
                className="select-models"
                type="number"
                onChange={(e) => setTemperature(e.target.value)}
                min="0"
                max="1"
                step="0.1"
                value={temperature}
              />

              <span className="info">
                The temperature parameter controls model randomness: 0 for
                logic, 1 for creativity.
              </span>

              <label className="side-label">Prompt Engineering</label>
              <input
                className="select-models"
                type="text"
                onChange={(e) => setPreSetPrompt(e.target.value)}
                // min="0"
                // max="1"
                // step="0.1"
                // make the input box bigger based on the length of the prompt

                value={preSetPrompt}
              />
              {/* <Button text="0 - Logical" onClick={() => setTemperature(0)}/>
                            <Button text="0.5 - Balanced" onClick={() => setTemperature(0.5)}/>
                            <Button text="1 - Creative" onClick={() => setTemperature(1)}/> */}
              <span className="info">Please write your prompt here.</span>
            </div>
          </div>
        </div>
        {/* </div> */}

        <div
          className="side-menu-buttonForGOT"
          id="newchatbuttonForGOT"
          onClick={async (e) => {
            let tempChatCurrentTempId = await checkClickedChatboxTab(e);

            setNumChatBox((numChatBox) => numChatBox + 1);

            // checking got data in the chatbox
            let chatid_list = await savedChatIDs();

            let data = await getChatMessageByExperimentId(
              chatid_list[tempChatCurrentTempId - 1]
              // chatCurrentTempId
            );

            // Calculate the index for the third-to-last item
            const index = data.chatlogs.length - 3;

            // Accessing the third-to-last chatlog entry, if the array is long enough
            const thirdFromLastChatlog =
              data.chatlogs.length > 2 ? data.chatlogs[index] : null;

            // if thirdFromLastChatlog is null, then readyToDisplayGOT is false
            if (thirdFromLastChatlog === null) {
              setReadyToDisplayGOT(false);
              const textarea = document.getElementById("chatSubmitFormID");
              // Make the textarea editable
              textarea.readOnly = false;

              // Make the textarea visible
              textarea.style.opacity = 1;

              // make chatsubmitbutton id block
              const submitbutton = document.getElementById("chatsubmitbutton");
              submitbutton.style.display = "block";
            } else {
              setReadyToDisplayGOT(true);

              // Get the element by its ID
              const textarea = document.getElementById("chatSubmitFormID");

              // Make the textarea read-only
              textarea.readOnly = true;

              // Make the textarea invisible but still occupy space
              textarea.style.opacity = 0;
            }
          }}
          // style={{ display: "none" }}
        >
          {/* <AddCircleOutlineRoundedIcon fontSize="small" />  */}+ New Chat
        </div>

        {Array(numChatBox)
          .fill()
          .map((_, i) => (
            <div className="sidemenuForGOT chatboxtapForGOT">
              <div
                className="side-menu-buttonForGOT"
                // key={i}
                onClick={async (e) => {
                  let tempChatCurrentTempId = await checkClickedChatboxTab(e);

                  console.log("tempChatCurrentTempId", tempChatCurrentTempId);

                  clearAllTrashIcons(e.target.parentNode.parentNode);

                  clearAllCheckIcons(e.target.parentNode.parentNode);

                  e.target.parentNode.childNodes[1].style.display = "block";
                  e.target.parentNode.childNodes[2].style.display = "block";

                  // checking got data in the chatbox
                  let chatid_list = await savedChatIDs();
                  console.log("chatid_list", chatid_list);

                  let data = await getChatMessageByExperimentId(
                    chatid_list[tempChatCurrentTempId - 1]
                    // chatCurrentTempId
                  );

                  // find the third in chatlogs in data

                  console.log("dataInSideMenu", data);

                  // Calculate the index for the third-to-last item
                  const index = data.chatlogs.length - 3;

                  // Accessing the third-to-last chatlog entry, if the array is long enough
                  const thirdFromLastChatlog =
                    data.chatlogs.length > 2 ? data.chatlogs[index] : null;

                  console.log(
                    "thirdFromLastChatlogInSideMenu",
                    thirdFromLastChatlog
                  );

                  // if thirdFromLastChatlog is null, then readyToDisplayGOT is false
                  if (thirdFromLastChatlog === null) {
                    setReadyToDisplayGOT(false);
                    const textarea =
                      document.getElementById("chatSubmitFormID");
                    // Make the textarea editable
                    textarea.readOnly = false;

                    // Make the textarea visible
                    textarea.style.opacity = 1;

                    const submitbutton =
                      document.getElementById("chatsubmitbutton");
                    // make submitbutton diplsay block
                    submitbutton.style.display = "block";
                  } else {
                    setReadyToDisplayGOT(true);

                    // Get the element by its ID
                    const textarea =
                      document.getElementById("chatSubmitFormID");

                    // Make the textarea read-only
                    textarea.readOnly = true;

                    // Make the textarea invisible but still occupy space
                    textarea.style.opacity = 0;
                  }
                }}
                onDoubleClick={async (e) => {
                  // find the child node with id newchatbutton
                  let newchatbutton = document.getElementById(
                    "newchatbuttonForGOT"
                  );

                  // make it unclickable
                  newchatbutton.style.pointerEvents = "none";

                  // e.target.parentNode.childNodes[1].textContent = "✔︎"

                  // allow to change the text in div
                  e.target.contentEditable = true;
                  e.target.focus();

                  //not allow user to use delete key when the text is empty
                  e.target.onkeydown = async function (e) {
                    // split e.target.textContent with & and _ to get the text
                    // console.log("0509-e.target.childNodes[0].textContent",e.target.textContent)
                    let tempString = e.target.textContent
                      .split("&")[0]
                      .split("_")[0];

                    console.log("tempString", tempString);

                    // e.keyCode === 8 is the delete key
                    if (tempString === "" && e.keyCode === 8) {
                      // console.log("tempString ===  && e.keyCode === 8)")
                      e.preventDefault();

                      // e.target.textContent
                    }
                    // enter key is not allowed
                    if (e.keyCode === 13) {
                      console.log("e.keyCode", e.keyCode);
                      // if(e.keyCode === 13) {
                      // console.log("e.keyCode === 13 enter key is not allowed");
                      e.preventDefault();
                      e.target.contentEditable = false;
                      e.target.focus();

                      // post the + New Chat name to the DB
                      // postChatNameToDB(tempString);

                      let chatids_list = await savedChatIDs();
                      console.log("chatids_list", chatids_list);

                      console.log(
                        "chatids_list[chatCurrentTempId - 1]",
                        chatids_list[chatCurrentTempId - 1]
                      );

                      postChatNameToDB(
                        tempString,
                        chatids_list[chatCurrentTempId - 1]
                      );
                    }

                    // cannot enter more than 20 characters
                    if (e.target.textContent.length > 25) {
                      console.log("Please do not enter more than 25");
                      e.preventDefault();
                    }
                  };
                }}
              >
                {tapTitles.taptitles[i]}
                <p style={{ display: "none" }} contentEditable={false}>
                  _{i}
                </p>

                <div
                  className="numUnvisPele"
                  style={{ display: "none" }}
                  contentEditable={false}
                >
                  <span>&ChatBox_{i}</span>
                </div>
              </div>

              {/* Tooltip */}
              <Tooltip title="Delete this chat tap." placement="right">
                <div
                  className="side-menu-button-trashForGOT trash"
                  key={i}
                  // onClick={removeCorChat}
                  onMouseEnter={(e) => {
                    changeTrashToCheck(
                      e.target.parentNode.childNodes[1],
                      false
                    );
                  }}
                  onMouseLeave={(e) => {
                    changeTrashToCheck(e.target.parentNode.childNodes[1], true);
                  }}
                  onClick={async (e) => {
                    // Here!!!
                    // try {
                    //   // change e.target to e.target.parentNode.childNodes[0]

                    //   const firstChildOfParent =
                    //     e.target.parentNode.childNodes[0];

                    //   // then use firstChildOfParent instead of e.target for further operations
                    //   let tempChatCurrentTempId = await checkClickedChatboxTab({
                    //     ...e, // 기존 이벤트 객체의 나머지 부분을 전파합니다.
                    //     target: firstChildOfParent, // target을 firstChildOfParent로 변경합니다.
                    //   });

                    //   // checking got data in the chatbox
                    //   let chatid_list = await savedChatIDs();

                    //   // console.log("length-chatid_list", chatid_list.length);

                    //   let data = "";
                    //   // currently the number of taps are larger than 2
                    //   console.log("7373-=============Next=================");
                    //   console.log(
                    //     "7373-tempChatCurrentTempId",
                    //     tempChatCurrentTempId
                    //   );

                    //   // tempChatCurrentTempId is currently clicked chatboxtap
                    //   // if (tempChatCurrentTempId >= 2) {
                    //   // if chatid_list.length ===3, which means that the current number of chatbox is 2
                    //   if (chatid_list.length >= 2) {
                    //     console.log("7373-chatid_list.length >= 2");
                    //     console.log("7373-chatid_list", chatid_list);
                    //     // if tempChatCurrentTempId >=2
                    //     if (tempChatCurrentTempId >= 2) {
                    //       console.log("7373-tempChatCurrentTempId >= 2");
                    //       data = await getChatMessageByExperimentId(
                    //         // chatid_list[tempChatCurrentTempId - 2]
                    //         chatid_list[chatid_list.length - 2]
                    //         // chatCurrentTempId
                    //       );
                    //     }
                    //     // else if tempChatCurrentTempId ===1
                    //     else if (tempChatCurrentTempId === 1) {
                    //       console.log("7373-tempChatCurrentTempId === 1");
                    //       data = await getChatMessageByExperimentId(
                    //         // chatid_list[tempChatCurrentTempId - 1]
                    //         chatid_list[chatid_list.length - 2]
                    //         // chatCurrentTempId
                    //       );
                    //       // tempChatCurrentTempId - 2 is the chatCurrentTempId
                    //       // setChatCurrentTempId(1);
                    //     }

                    //     // data = await getChatMessageByExperimentId(
                    //     //   chatid_list[tempChatCurrentTempId - 2]
                    //     //   // chatCurrentTempId
                    //     // );

                    //     console.log("dataInSideMenu", data);

                    //     console.log("chatid_list.length", chatid_list.length);
                    //     // console.log()
                    //     console.log(
                    //       "7575-chatid_list.length-1",
                    //       chatid_list.length - 1
                    //     );
                    //     console.log(
                    //       "7575-chatid_list.length-2",
                    //       chatid_list.length - 2
                    //     );

                    //     setChatCurrentTempId(chatid_list.length - 1);

                    //     // find the third in chatlogs in data

                    //     console.log("removeCorChat-dataInSideMenu", data);

                    //     // Calculate the index for the third-to-last item
                    //     const index = data.chatlogs.length - 3;

                    //     // Accessing the third-to-last chatlog entry, if the array is long enough ,which means it has the json file for GOT in the chatlog
                    //     const thirdFromLastChatlog =
                    //       data.chatlogs.length > 2
                    //         ? data.chatlogs[index]
                    //         : null;

                    //     console.log(
                    //       "removeCorChat-thirdFromLastChatlogInSideMenu",
                    //       thirdFromLastChatlog
                    //     );

                    //     console.log("length-chatid_list", chatid_list.length);

                    //     // if thirdFromLastChatlog is null, which means that it does not have the GOT json in the chatlogs, then readyToDisplayGOT is false
                    //     if (thirdFromLastChatlog === null) {
                    //       console.log("7373-thirdFromLastChatlog === null");
                    //       console.log("notshowGOT");
                    //       setReadyToDisplayGOT(false);
                    //       const textarea =
                    //         document.getElementById("chatSubmitFormID");
                    //       // Make the textarea editable
                    //       textarea.readOnly = false;

                    //       // Make the textarea visible
                    //       textarea.style.opacity = 1;

                    //       const submitbutton =
                    //         document.getElementById("chatsubmitbutton");
                    //       // make submitbutton diplsay block
                    //       submitbutton.style.display = "block";
                    //     } else {
                    //       console.log("7373-thirdFromLastChatlog !== null");
                    //       console.log("showGOT");
                    //       setReadyToDisplayGOT(true);

                    //       // Get the element by its ID
                    //       const textarea =
                    //         document.getElementById("chatSubmitFormID");

                    //       // Make the textarea read-only
                    //       textarea.readOnly = true;

                    //       // Make the textarea invisible but still occupy space
                    //       textarea.style.opacity = 0;
                    //     }

                    //     console.log("removeCorChat");
                    //     removeCorChat(e);
                    //   }
                    //   // currently the number of taps are 1
                    //   else {
                    //     console.log("7373-chatid_list.length === 1");
                    //     console.log("num_chatbox is 1");
                    //     // setReadyToDisplayGOT(false);
                    //     const textarea =
                    //       document.getElementById("chatSubmitFormID");
                    //     // Make the textarea editable
                    //     textarea.readOnly = false;

                    //     // Make the textarea visible
                    //     textarea.style.opacity = 1;

                    //     const submitbutton =
                    //       document.getElementById("chatsubmitbutton");
                    //     // make submitbutton diplsay block
                    //     submitbutton.style.display = "block";

                    //     setChatCurrentTempId(1);
                    //     setReadyToDisplayGOT(false);

                    //     console.log("removeCorChat");
                    //     await removeCorChat(e);
                    //   }
                    // } catch (error) {
                    //   // // console.log("error",error)
                    //   console.log("error-removeCorChat", error);
                    // }
                    try {
                      // change e.target to e.target.parentNode.childNodes[0]

                      const firstChildOfParent =
                        e.target.parentNode.childNodes[0];

                      // then use firstChildOfParent instead of e.target for further operations
                      let tempChatCurrentTempId = await checkClickedChatboxTab({
                        ...e, // 기존 이벤트 객체의 나머지 부분을 전파합니다.
                        target: firstChildOfParent, // target을 firstChildOfParent로 변경합니다.
                      });

                      let chatid_list = await savedChatIDs();

                      console.log("55555-before-chatid_list", chatid_list);

                      await removeCorChat(e);

                      // checking got data in the chatbox

                      chatid_list = await savedChatIDs();

                      console.log("55555-after-chatid_list", chatid_list);

                      let data = "";
                      // currently the number of taps are larger than 2
                      console.log("7373-=============Next=================");
                      console.log(
                        "7373-tempChatCurrentTempId",
                        tempChatCurrentTempId
                      );

                      data = await getChatMessageByExperimentId(
                        // chatid_list[tempChatCurrentTempId - 2]
                        chatid_list[chatid_list.length - 1]
                        // chatCurrentTempId
                      );

                      setChatCurrentTempId(chatid_list.length);

                      const index = data.chatlogs.length - 3;

                      // Accessing the third-to-last chatlog entry, if the array is long enough ,which means it has the json file for GOT in the chatlog
                      const thirdFromLastChatlog =
                        data.chatlogs.length > 2 ? data.chatlogs[index] : null;

                      console.log(
                        "removeCorChat-thirdFromLastChatlogInSideMenu",
                        thirdFromLastChatlog
                      );

                      console.log("length-chatid_list", chatid_list.length);

                      // if thirdFromLastChatlog is null, which means that it does not have the GOT json in the chatlogs, then readyToDisplayGOT is false
                      if (thirdFromLastChatlog === null) {
                        console.log("7373-thirdFromLastChatlog === null");
                        console.log("notshowGOT");
                        setReadyToDisplayGOT(false);
                        const textarea =
                          document.getElementById("chatSubmitFormID");
                        // Make the textarea editable
                        textarea.readOnly = false;

                        // Make the textarea visible
                        textarea.style.opacity = 1;

                        const submitbutton =
                          document.getElementById("chatsubmitbutton");
                        // make submitbutton diplsay block
                        submitbutton.style.display = "block";
                      } else {
                        console.log("7373-thirdFromLastChatlog !== null");
                        console.log("showGOT");
                        setReadyToDisplayGOT(true);

                        // Get the element by its ID
                        const textarea =
                          document.getElementById("chatSubmitFormID");

                        // Make the textarea read-only
                        textarea.readOnly = true;

                        // Make the textarea invisible but still occupy space
                        textarea.style.opacity = 0;
                      }
                    } catch (error) {
                      // // console.log("error",error)
                      console.log("error-removeCorChat", error);
                    }
                  }}
                  style={{ display: "none" }}
                >
                  <svg
                    width="22"
                    height="18"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="10"
                      cy="10"
                      r="7"
                      stroke="white"
                      stroke-width="1.5"
                      fill="none"
                    />

                    <rect x="6" y="9" width="8" height="2" fill="white" />
                  </svg>
                </div>
              </Tooltip>

              {/* make unvisible */}
              <div
                className="side-menu-button-trashForGOT check"
                // style={{ display: "none" }}
                onMouseEnter={(e) => {
                  changePenToCheck(e.target.parentNode.childNodes[2], false);
                }}
                onMouseLeave={(e) => {
                  changePenToCheck(e.target.parentNode.childNodes[2], true);
                }}
                onClick={async (e) => {
                  let newchatbutton = document.getElementById(
                    "newchatbuttonForGOT"
                  );

                  // make it clickable
                  newchatbutton.style.pointerEvents = "auto";

                  // find element by className side-menu-button from the e.target.parentNode

                  let tempSideMenuButtonText = e.target.parentNode
                    .getElementsByClassName("side-menu-buttonForGOT")[0]
                    .textContent.split("&")[0]
                    .split("_")[0];

                  let chatids_list = await savedChatIDs();
                  console.log("chatids_list", chatids_list);

                  postChatNameToDB(
                    tempSideMenuButtonText,
                    chatids_list[chatCurrentTempId - 1]
                  );
                }}
              >
                🖋
              </div>
            </div>
          ))}
      </aside>
    </div>
  );
}
