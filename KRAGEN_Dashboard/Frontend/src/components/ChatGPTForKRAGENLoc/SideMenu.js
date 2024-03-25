import React, { useState, useContext } from "react";
import { AllContext } from "./context/AllContext";
import { debounce, throttle } from "lodash"; // import debounce from lodash

// import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
// import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";

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
    gotLoaded,
    setGotLoaded,
    setDataset,
    setDataReady,
    setChatInputForGOT,
    gotQuestion,
    setGotQuestion,
    gotAnswer,
    setGotAnswer,
  } = useContext(AllContext);

  const [chattapClickable, setChattapClickable] = useState(true);

  const handleChattapClick = async (e) => {
    if (chattapClickable) {
      setChattapClickable(false); // Change state to prevent further clicks.
      debouncedOnClickChatTab(e); // Execute the click event handler.
      setTimeout(() => setChattapClickable(true), 300); // Allow clicking again after 100ms.
    }
  };

  const debouncedOnClickNewChat = debounce(async (e) => {
    // set gotQuestion, gotAnswer, chatInputForGOT, gotLoaded, dataset, dataReady, readyToDisplayGOT
    setGotQuestion("");
    setGotAnswer("");
    // Set initial states
    setChatInputForGOT("");
    setGotLoaded("");
    setDataset("");
    setDataReady(false);
    setReadyToDisplayGOT(false);

    let tempChatCurrentTempId = await checkClickedChatboxTab(e);

    setCurrentExpId(numChatBox + 1);
    await setTapTitlesFunc(numChatBox + 1);
    setNumChatBox((numChatBox) => numChatBox + 1);

    checkNumChatBox();
    setBoldUnderlineAndInitTraIc();

    let chatid_list = await savedChatIDs();

    // Load data for the selected chat tab
    if (chatid_list.length > tempChatCurrentTempId - 1) {
      const data = await getChatMessageByExperimentId(
        chatid_list[tempChatCurrentTempId - 1]
      );
      console.log("debouncedOnClickNewChat-data", data);

      // Set the textarea to be editable
      const textarea = document.getElementById("chatSubmitFormID");
      textarea.readOnly = false;
      textarea.style.opacity = 1;

      // Display the submit button
      const submitbutton = document.getElementById("chatsubmitbutton");
      submitbutton.style.display = "block";
    }
  }, 250);

  const debouncedOnClickChatTab = debounce(async (e) => {
    // Execute checkClickedChatboxTab and savedChatIDs in parallel since they are independent
    // console.log("debouncedOnClickChatTab-e", e);
    const [tempChatCurrentTempId, chatid_list] = await Promise.all([
      checkClickedChatboxTab(e),
      savedChatIDs(),
    ]);

    // UI operations to clear icons and display chat controls
    clearAllTrashIcons(e.target.parentNode.parentNode);
    clearAllCheckIcons(e.target.parentNode.parentNode);
    e.target.parentNode.childNodes[1].style.display = "block";
    e.target.parentNode.childNodes[2].style.display = "block";

    // Ensure the chat ID is within bounds before attempting to fetch chat messages
    if (chatid_list.length > tempChatCurrentTempId - 1) {
      let data = await getChatMessageByExperimentId(
        chatid_list[tempChatCurrentTempId - 1]
      );

      // Process the data from the third-to-last chatlog entry
      const index = data.chatlogs.length - 3;
      const thirdFromLastChatlog =
        data.chatlogs.length > 2 ? data.chatlogs[index] : null;

      if (thirdFromLastChatlog === null) {
        setGotQuestion("");
        setGotAnswer("");
        setReadyToDisplayGOT(false);
        setDataset("");
        makeTextareaEditable();
      } else {
        let thirdFromLastChatlogMessage = JSON.parse(
          thirdFromLastChatlog.message
        );

        console.log("thirdFromLastChatlogMessage", thirdFromLastChatlogMessage);

        setDataset(thirdFromLastChatlogMessage);

        // set the question and answer states
        setGotQuestion(thirdFromLastChatlogMessage.question);
        setGotAnswer(thirdFromLastChatlogMessage.answer);

        setReadyToDisplayGOT(true);
        makeTextareaReadOnly();
      }
    } else {
      // If the chat ID is out of bounds, reset to default UI state
      setDefaultsForUI();
    }
  }, 250);

  function makeTextareaEditable() {
    const textarea = document.getElementById("chatSubmitFormID");
    textarea.readOnly = false;
    textarea.style.opacity = 1;
    document.getElementById("chatsubmitbutton").style.display = "block";
  }

  function makeTextareaReadOnly() {
    const textarea = document.getElementById("chatSubmitFormID");
    textarea.readOnly = true;
    textarea.style.opacity = 0;
  }

  function setDefaultsForUI() {
    // Implement UI reset logic here
    setReadyToDisplayGOT(false);
    setDataset("");
    // Additional UI reset operations as needed
  }
  const debouncedOnDoubleClickChatTab = debounce(async (e) => {
    // find the child node with id newchatbutton
    let newchatbutton = document.getElementById("newchatbuttonForGOT");

    // make it unclickable
    newchatbutton.style.pointerEvents = "none";

    // allow to change the text in div
    e.target.contentEditable = true;
    e.target.focus();

    //not allow user to use delete key when the text is empty
    e.target.onkeydown = async function (e) {
      // split e.target.textContent with & and _ to get the text
      // console.log("0509-e.target.childNodes[0].textContent",e.target.textContent)
      let tempString = e.target.textContent.split("&")[0].split("_")[0];

      // e.keyCode === 8 is the delete key
      if (tempString === "" && e.keyCode === 8) {
        // console.log("tempString ===  && e.keyCode === 8)")
        e.preventDefault();
      }
      // enter key is not allowed
      if (e.keyCode === 13) {
        e.preventDefault();
        e.target.contentEditable = false;
        e.target.focus();

        let chatids_list = await savedChatIDs();
        // console.log("chatids_list", chatids_list);

        await postChatNameToDB(tempString, chatids_list[chatCurrentTempId - 1]);
      }

      // cannot enter more than 20 characters
      if (e.target.textContent.length > 25) {
        e.preventDefault();
      }
    };
  }, 250);

  // debounce for side-menu-button-trashForGOT
  const debouncedOnClickRemoveChatTab = debounce(async (e) => {
    try {
      setGotQuestion("");
      setGotAnswer("");

      const firstChildOfParent = e.target.parentNode.childNodes[0];

      // then use firstChildOfParent instead of e.target for further operations
      let tempChatCurrentTempId = await checkClickedChatboxTab({
        ...e, // 기존 이벤트 객체의 나머지 부분을 전파합니다.
        target: firstChildOfParent, // target을 firstChildOfParent로 변경합니다.
      });

      let chatid_list = await savedChatIDs();

      await removeCorChat(e);

      chatid_list = await savedChatIDs();

      let data = "";
      // currently the number of taps are larger than 2

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

      if (thirdFromLastChatlog === null) {
        setDataset("");
        setReadyToDisplayGOT(false);
        setDataReady(false);
        setGotLoaded("");

        const textarea = document.getElementById("chatSubmitFormID");
        // Make the textarea editable
        textarea.readOnly = false;

        // Make the textarea visible
        textarea.style.opacity = 1;

        const submitbutton = document.getElementById("chatsubmitbutton");

        submitbutton.style.display = "block";
      } else {
        let thirdFromLastChatlogMessage = JSON.parse(
          thirdFromLastChatlog.message
        );

        setDataset(thirdFromLastChatlogMessage);
        setGotQuestion(thirdFromLastChatlogMessage.question);
        setGotAnswer(thirdFromLastChatlogMessage.answer);
        setReadyToDisplayGOT(true);

        setDataReady(true);
        setGotLoaded(true);

        // Get the element by its ID
        const textarea = document.getElementById("chatSubmitFormID");

        // Make the textarea read-only
        textarea.readOnly = true;

        // Make the textarea invisible but still occupy space
        textarea.style.opacity = 0;
      }
    } catch (error) {
      console.log("error-removeCorChat", error);
    }
  }, 250);

  const onMouseEnterThrottledTrashToCheck = throttle((e) => {
    changeTrashToCheck(e.target.parentNode.childNodes[1], false);
  }, 100); //

  const onMouseLeaveThrottledTrashToCheck = throttle((e) => {
    changeTrashToCheck(e.target.parentNode.childNodes[1], true);
  }, 100); //

  // Debouncing onMouseEnter and onMouseLeave
  const debouncedChangePenToCheckEnter = debounce((target, flag) => {
    changePenToCheck(target, flag);
  }, 250); // 250ms delay

  const debouncedChangePenToCheckLeave = debounce((target, flag) => {
    changePenToCheck(target, flag);
  }, 250); // 250ms delay

  // Debouncing onClick
  const debouncedOnClickPen = debounce(async (e) => {
    let newchatbutton = document.getElementById("newchatbuttonForGOT");

    // make it clickable
    newchatbutton.style.pointerEvents = "auto";

    // find element by className side-menu-button from the e.target.parentNode
    let tempSideMenuButtonText = e.target.parentNode
      .getElementsByClassName("side-menu-buttonForGOT")[0]
      .textContent.split("&")[0]
      .split("_")[0];

    let chatids_list = await savedChatIDs();
    // console.log("chatids_list", chatids_list);

    await postChatNameToDB(
      tempSideMenuButtonText,
      chatids_list[chatCurrentTempId - 1]
    );
  }, 200); // 200ms delay

  const [chatids, setChatids] = useState([]);

  const [openaiApiState, setopenaiApiState] = useState(0);

  async function getAllChatsAndGetSpecificChatBasedOnExpID(
    clickedChatBoxNum, // "+ New Chat" or real chat id
    // countClickedChatBoxID, // total number of chatboxs
    totChat, // total number of chatboxs
    setChatLog
  ) {
    let data = 0;

    if (clickedChatBoxNum !== "+ New Chat") {
      data = await getChatMessageByExperimentId(clickedChatBoxNum);
    }

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

      setChatids(current_chatids_list);

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
      let chatLogNew = [];

      for (let i = 0; i < data["chatlogs"].length; i++) {
        if (data["chatlogs"][i]["who"] === "user") {
          chatLogNew = [
            ...chatLogNew,
            {
              user: data["chatlogs"][i]["who"],
              message: data["chatlogs"][i]["message"],
            },
          ];
        } else if (data["chatlogs"][i]["who"] === "gpt") {
          chatLogNew = [
            ...chatLogNew,
            {
              user: data["chatlogs"][i]["who"],
              message: data["chatlogs"][i]["message"],
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

    if (e.target.childNodes[0].nodeValue === "+ New Chat") {
      var countClickedChatBoxID = numChatBox + 1;
      // console.log("countClickedChatBoxID", countClickedChatBoxID);
    } else {
      var siblings = e.target.parentNode.parentNode.childNodes;

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
      // console.log("ttt-countClickedChatBoxID", countClickedChatBoxID);
    }
    // first chatbox is 1, second chatbox is 2, third chatbox is 3, etc.

    let chatids_list = await savedChatIDs();

    setChatCurrentTempId(countClickedChatBoxID);

    // user clicks chatbox tap

    if (e.target.childNodes.length === 3) {
      var clickedChatBoxNum =
        e.target.childNodes[2].childNodes[0].childNodes[1].nodeValue;
    }

    // user clicks + New Chat
    else if (e.target.childNodes.length === 1) {
      var clickedChatBoxNum = e.target.childNodes[0].nodeValue;
    }

    let savedChatIDs_list = await savedChatIDs();

    let addingNewChatbuttonOrRealChatID = 0;
    if (savedChatIDs_list[clickedChatBoxNum] === undefined) {
      addingNewChatbuttonOrRealChatID = "+ New Chat";
    } else {
      addingNewChatbuttonOrRealChatID = savedChatIDs_list[clickedChatBoxNum];
    }

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
                      strokeWidth="1.5"
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
                    strokeWidth="1.5"
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

        let chatids_list = await savedChatIDs();

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

    await patchSpecificChat(chattabid, chatboxtapname);

    setTapTitles({
      taptitles: tapTitles.taptitles.map((title, index) => {
        if (index === chatCurrentTempId - 1) {
          return chatboxtapname;
        }
        return title;
      }),
    });
  }

  return (
    <div className="divsidemenuForGOT">
      <aside
        className="sidemenuForGOT"
        style={{
          overflowY: "auto", //
          maxHeight: "100vh", //
        }}
      >
        {/* <div className="side-menu-button" onClick={() => setNumChatBox(numChatBox + 1)}> */}
        {/* <div className="side-menu-button" 
                > */}
        <button
          id="openPopupBtn"
          className="side-menu-buttonForGOT"
          style={{ display: "none" }}
          onClick={() => {
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
            if (popupContent.style.display !== "block") {
              popupContainer.style.display = "none";
            }
          }}
        >
          {/* make close box for popupContent */}
          <div id="popupContent" className="popup-content">
            {/* <!-- Your code snippet here --> */}
            <div className="models">
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
                value={preSetPrompt}
              />

              <span className="info">Please write your prompt here.</span>
            </div>
          </div>
        </div>

        <div
          className="side-menu-buttonForGOT"
          id="newchatbuttonForGOT"
          onClick={debouncedOnClickNewChat}
        >
          + New Chat
        </div>

        {Array(numChatBox)
          .fill()
          .map((_, i) => (
            <div key={i} className="sidemenuForGOT chatboxtapForGOT">
              <div
                className="side-menu-buttonForGOT"
                //
                // key={i}
                onClick={debouncedOnClickChatTab}
                // onClick={handleChattapClick}
                // onClick={chattapClickable ? handleChattapClick : undefined}
                onDoubleClick={async (e) => {
                  await debouncedOnDoubleClickChatTab(e);
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
                  onMouseEnter={onMouseEnterThrottledTrashToCheck}
                  onMouseLeave={onMouseLeaveThrottledTrashToCheck}
                  onClick={debouncedOnClickRemoveChatTab}
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
                      strokeWidth="1.5"
                      fill="none"
                    />

                    <rect x="6" y="9" width="8" height="2" fill="white" />
                  </svg>
                </div>
              </Tooltip>

              <div
                className="side-menu-button-trashForGOT check"
                onMouseEnter={(e) =>
                  debouncedChangePenToCheckEnter(
                    e.target.parentNode.childNodes[2],
                    false
                  )
                }
                onMouseLeave={(e) =>
                  debouncedChangePenToCheckLeave(
                    e.target.parentNode.childNodes[2],
                    true
                  )
                }
                onClick={(e) => debouncedOnClickPen(e)}
              >
                🖋
              </div>
            </div>
          ))}
      </aside>
    </div>
  );
}
