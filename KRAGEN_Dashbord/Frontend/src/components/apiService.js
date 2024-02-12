// ChatGPTForExecGPT component mainly use these below functions
let apiUrl = process.env.REACT_APP_API_URL;
let apiPort = process.env.REACT_APP_API_PORT;
let endpoint = "";

// get all chatids from db
async function savedChatIDs() {
  endpoint = `${apiUrl}:${apiPort}/chatapi/v1/chats/chatids`;

  let data = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      return data["chatids"];
    })
    .catch((err) => {
      console.log("err--getAllChatsFromDB", err);
      throw err;
    });

  return data;
}

// get all chats from db by chatid
async function getAllChatsFromDB(current_chatTapID) {
  let endpoint = `${apiUrl}:${apiPort}/chatapi/v1/chats/${current_chatTapID}/chatlogs`;

  let data = await fetch(
    // `/chatapi/v1/chats/${current_chatTapID}/chatlogs`,
    endpoint,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
    .then((res) => res.json())
    .then((data) => {
      // console.log("step.1-getAllChatsFromDB", data);
      return data;
    })
    .catch((err) => {
      // console.log("err--getAllChatsFromDB",err);
      throw err;
    });

  return data;
}

// delete specific chat by chatid
async function deleteSpecificChat(current_chatTapID) {
  // console.log("deleteSpecificChat-current_chatTapID", current_chatTapID);
  // DELETE /chatapi/v1/chats/641e31ddb2663354ec5d52b8

  endpoint = `${apiUrl}:${apiPort}/chatapi/v1/chats/${current_chatTapID}`;

  let data = await fetch(
    // `/chatapi/v1/chats/${current_chatTapID}`,
    endpoint,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
    .then((res) => res.json())
    .then((data) => {
      return data;
    })
    .catch((err) => {
      throw err;
    });
  return data;
}
// post chatlogs to db
async function postInChatlogsToDB(chat_id, message, message_type, who) {
  endpoint = `${apiUrl}:${apiPort}/chatapi/v1/chats/${chat_id}/chatlogs`;
  let data = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // _chat_id: chat_id,
      message: message,
      message_type: message_type,
      who: who,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      // console.log("data--postInChatlogsToDB", data);
      return data;
    })
    .catch((err) => {
      throw err;
    });

  return data;
}

// get chatlogs from db by chatid
async function getChatMessageByExperimentId(current_chatTapID) {
  endpoint = `${apiUrl}:${apiPort}/chatapi/v1/chats/${current_chatTapID}/chatlogs`;

  let data = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      return data;
    })
    .catch((err) => {
      throw err;
    });

  return data;
}

// call openai api
async function openaiChatCompletions(currentModel, preSetLastMessageFromUser) {
  let data = await fetch("/openai/v1/chat/completions", {
    method: "POST",
    // method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: currentModel,
      // "messages": [{"role": "user", "content": "Say this is a test!"},{"role": "user", "content": "Say this is a test!"}],
      // original
      messages: [{ role: "user", content: preSetLastMessageFromUser }],

      // "messages": [{"role": "user", "content": messages}],
      // "temperature": 0.7
      // "reset_context": "true"
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      return data;
    })
    .catch((err) => {
      throw err;
    });

  return data;
}

// call openai api with chatlog
function tokenChekcerForGPT3Point5Turbo(chatLogNewFormatFiltered) {
  let newChatLogNewFormatFiltered = chatLogNewFormatFiltered;

  let str = chatLogNewFormatFiltered.map((item) => item.content).join(" ");

  const tokens = str.split(" ");
  const tokenCount = tokens.length;

  if (tokenCount > 1000) {
    newChatLogNewFormatFiltered = chatLogNewFormatFiltered
      .slice(0, 3)
      .concat(chatLogNewFormatFiltered.slice(-3));
  }

  return newChatLogNewFormatFiltered;
}

