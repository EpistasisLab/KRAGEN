import { useRegisterEvents, useSigma } from "react-sigma-v2";
import { FC, useEffect } from "react";

function getMouseLayer() {
  return document.querySelector(".sigma-mouse");
}

const GraphEventsController: FC<{
  setHoveredNode: (node: string | null) => void;
  setHoveredEdge: (edge: string | null) => void;
  setHoveredEdgeLabel: (edgeLabel: string | null) => void;
  setDescriptionForClickedNode: (description: string) => void;
}> = ({
  setHoveredNode,
  setHoveredEdge,
  setHoveredEdgeLabel,
  setDescriptionForClickedNode,
  children,
}) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();
  const registerEvents = useRegisterEvents();

  /**
   * Initialize here settings that require to know the graph and/or the sigma
   * instance:
   */
  useEffect(() => {
    registerEvents({
      clickNode({ node }) {
        // Check if the 'hidden' attribute of the node is false
        if (!graph.getNodeAttribute(node, "hidden")) {
          // if node is node_-1, then do not open the node's URL in a new tab
          if (node === "node_-1") {
            // get entire node information
            let nodeName = graph.getNodeAttributes(node);
            // please show this json in to console
            let nodeThoughts = JSON.stringify(nodeName, null, 2);

            setDescriptionForClickedNode(nodeThoughts);
          } else {
            // Get the node's label (name) and display it
            // let nodeName = graph.getNodeAttribute(node, "thoughts");
            let nodeName = graph.getNodeAttributes(node);
            // please show this json in to console

            let nodeThoughts = JSON.stringify(nodeName, null, 2);
            // alert("Node thoughts: " + nodeName);

            setDescriptionForClickedNode(nodeThoughts);
          }
        }
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
      enterEdge({ edge }) {
        // setHoveredEdge(edge);
        setHoveredEdge(null);
        // Handle edge hover enter event
        // Example: Highlight the edge, show edge information, etc.
        // graph.setEdgeAttribute(edge, "color", "#ff0000"); // Change color to red
        graph.setEdgeAttribute(edge, "size", 7); // Increase size for visibility

        // how to get edge information
        const edgeData = graph.getEdgeAttributes(edge);

        // If you want to display this label in the UI, you can use a state variable.
        // For example:
        // setHoveredEdgeLabel(edgeData.label);
        setHoveredEdgeLabel("");
      },
      leaveEdge({ edge }) {
        setHoveredEdge(null);
        setHoveredEdgeLabel("");
        // Handle edge hover leave event
        graph.setEdgeAttribute(edge, "color", "#ffffff"); // Change color back to default
        graph.setEdgeAttribute(edge, "size", 5); // Revert size to original
      },
      clickEdge({ edge }) {
        // Handle edge click event
        // Example: Show detailed information about the edge, etc.
        const edgeData = graph.getEdgeAttributes(edge);
        // Set the clicked edge data
        // setClickedEdge(edgeData);
      },
    });
  }, []);

  return <>{children}</>;
};

export default GraphEventsController;
