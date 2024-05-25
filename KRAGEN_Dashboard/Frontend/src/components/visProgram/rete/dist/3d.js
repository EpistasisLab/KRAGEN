"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.createEditor = void 0;
var rete_1 = require("rete");
var rete_area_3d_plugin_1 = require("rete-area-3d-plugin");
var rete_connection_plugin_1 = require("rete-connection-plugin");
var rete_react_plugin_1 = require("rete-react-plugin");
var THREE = require("three");
var Connection = /** @class */ (function (_super) {
    __extends(Connection, _super);
    function Connection() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Connection;
}(rete_1.ClassicPreset.Connection));
var NumberNode = /** @class */ (function (_super) {
    __extends(NumberNode, _super);
    function NumberNode(initial, change) {
        var _this = _super.call(this, "Number") || this;
        _this.width = 180;
        _this.height = 120;
        _this.addOutput("value", new rete_1.ClassicPreset.Output(socket, "Number"));
        _this.addControl("value", new rete_1.ClassicPreset.InputControl("number", { initial: initial, change: change }));
        return _this;
    }
    return NumberNode;
}(rete_1.ClassicPreset.Node));
var AddNode = /** @class */ (function (_super) {
    __extends(AddNode, _super);
    function AddNode() {
        var _this = _super.call(this, "Add") || this;
        _this.width = 180;
        _this.height = 195;
        _this.addInput("a", new rete_1.ClassicPreset.Input(socket, "A"));
        _this.addInput("b", new rete_1.ClassicPreset.Input(socket, "B"));
        _this.addOutput("value", new rete_1.ClassicPreset.Output(socket, "Number"));
        _this.addControl("result", new rete_1.ClassicPreset.InputControl("number", { initial: 0, readonly: true }));
        return _this;
    }
    return AddNode;
}(rete_1.ClassicPreset.Node));
var socket = new rete_1.ClassicPreset.Socket("socket");
function createEditor(container) {
    return __awaiter(this, void 0, void 0, function () {
        var editor, area, connection, reactRender, a, b, add, axesHelper, gridHelper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    editor = new rete_1.NodeEditor();
                    area = new rete_area_3d_plugin_1.Area3DPlugin(container);
                    connection = new rete_connection_plugin_1.ConnectionPlugin();
                    reactRender = new rete_react_plugin_1.ReactPlugin();
                    editor.use(area);
                    area.use(reactRender);
                    area.use(connection);
                    connection.addPreset(rete_connection_plugin_1.Presets.classic.setup());
                    reactRender.addPreset(rete_react_plugin_1.Presets.classic.setup());
                    rete_area_3d_plugin_1.Area3DExtensions.forms.connection(reactRender);
                    rete_area_3d_plugin_1.Area3DExtensions.forms.node(area);
                    a = new NumberNode(1);
                    b = new NumberNode(1);
                    add = new AddNode();
                    return [4 /*yield*/, editor.addNode(a)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, editor.addNode(b)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, editor.addNode(add)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, editor.addConnection(new Connection(a, "value", add, "a"))];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, editor.addConnection(new Connection(b, "value", add, "b"))];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, area.translate(a.id, { x: 12, y: 35 })];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, area.translate(b.id, { x: 12, y: 172 })];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, area.translate(add.id, { x: 250, y: 12 })];
                case 8:
                    _a.sent();
                    axesHelper = new THREE.AxesHelper(100);
                    gridHelper = new THREE.GridHelper(10000, 100);
                    gridHelper.translateY(-320);
                    area.area.scene.root.add(axesHelper);
                    area.area.scene.root.add(gridHelper);
                    rete_area_3d_plugin_1.Area3DExtensions.animate(area);
                    return [2 /*return*/, {
                            destroy: function () { return area.destroy(); }
                        }];
            }
        });
    });
}
exports.createEditor = createEditor;
