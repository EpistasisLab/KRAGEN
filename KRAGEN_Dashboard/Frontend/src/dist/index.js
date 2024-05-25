"use strict";
exports.__esModule = true;
var react_1 = require("react");
var react_dom_1 = require("react-dom");
require("./styles.css");
var ChatGPTForKRAGENLoc_1 = require("./components/ChatGPTForKRAGENLoc");
// import AlertExplainPurpose from "./components/AlertExplainPurpose";
// import * as Sentry from "@sentry/react";
var VISPROG_1 = require("./components/visProgram/VISPROG");
var ErrorBoundary_1 = require("./components/ErrorBoundary");
// Set up global error handler
window.onerror = function (message, source, lineno, colno, error) {
    // Add error logging logic here
    console.log("Captured in window.onerror:", message);
    // Return true to prevent default browser handling
    return true;
};
function App() {
    var _a = react_1.useState(true), isAlertOpen = _a[0], setIsAlertOpen = _a[1];
    return (react_1["default"].createElement("div", { id: "main-page", className: "flex flex-col overflow-auto", style: {
            backgroundImage: "linear-gradient(\n                        rgba(0, 0, 0, 0.3),\n                        rgba(0, 0, 0, 0.3)\n                      ), url('/images/bg-masthead_darker_image.jpg')",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            height: "100vh"
        } },
        react_1["default"].createElement("div", { className: "flex flex-row h-screen overflow-y-hidden" },
            react_1["default"].createElement("div", { className: "chartsbaseright bg-gray-950 pt-2 pl-2 pb-0" }),
            react_1["default"].createElement("div", { id: "chatgpt-space", style: { width: "100vw", height: "100vh" }, className: "chatbaseleft bg-gray-950 pt-2 pl-2 pb-0" },
                react_1["default"].createElement(ChatGPTForKRAGENLoc_1["default"], { experiment: "kragenloc" }),
                react_1["default"].createElement(VISPROG_1["default"], null)))));
}
react_dom_1["default"].render(react_1["default"].createElement(react_1["default"].StrictMode, null,
    react_1["default"].createElement(ErrorBoundary_1["default"], null,
        react_1["default"].createElement(App, null))), document.getElementById("root"));
