function checkIfCode(messageFromOpenai) {
  // check if the messageFromOpenai contains python code. for example the messageFromOpenai looks like this:

  let booleanCode = false;
  messageFromOpenai.split("\n").forEach((line) => {
    // console.log("checkIfCode-line", line);
    if (line.includes("```python")) {
      booleanCode = true;
    }
  });

  return booleanCode;
}

function extractCode(messageFromOpenai) {
  const regex = /```([\s\S]+?)```/;
  const match = regex.exec(messageFromOpenai);
  const code = match[1];

  // console.log("messageFromOpenai", messageFromOpenai);

  console.log("extractCode", code);

  // console.log("match", match);

  return code;
}

function extractPackagesOfCode(code) {
  let packages = [];
  let codeSplit = code.split("\n");
  codeSplit.forEach((item) => {
    if (
      (item.includes("import") && item.includes("as")) ||
      (item.includes("from") && item.includes("import"))
    ) {
      // find the index where "import" or from are located
      let index_import = item.indexOf("import");
      let index_from = item.indexOf("from");

      console.log("index_import", index_import);
      console.log("index_from", index_from);
      if (index_import === 0 || index_from === 0) {
        let itemSplit = item.split(" ");
        // import sklearn.datasets as datasets
        // for the above case.
        let pack = itemSplit[1].split(".")[0];

        packages.push(pack);
      }
    }
  });

  console.log("packages", packages);
  return packages;
}

function filterRedHRYChatlogs(data) {
  let isFirstHelpMessageFound = false;

  const filteredChatlogs = data.chatlogs.filter((chat, index) => {
    if (chat.message === "How can I help you today?") {
      if (!isFirstHelpMessageFound) {
        // When the first 'How can I help you today?' message is found".
        isFirstHelpMessageFound = true;
        return true;
      } else {
        // Remove the same message after the first message
        return false;
      }
    }
    return true; // Keep the other messages as they are
  });

  return {
    ...data, // Maintain the rest of the existing data
    chatlogs: filteredChatlogs, // Update with the filtered chatlogs
  };
}

function convertToOfficialPackageName(
  listOfOfficialPackageName,
  packagesNotInstalled
) {
  // listOfOfficialPackageName is string like {sklearn:scikit-learn}

  // convert listOfOfficialPackageName to object
  let listOfOfficialPackageNameObject = JSON.parse(listOfOfficialPackageName);

  console.log(
    "convertToOfficialPackageName-listOfOfficialPackageNameObject",
    listOfOfficialPackageNameObject
  );
}

function replaceFirstBackticks(message) {
  // let str = "example string";
  let index = message.indexOf("```");

  // if index is -1, return
  if (index === -1) {
    return message;
  } else {
    // get string from index to 10
    let str = message.slice(index, index + 10);
    // if str does not include python, replace the first triple backtick with triple backtick + "python"
    if (!str.includes("python")) {
      // console.log("replaceFirstBackticks-before-message",message)
      message = message.replace(/```/, "```python");
      // console.log("replaceFirstBackticks-before-message",message)

      return message;
    } else {
      return message;
    }
  }
}

function addComments(codeSnippet) {
  const lines = codeSnippet.split("\n");
  const commentedLines = [];
  let isCodeBlock = false;
  for (const line of lines) {
    if (line.includes("```python")) {
      isCodeBlock = true;
    }

    if (isCodeBlock === false) {
      // if first character is not #, add #
      if (line[0] !== "#") {
        commentedLines.push(`# ${line}`);
      } else {
        commentedLines.push(`${line}`);
      }
    }

    if (isCodeBlock === true) {
      commentedLines.push(`${line}`);

      if (
        line.includes("```") &&
        !line.includes("```python") &&
        isCodeBlock === true
      ) {
        isCodeBlock = false;
      }
    }
  }
  return commentedLines.join("\n");
}

function makeBlinking() {
  // get all classes names blinking
  let blinking = document.getElementsByClassName("blinkingCandi");

  console.log("makeBlinking-blinking", blinking);
  // chagne all classes names blinking noblinking
  for (let i = 0; i < blinking.length; i++) {
    blinking[i].className = "blinking";
  }
}

function nomoreBlinking() {
  // get all classes names blinking
  let blinking = document.getElementsByClassName("blinking");

  // console.log("blinking.length", blinking.length);
  // chagne all classes names blinking noblinking
  for (let i = 0; i < blinking.length; i++) {
    // console.log("nomoreBlinking-blinking[i]", blinking[i]);
    blinking[i].className = "noblinking";
  }
}

function disableReadingInput() {
  // make submit button disabled
  let submitButton = document.getElementsByClassName("submit")[0];
  //   console.log("submitButton", submitButton)
  submitButton.disabled = true;

  //   document.querySelector(".submit").disabled = false;

  // make chat-input-textarea disabled
  let chatInputTextarea = document.getElementsByClassName(
    "chat-input-textarea"
  )[0];
  // console.log("chat-input-textarea", chat-input-textarea)
  chatInputTextarea.disabled = true;
}

function enableReadingInput() {
  let submitButton = document.getElementsByClassName("submit")[0];
  // make submit button abled
  submitButton.disabled = false;

  let chatInputTextarea = document.getElementsByClassName(
    "chat-input-textarea"
  )[0];
  //  // make chatInputTextarea abled
  chatInputTextarea.disabled = false;
}

export {
  checkIfCode,
  extractCode,
  extractPackagesOfCode,
  filterRedHRYChatlogs,
  convertToOfficialPackageName,
  replaceFirstBackticks,
  addComments,
  makeBlinking,
  nomoreBlinking,
  disableReadingInput,
  enableReadingInput,
};
