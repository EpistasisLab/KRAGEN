"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var react_1 = require("react");
var react_sigma_v2_1 = require("react-sigma-v2");
var lodash_1 = require("lodash");
var node_image_1 = require("sigma/rendering/webgl/programs/node.image");
var GraphSettingsController_1 = require("./GraphSettingsController");
var GraphEventsController_1 = require("./GraphEventsController");
var GraphDataController_1 = require("./GraphDataController");
var DescriptionPanel_1 = require("./DescriptionPanel");
var ClustersPanel_1 = require("./ClustersPanel");
var SearchField_1 = require("./SearchField");
// import drawLabel from "../../canvas-utils";
var canvas_utils_1 = require("./others/canvas-utils");
var GraphTitle_1 = require("./GraphTitle");
var TagsPanel_1 = require("./TagsPanel");
require("react-sigma-v2/lib/react-sigma-v2.css");
var gr_1 = require("react-icons/gr");
var bi_1 = require("react-icons/bi");
var bs_1 = require("react-icons/bs");
var Root = function () {
    var _a = react_1.useState(false), showContents = _a[0], setShowContents = _a[1];
    var _b = react_1.useState(false), dataReady = _b[0], setDataReady = _b[1];
    var _c = react_1.useState(null), dataset = _c[0], setDataset = _c[1];
    var _d = react_1.useState({
        clusters: {},
        tags: {}
    }), filtersState = _d[0], setFiltersState = _d[1];
    var _e = react_1.useState(null), hoveredNode = _e[0], setHoveredNode = _e[1];
    // Load data on mount:
    react_1.useEffect(function () {
        fetch(process.env.PUBLIC_URL + "/dataset.json")
            .then(function (res) { return res.json(); })
            .then(function (dataset) {
            setDataset(dataset);
            setFiltersState({
                clusters: lodash_1.mapValues(lodash_1.keyBy(dataset.clusters, "key"), lodash_1.constant(true)),
                tags: lodash_1.mapValues(lodash_1.keyBy(dataset.tags, "key"), lodash_1.constant(true))
            });
            requestAnimationFrame(function () { return setDataReady(true); });
        });
    }, []);
    if (!dataset)
        return null;
    return (
    // <div id="dispnetgra" className={showContents ? "show-contents" : ""}>
    // <div id="dispnetgra" className={showContents ? "show-contents" : ""}>
    react_1["default"].createElement(react_sigma_v2_1.SigmaContainer, { graphOptions: { type: "directed" }, initialSettings: {
            nodeProgramClasses: { image: node_image_1["default"]() },
            labelRenderer: canvas_utils_1["default"],
            defaultNodeType: "image",
            defaultEdgeType: "arrow",
            labelDensity: 0.07,
            labelGridCellSize: 60,
            labelRenderedSizeThreshold: 15,
            labelFont: "Lato, sans-serif",
            zIndex: true
        }, className: "react-sigma" },
        react_1["default"].createElement(GraphSettingsController_1["default"], { hoveredNode: hoveredNode }),
        react_1["default"].createElement(GraphEventsController_1["default"], { setHoveredNode: setHoveredNode }),
        react_1["default"].createElement(GraphDataController_1["default"], { dataset: dataset, filters: filtersState }),
        dataReady && (react_1["default"].createElement(react_1["default"].Fragment, null,
            react_1["default"].createElement("div", { className: "controls" },
                react_1["default"].createElement("div", { className: "ico" },
                    react_1["default"].createElement("button", { type: "button", className: "show-contents", onClick: function () { return setShowContents(true); }, title: "Show caption and description" },
                        react_1["default"].createElement(bi_1.BiBookContent, null))),
                react_1["default"].createElement(react_sigma_v2_1.FullScreenControl, { className: "ico", customEnterFullScreen: react_1["default"].createElement(bs_1.BsArrowsFullscreen, null), customExitFullScreen: react_1["default"].createElement(bs_1.BsFullscreenExit, null) }),
                react_1["default"].createElement(react_sigma_v2_1.ZoomControl, { className: "ico", customZoomIn: react_1["default"].createElement(bs_1.BsZoomIn, null), customZoomOut: react_1["default"].createElement(bs_1.BsZoomOut, null), customZoomCenter: react_1["default"].createElement(bi_1.BiRadioCircleMarked, null) })),
            react_1["default"].createElement("div", { className: "contents" },
                react_1["default"].createElement("div", { className: "ico" },
                    react_1["default"].createElement("button", { type: "button", className: "ico hide-contents", onClick: function () { return setShowContents(false); }, title: "Show caption and description" },
                        react_1["default"].createElement(gr_1.GrClose, null))),
                react_1["default"].createElement(GraphTitle_1["default"], { filters: filtersState }),
                react_1["default"].createElement("div", { className: "panels" },
                    react_1["default"].createElement(SearchField_1["default"], { filters: filtersState }),
                    react_1["default"].createElement(DescriptionPanel_1["default"], null),
                    react_1["default"].createElement(ClustersPanel_1["default"], { clusters: dataset.clusters, filters: filtersState, setClusters: function (clusters) {
                            return setFiltersState(function (filters) { return (__assign(__assign({}, filters), { clusters: clusters })); });
                        }, toggleCluster: function (cluster) {
                            setFiltersState(function (filters) {
                                var _a;
                                return (__assign(__assign({}, filters), { clusters: filters.clusters[cluster]
                                        ? lodash_1.omit(filters.clusters, cluster)
                                        : __assign(__assign({}, filters.clusters), (_a = {}, _a[cluster] = true, _a)) }));
                            });
                        } }),
                    react_1["default"].createElement(TagsPanel_1["default"], { tags: dataset.tags, filters: filtersState, setTags: function (tags) {
                            return setFiltersState(function (filters) { return (__assign(__assign({}, filters), { tags: tags })); });
                        }, toggleTag: function (tag) {
                            setFiltersState(function (filters) {
                                var _a;
                                return (__assign(__assign({}, filters), { tags: filters.tags[tag] ? lodash_1.omit(filters.tags, tag) : __assign(__assign({}, filters.tags), (_a = {}, _a[tag] = true, _a)) }));
                            });
                        } }))))))
    // </div>
    );
};
exports["default"] = Root;
