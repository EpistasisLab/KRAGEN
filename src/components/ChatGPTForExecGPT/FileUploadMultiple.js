import {useState} from 'react';
import React from 'react';
// import './App.css'
// import 'reactjs-popup/dist/index.css';


const MAX_COUNT = 5;

function FileUploadMultiple(
    {chatLog, setChatLog, setChatInput, handleSubmit, chatInput}
) {

    const [uploadedFiles, setUploadedFiles] = useState([])
    const [fileLimit, setFileLimit] = useState(false);
    const [resp, setResp] = useState([""]);

    const [count, setCount] = useState(0);

    const handleUploadFiles = files => {
        const uploaded = [...uploadedFiles];
        let limitExceeded = false;
        files.some((file) => {
            if (uploaded.findIndex((f) => f.name === file.name) === -1) {
                uploaded.push(file);
                if (uploaded.length === MAX_COUNT) 
                    setFileLimit(true);
                if (uploaded.length > MAX_COUNT) {
                    alert(`You can only add a maximum of ${MAX_COUNT} files`);
                    setFileLimit(false);
                    limitExceeded = true;
                    return true;
                }
            }
        })
        if (!limitExceeded) 
            setUploadedFiles(uploaded);
        console.log("uploaded[0].name", uploaded[0].name)

        // convert uploaded[0].name to string
        let uploadedName = uploaded[0]
            .name
            .toString();
        console.log("uploadedName", uploadedName)

        let temp = uploadedName.includes(".csv")
        // convert temp to string
        temp = temp.toString();
        console.log("temp", temp)

        let chatLogNew;

        if (uploaded[0].name.includes(".csv") || uploaded[0].name.includes(".tsv") || uploaded[0].name.includes(".xslx")) {

            // if(true){
            console.log("testone")

            // here files should be uploaded to the server
            // console.log("FileUploadMultiple.js",uploaded) upload data to server show the
            // uploaded files to the server Call `fetch()`, passing in the URL.
            fetch('http://localhost:8000/testone')
            // fetch() returns a promise. When we have received a response from the server,
            // the promise's `then()` handler is called with the response.
                .then((response) => {
                // Our handler throws an error if the request did not succeed.
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                // Otherwise (if the response succeeded), our handler fetches the response as
                // text by calling response.text(), and immediately returns the promise returned
                // by `response.text()` console.log("response",response);

                return response.text();
            })
            // When response.text() has succeeded, the `then()` handler is called with the
            // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                setResp(text);

                // console.log("text", text) json
                let parsed = JSON.parse(text);

                console.log("parsed", parsed['data'][0]['response'])

                text = parsed['data'][0]['response']

                // time delay setTimeout(() => {     setChatLog([         ...chatLog, { user:
                // "gpt",             message: `${text}`         }     ]); }, 1000);

                setTimeout(() => {

                    chatLogNew = [
                        ...chatLog, {
                            user: "gpt",
                            message: `${text}`
                        }
                    ]

                    // setChatInput("");
                    setChatLog(chatLogNew);

                }, 2000);

                // setChatLog([     ...chatLog, {         user: "gpt",         message:
                // `${text}`     } ]); setChatLog([     ...chatLog, {         user: "gpt",
                // message: `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                return fetch('http://localhost:8000/testtwo');
            })
            // Catch any errors that might happen, and display a message in the
            // `poemDisplay` box.
                .catch((error) => console.log("error", error))

            // fetch() returns a promise. When we have received a response from the server,
            // the promise's `then()` handler is called with the response.
                .then((response) => {
                // Our handler throws an error if the request did not succeed.
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                // Otherwise (if the response succeeded), our handler fetches the response as
                // text by calling response.text(), and immediately returns the promise returned
                // by `response.text()` console.log("response",response);

                return response.text();
            })
            // When response.text() has succeeded, the `then()` handler is called with the
            // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                // setResp(text);

                console.log("userbutton", text)

                // parse text using  comma as delimiter let parsed = text.split(",");
                // console.log("parsed", parsed) remove first element parsed.shift();
                // console.log("parsed", parsed)  get elements from 1 to last let parsed2 =
                // parsed.slice(1, parsed.length); console.log("parsed2", parsed2)

                setTimeout(() => {

                    chatLogNew = [
                        ...chatLogNew, {
                            user: "me",
                            message: `${text}`
                        }
                    ]

                    // setChatInput("");
                    setChatLog(chatLogNew);

                }, 4000);

                // setChatLog([     ...chatLog, {         user: "gpt",         message:
                // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                return fetch('http://localhost:8000/testthreegpt');

            })
            // Catch any errors that might happen, and display a message in the
            // `poemDisplay` box.
                .catch((error) => console.log("error", error))
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); console.log("text", text) json
                    let parsed = JSON.parse(text);

                    console.log("parsed", parsed['data'][0]['response'])

                    text = parsed['data'][0]['response']

                    // time delay setTimeout(() => {     setChatLog([         ...chatLog, { user:
                    // "gpt",             message: `${text}`         }     ]); }, 1000);

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "gpt",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 6000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testthreeme');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);
                    // console.log("respone-me",response) covert response to json return
                    // response.json();

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); text console.log("userbutton", text['data'][0]['buttons'])
                    // text ="Yes, No"

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "me",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 8500);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testfourgpt');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))

                // gpt turn
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); console.log("text", text) json
                    let parsed = JSON.parse(text);

                    console.log("parsed", parsed['data'][0]['response'])

                    text = parsed['data'][0]['response']

                    // time delay setTimeout(() => {     setChatLog([         ...chatLog, { user:
                    // "gpt",             message: `${text}`         }     ]); }, 1000);

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "gpt",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 10500);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testfourme');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);
                    // console.log("respone-me",response) covert response to json return
                    // response.json();

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); text console.log("userbutton", text['data'][0]['buttons'])
                    // text ="Yes, No"

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "me",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 12500);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testfivegpt');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); console.log("text", text) json
                    let parsed = JSON.parse(text);

                    console.log("parsed", parsed['data'][0]['response'])

                    text = parsed['data'][0]['response']

                    // time delay setTimeout(() => {     setChatLog([         ...chatLog, { user:
                    // "gpt",             message: `${text}`         }     ]); }, 1000);

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "gpt",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 15000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testfiveme');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);
                    // console.log("respone-me",response) covert response to json return
                    // response.json();

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); text console.log("userbutton", text['data'][0]['buttons'])
                    // text ="Yes, No"

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "me",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 17000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testsixgpt');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); console.log("text", text) json
                    let parsed = JSON.parse(text);

                    console.log("parsed", parsed['data'][0]['response'])

                    text = parsed['data'][0]['response']

                    // time delay setTimeout(() => {     setChatLog([         ...chatLog, { user:
                    // "gpt",             message: `${text}`         }     ]); }, 1000);

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "gpt",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 19000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testsevengpt');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))

                // gpt
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); console.log("text", text) json
                    let parsed = JSON.parse(text);

                    console.log("parsed", parsed['data'][0]['response'])

                    text = parsed['data'][0]['response']

                    // time delay setTimeout(() => {     setChatLog([         ...chatLog, { user:
                    // "gpt",             message: `${text}`         }     ]); }, 1000);

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "gpt",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 21000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testeightgpt');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); console.log("text", text) json
                    let parsed = JSON.parse(text);

                    console.log("parsed", parsed['data'][0]['response'])

                    text = parsed['data'][0]['response']

                    // time delay setTimeout(() => {     setChatLog([         ...chatLog, { user:
                    // "gpt",             message: `${text}`         }     ]); }, 1000);

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "gpt",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 23000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testnineme');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);
                    // console.log("respone-me",response) covert response to json return
                    // response.json();

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "me",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 25000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testtengpt');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); console.log("text", text) json
                    let parsed = JSON.parse(text);

                    console.log("parsed", parsed['data'][0]['response'])

                    text = parsed['data'][0]['response']

                    // time delay setTimeout(() => {     setChatLog([         ...chatLog, { user:
                    // "gpt",             message: `${text}`         }     ]); }, 1000);

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "gpt",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 27000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testelevengpt');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); console.log("text", text) json
                    let parsed = JSON.parse(text);

                    console.log("parsed", parsed['data'][0]['response'])

                    text = parsed['data'][0]['response']

                    // time delay setTimeout(() => {     setChatLog([         ...chatLog, { user:
                    // "gpt",             message: `${text}`         }     ]); }, 1000);

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "gpt",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 29000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testtwelvengpt');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); console.log("text", text) json
                    let parsed = JSON.parse(text);

                    console.log("parsed", parsed['data'][0]['response'])

                    text = parsed['data'][0]['response']

                    // time delay setTimeout(() => {     setChatLog([         ...chatLog, { user:
                    // "gpt",             message: `${text}`         }     ]); }, 1000);

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "gpt",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 31000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testthirteenme');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);
                    // console.log("respone-me",response) covert response to json return
                    // response.json();

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); text console.log("userbutton", text['data'][0]['buttons'])
                    // text ="Yes, No"

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "me",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 32000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testfourteengpt');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); console.log("text", text) json
                    let parsed = JSON.parse(text);

                    console.log("parsed", parsed['data'][0]['response'])

                    text = parsed['data'][0]['response']

                    // time delay setTimeout(() => {     setChatLog([         ...chatLog, { user:
                    // "gpt",             message: `${text}`         }     ]); }, 1000);

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "gpt",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 33000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testfourteenme');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);
                    // console.log("respone-me",response) covert response to json return
                    // response.json();

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); text console.log("userbutton", text['data'][0]['buttons'])
                    // text ="Yes, No"

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "me",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 35000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testfifteengpt');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))

                // gpt
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); console.log("text", text) json
                    let parsed = JSON.parse(text);

                    console.log("parsed", parsed['data'][0]['response'])

                    text = parsed['data'][0]['response']

                    // time delay setTimeout(() => {     setChatLog([         ...chatLog, { user:
                    // "gpt",             message: `${text}`         }     ]); }, 1000);

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "gpt",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 37000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testfifteenme');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))

                // me
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);
                    // console.log("respone-me",response) covert response to json return
                    // response.json();

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); text console.log("userbutton", text['data'][0]['buttons'])
                    // text ="Yes, No"

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "me",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 39000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testsixteengpt');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); console.log("text", text) json
                    let parsed = JSON.parse(text);

                    console.log("parsed", parsed['data'][0]['response'])

                    text = parsed['data'][0]['response']

                    // time delay setTimeout(() => {     setChatLog([         ...chatLog, { user:
                    // "gpt",             message: `${text}`         }     ]); }, 1000);

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "gpt",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 41000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testsixteenme');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))

                // me
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);
                    // console.log("respone-me",response) covert response to json return
                    // response.json();

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text);

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "me",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 43000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testseventeengpt');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))

                // gpt
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); console.log("text", text) json
                    let parsed = JSON.parse(text);

                    console.log("parsed", parsed['data'][0]['response'])

                    text = parsed['data'][0]['response']

                    // time delay setTimeout(() => {     setChatLog([         ...chatLog, { user:
                    // "gpt",             message: `${text}`         }     ]); }, 1000);

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "gpt",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 45000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testseventeenme');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))

                // me
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);
                    // console.log("respone-me",response) covert response to json return
                    // response.json();

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); text console.log("userbutton", text['data'][0]['buttons'])
                    // text ="Yes, No"

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "me",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 47000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testeighteengpt');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))

                // gpt
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); console.log("text", text) json
                    let parsed = JSON.parse(text);

                    console.log("parsed", parsed['data'][0]['response'])

                    text = parsed['data'][0]['response']

                    // time delay setTimeout(() => {     setChatLog([         ...chatLog, { user:
                    // "gpt",             message: `${text}`         }     ]); }, 1000);

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "gpt",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 49000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testeighteenme');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))

                // me
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);
                    // console.log("respone-me",response) covert response to json return
                    // response.json();

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); text console.log("userbutton", text['data'][0]['buttons'])
                    // text ="Yes, No"

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "me",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 51000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testnineteengpt');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))

                // gpt
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); console.log("text", text) json
                    let parsed = JSON.parse(text);

                    console.log("parsed", parsed['data'][0]['response'])

                    text = parsed['data'][0]['response']

                    // time delay setTimeout(() => {     setChatLog([         ...chatLog, { user:
                    // "gpt",             message: `${text}`         }     ]); }, 1000);

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "gpt",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 53000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testnineteenme');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))

                // me
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);
                    // console.log("respone-me",response) covert response to json return
                    // response.json();

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); text console.log("userbutton", text['data'][0]['buttons'])
                    // text ="Yes, No"

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "me",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 55000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testtwentygpt');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))

                // gpt
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); console.log("text", text) json
                    let parsed = JSON.parse(text);

                    console.log("parsed", parsed['data'][0]['response'])

                    text = parsed['data'][0]['response']

                    // time delay setTimeout(() => {     setChatLog([         ...chatLog, { user:
                    // "gpt",             message: `${text}`         }     ]); }, 1000);

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "gpt",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 57000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testtwentyme');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))

                // me
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);
                    // console.log("respone-me",response) covert response to json return
                    // response.json();

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); text console.log("userbutton", text['data'][0]['buttons'])
                    // text ="Yes, No"

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "me",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 59000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text) return
                    // fetch('http://localhost:8000/testtwentyme');
                    return fetch('http://localhost:8000/testtwentyonegpt');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))

                // gpt
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); console.log("text", text) json
                    let parsed = JSON.parse(text);

                    console.log("parsed", parsed['data'][0]['response'])

                    text = parsed['data'][0]['response']

                    // time delay setTimeout(() => {     setChatLog([         ...chatLog, { user:
                    // "gpt",             message: `${text}`         }     ]); }, 1000);

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "gpt",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 61000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text) return
                    // fetch('http://localhost:8000/testtwentyonegpt');
                    return fetch('http://localhost:8000/testtwentyoneme');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))

                // me
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);
                    // console.log("respone-me",response) covert response to json return
                    // response.json();

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); text console.log("userbutton", text['data'][0]['buttons'])
                    // text ="Yes, No"

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "me",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 63000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testtwentytwogpt');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))

                // gpt
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); console.log("text", text) json
                    let parsed = JSON.parse(text);

                    console.log("parsed", parsed['data'][0]['response'])

                    text = parsed['data'][0]['response']

                    // time delay setTimeout(() => {     setChatLog([         ...chatLog, { user:
                    // "gpt",             message: `${text}`         }     ]); }, 1000);

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "gpt",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 65000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testtwentytwome');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))

                // me
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);
                    // console.log("respone-me",response) covert response to json return
                    // response.json();

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); text console.log("userbutton", text['data'][0]['buttons'])
                    // text ="Yes, No"

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "me",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 65000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testtwentythreegpt');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))

                // gpt
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); console.log("text", text) json
                    let parsed = JSON.parse(text);

                    console.log("parsed", parsed['data'][0]['response'])

                    text = parsed['data'][0]['response']

                    // time delay setTimeout(() => {     setChatLog([         ...chatLog, { user:
                    // "gpt",             message: `${text}`         }     ]); }, 1000);

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "gpt",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 67000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testtwentythreeme');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))

                // me
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);
                    // console.log("respone-me",response) covert response to json return
                    // response.json();

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); text console.log("userbutton", text['data'][0]['buttons'])
                    // text ="Yes, No"

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "me",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 69000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testtwentyfourgpt');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))

                // gpt
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); console.log("text", text) json
                    let parsed = JSON.parse(text);

                    console.log("parsed", parsed['data'][0]['response'])

                    text = parsed['data'][0]['response']

                    // time delay setTimeout(() => {     setChatLog([         ...chatLog, { user:
                    // "gpt",             message: `${text}`         }     ]); }, 1000);

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "gpt",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 71000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testtwentyfourme');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))

                // me
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);
                    // console.log("respone-me",response) covert response to json return
                    // response.json();

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); text console.log("userbutton", text['data'][0]['buttons'])
                    // text ="Yes, No"

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "me",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 73000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testtwentyfivegpt');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))

                // gpt
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); console.log("text", text) json
                    let parsed = JSON.parse(text);

                    console.log("parsed", parsed['data'][0]['response'])

                    text = parsed['data'][0]['response']

                    // time delay setTimeout(() => {     setChatLog([         ...chatLog, { user:
                    // "gpt",             message: `${text}`         }     ]); }, 1000);

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "gpt",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 75000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testtwentyfiveme');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))

                // me
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);
                    // console.log("respone-me",response) covert response to json return
                    // response.json();

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); text console.log("userbutton", text['data'][0]['buttons'])
                    // text ="Yes, No"

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "me",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 77000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testtwentysixgpt');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))

                // gpt
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); console.log("text", text) json
                    let parsed = JSON.parse(text);

                    console.log("parsed", parsed['data'][0]['response'])

                    text = parsed['data'][0]['response']

                    // time delay setTimeout(() => {     setChatLog([         ...chatLog, { user:
                    // "gpt",             message: `${text}`         }     ]); }, 1000);

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "gpt",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 79000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testtwentysixme');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))

                // me
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);
                    // console.log("respone-me",response) covert response to json return
                    // response.json();

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); text console.log("userbutton", text['data'][0]['buttons'])
                    // text ="Yes, No"

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "me",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 81000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testtwentysevengpt');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))

                // gpt
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); console.log("text", text) json
                    let parsed = JSON.parse(text);

                    console.log("parsed", parsed['data'][0]['response'])

                    text = parsed['data'][0]['response']

                    // time delay setTimeout(() => {     setChatLog([         ...chatLog, { user:
                    // "gpt",             message: `${text}`         }     ]); }, 1000);

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "gpt",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 83000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testtwentysevenme');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))

                // me
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);
                    // console.log("respone-me",response) covert response to json return
                    // response.json();

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); text console.log("userbutton", text['data'][0]['buttons'])
                    // text ="Yes, No"

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "me",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 85000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testtwentyeightgpt');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))

                // gpt
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); console.log("text", text) json
                    let parsed = JSON.parse(text);

                    console.log("parsed", parsed['data'][0]['response'])

                    text = parsed['data'][0]['response']

                    // time delay setTimeout(() => {     setChatLog([         ...chatLog, { user:
                    // "gpt",             message: `${text}`         }     ]); }, 1000);

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "gpt",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 87000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testtwentyeightme');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))

                // me
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);
                    // console.log("respone-me",response) covert response to json return
                    // response.json();

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); text console.log("userbutton", text['data'][0]['buttons'])
                    // text ="Yes, No"

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "me",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 89000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testtwentyninegpt');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))

                // gpt
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); console.log("text", text) json
                    let parsed = JSON.parse(text);

                    console.log("parsed", parsed['data'][0]['response'])

                    text = parsed['data'][0]['response']

                    // time delay setTimeout(() => {     setChatLog([         ...chatLog, { user:
                    // "gpt",             message: `${text}`         }     ]); }, 1000);

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "gpt",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 91000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testtwentynineme');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))

                // me
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);
                    // console.log("respone-me",response) covert response to json return
                    // response.json();

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); text console.log("userbutton", text['data'][0]['buttons'])
                    // text ="Yes, No"

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "me",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 93000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testthirtygpt');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))

                // gpt
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); console.log("text", text) json
                    let parsed = JSON.parse(text);

                    console.log("parsed", parsed['data'][0]['response'])

                    text = parsed['data'][0]['response']

                    // time delay setTimeout(() => {     setChatLog([         ...chatLog, { user:
                    // "gpt",             message: `${text}`         }     ]); }, 1000);

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "gpt",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 95000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testthirtyme');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))

                // me
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);
                    // console.log("respone-me",response) covert response to json return
                    // response.json();

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); text console.log("userbutton", text['data'][0]['buttons'])
                    // text ="Yes, No"

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "me",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 97000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testthirtyonegpt');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))

                // gpt
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); console.log("text", text) json
                    let parsed = JSON.parse(text);

                    console.log("parsed", parsed['data'][0]['response'])

                    text = parsed['data'][0]['response']

                    // time delay setTimeout(() => {     setChatLog([         ...chatLog, { user:
                    // "gpt",             message: `${text}`         }     ]); }, 1000);

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "gpt",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 99000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
                    return fetch('http://localhost:8000/testthirtytwogpt');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))

                // gpt
                .then((response) => {
                    // Our handler throws an error if the request did not succeed.
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    // Otherwise (if the response succeeded), our handler fetches the response as
                    // text by calling response.text(), and immediately returns the promise returned
                    // by `response.text()` console.log("response",response);

                    return response.text();
                })
                // When response.text() has succeeded, the `then()` handler is called with the
                // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                    // setResp(text); console.log("text", text) json
                    let parsed = JSON.parse(text);

                    console.log("parsed", parsed['data'][0]['response'])

                    text = parsed['data'][0]['response']

                    // time delay setTimeout(() => {     setChatLog([         ...chatLog, { user:
                    // "gpt",             message: `${text}`         }     ]); }, 1000);

                    setTimeout(() => {

                        chatLogNew = [
                            ...chatLogNew, {
                                user: "gpt",
                                message: `${text}`
                            }
                        ]

                        // setChatInput("");
                        setChatLog(chatLogNew);

                    }, 101000);

                    // setChatLog([     ...chatLog, {         user: "gpt",         message:
                    // `${text}`     } ]); handleSubmit(Event); console.log("text", text) return
                    // fetch('http://localhost:8000/testfourme');

                })
                // Catch any errors that might happen, and display a message in the
                // `poemDisplay` box.
                .catch((error) => console.log("error", error))

            } else {

            // here files should be uploaded to the server
            // console.log("FileUploadMultiple.js",uploaded) upload data to server show the
            // uploaded files to the server Call `fetch()`, passing in the URL.
            fetch('http://localhost:8000/test')
            // fetch() returns a promise. When we have received a response from the server,
            // the promise's `then()` handler is called with the response.
                .then((response) => {
                // Our handler throws an error if the request did not succeed.
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                // Otherwise (if the response succeeded), our handler fetches the response as
                // text by calling response.text(), and immediately returns the promise returned
                // by `response.text()` console.log("response",response);

                return response.text();
            })
            // When response.text() has succeeded, the `then()` handler is called with the
            // text, and we copy it into the `poemDisplay` box.
                .then((text) => {
                setResp(text);

                console.log("text", text)

                // parse text using  comma as delimiter
                let parsed = text.split(",");
                console.log("parsed", parsed)

                // remove first element
                parsed.shift();
                console.log("parsed", parsed)

                // time delay
                setTimeout(() => {
                    setChatLog([
                        ...chatLog, {
                            user: "gpt",
                            message: `${text}`
                        }
                    ]);
                }, 1000);

                // setChatLog([     ...chatLog, {         user: "gpt",         message:
                // `${text}`     } ]); handleSubmit(Event); console.log("text", text)
            })
            // Catch any errors that might happen, and display a message in the
            // `poemDisplay` box.
                .catch((error) => console.log("error", error));
        }

    }

    const handleFileEvent = (e) => {
        const chosenFiles = Array
            .prototype
            .slice
            .call(e.target.files)
        // console.log("chosenFiles", chosenFiles)
        handleUploadFiles(chosenFiles);
    }

    function test() {
        console.log("test")
    }

    return (
        <div className="side-menu-button" display = "none">

            <input
                id='fileUpload'
                type='file'
                multiple="multiple"
                accept='application/pdf, image/png, .csv, .tsv'
                onChange={handleFileEvent}
                disabled={fileLimit}/>

            <label htmlFor='fileUpload' onClick={() => setCount(count + 1)}>
                <a
                    className={`btn btn-primary ${ !fileLimit
                        ? ''
                        : 'disabled'} `}>

                    + Upload Files</a>
            </label>

            <div className="uploaded-files-list">
                {
                    uploadedFiles.map((file, index) => (
                        <div
                            key={`file-${index}`}
                            style={{
                                display: "none"
                            }}>
                            {file.name}
                        </div>
                    ))
                }

            </div>

        </div>
    );
}

export default FileUploadMultiple;
