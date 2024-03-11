import React, { useState } from "react";
import { useContext } from "react";
import { AllContext } from "./context/AllContext";

const ResizableDiv = () => {
  const { gotQuestion, gotAnswer } = useContext(AllContext);
  const [size, setSize] = useState({ width: 500, height: 130 });

  const handleDrag = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = size.width;
    const startHeight = size.height;

    const doDrag = (dragEvent) => {
      setSize({
        width: startWidth + dragEvent.clientX - startX,
        height: startHeight + dragEvent.clientY - startY,
      });
    };

    const stopDrag = () => {
      document.removeEventListener("mousemove", doDrag);
      document.removeEventListener("mouseup", stopDrag);
    };

    document.addEventListener("mousemove", doDrag);
    document.addEventListener("mouseup", stopDrag);
  };

  return (
    <div
      className="fixed bg-black text-white p-4"
      style={{
        width: `${size.width}px`,
        height: `${size.height}px`,
        overflow: "auto",
        position: "absolute",
        top: "5%", // Adjusted for demonstration; calculate based on requirements
        left: "5%", // Adjusted for demonstration; calculate based on requirements
        zIndex: 100,
        fontSize: "1.1rem",
        resize: "both",
        backgroundColor: "rgba(255, 255, 255, 0.1)",

        borderRadius: "10px",
      }}
    >
      <p className="font-semibold text-lg">
        <b>Question</b>: {gotQuestion}
      </p>
      <p className="font-semibold text-lg">
        <b>Answer</b>: {gotAnswer}
      </p>
      <div
        onMouseDown={handleDrag}
        style={{
          cursor: "nwse-resize",
          position: "absolute",
          right: "0",
          bottom: "0",
          //   backgroundColor: "blue",
          width: "10px",
          height: "10px",
        }}
      />
    </div>
  );
};

export default ResizableDiv;
