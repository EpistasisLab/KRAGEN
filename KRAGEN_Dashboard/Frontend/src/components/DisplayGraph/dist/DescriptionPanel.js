"use strict";
exports.__esModule = true;
var react_1 = require("react");
var bs_1 = require("react-icons/bs");
var Panel_1 = require("./Panel");
var store_1 = require("../../store/store");
var DescriptionPanel = function (_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2;
    var descriptionForClickedNode = _a.descriptionForClickedNode, setDescriptionForClickedNode = _a.setDescriptionForClickedNode, chatCurrentTempId = _a.chatCurrentTempId;
    var _3 = react_1.useState(null), parsedData = _3[0], setParsedData = _3[1];
    var _4 = store_1["default"](function (state) {
        return {
            count: state.count,
            increment: state.increment,
            currentGenerateNodeClickId: state.currentGenerateNodeClickId,
            setCurrentGenerateNodeClickId: state.setCurrentGenerateNodeClickId
        };
    }), count = _4.count, increment = _4.increment, currentGenerateNodeClickId = _4.currentGenerateNodeClickId, setCurrentGenerateNodeClickId = _4.setCurrentGenerateNodeClickId;
    react_1.useEffect(function () {
        if (descriptionForClickedNode) {
            try {
                // Parse JSON whenever descriptionForClickedNode changes
                var data = JSON.parse(descriptionForClickedNode);
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
                }
                else {
                    setParsedData(data);
                }
            }
            catch (e) {
                // error handling that occurs during JSON parsing
                console.error("Error parsing JSON", e);
                console.log("data-descriptionForClickedNode-useEffect-error", e);
                setParsedData(null);
            }
        }
    }, [descriptionForClickedNode]);
    // RESET DESCRIPTION WHEN CLICKED CHATTAB CHANGES
    react_1.useEffect(function () {
        setParsedData(null);
    }, [chatCurrentTempId]);
    return (react_1["default"].createElement(Panel_1["default"], { initiallyDeployed: true, title: react_1["default"].createElement(react_1["default"].Fragment, null,
            react_1["default"].createElement(bs_1.BsInfoCircle, { className: "text-muted" }),
            " Description") }, parsedData ? (react_1["default"].createElement("div", null,
        parsedData.key === "node_-1" ? (react_1["default"].createElement(react_1["default"].Fragment, null,
            react_1["default"].createElement("h3", null, "Question:"),
            react_1["default"].createElement("div", { style: { maxHeight: "200px", overflowY: "auto" } }, (_d = (_c = (_b = parsedData.thoughts) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.question) !== null && _d !== void 0 ? _d : null))) : null,
        parsedData.key !== "node_-1" &&
            parsedData.label !== "Answer" &&
            parsedData.label !== "Selector" ? (react_1["default"].createElement(react_1["default"].Fragment, null,
            react_1["default"].createElement("h3", { onClick: function () {
                    console.log("parsedData", parsedData);
                } }, "Prompt:"),
            react_1["default"].createElement("div", { style: { maxHeight: "200px", overflowY: "auto" }, contentEditable: "true" }, (_g = (_f = (_e = parsedData.thoughts) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.prompt) !== null && _g !== void 0 ? _g : null))) : null,
        parsedData.key !== "node_-1" &&
            parsedData.key !== "node_0" &&
            parsedData.label !== "Selector" &&
            parsedData.label !== "Answer" ? (react_1["default"].createElement(react_1["default"].Fragment, null,
            react_1["default"].createElement("h3", { style: {
                    display: Number.isInteger(currentGenerateNodeClickId)
                        ? "block"
                        : "none"
                } }, "Knowledge:"),
            react_1["default"].createElement("div", { style: { maxHeight: "200px", overflowY: "auto" }, contentEditable: "true" }, typeof ((_j = (_h = parsedData.thoughts) === null || _h === void 0 ? void 0 : _h[0]) === null || _j === void 0 ? void 0 : _j.knowledge) === "string"
                ? (_m = (_l = (_k = parsedData.thoughts) === null || _k === void 0 ? void 0 : _k[0]) === null || _l === void 0 ? void 0 : _l.knowledge) === null || _m === void 0 ? void 0 : _m.split("\n").map(function (item, index // Use index for key to avoid duplicate keys
                ) {
                    return item.trim() !== "" ? (react_1["default"].createElement("li", { key: index, style: {
                            display: currentGenerateNodeClickId === index
                                ? "block"
                                : "none"
                        } }, item)) : null;
                }) : null))) : null,
        parsedData.key !== "node_-1" &&
            parsedData.label !== "Selector" &&
            ((_p = (_o = parsedData.thoughts) === null || _o === void 0 ? void 0 : _o[0]) === null || _p === void 0 ? void 0 : _p.current) !==
                "" ? (react_1["default"].createElement(react_1["default"].Fragment, null,
            react_1["default"].createElement("h3", null, "Response:"),
            react_1["default"].createElement("div", { style: { maxHeight: "200px", overflowY: "auto" } }, (_s = (_r = (_q = parsedData.thoughts) === null || _q === void 0 ? void 0 : _q[0]) === null || _r === void 0 ? void 0 : _r.current) !== null && _s !== void 0 ? _s : null))) : null,
        parsedData.edges ? (react_1["default"].createElement("div", null,
            react_1["default"].createElement("h3", null, "Edges:"),
            react_1["default"].createElement("p", null, (_t = parsedData.edges) === null || _t === void 0 ? void 0 : _t.map(function (edge) { return (react_1["default"].createElement("li", null, edge)); })))) : null,
        parsedData.label === "Selector" &&
            ((_v = (_u = parsedData.thoughts) === null || _u === void 0 ? void 0 : _u[0]) === null || _v === void 0 ? void 0 : _v.edge_id) !==
                undefined ? (react_1["default"].createElement(react_1["default"].Fragment, null,
            react_1["default"].createElement("h3", null, "Edge:"),
            react_1["default"].createElement("p", { contentEditable: "true" }, (_2 = (_y = (_x = (_w = parsedData.thoughts) === null || _w === void 0 ? void 0 : _w[0]) === null || _x === void 0 ? void 0 : _x.edges) === null || _y === void 0 ? void 0 : _y[(_1 = (_0 = (_z = parsedData.thoughts) === null || _z === void 0 ? void 0 : _z[0]) === null || _0 === void 0 ? void 0 : _0.edge_id) !== null && _1 !== void 0 ? _1 : 0]) !== null && _2 !== void 0 ? _2 : null))) : null)) : (react_1["default"].createElement("p", null, "Please click on a node to display information about the question, answer, prompt, and edges."))));
};
exports["default"] = DescriptionPanel;