async function openaiChatCompletionsWithChatLog(
  currentModel,
  chatLogNew,
  preSet,
  lastMessageFromUser
) {
  let preSetLastMessageFromUser = preSet + lastMessageFromUser;

  let chatLogNewFormat = chatLogNew.map((item) => {
    // console.log("item",item)
    return {
      role: item.user,
      content: item.message,
    };
  });

  // console.log("chatLogNewFormat",chatLogNewFormat)

  // replace gpt with system if role is gpt
  chatLogNewFormat = chatLogNewFormat.map((item) => {
    if (item.role === "gpt") {
      item.role = "assistant";
    } else if (item.role === "me") {
      item.role = "user";
    }
    return item;
  });

  // please remove "Please wait while I am thinking.." by system from chatLogNewFormat
  let chatLogNewFormatFiltered = chatLogNewFormat.filter(
    (item) => item.content !== "Please wait while I am thinking.."
  );

  // please remove item if item content includes "The tabular data is"
  chatLogNewFormatFiltered = chatLogNewFormatFiltered.filter(
    (item) => !item.content.includes("The tabular data is")
  );

  // console.log("chatLogNewFormatFiltered", chatLogNewFormatFiltered);

  // remove the last message from user
  chatLogNewFormat.pop();

  // push {"role": "system", "content":preSet} to the head of chatLogNewFormat
  // {"role": "system", "content":preSet} should be located at the head of chatLogNewFormat
  chatLogNewFormatFiltered.unshift({ role: "system", content: preSet });
  chatLogNewFormatFiltered.push({
    role: "user",
    content: lastMessageFromUser,
  });

  // get only message by user from chatLogNewFormat

  //   let anotherTest = chatLogNewFormat.filter((item) => item.role === "user");

  // calculate token of chatLogNewFormat
  let token = 0;
  chatLogNewFormatFiltered.forEach((item) => {
    token = token + item.content.length;
  });

  chatLogNewFormatFiltered = tokenChekcerForGPT3Point5Turbo(
    chatLogNewFormatFiltered
  );

  endpoint = `${apiUrl}:${apiPort}/openai/v1/chat/completions`;
  // let data = await fetch("/openai/v1/chat/completions", {
  let data = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: currentModel,
      messages: chatLogNewFormatFiltered,

      // "messages": [
      //     {"role": "user", "content": "Hi!"},{"role": "user", "content": "Say this is a test!"}
      // ],

      // original
      // "messages": [{"role": "user", "content":preSetLastMessageFromUser}],

      // "messages": [{"role": "user", "content": messages}],
      // "temperature": 0.7
      // "reset_context": "true",

      // new
      // "messages": chatLogNewFormat

      // last two messages
      // "messages": lastTwoMessages

      // new test
      // "messages": chatLogNewFormatFiltered,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      // console.log("data--openaiChatCompletions", data);
      return data;
    })
    .catch((err) => {
      console.log("err--openaiChatCompletions", err);
      throw err;
    });

  return data;
}

function encQuestion(question) {
  return encodeURIComponent(question)
    .replace(/!/g, "%21")
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29")
    .replace(/\*/g, "%2A")
    .replace(/~/g, "%7E")
    .replace(/'/g, "%22")
    .replace(/:/g, "%3A")
    .replace(/\//g, "%2F")
    .replace(/\?/g, "%3F")
    .replace(/#/g, "%23")
    .replace(/&/g, "%26")
    .replace(/=/g, "%3D")
    .replace(/\+/g, "%2B")
    .replace(/,/g, "%2C")
    .replace(/@/g, "%40")
    .replace(/\$/g, "%24");
}

function encodeSpecialCharacters(question) {
  return question
    .replace(/ /g, "%20") // 공백
    .replace(/\//g, "%2F") // 슬래시
    .replace(/\?/g, "%3F") // 물음표
    .replace(/%/g, "%25") // 백분율 기호
    .replace(/&/g, "%26") // 앰퍼샌드
    .replace(/=/g, "%3D") // 등호
    .replace(/\+/g, "%2B") // 플러스
    .replace(/#/g, "%23") // 해시
    .replace(/!/g, "%21") // 느낌표
    .replace(/'/g, "%27") // 작은따옴표
    .replace(/\(/g, "%28") // 왼쪽 괄호
    .replace(/\)/g, "%29") // 오른쪽 괄호
    .replace(/\*/g, "%2A") // 별표
    .replace(/,/g, "%2C") // 쉼표
    .replace(/:/g, "%3A") // 콜론
    .replace(/;/g, "%3B") // 세미콜론
    .replace(/@/g, "%40") // 앳 기호
    .replace(/\[/g, "%5B") // 왼쪽 대괄호
    .replace(/\]/g, "%5D") // 오른쪽 대괄호
    .replace(/~/g, "%7E"); // 물결표
}

// call vectordb api
async function getVES(question) {
  const encodedQuestion = encodeSpecialCharacters(question);
  endpoint = `${apiUrl}:${apiPort}/incontextlearningapi/v1/ves/${encodedQuestion}`;
  // /incontextlearningapi/v1/ves
  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      // Check if the response is ok (status code 200-299)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      // Convert the response to text
      return response.text();
    })
    .then((text) => {
      // console.log("in_context-text-from-vectordb", text);
      return text;
    })
    .catch((error) => {
      throw error;
    });

  return response;
}

async function initailChatBoxSetting(current_chatTapID) {
  let data = await getAllChatsFromDB(current_chatTapID);
  console.log("getAllChatsFromDB_data", data);
  // there are no chatlogs
  if (data["chatlogs"].length === 0) {
    await postInChatlogsToDB(
      current_chatTapID,
      "How can I help you today?",
      "text",
      "gpt"
    );
  }
}

async function createChatID() {
  let data = await fetch(`${apiUrl}:${apiPort}/chatapi/v1/chats`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: "chatbox",
    }),
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    } else {
      return response.json();
    }
  });

  return data;
}

