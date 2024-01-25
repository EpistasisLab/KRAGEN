import React, { FC, useEffect, useState } from "react";
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
import { BiRadioCircleMarked, BiBookContent } from "react-icons/bi";
// import ControlPointIcon from "@mui/icons-material/ControlPoint";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import {
  BsArrowsFullscreen,
  BsFullscreenExit,
  BsZoomIn,
  BsZoomOut,
} from "react-icons/bs";

const DisplayGraph: FC = () => {
  const [showContents, setShowContents] = useState(false);

  const [dataReady, setDataReady] = useState(false);
  // set description for clicked node
  const [descriptionForClickedNode, setDescriptionForClickedNode] =
    useState("");
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [filtersState, setFiltersState] = useState<FiltersState>({
    clusters: {},
    tags: {},
  });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // toggle for controlpanel
  const [toggleControlPanel, setToggleControlPanel] = useState(true);

  // Load data on mount:
  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/dataset.json`)
      .then((res) => res.json())
      .then((dataset: Dataset) => {
        setDataset(dataset);
        setFiltersState({
          clusters: mapValues(keyBy(dataset.clusters, "key"), constant(true)),
          tags: mapValues(keyBy(dataset.tags, "key"), constant(true)),
        });
        requestAnimationFrame(() => setDataReady(true));
      });
  }, []);

  if (!dataset) return null;

  return (
    // <div id="dispnetgra" className={showContents ? "show-contents" : ""}>
    // <div id="dispnetgra" className={showContents ? "show-contents" : ""}>
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
      }}
      className="react-sigma"
    >
      <GraphSettingsController hoveredNode={hoveredNode} />
      <GraphEventsController
        setHoveredNode={setHoveredNode}
        setDescriptionForClickedNode={setDescriptionForClickedNode}
      />
      <GraphDataController dataset={dataset} filters={filtersState} />

      {dataReady && (
        <>
          <div className="controls">
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
                  <SearchField filters={filtersState} />
                  <DescriptionPanel
                    descriptionForClickedNode={descriptionForClickedNode}
                  />
                  <ClustersPanel
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
                  />
                  <TagsPanel
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
                  />
                </>
              )}
            </div>
          </div>
        </>
      )}
    </SigmaContainer>
    // </div>
  );
};

export default DisplayGraph;
