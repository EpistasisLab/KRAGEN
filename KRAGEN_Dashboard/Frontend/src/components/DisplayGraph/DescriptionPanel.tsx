import React, { useEffect, useState, FC } from "react";
import { BsInfoCircle } from "react-icons/bs";

import Panel from "./Panel";

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

  useEffect(() => {
    if (descriptionForClickedNode) {
      try {
        // Parse JSON whenever descriptionForClickedNode changes
        const data = JSON.parse(descriptionForClickedNode);

        if (data[0]) {
          setParsedData(data[0]);
        } else {
          setParsedData(data);
        }
      } catch (e) {
        // error handling that occurs during JSON parsing
        console.error("Error parsing JSON", e);
        setParsedData(null);
      }
    }
  }, [descriptionForClickedNode]); // descriptionForClickedNode가 변경될 때마다 실행

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
              <h3>Prompt:</h3>
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
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
              <h3>Knowledge:</h3>
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                {(parsedData as { thoughts?: Array<any> }).thoughts?.[0]
                  ?.knowledge[0] !== undefined
                  ? (
                      parsedData as { thoughts?: Array<any> }
                    ).thoughts?.[0]?.knowledge?.[0]
                      .split("\n")
                      .map((item: string) =>
                        item.trim() !== "" ? <li key={item}>{item}</li> : null
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
              <p>
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
