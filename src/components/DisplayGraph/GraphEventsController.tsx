import { useRegisterEvents, useSigma } from "react-sigma-v2";
import { FC, useEffect } from "react";

function getMouseLayer() {
  return document.querySelector(".sigma-mouse");
}

const GraphEventsController: FC<{
  setHoveredNode: (node: string | null) => void;
  setDescriptionForClickedNode: (description: string) => void;
}> = ({ setHoveredNode, setDescriptionForClickedNode, children }) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();
  const registerEvents = useRegisterEvents();

  /**
   * Initialize here settings that require to know the graph and/or the sigma
   * instance:
   */
  useEffect(() => {
    registerEvents({
      // clickNode({ node }) {
      //   if (!graph.getNodeAttribute(node, "hidden")) {
      //     window.open(graph.getNodeAttribute(node, "URL"), "_blank");
      //   }
      // },

      // clickNode({ node }) {
      //   // Only act if the 'hidden' attribute of the node is false
      //   if (!graph.getNodeAttribute(node, "hidden")) {
      //     // Open the node's URL in a new tab
      //     window.open(graph.getNodeAttribute(node, "URL"), "_blank");
      //   }

      //   // Print the node's key in the console
      //   console.log("Clicked node key:", node);
      // },
      clickNode({ node }) {
        // Check if the 'hidden' attribute of the node is false
        if (!graph.getNodeAttribute(node, "hidden")) {
          // Get the node's label (name) and display it
          const nodeName = graph.getNodeAttribute(node, "thoughts");
          // please show this json in to console

          let nodeThoughts = JSON.stringify(nodeName, null, 2);
          // alert("Node thoughts: " + nodeName);
          console.log("Node thoughts: " + nodeThoughts);
          setDescriptionForClickedNode(nodeThoughts);
        }

        // Print the node's key in the console
        // console.log("Clicked node thoughts:", node);
      },
      enterNode({ node }) {
        setHoveredNode(node);
        // TODO: Find a better way to get the DOM mouse layer:
        const mouseLayer = getMouseLayer();
        if (mouseLayer) mouseLayer.classList.add("mouse-pointer");
      },
      leaveNode() {
        setHoveredNode(null);
        // TODO: Find a better way to get the DOM mouse layer:
        const mouseLayer = getMouseLayer();
        if (mouseLayer) mouseLayer.classList.remove("mouse-pointer");
      },
    });
  }, []);

  return <>{children}</>;
};

export default GraphEventsController;
