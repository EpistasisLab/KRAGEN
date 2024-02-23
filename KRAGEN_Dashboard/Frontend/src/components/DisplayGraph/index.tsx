import React, { CSSProperties, FC, useEffect, useState } from "react";
import { SigmaContainer, ZoomControl, FullScreenControl } from "react-sigma-v2";

import { omit, mapValues, keyBy, constant } from "lodash";

import getNodeProgramImage from "sigma/rendering/webgl/programs/node.image";

import GraphSettingsController from "./GraphSettingsController";
import GraphEventsController from "./GraphEventsController";
import GraphDataController from "./GraphDataController";
import DescriptionPanel from "./DescriptionPanel";
import { Dataset, FiltersState } from "./others/types";
import ClustersPanel from "./ClustersPanel";
import SearchField from "./SearchField";
// import drawLabel from "../../canvas-utils";
import drawLabel from "./others/canvas-utils";
import GraphTitle from "./GraphTitle";
import TagsPanel from "./TagsPanel";

import "react-sigma-v2/lib/react-sigma-v2.css";
import { GrClose } from "react-icons/gr";
import {
  BiRadioCircleMarked,
  BiBookContent,
  BiHome,
  BiReset,
} from "react-icons/bi";

import { IoMdArrowRoundBack } from "react-icons/io";
// import ControlPointIcon from "@mui/icons-material/ControlPoint";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import {
  BsArrowsFullscreen,
  BsFullscreenExit,
  BsZoomIn,
  BsZoomOut,
} from "react-icons/bs";

import CircularProgress from "@mui/material/CircularProgress";

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
} from "../apiService";

interface DisplayGraphProps {
  readyToDisplayGOT: boolean;
  setReadyToDisplayGOT: (value: boolean) => void;
  chatInputForGOT: string;
  chatCurrentTempId: string;
  setGotLoaded: (value: boolean) => void;
  GOTJSON: any;
  descGOTREQ: boolean;
  dataReady: boolean;
  setDataReady: (value: boolean) => void;
  dataset: Dataset | null;
  setDataset: (value: Dataset | null) => void;
  // setReadyToDisplayGOT: (value: boolean) => void;
}