async function generate_error() {
  try {
    const response = await fetch(
      `${apiUrl}:${apiPort}/chatapi/v1/chats/geneerror`
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Unknown error occurred");
    }
    console.log("Success:", data);
    return data;
  } catch (error) {
    console.error(
      "There was a problem with the fetch operation in generate_error: ",
      error.message
    );
    throw error; // Re-throw the error to be caught by the caller
  }
}

async function getSpecificChatbyChatId(current_chatTapID) {
  let data = await fetch(
    `${apiUrl}:${apiPort}/chatapi/v1/chats/${current_chatTapID}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
    .then((res) => res.json())
    .then((data) => {
      // console.log("data--getSpecificChatbyChatId", data);
      return data;
    })
    .catch((err) => {
      // Format the error message to match the data structure
      err = {
        chat: {
          chat_id: null, // or appropriate default value
          execution_id: null,
          id: null, // or appropriate default value
          message: "Sorry, there was an error retrieving the chat.",
          message_type: "text",
          src_code: null,
          timestamp: new Date().toISOString(), // current timestamp
          who: "system", // or another appropriate identifier
        },
        message: `Error retrieving chat: ${err.message}`,
      };
      throw err;
    });

  return data;
}

async function openaiComletions(currentModel, preSetLastMessageFromUser) {
  let data = await fetch(`{apiUrl}:{apiPort}/openai/v1/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: currentModel,
      prompt: preSetLastMessageFromUser,
      temperature: 0.7,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      return data;
    })
    .catch((err) => {
      throw err;
    });
  return data;
}

// check if the packages are already installed or not
async function checkCodePackages(packagesArray) {
  // let response = await fetch("/execapi/v1/packages");
  let response = await fetch(`${apiUrl}:${apiPort}/execapi/v1/packages`);
  let data = await response.json();

  // let allInstalledPackages = data["exec_results"]["stdout"].split("\n");
  let allInstalledPackages = data["packages"];

  for (let i = 0; i < allInstalledPackages.length; i++) {
    allInstalledPackages[i] = allInstalledPackages[i].split("==")[0];
  }

  let requiredPackages = new Set(packagesArray);
  let installedPackages = new Set(allInstalledPackages);

  const result = new Set(requiredPackages);

  //  set substract
  for (const elem of installedPackages) {
    result.delete(elem);
  }

  // convert result to array
  let packagesNotInstalled = Array.from(result);

  return packagesNotInstalled;
}

