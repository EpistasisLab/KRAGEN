import React, { useEffect, useState, FC } from "react";
import { BsInfoCircle } from "react-icons/bs";

import Panel from "./Panel";

import useStore from "../../store/store";

const DescriptionPanel: FC<{
  descriptionForClickedNode?: string;
  setDescriptionForClickedNode: (description: string) => void;
  chatCurrentTempId?: any;
}> = ({
  descriptionForClickedNode,
  setDescriptionForClickedNode,
  chatCurrentTempId,
}) => {
  const [parsedData, setParsedData] = useState(null);

  const {
    count,
    increment,
    currentGenerateNodeClickId,
    setCurrentGenerateNodeClickId,
  } = useStore((state) => {
    return {
      count: state.count,
      increment: state.increment,
      currentGenerateNodeClickId: state.currentGenerateNodeClickId,
      setCurrentGenerateNodeClickId: state.setCurrentGenerateNodeClickId,
    };
  });

  useEffect(() => {
    if (descriptionForClickedNode) {
      try {
        // Parse JSON whenever descriptionForClickedNode changes
        const data = JSON.parse(descriptionForClickedNode);
        console.log("data-descriptionForClickedNode", data);
        var id = data.key.split("_")[1];
        console.log("id", id);
        // make id as integer
        var idInt = parseInt(id);
        // make integer id as currentGenerateNodeClickId after dividing by 2
        idInt = idInt / 2 - 1;
        console.log("idInt", idInt);
        setCurrentGenerateNodeClickId(idInt);
        if (data[0]) {
          setParsedData(data[0]);
        } else {
          setParsedData(data);
        }
      } catch (e) {
        // error handling that occurs during JSON parsing
        console.error("Error parsing JSON", e);
        console.log("data-descriptionForClickedNode-useEffect-error", e);
        setParsedData(null);
      }
    }
  }, [descriptionForClickedNode]);
  // RESET DESCRIPTION WHEN CLICKED CHATTAB CHANGES
  useEffect(() => {
    setParsedData(null);
  }, [chatCurrentTempId]);

  return (
    <Panel
      initiallyDeployed
      title={
        <>
          <BsInfoCircle className="text-muted" /> Description
        </>
      }
    >
      {parsedData ? (
        <div>
          {(parsedData as { key?: string }).key === "node_-1" ? (
            <>
              <h3>Question:</h3>
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                {(parsedData as { thoughts?: Array<any> }).thoughts?.[0]
                  ?.question ?? null}
              </div>
            </>
          ) : null}

          {(parsedData as { key?: string }).key !== "node_-1" &&
          (parsedData as { label?: string }).label !== "Answer" &&
          (parsedData as { label?: string }).label !== "Selector" ? (
            <>
              <h3
                onClick={() => {
                  console.log("parsedData", parsedData);
                }}
              >
                Prompt:
              </h3>

              <div
                style={{ maxHeight: "200px", overflowY: "auto" }}
                contentEditable="true"
              >
                {(parsedData as { thoughts?: Array<any> }).thoughts?.[0]
                  ?.prompt ?? null}
              </div>
            </>
          ) : null}

          {(parsedData as { key?: string }).key !== "node_-1" &&
          (parsedData as { key?: string }).key !== "node_0" &&
          (parsedData as { label?: string }).label !== "Selector" &&
          (parsedData as { label?: string }).label !== "Answer" ? (
            <>
              <h3
                style={{
                  display: Number.isInteger(currentGenerateNodeClickId)
                    ? "block"
                    : "none",
                }}
              >
                Knowledge:
              </h3>

              <div
                style={{ maxHeight: "200px", overflowY: "auto" }}
                contentEditable="true"
              >
                {typeof (
                  parsedData as {
                    thoughts?: Array<{ knowledge?: string; key?: string }>;
                  }
                ).thoughts?.[0]?.knowledge === "string"
                  ? (
                      parsedData as {
                        thoughts?: Array<{ knowledge?: string; key?: string }>;
                      }
                    ).thoughts?.[0]?.knowledge
                      ?.split("\n")
                      .map(
                        (
                          item,
                          index // Use index for key to avoid duplicate keys
                        ) =>
                          item.trim() !== "" ? (
                            <li
                              key={index}
                              style={{
                                display:
                                  currentGenerateNodeClickId === index
                                    ? "block"
                                    : "none",
                              }}
                            >
                              {item}
                            </li>
                          ) : null
                      )
                  : null}
              </div>
            </>
          ) : null}

          {(parsedData as { key?: string }).key !== "node_-1" &&
          (parsedData as { label?: string }).label !== "Selector" &&
          (parsedData as { thoughts?: Array<any> }).thoughts?.[0]?.current !==
            "" ? (
            <>
              <h3>Response:</h3>
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                {(parsedData as { thoughts?: Array<any> }).thoughts?.[0]
                  ?.current ?? null}
              </div>
            </>
          ) : null}

          {/* show all edges */}
          {(parsedData as { edges?: string[] }).edges ? (
            <div>
              <h3>Edges:</h3>
              <p>
                {(parsedData as { edges?: string[] }).edges?.map((edge) => (
                  <li>{edge}</li>
                ))}
              </p>
            </div>
          ) : null}

          {(parsedData as { label?: string }).label === "Selector" &&
          (parsedData as { thoughts?: Array<any> }).thoughts?.[0]?.edge_id !==
            undefined ? (
            <>
              <h3>Edge:</h3>
              <p contentEditable="true">
                {(parsedData as { thoughts?: Array<any> }).thoughts?.[0]
                  ?.edges?.[
                  (parsedData as { thoughts?: Array<any> }).thoughts?.[0]
                    ?.edge_id ?? 0
                ] ?? null}
              </p>
            </>
          ) : null}
        </div>
      ) : (
        <p>
          Please click on a node to display information about the question,
          answer, prompt, and edges.
        </p>
      )}
    </Panel>
  );
};

export default DescriptionPanel;
