import { useState, useEffect } from "react";
import ChatBox from "./ChatBox";
import { AllContext } from "./context/AllContext";
import SideMenu from "./SideMenu";

import {
  savedChatIDs,
  getAllChatsFromDB,
  postInChatlogsToDB,
  getChatMessageByExperimentId,
  openaiChatCompletions,
  openaiChatCompletionsWithChatLog,
  initailChatBoxSetting,
  getSpecificChatbyChatId,
  checkCodePackages,
  postInChatlogsToDBWithExeId,
  patchChatToDB,
  postChats,
  deleteSpecificChat,
  patchSpecificChat,
  createChatID,
  getSpecificChatTitlebyChatId,
  sendChatInputToBackend,
  updateChatTitleByChatId,
} from "../apiService";

import {
  checkIfCode,
  extractCode,
  extractPackagesOfCode,
  replaceFirstBackticks,
  addComments,
  makeBlinking,
  nomoreBlinking,
  disableReadingInput,
  enableReadingInput,
} from "../codeUtils";

// export default function ChatGPT({ experiment }) {
export default function ChatGPT({ experiment }) {
  // let limitNumChatBox = 5;
  let limitNumChatBox = 50;

  // current chat tap id
  const [current_chatTapID, setCurrent_chatTapID] = useState(0);

  // this is the number of chat boxes in the result page
  const [numChatBox, setNumChatBox] = useState(0);

  // this is the index of the current chattab where user is typing
  const [chatCurrentTempId, setChatCurrentTempId] = useState(0);

  // loadLocalChatModel is boolean value that indicates whether the local chat model should be loaded
  // const [loadLocalChatModel, setLoadLocalChatModel] = useState(true);
  const [loadLocalChatModel, setLoadLocalChatModel] = useState(false);

  let apiUrl = process.env.REACT_APP_API_URL;
  let apiPort = process.env.REACT_APP_API_PORT;

  function checkNumChatBox() {
    if (numChatBox + 1 > limitNumChatBox) {
      document.getElementById("newchatbuttonForGOT").style.pointerEvents =
        "none";
    } else {
      document.getElementById("newchatbuttonForGOT").style.pointerEvents =
        "auto";
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

  useEffect(async () => {
    const fetchData = async () => {
      let savedChatIDs_list = await savedChatIDs();

      let last_chatTapID_in_the_list = 0;

      let lengthofChatIDs = savedChatIDs_list.length;

      // at least one chat box exists
      // if (lengthofChatIDs !== 1) {
      if (lengthofChatIDs !== 0) {
        last_chatTapID_in_the_list = savedChatIDs_list[lengthofChatIDs - 1];
      }
      // there is no chat box
      else {
        last_chatTapID_in_the_list = 1;
        lengthofChatIDs = 1;
        await createChatID();
      }

      // set current chat tap id
      setCurrent_chatTapID(last_chatTapID_in_the_list);

      setNumChatBox(lengthofChatIDs);

      setChatCurrentTempId(lengthofChatIDs);

      // new added
      checkNumChatBox();
      setBoldUnderlineAndInitTraIc();
      // setCurrentExpId(numChatBox);

      await setTapTitlesFunc();

      // await getEngines();
      await initailChatBoxSetting(last_chatTapID_in_the_list);
      await getAllChatsFromDBFilterbyExpIdSetChatbox(
        last_chatTapID_in_the_list,
        lengthofChatIDs
      );

      // setTapTitlesFunc(limitNumChatBox);
      // setTapTitlesFunc(numChatBox);
      setLanModelReset(true);

      let savechatids = await savedChatIDs();

      // if chatCurrentTempId is undefined,
      if (savechatids.length === 1) {
        // update chat title by chat id and chat input

        // check whether the title exists or not using chatid
        let temptitle = await getSpecificChatTitlebyChatId(savechatids[0]);

        console.log("temptitle", temptitle);

        await updateChatTitleByChatId(savechatids[0], temptitle);
        await setTapTitlesFunc();
      }

      let data = await getChatMessageByExperimentId(
        savechatids[savechatids.length - 1]
      );

      // Calculate the index for the third-to-last item
      const index = data.chatlogs.length - 3;

      // Accessing the third-to-last chatlog entry, if the array is long enough
      const thirdFromLastChatlog =
        data.chatlogs.length > 2 ? data.chatlogs[index] : null;

      if (thirdFromLastChatlog === null) {
        // [readyToDisplayGOT, GOTJSON, dataReady]
        setChatInputForGOT("");
        setDataset("");
        setGotLoaded("");

        // setGOTJSON("");
        setDataReady(false);
        setReadyToDisplayGOT(false);

        const textarea = document.getElementById("chatSubmitFormID");
        // Make the textarea editable
        textarea.readOnly = false;
        // Make the textarea visible
        textarea.style.opacity = 1;
      } else {
        // readyToDisplayGOT, GOTJSON, dataReady
        setChatInputForGOT("");
        // setDataset("");
        setGotLoaded("");

        let thirdFromLastChatlogMessage = JSON.parse(
          thirdFromLastChatlog.message
        );

        // setGOTJSON(thirdFromLastChatlogMessage);
        setDataset(thirdFromLastChatlogMessage);
        setGotQuestion(thirdFromLastChatlogMessage.question);
        setGotAnswer(thirdFromLastChatlogMessage.answer);
        console.log("here-7");
        setDataReady(true);
        setReadyToDisplayGOT(true);

        // Get the element by its ID
        const textarea = document.getElementById("chatSubmitFormID");

        // Make the textarea read-only
        textarea.readOnly = true;

        // Make the textarea invisible but still occupy space
        textarea.style.opacity = 0;
      }
    };
    fetchData();
  }, [window.location.href]);

  useEffect(() => {
    const fetchData = async () => {
      checkNumChatBox();
      setBoldUnderlineAndInitTraIc();
      setCurrentExpId(numChatBox);

      await setTapTitlesFunc();
    };

    fetchData();
  }, [numChatBox]);

  const [chatInput, setChatInput] = useState("");
  // By using let preSet,
  const [preSetPrompt, setPreSetPrompt] =
    useState(`If you are asked to show a dataframe or alter it, output the file as a csv locally. And generate a script of python code. I strongly ask you to always write the code between three backticks python and three backticks always. For example, \`\`\`python \n print("hello world") \n \`\`\` and when users want to see the dataframe, save it as a csv file locally. However do not use temparary file paths. For example, pd.read_csv('path/to/your/csv/file.csv') is not allowed. There is already df variable in the code. You can use it. For example, df.head() is allowed. And when users want to see plot, please save it locally. For example, plt.savefig('file.png') is allowed. 

    please make sure that any commenets should be in the form of #. For example, # this is a comment. or # Note: Please make sure to install the necessary libraries before running this code such as imblearn, pandas, matplotlib and sklearn.

    Please also make sure thant when you return python script, please comment out any explanation between \`\`\`python \n and \n \`\`\` . For example, 
    # Sure, here's an example code to create violin plots using seaborn library, where each column of a pandas dataframe is plotted as a separate violin plot and saved as a png file.
    
    import pandas as pd
    import seaborn as sns
    import matplotlib.pyplot as plt
    # Load sample data
    df = sns.load_dataset("tips")
    # Get column names
    cols = df.columns

    If you give me a code like this, I will give you a score of 0. Please make sure to comment out any explanation between \`\`\`python \n and \n \`\`\` . For example,

    \`\`\`python \n import pandas as pd \n
    from sklearn.model_selection import train_test_split \n
    from sklearn.preprocessing import StandardScaler \n
    from keras.models import Sequential \n
    from keras.layers import Dense \n
    import matplotlib.pyplot as plt \n
    # load the DataFrame \n
    df = pd.read_csv('your_dataframe.csv') \n \`\`\`

    In the case where machine learning task is required, please make sure to use df as the dataframe name, and save learning curve as a png file. Please do not load the data from the csv file. 

    In the case where python generates more than 2 image files (png, jpg, jpeg, etc), please make sure to zip all the files and save it as a zip file.

    Python version where the code is executed is 3.7.16. Please make sure to import packages that are reliable and stable on this version.
    
    In any situation where you need to manipulate a dataframe (df) and save it, for each column name, if it contains an underscore (_), replace the underscore with a hyphen (-).
    `);

  const [models, setModels] = useState([]);
  // const [temperature, setTemperature] = useState(0.5);
  const [temperature, setTemperature] = useState(0);
  // language model
  // const [currentModel, setCurrentModel] = useState("text-davinci-003");
  const [currentModel, setCurrentModel] = useState("gpt-3.5-turbo");

  // initial chat box setting
  const [chatLog, setChatLog] = useState([
    {
      user: "gpt",
      message: "How can I help you today?",
    },
  ]);

  const [lanModelReset, setLanModelReset] = useState(false);

  // current experiment id
  const [currentExpId, setCurrentExpId] = useState("");

  // tap titles
  // tapTitles is an object that contains the title of each chat box
  const [tapTitles, setTapTitles] = useState({
    taptitles: "",
  });

  // modeforchatorcoderuning
  const [modeForChatOrCodeRunning, setModeForChatOrCodeRunning] =
    useState("chat");

  // extractedCode
  const [extractedCode, setExtractedCode] = useState({
    code: "",
  });

  const [tabluerData, setTabluerData] = useState([]);

  const [modeForTabluerData, setModeForTabluerData] = useState(false);

  const [booleanPackageInstall, setBooleanPackageInstall] = useState(false);

  // setChatInputForGOT
  const [chatInputForGOT, setChatInputForGOT] = useState("");

  // GOTJSON data
  const [dataset, setDataset] = useState("");

  // got data ready is true when the got data is ready to be displayed in the DisplayGraph component after the api call
  const [dataReady, setDataReady] = useState(false);

  // ready to show disply the component named DisplayGraph
  const [readyToDisplayGOT, setReadyToDisplayGOT] = useState(false);

  // gotloaded state include "", true, false for loading icon
  // false means that the loading icon is displayed
  // true means that the loading icon is not displayed
  // "" means that the loading icon is not displayed
  const [gotLoaded, setGotLoaded] = useState("");

  // question and answer state from GOT json
  const [gotQuestion, setGotQuestion] = useState("");
  const [gotAnswer, setGotAnswer] = useState("");

  const [isDark, setIsDark] = useState(false);

  // clear chats
  function clearChat() {
    setChatLog([]);
  }

  // load all the models
  async function getEngines() {
    // fetch("http://localhost:3080/models")
    await fetch(`${apiUrl}:${apiPort}/openai/v1/models`)
      .then((res) => res.json())
      .then((data) => {
        // filter elements whose id include "gpt"

        let filteredModel = data.data.filter((item) => item.id.includes("gpt"));

        setModels(filteredModel);
      });
  }

  // get all chats from db by chatid, and set setNumChatBox and setChatCurrentTempId
  async function getAllChatsFromDBFilterbyExpIdSetChatbox(
    current_chatTapID,
    countofchatids
  ) {
    // GET http://localhost:5080/chatapi/v1/chats

    let data = await getAllChatsFromDB(current_chatTapID);

    setNumChatBox(countofchatids);
    setCurrent_chatTapID(current_chatTapID);

    if (countofchatids >= limitNumChatBox) {
      // if document.getElementById("newchatbuttonForGOT") is not null
      if (document.getElementById("newchatbuttonForGOT") !== null) {
        document.getElementById("newchatbuttonForGOT").style.pointerEvents =
          "none";
      }
    }

    let chatLogNew = [];

    // need to change
    for (let i = 0; i < data["chatlogs"].length; i++) {
      if (data["chatlogs"][i]["who"] === "user") {
        chatLogNew = [
          ...chatLogNew,
          {
            user: data["chatlogs"][i]["who"],
            message: data["chatlogs"][i]["message"],
            execution_id:
              data["chatlogs"][i]["_execution_id"] === undefined
                ? ""
                : data["chatlogs"][i]["_execution_id"],
          },
        ];
      } else if (data["chatlogs"][i]["who"] === "gpt") {
        chatLogNew = [
          ...chatLogNew,
          {
            user: data["chatlogs"][i]["who"],
            message: data["chatlogs"][i]["message"],
            execution_id:
              data["chatlogs"][i]["_execution_id"] === undefined
                ? ""
                : data["chatlogs"][i]["_execution_id"],

            // message: data["chatlogs"][i]["message"].split(/\n/).map(line => <div key={line}>{line}</div>)
          },
        ];
      }
    }
    // reverse the order of chatLogNew
    chatLogNew = chatLogNew.reverse();
    setChatLog(chatLogNew);
  }

  async function handleSubmit(e) {
    // make all onclick or any event to be disabled in the all buttons classname side-menu-buttonForGOT
    let sideMenuButtonForGOT =
      document.getElementsByClassName("divsidemenuForGOT");

    for (let i = 0; i < sideMenuButtonForGOT.length; i++) {
      sideMenuButtonForGOT[i].style.pointerEvents = "none";
    }

    // newchatbuttonForGOT id
    let newchatbuttonForGOT = document.getElementById("newchatbuttonForGOT");
    newchatbuttonForGOT.style.pointerEvents = "none";

    // prevent page from refreshing
    e.preventDefault();

    // make id chatSubmitFormID unvisible
    // document.getElementById("chatSubmitFormID").style.display = "none";

    // Get the element by its ID
    const textarea = document.getElementById("chatSubmitFormID");

    // Check if the element exists
    if (textarea) {
      // Make the textarea read-only
      textarea.readOnly = true;

      // Make the textarea invisible but still occupy space
      textarea.style.opacity = 0;
    }

    let chatLogNew = [];

    chatLogNew = [
      ...chatLog,
      {
        user: "me",
        message: `${chatInput}`,
      },
    ];
    setChatInputForGOT(chatInput);
    setChatInput("");
    setChatLog(chatLogNew);

    // GET http://localhost:5080/chatapi/v1/chats/experiment/${experimentId}
    // let data = await getChatMessageByExperimentId(experimentId);

    let chatid_list = await savedChatIDs();

    let data = await getChatMessageByExperimentId(
      chatid_list[chatCurrentTempId - 1]
      // chatCurrentTempId
    );

    // chatCurrentTempId is 1,2,3, ...
    // there is no 0 chatCurrentTempId.
    if (chatCurrentTempId === "") {
      setChatCurrentTempId(1);
    }

    if (chatInput !== undefined || chatInput !== "") {
      await postInChatlogsToDB(
        chatid_list[chatCurrentTempId - 1],
        chatInput,
        "text",
        "user"
      );

      // if chatInput is longer than 14 characters, then make the chatInput to be the first 11 characters of the chatInput and add ...
      // let chatInputTemp = chatInput;
      // if (chatInputTemp.length > 14) {
      //   chatInputTemp = chatInputTemp.slice(0, 11) + "...";
      // }

      // update chat title by chat id and chat input
      await updateChatTitleByChatId(
        chatid_list[chatCurrentTempId - 1],
        // chatInputTemp
        chatInput
      );

      await setTapTitlesFunc();

      // [readyToDisplayGOT, dataReady]);
      // fetch the data.json file for the submitted chatInput and chatid
      setDataset("");
      setReadyToDisplayGOT(true);
      setGotLoaded(false);
      console.log("here-1");
    }
  }

  async function setTapTitlesFunc() {
    let tempTapTitles = [];

    let chatid_list = await savedChatIDs();

    let index = 0;
    tempTapTitles = await Promise.all(
      chatid_list.map(async (chatid) => {
        // let data = await getSpecificChatbyChatId(chatid);
        let data = await getSpecificChatTitlebyChatId(chatid);
        index++;
        // console.log("setTapTitlesFunc-data", data);

        return data["title"];
      })
    );

    // console.log("tempTapTitles", tempTapTitles);

    setTapTitles({ ...tapTitles, taptitles: tempTapTitles });
  }

  function autoScrollDown() {
    let scrollToTheBottomChatLog = document.getElementById("chatgpt-space");
    scrollToTheBottomChatLog.scrollTop = scrollToTheBottomChatLog.scrollHeight;
  }

  function handleTemp(temp) {
    if (temp > 1) {
      setTemperature(1);
    } else if (temp < 0) {
      setTemperature(0);
    } else {
      setTemperature(temp);
    }
  }

  return (
    <div className="ChatGPTForGOT">
      <AllContext.Provider
        value={{
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
        }}
      >
        <SideMenu />
      </AllContext.Provider>
      <AllContext.Provider
        value={{
          chatInput,
          chatLog,
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
        }}
      >
        <ChatBox />
      </AllContext.Provider>
    </div>
  );
}
