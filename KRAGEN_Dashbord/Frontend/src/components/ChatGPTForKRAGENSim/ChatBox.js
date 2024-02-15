import { useState, useEffect, useContext } from "react";
import { AllContext } from "./context/AllContext";
import DisplayGraph from "../DisplayGraph";
import { BiHome } from "react-icons/bi";

// Primary Chat Window
const ChatBox = () => {
  const { setChatInput, handleSubmit, chatInput, readyToDisplayGOT } =
    useContext(AllContext);

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

  return (
    <>
      <section className="chatboxForGOT">
        {/* 2 current */}
        <div className="chat-input-containerForGOT flex items-center">
          <div className="chat-input-holderForGOT flex-grow">
            <form
              id="chatSubmitFormID"
              className="chatSubmitForm"
              onSubmit={handleSubmit}
              onClick={(e) => {
                console.log("click chatSubmitFormID");
                // find button under chatSubmitFormID id
                let button = document
                  .getElementById("chatSubmitFormID")
                  .querySelector(".submit");
                // if the length of chatInput is 0, make the button unclicable
                if (chatInput.length === 0) {
                  button.disabled = true;
                }
              }}
            >
              <input
                rows="1"
                value={chatInput}
                onChange={(e) => {
                  const input = e.target.value;
                  // console.log("input-length", input.length);

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
              {/* home button */}
              <div className="ico">
                <button
                  type="button"
                  className="ico"
                  onClick={() => (window.location.href = "/Home")} // Change to '/Home' or '/' as needed
                  title="Home"
                >
                  <BiHome /> {/* Use the home icon */}
                </button>
              </div>
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

        <div id="dispnetgra" className={"show-contents"}>
          <DisplayGraph readyToDisplayGOT={readyToDisplayGOT} />
        </div>
      </section>
    </>
  );
};

export default ChatBox;
