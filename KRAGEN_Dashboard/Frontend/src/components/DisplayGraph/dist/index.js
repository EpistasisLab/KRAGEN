"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var react_1 = require("react");
var react_sigma_v2_1 = require("react-sigma-v2");
var lodash_1 = require("lodash");
var node_image_1 = require("sigma/rendering/webgl/programs/node.image");
var GraphEventsController_1 = require("./GraphEventsController");
var GraphDataController_1 = require("./GraphDataController");
var DescriptionPanel_1 = require("./DescriptionPanel");
// import drawLabel from "../../canvas-utils";
var canvas_utils_1 = require("./others/canvas-utils");
require("react-sigma-v2/lib/react-sigma-v2.css");
var gr_1 = require("react-icons/gr");
var bi_1 = require("react-icons/bi");
// import ControlPointIcon from "@mui/icons-material/ControlPoint";
var KeyboardArrowUpRounded_1 = require("@mui/icons-material/KeyboardArrowUpRounded");
var KeyboardArrowDownRounded_1 = require("@mui/icons-material/KeyboardArrowDownRounded");
var bs_1 = require("react-icons/bs");
var ErrorBoundary_1 = require("../ErrorBoundary");
var apiService_1 = require("../apiService");
var store_1 = require("../../store/store");
var DisplayGraph = function (_a) {
    var chatInputForGOT = _a.chatInputForGOT, readyToDisplayGOT = _a.readyToDisplayGOT, setReadyToDisplayGOT = _a.setReadyToDisplayGOT, chatCurrentTempId = _a.chatCurrentTempId, setGotLoaded = _a.setGotLoaded, dataReady = _a.dataReady, setDataReady = _a.setDataReady, dataset = _a.dataset, setDataset = _a.setDataset, gotQuestion = _a.gotQuestion, setGotQuestion = _a.setGotQuestion, gotAnswer = _a.gotAnswer, setGotAnswer = _a.setGotAnswer;
    var sigmaContainerRef = react_1.useRef(null);
    var _b = react_1.useState(false), showContents = _b[0], setShowContents = _b[1];
    // const [dataReady, setDataReady] = useState(false);
    // set description for clicked node
    // const [descriptionForClickedNode, setDescriptionForClickedNode] =
    //   useState("");
    var _c = store_1["default"](function (state) {
        return {
            descriptionForClickedNode: state.descriptionForClickedNode,
            setDescriptionForClickedNode: state.setDescriptionForClickedNode
        };
    }), descriptionForClickedNode = _c.descriptionForClickedNode, setDescriptionForClickedNode = _c.setDescriptionForClickedNode;
    // const [dataset, setDataset] = useState<Dataset | null>(null);
    var _d = react_1.useState({
        clusters: {},
        tags: {}
    }), filtersState = _d[0], setFiltersState = _d[1];
    // Node
    var _e = react_1.useState(null), hoveredNode = _e[0], setHoveredNode = _e[1];
    // Egde
    var _f = react_1.useState(null), hoveredEdge = _f[0], setHoveredEdge = _f[1];
    // Egde Label
    var _g = react_1.useState(null), hoveredEdgeLabel = _g[0], setHoveredEdgeLabel = _g[1];
    // toggle for controlpanel
    var _h = react_1.useState(true), toggleControlPanel = _h[0], setToggleControlPanel = _h[1];
    var _j = react_1.useState({ x: 0, y: 0 }), mousePosition = _j[0], setMousePosition = _j[1];
    //
    // const [isLoading, setIsLoading] = useState(false); // loading icon show
    // // question and answer state
    // const [question, setQuestion] = useState("");
    // const [answer, setAnswer] = useState("");
    // Track mouse position
    react_1.useEffect(function () {
        var handleMouseMove = function (e) {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return function () {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);
    // edge label display
    // Style for the label display
    var labelStyle = {
        position: "absolute",
        left: mousePosition.x + 1000 + "px",
        top: mousePosition.y - 100 + "px",
        transform: "translate(-1000%, -1000%)"
    };
    // original
    react_1.useEffect(function () {
        var fetchData = function () { return __awaiter(void 0, void 0, void 0, function () {
            var res, dataset_1, chatid_list, datasetString, sideMenuButtons, i, button, newchatbuttonForGOT, newchatbutton, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(readyToDisplayGOT === true &&
                            dataset === "" &&
                            chatInputForGOT !== "")) return [3 /*break*/, 8];
                        // setIsLoading(true); // loading icon show
                        setGotLoaded(false);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, fetch(process.env.REACT_APP_API_URL + ":" + process.env.REACT_APP_API_PORT + "/chatapi/v1/got", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    chatInput: chatInputForGOT
                                })
                            })];
                    case 2:
                        res = _a.sent();
                        return [4 /*yield*/, res.json()];
                    case 3:
                        dataset_1 = _a.sent();
                        return [4 /*yield*/, apiService_1.savedChatIDs()];
                    case 4:
                        chatid_list = _a.sent();
                        datasetString = JSON.stringify(dataset_1);
                        return [4 /*yield*/, apiService_1.postInChatlogsToDB(chatid_list[Number(chatCurrentTempId) - 1], 
                            // chatInputForGOT,
                            // dataset,
                            datasetString, "text", "gpt")];
                    case 5:
                        _a.sent();
                        setDataset(dataset_1);
                        // setReadyToDisplayGOT(true);
                        // set question and answer
                        setGotQuestion(dataset_1.question);
                        setGotAnswer(dataset_1.answer);
                        setFiltersState({
                            clusters: lodash_1.mapValues(lodash_1.keyBy(dataset_1.clusters, "key"), lodash_1.constant(true)),
                            tags: lodash_1.mapValues(lodash_1.keyBy(dataset_1.tags, "key"), lodash_1.constant(true))
                        });
                        requestAnimationFrame(function () {
                            setDataReady(true);
                            setGotLoaded(true);
                        });
                        sideMenuButtons = document.getElementsByClassName("divsidemenuForGOT");
                        if (sideMenuButtons) {
                            for (i = 0; i < sideMenuButtons.length; i++) {
                                button = sideMenuButtons[i];
                                button.style.pointerEvents = "auto";
                            }
                        }
                        newchatbuttonForGOT = document.getElementById("newchatbuttonForGOT");
                        newchatbutton = newchatbuttonForGOT;
                        newchatbutton.style.pointerEvents = "auto";
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _a.sent();
                        console.error("Failed to fetch data:", error_1);
                        // Handle the error accordingly
                        // setIsLoading(false); // Ensure loading icon is hidden in case of error
                        setDataReady(false);
                        setGotLoaded(false);
                        return [3 /*break*/, 7];
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        if (readyToDisplayGOT === true &&
                            dataset !== "" &&
                            chatInputForGOT === "") {
                            // setIsLoading(true); // loading icon show
                            setGotLoaded(false);
                            try {
                                setDataset(dataset);
                                // set question and answer
                                // setQuestion("Question: " + gotQuestion);
                                // setAnswer("Answer: " + gotAnswer);
                                setGotQuestion(dataset.question);
                                setGotAnswer(dataset.answer);
                                setFiltersState({
                                    clusters: lodash_1.mapValues(lodash_1.keyBy(dataset.clusters, "key"), lodash_1.constant(true)),
                                    tags: lodash_1.mapValues(lodash_1.keyBy(dataset.tags, "key"), lodash_1.constant(true))
                                });
                                requestAnimationFrame(function () {
                                    setDataReady(true);
                                    setGotLoaded(true);
                                    // setIsLoading(false);
                                    // setIsLoading(false);
                                });
                            }
                            catch (error) {
                                console.error("Failed to fetch data:", error);
                                // Handle the error accordingly
                                // setIsLoading(false); // Ensure loading icon is hidden in case of error
                                setDataReady(false);
                                setGotLoaded(false);
                            }
                        }
                        _a.label = 9;
                    case 9: return [2 /*return*/];
                }
            });
        }); };
        fetchData();
    }, [readyToDisplayGOT, dataReady]); // Only re-run the effect if readyToDisplayGOT GOTJSON changes
    if (!dataset)
        return null;
    return (
    // <ErrorBoundary>
    // descriptionForClickedNode
    // when descriptionForClickedNode is not null, show below
    // {descriptionForClickedNode !== null
    react_1["default"].createElement(ErrorBoundary_1["default"], null,
        react_1["default"].createElement(react_sigma_v2_1.SigmaContainer, { graphOptions: { type: "directed" }, initialSettings: {
                nodeProgramClasses: { image: node_image_1["default"]() },
                labelRenderer: canvas_utils_1["default"],
                defaultNodeType: "image",
                defaultEdgeType: "arrow",
                labelDensity: 0.07,
                labelGridCellSize: 60,
                labelRenderedSizeThreshold: 15,
                labelFont: "Lato, sans-serif",
                zIndex: true,
                allowInvalidContainer: true
            }, 
            // settings={{
            //   autoRescale: true,
            //   allowInvalidContainer: true,
            // }}
            className: "react-sigma" }, readyToDisplayGOT && dataReady && (react_1["default"].createElement(react_1["default"].Fragment, null,
            react_1["default"].createElement(ErrorBoundary_1["default"], null,
                react_1["default"].createElement(GraphEventsController_1["default"], { setHoveredNode: setHoveredNode, setHoveredEdge: setHoveredEdge, setHoveredEdgeLabel: setHoveredEdgeLabel, setDescriptionForClickedNode: setDescriptionForClickedNode })),
            react_1["default"].createElement(ErrorBoundary_1["default"], null,
                react_1["default"].createElement(GraphDataController_1["default"], { dataset: dataset, filters: filtersState })),
            react_1["default"].createElement("div", { className: "controls" },
                react_1["default"].createElement("div", { className: "ico" },
                    react_1["default"].createElement("button", { type: "button", className: "show-contents", onClick: function () { return setShowContents(true); }, title: "Show caption and description" },
                        react_1["default"].createElement(bi_1.BiBookContent, null))),
                react_1["default"].createElement(react_sigma_v2_1.FullScreenControl, { className: "ico", customEnterFullScreen: react_1["default"].createElement(bs_1.BsArrowsFullscreen, null), customExitFullScreen: react_1["default"].createElement(bs_1.BsFullscreenExit, null) }),
                react_1["default"].createElement(react_sigma_v2_1.ZoomControl, { className: "ico", customZoomIn: react_1["default"].createElement(bs_1.BsZoomIn, null), customZoomOut: react_1["default"].createElement(bs_1.BsZoomOut, null), customZoomCenter: react_1["default"].createElement(bi_1.BiRadioCircleMarked, null) }),
                hoveredEdgeLabel && (react_1["default"].createElement("div", { className: "edge-label-display", style: labelStyle }, hoveredEdgeLabel))),
            react_1["default"].createElement("div", { className: "contents" },
                react_1["default"].createElement("div", { className: "ico" },
                    react_1["default"].createElement("button", { type: "button", className: "ico hide-contents", onClick: function () { return setShowContents(false); }, title: "Show caption and description" },
                        react_1["default"].createElement(gr_1.GrClose, null))),
                react_1["default"].createElement("div", { className: "panels" },
                    react_1["default"].createElement("div", { className: "flex justify-end" }, toggleControlPanel === false ? (react_1["default"].createElement(KeyboardArrowUpRounded_1["default"], { style: {
                            color: "white",
                            fontSize: "70px",
                            cursor: "pointer"
                        }, onClick: function (event) {
                            // Find the closest element with the class 'panels'
                            var target = event.target; // Ensuring the target is seen as an HTMLElement
                            var closestPanel = target.closest(".panels");
                            // If a 'panels' element is found, change its width to 100%
                            if (closestPanel) {
                                closestPanel.style.width = "350px";
                            }
                            // Additional action
                            setToggleControlPanel(true);
                        } })) : (react_1["default"].createElement(KeyboardArrowDownRounded_1["default"], { style: {
                            color: "white",
                            fontSize: "70px",
                            cursor: "pointer"
                        }, onClick: function (event) {
                            // Find the closest element with the class 'panels'
                            var target = event.target; // Ensuring the target is seen as an HTMLElement
                            var closestPanel = target.closest(".panels");
                            // If a 'panels' element is found, change its width to 100%
                            if (closestPanel) {
                                closestPanel.style.width = "100px";
                            }
                            // Additional action
                            setToggleControlPanel(false);
                        } }))),
                    toggleControlPanel && (react_1["default"].createElement(react_1["default"].Fragment, null,
                        react_1["default"].createElement(ErrorBoundary_1["default"], null,
                            react_1["default"].createElement(DescriptionPanel_1["default"], { descriptionForClickedNode: descriptionForClickedNode, setDescriptionForClickedNode: setDescriptionForClickedNode, chatCurrentTempId: chatCurrentTempId })))))))))));
};
exports["default"] = DisplayGraph;
