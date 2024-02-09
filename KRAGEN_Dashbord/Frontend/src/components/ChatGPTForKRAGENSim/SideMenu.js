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
  } = useContext(AllContext);

  const [chatids, setChatids] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      console.log("good-sidemenu-useEffect-fetchData");
      console.log("numChatBox in SideMenu", numChatBox);

      setNumChatBox(1);

      console.log("numChatBox in SideMenu", numChatBox);

      checkNumChatBox();
      setBoldUnderlineAndInitTraIc();
      setCurrentExpId(numChatBox);

      await setTapTitlesFunc(numChatBox);
    };

    fetchData();
  }, [window.location.href, numChatBox]);

  const [openaiApiState, setopenaiApiState] = useState(0);

  // async function createChatID() {
  //   //POST https://localhost:5050/chatapi/v1/chats
  //   // /chatapi/v1/chat
  //   // Content-Type: application/json
  //   // {

  //   let data = await fetch("/chatapi/v1/chats", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       title: "chatbox",
  //     }),
  //   }).then((response) => {
  //     if (!response.ok) {
  //       throw new Error(`HTTP error: ${response.status}`);
  //     } else {
  //       return response.json();
  //     }
  //   });

  //   return data;
  // }

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
    if (clickedChatBoxNum == "+ New Chat") {
      // POST http://localhost:5080/chatapi/v1/chats
      // Content-Type: application/json

      // {
      //     "title" : "`${experimentID}`",
      //     "_experiment_id": "641e7a67c3386b002e521705",
      //     "_dataset_id": "63f6e4947c5f93004a3e3ca7"
      // }

      // let experimentID = experiment.data._id;

      // data = await postChats(experimentID);

      // console.log("data-postChats", data);

      // POST http://localhost:5080/chatapi/v1/chatlogs
      // Content-Type: application/json

      // {
      //     "_chat_id" : "641f26a1b2663354ec5d634f",
      //     "message" : "Hello there from my desk!!!!!!b",
      //     "message_type" : "text",
      //     "who" : "user"
      // }

      // POST {{base_url}}/chatapi/v1/chats

      let new_chatid = await createChatID();

      // console.log("new_chatid[chat_id]", new_chatid["chat_id"]);

      // console.log("post-countClickedChatBoxID", countClickedChatBoxID);

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

    if (e.target.childNodes[0].nodeValue === "+ New Chat") {
      // this is the number of chat boxes in the result page
      // numChatBox, setNumChatBox

      // console.log("e.target.childNodes.length", e.target.childNodes.length);
      // // e.target.childNodes[0].nodeValue
      // console.log(
      //   "e.target.childNodes[0].nodeValue",
      //   e.target.childNodes[0].nodeValue
      // );

      var countClickedChatBoxID = numChatBox + 1;
      // console.log("countClickedChatBoxID", countClickedChatBoxID);
    } else {
      var siblings = e.target.parentNode.parentNode.childNodes;

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
    if (e.target.childNodes.length == 3) {
      var clickedChatBoxNum =
        e.target.childNodes[2].childNodes[0].childNodes[1].nodeValue;

      console.log("clickedChatBoxNum", clickedChatBoxNum);
    }

    // user clicks + New Chat
    else if (e.target.childNodes.length == 1) {
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
    if (savedChatIDs_list[clickedChatBoxNum] == undefined) {
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
  }

  // function clearAllTrashIcons (nodes) {

  //     // for (let i = 1; i < nodes.childNodes.length-1; i++) {
  //     for (let i = 3; i < nodes.childNodes.length; i++) {

  //         nodes.childNodes[i].childNodes[1].style.display = "none";
  //         nodes.childNodes[i].childNodes[1].innerHTML = "🗑️";
  //     }
  // }

  // function clearAllTrashIcons(nodes) {
  //   Array.from(nodes.childNodes)
  //     .slice(3)
  //     .forEach((node) => {
  //       node.childNodes[1].style.display = "none";
  //       node.childNodes[1].innerHTML = "🗑️";
  //     });
  // }

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

  // function clearAllCheckIcons (nodes) {
  //     // for (let i = 1; i < nodes.childNodes.length-1; i++) {
  //     for (let i = 3; i < nodes.childNodes.length; i++) {
  //         nodes.childNodes[i].childNodes[2].style.display = "none";
  //         nodes.childNodes[i].childNodes[2].innerHTML = "🖋";
  //     }
  // }

  // function clearAllCheckIcons(nodes) {
  //   Array.from(nodes.childNodes)
  //     .slice(3)
  //     .forEach((node) => {
  //       node.childNodes[2].style.display = "none";
  //       node.childNodes[2].innerHTML = "🖋";
  //     });
  // }

  function clearAllCheckIcons(nodes) {
    Array.from(nodes.childNodes)
      .slice(3)
      .forEach((node) => {
        node.childNodes[2].style.display = "none";
        // node.childNodes[2].innerHTML = "🖋";
        node.childNodes[2].innerHTML = "";
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

  // function changeTrashToCheck(node, reverse) {
  //   if (reverse == true) {
  //     node.innerHTML = "🗑️";
  //     // console.log("node.innerHTML",node.innerHTML)
  //   } else {
  //     node.innerHTML = "✔︎";
  //     // console.log("node.innerHTML",node.innerHTML)
  //   }
  // }

  function changeTrashToCheck(node, reverse) {
    if (reverse === true) {
      // node.innerHTML = "🗑️";
      //       node.innerHTML = `
      //       <svg width="22" height="18" xmlns="http://www.w3.org/2000/svg">
      //     <!-- Main body of trash bin -->
      //     <path d="M3 6h18v15H3z" fill="#6e6e6e"/>
      //     <path d="M1 6h22v2H1z" fill="#ffffff"/>
      //     <!-- Lid of the trash bin -->
      //     <rect x="6" y="2" width="12" height="2" fill="#ffffff"/>
      //     <!-- Lines on the trash bin -->
      //     <rect x="5" y="6" width="2" height="15" fill="#ffffff"/>
      //     <rect x="9" y="6" width="2" height="15" fill="#ffffff"/>
      //     <rect x="13" y="6" width="2" height="15" fill="#ffffff"/>
      //     <rect x="17" y="6" width="2" height="15" fill="#ffffff"/>

      //     <!-- Handles of the lid -->
      //     <rect x="7" y="3" width="1" height="1" fill="#ffffff"/>
      //     <rect x="16" y="3" width="1" height="1" fill="#ffffff"/>
      // </svg>`;
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
      // MAKE WHITE TRASH ICON

      // node.innerHTML =
      //   '<Icon name="trash alternate outline" style="color: white;" />';
      // // console.log("node.innerHTML",node.innerHTML)
    } else {
      node.innerHTML = "✔︎";
      // // console.log("node.innerHTML",node.innerHTML)
    }
  }

  // function changePenToCheck(node, reverse) {
  //   if (reverse == true) {
  //     node.innerHTML = "🖋";
  //     // console.log("node.innerHTML",node.innerHTML)
  //   } else {
  //     node.innerHTML = "✔︎";
  //     // console.log("node.innerHTML",node.innerHTML)
  //   }
  // }

  function changePenToCheck(node, reverse) {
    if (reverse === true) {
      // node.innerHTML = "🖋";
      node.innerHTML = "";
      // // console.log("node.innerHTML",node.innerHTML)
    } else {
      // node.innerHTML = "✔︎";
      node.innerHTML = "";
      // // console.log("node.innerHTML",node.innerHTML)
    }
  }

  // origin code
  // async function removeCorChat(e) {
  //   if (e.target.parentNode.childNodes[1].innerHTML == "✔︎") {
  //     if (e.target.parentNode.childNodes[0].childNodes.length === 2) {
  //       // var textClickedChatBox = e.target.parentNode.childNodes[0].childNodes[1].childNodes[0].textContent;

  //       alert(
  //         "Error: You cannot delete the chatbox tap. Please name the chatbox tap first."
  //       );

  //       //  Uncaught TypeError: Cannot read properties of undefined (reading 'split')

  //       throw new Error(
  //         "Error: You cannot delete the chatbox tap. Please name the chatbox tap first."
  //       );

  //       // receive the error message in the console
  //     } else if (e.target.parentNode.childNodes[0].childNodes.length === 3) {
  //       var textClickedChatBox =
  //         e.target.parentNode.childNodes[0].childNodes[2].childNodes[0]
  //           .textContent;
  //     }

  //     // parse textClickedChatBox with _
  //     var textClickedChatBoxIdString = textClickedChatBox.split("_")[1];

  //     // convert textClickedChatBoxIdString to integer
  //     var textClickedChatBoxId = parseInt(textClickedChatBoxIdString);

  //     // remove the clicked chatbox tap from DB
  //     // To do this, first get the experiment id from the url
  //     // After that, get the all chats from the DB using the experiment id
  //     // Then, remove the chat using the textClickedChatBox

  //     let data = await getAllChatsFromDB();

  //     let experimentId = experiment.data._id;

  //     // filter out the chats that has the same experiment id
  //     let filteredChats = data.map((chat) => {
  //       if (chat["_experiment_id"] === experimentId) {
  //         return chat;
  //       } else {
  //         return null;
  //       }
  //     });

  //     // remove null from filteredChats
  //     let filteredChatsWithoutNull = filteredChats.filter((chat) => {
  //       return chat !== null;
  //     });

  //     // DELETE /chatapi/v1/chats/6421ebd85dc44d80542362c4

  //     // remove the chat from DB
  //     await deleteSpecificChat(
  //       filteredChatsWithoutNull[textClickedChatBoxId]["_id"]
  //     );

  //     filteredChatsWithoutNull.splice(textClickedChatBoxId, 1);

  //     if (filteredChatsWithoutNull.length > 0) {
  //       let data = await getSpecificChatbyChatId(
  //         filteredChatsWithoutNull[filteredChatsWithoutNull.length - 1]["_id"]
  //       );

  //       let chatLogNew = [];

  //       for (let i = 0; i < data["chatlogs"].length; i++) {
  //         chatLogNew = [
  //           ...chatLogNew,
  //           {
  //             user: data["chatlogs"][i]["who"],
  //             message: data["chatlogs"][i]["message"],
  //           },
  //         ];
  //       }

  //       setChatLog(chatLogNew);
  //       setNumChatBox(numChatBox - 1);
  //       setChatCurrentTempId(numChatBox - 1);
  //     } else {
  //       // When filteredChatsWithoutNull.length == 0, if user remove the chatbox_0, it will reset the chatbox_0 with How can I help you today? by gpt. And this should be posted to the DB with the experimentId.

  //       let data = await postChats(experimentId);
  //       if (data["chatlogs"].length === 0) {
  //         // POST http://localhost:5080/chatapi/v1/chatlogs
  //         // Content-Type: application/json
  //         // {
  //         //     "_chat_id" : "642076d7262c19d0be23448b",
  //         //     "message" : "How are you?",
  //         //     "message_type" : "text",
  //         //     "who" : "gpt"
  //         // }

  //         await postInChatlogsToDB(
  //           data._id,
  //           "How can I help you today?",
  //           "text",
  //           "gpt"
  //         );

  //         // await postInChatlogsToDBWithExeId(experimentId, "How can I help you today?", "text", "gpt","")
  //       }

  //       let chatLogNew = [
  //         {
  //           user: "gpt",
  //           message: "How can I help you today?",
  //         },
  //       ];
  //       setChatLog(chatLogNew);
  //       setNumChatBox(1);
  //       setChatCurrentTempId(1);
  //       setTapTitlesFunc();
  //     }

  //     // if the chatbox tap was only one, when user remove the chat, it will remove from the DB, but the chatbox will show "How can I help you today?"

  //     // if the chatbox tap was more than one, when user remove the chat, it will remove from the DB, and the chatbox will show the left chatbox tap or the right chatbox tap.
  //   }
  // }

  // modification 3
  async function removeCorChat(e) {
    if (e.target.parentNode.childNodes[1].innerHTML == "✔︎") {
      if (e.target.parentNode.childNodes[0].childNodes.length === 2) {
        // var textClickedChatBox = e.target.parentNode.childNodes[0].childNodes[1].childNodes[0].textContent;

        alert(
          "Error: You cannot delete the chatbox tap. Please name the chatbox tap first."
        );

        //  Uncaught TypeError: Cannot read properties of undefined (reading 'split')

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
    console.log("sidemenu", sidemenu);
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
        // trash emoji
        sidemenu[i].childNodes[1].style.display = "none";
        // check emoji
        sidemenu[i].childNodes[2].style.display = "none";
      }
      // trash emoji for the last chatboxtap
      sidemenu[sidemenu.length - 1].childNodes[1].style.display = "block";
      // check emoji for each chatboxtap
      // sidemenu[sidemenu.length - 1].childNodes[2].style.display = "block";
    }
  }

  // origin
  // async function postChatNameToDB(chatboxtapname) {
  //   // get current url
  //   let url = window.location.href;
  //   let urlSplit = url.split("/");
  //   let experimentID = experiment.data._id;

  //   // GET http://localhost:5080/chatapi/v1/chats
  //   let data = await getChatMessageByExperimentId(experimentID);
  //   // filter data based on experiment id
  //   let dataFiltered = data.filter(function (el) {
  //     return el._experiment_id == experimentID;
  //   });

  //   // PATCH http://localhost:5080/chatapi/v1/chats/640bd7290674aa751483658b
  //   // Content-Type: application/json

  //   // {
  //   //     "title" : chatboxtapname,
  //   //     "_experiment_id": experimentID,
  //   //     "_dataset_id": experimentID
  //   // }

  //   await patchSpecificChat(
  //     dataFiltered[chatCurrentTempId - 1]["_id"],
  //     chatboxtapname,
  //     experimentID,
  //     experimentID
  //   );

  //   setTapTitles({
  //     taptitles: tapTitles.taptitles.map((title, index) => {
  //       if (index === chatCurrentTempId - 1) {
  //         return chatboxtapname;
  //       }
  //       return title;
  //     }),
  //   });
  // }

  async function postChatNameToDB(chatboxtapname, chattabid) {
    console.log("postChatNameToDB is called", chatboxtapname);
    console.log("postChatNameToDB is called", chattabid);
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

              {/* <Button
                                text="Smart - Davinci"
                                onClick={() => setCurrentModel("text-davinci-003")}/>
                            <Button
                                text="Code - Crushman"
                                onClick={() => setCurrentModel("code-cushman-001")}/> */}

              <span className="info">
                {/* The model parameter controls the engine used to generate the response. */}
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
              {/* <Button text="0 - Logical" onClick={() => setTemperature(0)}/>
                            <Button text="0.5 - Balanced" onClick={() => setTemperature(0.5)}/>
                            <Button text="1 - Creative" onClick={() => setTemperature(1)}/> */}
              <span className="info">
                {/* The temperature parameter controls the randomness of the model. 0 is the most
                                logical, 1 is the most creative. */}
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
            // console.log("77-newchatbutton is clicked e.target", e.target);
            // console.log("numChatBox", numChatBox);
            await checkClickedChatboxTab(e);
            // console.log("numChatBox-before", numChatBox);
            // setNumChatBox(numChatBox + 1);
            setNumChatBox((numChatBox) => numChatBox + 1);
          }}
          style={{ display: "none" }}
        >
          {/* <span></span> */}
          {/* <AddCircleOutlineRoundedIcon fontSize="small" />  */}+ New Chat
        </div>

        {Array(numChatBox)
          .fill()
          .map((_, i) => (
            <div className="sidemenuForGOT chatboxtapForGOT">
              <div
                className="side-menu-buttonForGOT"
                // key={i}
                onClick={(e) => {
                  console.log(
                    "77-e.target.parentNode.childNodes",
                    e.target.parentNode.childNodes
                  );

                  // console.log("tapTitles-side", tapTitles);

                  checkClickedChatboxTab(e);

                  clearAllTrashIcons(e.target.parentNode.parentNode);

                  clearAllCheckIcons(e.target.parentNode.parentNode);

                  e.target.parentNode.childNodes[1].style.display = "block";

                  console.log(
                    "e.target.parentNode.childNodes[1]",
                    e.target.parentNode.childNodes[1]
                  );

                  // console.log(
                  //   "e.target.parentNode.childNodes[2]",
                  //   e.target.parentNode.childNodes[2]
                  // );

                  // console.log(
                  //   "e.target.parentNode.childNodes[2].style.display",
                  //   e.target.parentNode.childNodes[2].style.display
                  // );

                  // e.target.parentNode.childNodes[2].style.display = "block";
                  // e.target.parentNode.childNodes[2].style.display = "block";
                }}
                // onDoubleClick={(e) => {
                //   console.log("77-onDoubleClick is clicked");
                //   // find the child node with id newchatbutton
                //   let newchatbutton = document.getElementById(
                //     "newchatbuttonForGOT"
                //   );

                //   // make it unclickable
                //   newchatbutton.style.pointerEvents = "none";

                //   // e.target.parentNode.childNodes[1].textContent = "✔︎"

                //   // allow to change the text in div
                //   e.target.contentEditable = true;
                //   e.target.focus();

                //   //not allow user to use delete key when the text is empty
                //   e.target.onkeydown = function (e) {
                //     // split e.target.textContent with & and _ to get the text
                //     // console.log("0509-e.target.childNodes[0].textContent",e.target.textContent)
                //     let tempString = e.target.textContent
                //       .split("&")[0]
                //       .split("_")[0];

                //     console.log("tempString", tempString);

                //     // e.keyCode === 8 is the delete key
                //     if (tempString === "" && e.keyCode === 8) {
                //       // console.log("tempString ===  && e.keyCode === 8)")
                //       e.preventDefault();

                //       // e.target.textContent
                //     }
                //     // enter key is not allowed
                //     if (e.keyCode === 13) {
                //       // if(e.keyCode === 13) {
                //       // console.log("e.keyCode === 13 enter key is not allowed");
                //       e.preventDefault();
                //       e.target.contentEditable = false;
                //       e.target.focus();

                //       // post the + New Chat name to the DB
                //       postChatNameToDB(tempString);
                //     }

                //     // cannot enter more than 20 characters
                //     if (e.target.textContent.length > 25) {
                //       console.log("Please do not enter more than 25");
                //       e.preventDefault();
                //     }
                //   };
                // }}
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

              {/* <div
                className="side-menu-button-trashForGOT trash"
                key={i}
                // onClick={removeCorChat}
                onMouseEnter={(e) => {
                  changeTrashToCheck(e.target.parentNode.childNodes[1], false);
                }}
                onMouseLeave={(e) => {
                  changeTrashToCheck(e.target.parentNode.childNodes[1], true);
                }}
                onClick={(e) => {
                  // changeTrashToCheck(e.target.parentNode.childNodes[1]);

                  try {
                    removeCorChat(e);
                  } catch (error) {
                    // console.log("error",error)
                    console.log("error-removeCorChat");
                  }
                }}
                style={{ display: "none" }}
              >
                🗑
              </div> */}

              {/* make unvisible */}
              {/* <div
                className="side-menu-button-trashForGOT check"
                style={{ display: "none" }}
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

                  console.log("tempSideMenuButtonText", tempSideMenuButtonText);

                  let chatids_list = await savedChatIDs();
                  console.log("chatids_list", chatids_list);

                  postChatNameToDB(
                    tempSideMenuButtonText,
                    chatids_list[chatCurrentTempId - 1]
                  );
                }}
              >
                🖋
              </div> */}

              {/* Tooltip */}
              <Tooltip title="Delete this chat tap." placement="right">
                <div
                  className="side-menu-button-trash trash"
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
                  onClick={(e) => {
                    // changeTrashToCheck(e.target.parentNode.childNodes[1]);

                    try {
                      removeCorChat(e);
                    } catch (error) {
                      // // console.log("error",error)
                      // console.log("error-removeCorChat");
                    }
                  }}
                  style={{ display: "none" }}
                >
                  {/* <svg width="22" height="18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6h18v15H3z" fill="#6e6e6e" />
                  <path d="M1 6h22v2H1z" fill="#ffffff" />

                  <rect x="6" y="2" width="12" height="2" fill="#ffffff" />

                  <rect x="5" y="6" width="2" height="15" fill="#ffffff" />
                  <rect x="9" y="6" width="2" height="15" fill="#ffffff" />
                  <rect x="13" y="6" width="2" height="15" fill="#ffffff" />
                  <rect x="17" y="6" width="2" height="15" fill="#ffffff" />

                  <rect x="7" y="3" width="1" height="1" fill="#ffffff" />
                  <rect x="16" y="3" width="1" height="1" fill="#ffffff" />
                </svg> */}

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
                className="side-menu-button-trash check"
                style={{ display: "none" }}
                onMouseEnter={(e) => {
                  changePenToCheck(e.target.parentNode.childNodes[2], false);
                }}
                onMouseLeave={(e) => {
                  changePenToCheck(e.target.parentNode.childNodes[2], true);
                }}
                onClick={async (e) => {
                  let newchatbutton = document.getElementById("newchatbutton");

                  // make it clickable
                  newchatbutton.style.pointerEvents = "auto";

                  // find element by className side-menu-button from the e.target.parentNode

                  let tempSideMenuButtonText = e.target.parentNode
                    .getElementsByClassName("side-menu-button")[0]
                    .textContent.split("&")[0]
                    .split("_")[0];

                  // console.log("tempSideMenuButtonText", tempSideMenuButtonText);

                  let chatids_list = await savedChatIDs();
                  // console.log("chatids_list", chatids_list);

                  postChatNameToDB(
                    tempSideMenuButtonText,
                    chatids_list[chatCurrentTempId - 1]
                  );
                }}
              >
                {/* 🖋 */}
              </div>
            </div>
          ))}
      </aside>
    </div>
  );
}