const DisplayGraph: FC<DisplayGraphProps> = ({
  readyToDisplayGOT,
  setReadyToDisplayGOT,
  chatInputForGOT,
  chatCurrentTempId,
  setGotLoaded,
  GOTJSON,
  dataReady,
  setDataReady,
  dataset,
  setDataset,

  // descGOTREQ,
  // setReadyToDisplayGOT,
}) => {
  const [showContents, setShowContents] = useState(false);

  // const [dataReady, setDataReady] = useState(false);
  // set description for clicked node
  const [descriptionForClickedNode, setDescriptionForClickedNode] =
    useState("");
  // const [dataset, setDataset] = useState<Dataset | null>(null);
  const [filtersState, setFiltersState] = useState<FiltersState>({
    clusters: {},
    tags: {},
  });
  // Node
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  // Egde
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);

  // Egde Label
  const [hoveredEdgeLabel, setHoveredEdgeLabel] = useState<string | null>(null);

  // toggle for controlpanel
  const [toggleControlPanel, setToggleControlPanel] = useState(true);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  //
  // const [isLoading, setIsLoading] = useState(false); // loading icon show

  // question and answer state
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: { clientX: any; clientY: any }) => {
      // console.log("e.clientX e.clientY", e.clientX, e.clientY);
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // edge label display
  // Style for the label display
  const labelStyle: CSSProperties = {
    position: "absolute",
    left: `${mousePosition.x + 1000}px`, // Convert number to string
    top: `${mousePosition.y - 100}px`, // Convert number to string
    transform: "translate(-1000%, -1000%)", // Center the div on the cursor
    // Additional styling here...
  };

  // useEffect(() => {
  //   console.log("chatCurrentTempIdInDisplayGraph", chatCurrentTempId);
  //   console.log("GOTchatInput", chatInputForGOT);

  //   if (readyToDisplayGOT) {
  //     setIsLoading(true); // loading icon show
  //     // fetch(`${process.env.PUBLIC_URL}/gotdata/dataset.json`)
  //     // get question from the textarea

  //     // fetch(
  //     //   `${process.env.REACT_APP_API_URL}:${process.env.REACT_APP_API_PORT}/chatapi/v1/got`
  //     // )
  //     // test
  //     fetch(
  //       `${process.env.REACT_APP_API_URL}:${process.env.REACT_APP_API_PORT}/chatapi/v1/gotjson`
  //     )
  //       .then((res) => res.json())
  //       .then((dataset: Dataset) => {
  //         console.log("datasetGOT", dataset);

  //         setDataset(dataset);

  //         // set question and answer
  //         setQuestion("Question: Who is the father of Jon Snow?");
  //         setAnswer("Answer: Rhaegar Targaryen");

  //         setFiltersState({
  //           clusters: mapValues(keyBy(dataset.clusters, "key"), constant(true)),
  //           tags: mapValues(keyBy(dataset.tags, "key"), constant(true)),
  //         });
  //         requestAnimationFrame(() => {
  //           setDataReady(true);
  //           setIsLoading(false);
  //         });
  //       });
  //   }
  // }, [readyToDisplayGOT]); // Only re-run the effect if count changes

  useEffect(() => {
    const fetchData = async () => {
      // console.log("chatCurrentTempIdInDisplayGraph", chatCurrentTempId);
      // console.log("GOTchatInput", chatInputForGOT);
      console.log("hereout-============================================");
      console.log("hereout-readyToDisplayGOT", readyToDisplayGOT);
      console.log("hereout-GOTJSON", GOTJSON);
      console.log("hereout-dataReady", dataReady);
      console.log("hereout-chatInputForGOT", chatInputForGOT);

      if (readyToDisplayGOT === true && GOTJSON === "") {
        console.log("hereout-first");
        // setIsLoading(true); // loading icon show
        setGotLoaded(false);

        try {
          // test1
          // const res = await fetch(
          //   `${process.env.PUBLIC_URL}/gotdata/dataset.json`
          // );
          // get question from the textarea

          // test 2
          // const res = await fetch(
          //   `${process.env.REACT_APP_API_URL}:${process.env.REACT_APP_API_PORT}/chatapi/v1/gotjson`
          // );

          // real api
          const res = await fetch(
            `${process.env.REACT_APP_API_URL}:${process.env.REACT_APP_API_PORT}/chatapi/v1/got`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                chatInput: chatInputForGOT,
              }),
            }
          );

          const dataset = await res.json();
          console.log("datasetGOT-readyToDisplayGOT", dataset);

          // post
          // chatInputForGOT

          let chatid_list = await savedChatIDs();

          console.log("chatid_listInDisplayGraph", chatid_list);

          let data = await getChatMessageByExperimentId(
            chatid_list[Number(chatCurrentTempId) - 1]
            // chatCurrentTempId
          );

          console.log("dataInDisplayGraph", data);
          // consert dataset to string
          let datasetString = JSON.stringify(dataset);

          // data is json format

          await postInChatlogsToDB(
            chatid_list[Number(chatCurrentTempId) - 1],
            // chatInputForGOT,
            // dataset,
            datasetString,
            "text",
            "gpt"
          );

          setDataset(dataset);

          // setReadyToDisplayGOT(true);

          // set question and answer
          setQuestion("Question: " + chatInputForGOT);
          // setAnswer("Answer: "+dataset.answer);

          setFiltersState({
            clusters: mapValues(keyBy(dataset.clusters, "key"), constant(true)),
            tags: mapValues(keyBy(dataset.tags, "key"), constant(true)),
          });
          requestAnimationFrame(() => {
            console.log("here2");
            // readyToDisplayGOT === true && GOTJSON === ""
            console.log("here2-readyToDisplayGOT", readyToDisplayGOT);
            console.log("here2-GOTJSON", GOTJSON);
            setDataReady(true);
            setGotLoaded(true);
            // setIsLoading(false);
            // setIsLoading(false);
          });
        } catch (error) {
          console.error("Failed to fetch data:", error);
          // Handle the error accordingly
          // setIsLoading(false); // Ensure loading icon is hidden in case of error
          setDataReady(false);
          setGotLoaded(false);
        }
      }

      if (readyToDisplayGOT === true && GOTJSON !== "") {
        console.log("hereout-second");
        // setIsLoading(true); // loading icon show
        setGotLoaded(false);

        try {
          // test1
          // const res = await fetch(
          //   `${process.env.PUBLIC_URL}/gotdata/dataset.json`
          // );
          // get question from the textarea

          // test 2
          // const res = await fetch(
          //   `${process.env.REACT_APP_API_URL}:${process.env.REACT_APP_API_PORT}/chatapi/v1/gotjson`
          // );

          // real api
          // const res = await fetch(
          //   `${process.env.REACT_APP_API_URL}:${process.env.REACT_APP_API_PORT}/chatapi/v1/got`,
          //   {
          //     method: "POST",
          //     headers: {
          //       "Content-Type": "application/json",
          //     },
          //     body: JSON.stringify({
          //       chatInput: chatInputForGOT,
          //     }),
          //   }
          // );

          // const dataset = await res.json();
          // console.log("datasetGOT", dataset);

          // post
          // chatInputForGOT

          // let chatid_list = await savedChatIDs();

          // console.log("chatid_listInDisplayGraph", chatid_list);

          // let data = await getChatMessageByExperimentId(
          //   chatid_list[Number(chatCurrentTempId) - 1]
          //   // chatCurrentTempId
          // );

          // console.log("dataInDisplayGraph", data);
          // // consert dataset to string
          // let datasetString = JSON.stringify(dataset);

          // // data is json format

          // await postInChatlogsToDB(
          //   chatid_list[Number(chatCurrentTempId) - 1],
          //   // chatInputForGOT,
          //   // dataset,
          //   datasetString,
          //   "text",
          //   "gpt"
          // );

          console.log("datasetGOT-GOTJSON", GOTJSON);

          setDataset(GOTJSON);

          // set question and answer
          setQuestion("Question: " + chatInputForGOT);
          // setAnswer("Answer: "+dataset.answer);

          setFiltersState({
            clusters: mapValues(keyBy(GOTJSON.clusters, "key"), constant(true)),
            tags: mapValues(keyBy(GOTJSON.tags, "key"), constant(true)),
          });
          requestAnimationFrame(() => {
            console.log("here3");
            setDataReady(true);
            setGotLoaded(true);
            // setIsLoading(false);
            // setIsLoading(false);
          });
        } catch (error) {
          console.error("Failed to fetch data:", error);
          // Handle the error accordingly
          // setIsLoading(false); // Ensure loading icon is hidden in case of error
          setDataReady(false);
          setGotLoaded(false);
        }
      }
    };

    fetchData();
  }, [readyToDisplayGOT, GOTJSON, dataReady]); // Only re-run the effect if readyToDisplayGOT GOTJSON changes

  if (!dataset) return null;

  return (
    <SigmaContainer
      graphOptions={{ type: "directed" }}
      initialSettings={{
        nodeProgramClasses: { image: getNodeProgramImage() },
        labelRenderer: drawLabel,
        defaultNodeType: "image",
        defaultEdgeType: "arrow",
        labelDensity: 0.07,
        labelGridCellSize: 60,
        labelRenderedSizeThreshold: 15,
        labelFont: "Lato, sans-serif",
        zIndex: true,
        // allowInvalidContainer: true,
      }}
      className="react-sigma"
    >
      {readyToDisplayGOT && dataReady && (
        <>
          <GraphSettingsController hoveredNode={hoveredNode} />
          <GraphEventsController
            setHoveredNode={setHoveredNode}
            setHoveredEdge={setHoveredEdge}
            setHoveredEdgeLabel={setHoveredEdgeLabel}
            setDescriptionForClickedNode={setDescriptionForClickedNode}
          />

          <GraphDataController dataset={dataset} filters={filtersState} />

          <div className="controls">
            {question && answer && (
              // font color is white
              // locate at 300px from the top and 20px from the left
              // Instead of px, use rem
              <div className="text-2xl text-white mb-40 ml-20 sm:mb-10 sm:ml-5 md:mb-20 md:ml-10 lg:mb-32 lg:ml-16">
                <div className="question">{question}</div>
                <div className="answer">{answer}</div>
              </div>
            )}

            <div className="ico">
              <button
                type="button"
                className="ico"
                onClick={() => {
                  console.log("reset button clicked");
                }}
                title="Back"
              >
                {/* reset button */}
                <BiReset />
              </button>
            </div>

            {/* home button */}
            <div className="ico">
              <button
                type="button"
                className="ico"
                onClick={() => {
                  // This is a placeholder for the actual logic to determine if '/Home' exists
                  const homeExists =
                    "/Hi"; /* logic to determine if '/Home' exists */
                  window.location.href = homeExists ? "/Home" : "/";
                }}
                title="Back"
              >
                {/* please use <- button */}
                <IoMdArrowRoundBack />
              </button>
            </div>
            <div className="ico">
              <button
                type="button"
                className="show-contents"
                onClick={() => setShowContents(true)}
                title="Show caption and description"
              >
                <BiBookContent />
              </button>
            </div>
            <FullScreenControl
              className="ico"
              customEnterFullScreen={<BsArrowsFullscreen />}
              customExitFullScreen={<BsFullscreenExit />}
            />
            <ZoomControl
              className="ico"
              customZoomIn={<BsZoomIn />}
              customZoomOut={<BsZoomOut />}
              customZoomCenter={<BiRadioCircleMarked />}
            />
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

            {hoveredEdgeLabel && (
              <div className="edge-label-display" style={labelStyle}>
                {hoveredEdgeLabel}
              </div>
            )}
          </div>
          <div className="contents">
            <div className="ico">
              <button
                type="button"
                className="ico hide-contents"
                onClick={() => setShowContents(false)}
                title="Show caption and description"
              >
                <GrClose />
              </button>
            </div>
            {/* <GraphTitle filters={filtersState} /> */}

            <div className="panels">
              <div className="flex justify-end">
                {toggleControlPanel === false ? (
                  <KeyboardArrowUpRoundedIcon
                    style={{
                      color: "white",
                      fontSize: "70px",
                      cursor: "pointer",
                    }}
                    onClick={(
                      event: React.MouseEvent<SVGSVGElement, MouseEvent>
                    ) => {
                      // Find the closest element with the class 'panels'
                      const target = event.target as HTMLElement; // Ensuring the target is seen as an HTMLElement
                      const closestPanel = target.closest(".panels");

                      // If a 'panels' element is found, change its width to 100%
                      if (closestPanel) {
                        (closestPanel as HTMLElement).style.width = "350px";
                      }
                      // Additional action
                      setToggleControlPanel(true);
                    }}
                  />
                ) : (
                  <KeyboardArrowDownRoundedIcon
                    style={{
                      color: "white",
                      fontSize: "70px",
                      cursor: "pointer",
                    }}
                    onClick={(
                      event: React.MouseEvent<SVGSVGElement, MouseEvent>
                    ) => {
                      // Find the closest element with the class 'panels'
                      const target = event.target as HTMLElement; // Ensuring the target is seen as an HTMLElement
                      const closestPanel = target.closest(".panels");

                      // If a 'panels' element is found, change its width to 100%
                      if (closestPanel) {
                        (closestPanel as HTMLElement).style.width = "100px";
                      }

                      // Additional action
                      setToggleControlPanel(false);
                    }}
                  />
                )}
              </div>

              {toggleControlPanel && (
                <>
                  {/* <SearchField filters={filtersState} /> */}
                  <DescriptionPanel
                    descriptionForClickedNode={descriptionForClickedNode}
                    setDescriptionForClickedNode={setDescriptionForClickedNode}
                    chatCurrentTempId={chatCurrentTempId}
                    // descGOTREQ={descGOTREQ}
                  />
                  {/* <ClustersPanel
                    clusters={dataset.clusters}
                    filters={filtersState}
                    setClusters={(clusters) =>
                      setFiltersState((filters) => ({
                        ...filters,
                        clusters,
                      }))
                    }
                    toggleCluster={(cluster) => {
                      setFiltersState((filters) => ({
                        ...filters,
                        clusters: filters.clusters[cluster]
                          ? omit(filters.clusters, cluster)
                          : { ...filters.clusters, [cluster]: true },
                      }));
                    }}
                  /> */}
                  {/* <TagsPanel
                    tags={dataset.tags}
                    filters={filtersState}
                    setTags={(tags) =>
                      setFiltersState((filters) => ({
                        ...filters,
                        tags,
                      }))
                    }
                    toggleTag={(tag) => {
                      setFiltersState((filters) => ({
                        ...filters,
                        tags: filters.tags[tag]
                          ? omit(filters.tags, tag)
                          : { ...filters.tags, [tag]: true },
                      }));
                    }}
                  /> */}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </SigmaContainer>
  );
};

export default DisplayGraph;
