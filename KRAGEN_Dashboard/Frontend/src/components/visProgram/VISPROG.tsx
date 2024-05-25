import React from "react";
import { useRete } from "rete-react-plugin";
import logo from "./logo.svg";
import "./App.css";
import "./rete.css";
import { createEditor } from "./rete";

function VISPROG() {
  const [ref] = useRete(createEditor);

  return (
    <div className="App">
      <div ref={ref} className="rete"></div>
    </div>
  );
}

export default VISPROG;
