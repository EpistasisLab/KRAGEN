import React, { useEffect, useState, FC } from "react";
import { BsInfoCircle } from "react-icons/bs";

import Panel from "./Panel";

const DescriptionPanel: FC<{ descriptionForClickedNode?: string }> = ({
  descriptionForClickedNode,
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
    if (descriptionForClickedNode) {
      try {
        // descriptionForClickedNode가 변경될 때마다 JSON을 파싱
        const data = JSON.parse(descriptionForClickedNode);
        console.log("parsed-data", data[0]);
        setParsedData(data[0]);
      } catch (e) {
        // JSON 파싱 중 발생하는 에러 처리
        console.error("JSON 파싱 에러", e);
        setParsedData(null);
      }
    }
  }, [descriptionForClickedNode]); // descriptionForClickedNode가 변경될 때마다 실행

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

      {parsedData ? (
        <div>
          {/* 파싱된 데이터를 사용하여 UI 구성 */}
          <h3>Question:</h3>
          <p>{(parsedData as { question?: string }).question}</p>
          <h3>Answer:</h3>
          <p>{(parsedData as { ground_truth?: string }).ground_truth}</p>
          <h3>Prompt:</h3>
          <p>{(parsedData as { prompt?: string }).prompt}</p>
          {/* parsedData.edges has two elements */}
          <h3>Edges:</h3>
          <p>{(parsedData as { edges?: string[] }).edges?.[0]}</p>
          <p>{(parsedData as { edges?: string[] }).edges?.[1] ?? ""}</p>
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