async function patchSpecificChat(
  current_chatTapID,
  title
  // experiment_id,
  // dataset_id
) {
  await fetch(`${apiUrl}:${apiPort}/chatapi/v1/chats/${current_chatTapID}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: title,
      // _experiment_id: experiment_id,
      // _dataset_id: experiment.data._dataset_id,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("data--patchSpecificChat", data);
    })
    .catch((err) => {
      console.log("err--patchSpecificChat", err);
    });
}
async function postInChatlogsToDBWithExeId(
  chat_id,
  message,
  message_type,
  who,
  exec_id = ""
) {
  console.log("message-bot", message);
  // let data = await fetch(`/chatapi/v1/chats/${chat_id}/chatlogs`, {
  let data = await fetch(
    `${apiUrl}:${apiPort}/chatapi/v1/chats/${chat_id}/chatlogs`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // _chat_id: chat_id,
        message: message,
        message_type: message_type,
        who: who,
        // _execution_id: exec_id,
      }),
    }
  )
    .then((res) => res.json())
    .then((data) => {
      // console.log("data--postInChatlogsToDBWithExeId", data);
      return data;
    })
    .catch((err) => {
      console.log("err--postInChatlogsToDBWithExeId", err);
      throw err;
    });

  return data;
}

async function postChats(experiment, experimentId) {
  // POST /chatapi/v1/chats
  // Content-Type: application/json

  // {
  //     "title" : "Chat with experiment id 2",
  //     "_experiment_id": "63f6e4987c5f93004a3e3ca8",
  //     "_dataset_id": "63f6e4947c5f93004a3e3ca7"
  // }

  // let data = await fetch("/chatapi/v1/chats", {
  let data = await fetch(`${apiUrl}:${apiPort}/chatapi/v1/chats`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: "ChatBox",
      _experiment_id: experimentId,
      _dataset_id: experiment.data._dataset_id,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      // console.log("postChats", data);
      return data;
    })
    .catch((err) => {
      // console.log("err--postChats",err);
      throw err;
    });

  return data;
}

async function patchChatToDB(
  current_chatTapID,
  id_in_chatTap,
  message,
  message_type,
  who
) {
  console.log("current_chatTapID-last", current_chatTapID);
  console.log("message-last", message);

  await fetch(
    // `/chatapi/v1/chatlogs/${current_chatTapID}`,
    // `/chatapi/v1/chats/${current_chatTapID}/chatlogs/${id_in_chatTap}`,
    `${apiUrl}:${apiPort}/chatapi/v1/chats/${current_chatTapID}/chatlogs/${id_in_chatTap}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message,
        message_type: message_type,
        who: who,
      }),
    }
  )
    .then((res) => res.json())
    .then((data) => {
      console.log("data--best--patchChatlog", data);
    })
    .catch((err) => {
      console.log("err--best--patchChatlog", err);
    });
}

async function getFilesURLs(file_id) {
  console.log("step-1.getFiles");
  // GET /api/v1/files/6435c790d48f033fde87242b

  // const response = await fetch(`/api/v1/files/${file_id}`, {
  const response = await fetch(`${apiUrl}:${apiPort}/api/v1/files/${file_id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      console.log("step-2.getFiles-response", response);
      return response;
    })

    .catch((error) => {
      console.error("getFiles-Error:", error);
      // return error;
      throw error;
    });

  return response;
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

// ChatBox component mainly use these below functions
async function getTokenUsage() {
  // Get user_ip

  // assume user ip is "111.222.333.444"
  let user_ip = "111.222.333.444";
  // today's date
  let today = new Date();
  let date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();

  // /tokenusageapi/v1/tokenusage/"111.222.333.444"/"2024-1-25"

  let endpoint = `${apiUrl}:${apiPort}/tokenusageapi/v1/tokenusage/${user_ip}/${date}`;

  let resultFromGettingTokenUsage = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("resultFromGettingTokenUsage-response-data", data);
      return data;
    })
    .catch((error) => {
      console.log("getTokenUsage-fetch-error", error);
      // return error;
      throw error;
    });

  return resultFromGettingTokenUsage;
}

// insert token usage to the database
async function insertTokenUsage() {
  // Get user_ip

  // assume user ip is "111.222.333.444"
  let user_ip = "111.222.333.444";

  // token_usage
  let token_usage = "1000";

  // today's date
  let today = new Date();
  let date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();

  // print user_ip, token_usage, date all together
  console.log("user_ip", user_ip);
  console.log("token_usage", token_usage);
  console.log("date", date);

  // /tokenusage/<user_ip>/<token_usage>/<date>

  let endpoint = `${apiUrl}:${apiPort}/tokenusageapi/v1/tokenusage/${user_ip}/${token_usage}/${date}`;

  let resultFromInsertingTokenUsage = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((error) => {
      // return error;
      throw error;
    });

  return resultFromInsertingTokenUsage;
}
export {
  savedChatIDs,
  getAllChatsFromDB,
  deleteSpecificChat,
  postInChatlogsToDB,
  getChatMessageByExperimentId,
  openaiChatCompletions,
  openaiChatCompletionsWithChatLog,
  getVES,
  initailChatBoxSetting,
  createChatID,
  generate_error,
  getSpecificChatbyChatId,
  openaiComletions,
  checkCodePackages,
  patchSpecificChat,
  postInChatlogsToDBWithExeId,
  postChats,
  patchChatToDB,
  getFilesURLs,
  checkStatus,
  getTokenUsage,
  insertTokenUsage,
};
