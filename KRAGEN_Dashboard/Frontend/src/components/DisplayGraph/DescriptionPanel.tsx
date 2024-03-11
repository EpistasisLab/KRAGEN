import React, { useEffect, useState, FC } from "react";
import { BsInfoCircle } from "react-icons/bs";

import Panel from "./Panel";

const DescriptionPanel: FC<{
  descriptionForClickedNode?: string;
  setDescriptionForClickedNode: (description: string) => void;
  chatCurrentTempId?: any;
  // descGOTREQ?: boolean;
}> = ({
  descriptionForClickedNode,
  setDescriptionForClickedNode,
  chatCurrentTempId,
}) => {
  // FC<{ descriptionForClickedNode?: string }> = ({ descriptionForClickedNode }) => {

  // const [clickedNodeDescription, setClickedNodeDescription] =
  //   React.useState("");

  // const handleNodeClick = (descriptionForClickedNode: any) => {
  //   // descriptionForClickedNode is json object

  //   console.log("descriptionForClickedNode", descriptionForClickedNode);
  // };

  const [parsedData, setParsedData] = useState(null);

  useEffect(() => {
    console.log("disp-chatCurrentTempId", chatCurrentTempId);
    if (descriptionForClickedNode) {
      console.log("descriptionForClickedNode", descriptionForClickedNode);
      try {
        // Parse JSON whenever descriptionForClickedNode changes
        const data = JSON.parse(descriptionForClickedNode);
        console.log("parsed-data", data);
        console.log("777-data[0]", data[0]);
        console.log("777-data", data);
        // console.log("parsed-data[]", data[0]);
        // console.log("parsed-data.edge_id", data[0].edge_id);
        // if data has 0th element, then setParsedData(data[0])
        // else setParsedData(data)
        if (data[0]) {
          setParsedData(data[0]);
        } else {
          setParsedData(data);
        }
        // setParsedData(data[0]);
        // setParsedData(data);
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
      {/* {descriptionForClickedNode} */}

      {/* parseData has thoughts. AND in thoughts, there is only one element. in the one element there is current field */}
      {parsedData ? (
        <div>
          {/* parseData has thoughts. AND in thoughts, there is only one element. in the one element there is current field */}

          {/* key in parsedData is node_-1 */}
          {/* For first question node */}
          {/* {(parsedData as { thoughts?: Array<any> }).thoughts ? (
            <>
              <h3>Question:</h3>
              {(parsedData as { thoughts?: Array<any> }).thoughts?.[0]
                ?.question ?? null}
            </>
          ) : null} */}

          {(parsedData as { key?: string }).key === "node_-1" ? (
            <>
              <h3>Question:</h3>
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                {(parsedData as { thoughts?: Array<any> }).thoughts?.[0]
                  ?.question ?? null}
              </div>
            </>
          ) : null}

          {/* {(parsedData as { prompt?: string }).prompt ? (
            <>
              <h3>Prompt:</h3>
              <p>{(parsedData as { prompt?: string }).prompt}</p>
            </>
          ) : null} */}

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

          {/* {(parsedData as { thoughts?: Array<any> }).thoughts ? (
            <>
              <h3>Prompt:</h3>
              {(parsedData as { thoughts?: Array<any> }).thoughts?.[0]
                ?.prompt ?? null}
            </>
          ) : null} */}

          {/* {(parsedData as { knowledge?: string }).knowledge ? (
            <>
              <h3>Knowledge:</h3>
              <p>{(parsedData as { knowledge?: string }).knowledge}</p>
            </>
          ) : null} */}
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

          {/* {(parsedData as { current?: string }).current ? (
            <>
              <h3>Current:</h3>
              <p>{(parsedData as { current?: string }).current}</p>
            </>
          ) : null}
           */}

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

          {/* if label in  parsedData  is Question} */}
          {/* {(parsedData as { label?: string }).label === "Question" ? (
            <>
              <h3>Question:</h3>
              <p>{(parsedData as { question?: string }).question}</p>
            </>
          ) : null} */}
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
          {/* parsedData.edges has two elements */}
          {/* {(parsedData as { edges?: string[]; edge_id?: number }).edge_id !==
            undefined && (
            <div>
              <h3>Edge:</h3>
              <p>
                {(parsedData as { edges?: string[]; edge_id?: number }).edges?.[
                  (parsedData as { edge_id?: number }).edge_id ?? 0
                ] ?? null}
              </p>
            </div>
          )} */}

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

          {/* Answer */}
          {/* {(parsedData as { label?: string }).label === "Answer" ? (
            <>
              <h3>Answer:</h3>
              <>
                {(parsedData as { thoughts?: Array<any> }).thoughts?.[0]
                  ?.current ?? null}
              </>
            </>
          ) : null} */}

          {/* <p>{(parsedData as { edge_id?: string }).edge_id}</p> */}
        </div>
      ) : (
        <p>
          Please click on a node to display information about the question,
          answer, prompt, and edges.
        </p>
      )}

      {/* <p>
        This map represents a <i>network</i> of Wikipedia articles around the
        topic of "Data vizualisation". Each <i>node</i> represents an article,
        and each edge a{" "}
        <a
          target="_blank"
          rel="noreferrer"
          href="https://en.wikipedia.org/wiki/See_also"
        >
          "See also" link
        </a>
        .
      </p>
      <p>
        The seed articles were selected by hand by the{" "}
        <a
          target="_blank"
          rel="noreferrer"
          href="https://medialab.sciencespo.fr/"
        >
          Sciences-Po médialab
        </a>{" "}
        team, and the network was crawled using{" "}
        <a
          target="_blank"
          rel="noreferrer"
          href="https://densitydesign.github.io/strumentalia-seealsology/"
        >
          Seealsology
        </a>
        , and then cleaned and enriched manually. This makes the dataset
        creditable to both the médialab team and{" "}
        <a
          target="_blank"
          rel="noreferrer"
          href="https://en.wikipedia.org/wiki/Wikipedia:Wikipedians"
        >
          Wikipedia editors
        </a>
        .
      </p>
      <p>
        This web application has been developed by{" "}
        <a
          target="_blank"
          rel="noreferrer"
          href="https://www.ouestware.com/en/"
        >
          OuestWare
        </a>
        , using{" "}
        <a target="_blank" rel="noreferrer" href="https://reactjs.org/">
          react
        </a>{" "}
        and{" "}
        <a target="_blank" rel="noreferrer" href="https://www.sigmajs.org">
          sigma.js
        </a>
        . You can read the source code{" "}
        <a
          target="_blank"
          rel="noreferrer"
          href="https://github.com/jacomyal/sigma.js/tree/main/demo"
        >
          on GitHub
        </a>
        .
      </p>
      <p>
        Nodes sizes are related to their{" "}
        <a
          target="_blank"
          rel="noreferrer"
          href="https://en.wikipedia.org/wiki/Betweenness_centrality"
        >
          betweenness centrality
        </a>
        . More central nodes (ie. bigger nodes) are important crossing points in
        the network. Finally, You can click a node to open the related Wikipedia
        article.
      </p> */}
    </Panel>
  );
};

export default DescriptionPanel;
