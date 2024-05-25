import { ClassicPreset as Classic, GetSchemes, NodeEditor } from "rete";

import { Area3D, Area3DExtensions, Area3DPlugin } from "rete-area-3d-plugin";
import {
  ConnectionPlugin,
  Presets as ConnectionPresets,
} from "rete-connection-plugin";
import {
  ReactPlugin,
  ReactArea2D,
  Presets as ReactPresets,
} from "rete-react-plugin";

import * as THREE from "three";

type Node = NumberNode | AddNode;
type Conn =
  | Connection<NumberNode, AddNode>
  | Connection<AddNode, AddNode>
  | Connection<AddNode, NumberNode>;
type Schemes = GetSchemes<Node, Conn>;

class Connection<A extends Node, B extends Node> extends Classic.Connection<
  A,
  B
> {}

class NumberNode extends Classic.Node {
  width = 180;
  height = 120;

  constructor(initial: number, change?: (value: number) => void) {
    super("Number");

    this.addOutput("value", new Classic.Output(socket, "Number"));
    this.addControl(
      "value",
      new Classic.InputControl("number", { initial, change })
    );
  }
}

class AddNode extends Classic.Node {
  width = 180;
  height = 195;

  constructor() {
    super("Add");

    this.addInput("a", new Classic.Input(socket, "A"));
    this.addInput("b", new Classic.Input(socket, "B"));
    this.addOutput("value", new Classic.Output(socket, "Number"));
    this.addControl(
      "result",
      new Classic.InputControl("number", { initial: 0, readonly: true })
    );
  }
}

type AreaExtra = Area3D<Schemes> | ReactArea2D<Schemes>;

const socket = new Classic.Socket("socket");

export async function createEditor(container: HTMLElement) {
  const editor = new NodeEditor<Schemes>();
  const area = new Area3DPlugin<Schemes, AreaExtra>(container);
  const connection = new ConnectionPlugin<Schemes, AreaExtra>();
  const reactRender = new ReactPlugin<Schemes, AreaExtra>();

  editor.use(area);
  area.use(reactRender);

  area.use(connection);

  connection.addPreset(ConnectionPresets.classic.setup());
  reactRender.addPreset(ReactPresets.classic.setup());

  Area3DExtensions.forms.connection(reactRender);

  Area3DExtensions.forms.node(area);

  const a = new NumberNode(1);
  const b = new NumberNode(1);
  const add = new AddNode();

  await editor.addNode(a);
  await editor.addNode(b);
  await editor.addNode(add);

  await editor.addConnection(new Connection(a, "value", add, "a"));
  await editor.addConnection(new Connection(b, "value", add, "b"));

  await area.translate(a.id, { x: 12, y: 35 });
  await area.translate(b.id, { x: 12, y: 172 });
  await area.translate(add.id, { x: 250, y: 12 });

  const axesHelper = new THREE.AxesHelper(100);
  const gridHelper = new THREE.GridHelper(10000, 100);

  gridHelper.translateY(-320);

  area.area.scene.root.add(axesHelper);
  area.area.scene.root.add(gridHelper);

  Area3DExtensions.animate(area);

  return {
    destroy: () => area.destroy(),
  };
}
