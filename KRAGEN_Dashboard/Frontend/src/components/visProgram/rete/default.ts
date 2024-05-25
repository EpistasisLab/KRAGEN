import { ClassicPreset as Classic, GetSchemes, NodeEditor } from 'rete';

import { Area2D, AreaPlugin } from 'rete-area-plugin';
import {
  ConnectionPlugin,
  Presets as ConnectionPresets,
} from 'rete-connection-plugin';
import {
  ReactPlugin,
  ReactArea2D,
  Presets as ReactPresets,
} from 'rete-react-plugin';

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
  constructor(initial: number, change?: (value: number) => void) {
    super('Number');

    this.addOutput('value', new Classic.Output(socket, 'Number'));
    this.addControl(
      'value',
      new Classic.InputControl('number', { initial, change })
    );
  }
}

class AddNode extends Classic.Node {
  constructor() {
    super('Add');

    this.addInput('a', new Classic.Input(socket, 'A'));
    this.addInput('b', new Classic.Input(socket, 'B'));
    this.addOutput('value', new Classic.Output(socket, 'Number'));
    this.addControl(
      'result',
      new Classic.InputControl('number', { initial: 0, readonly: true })
    );
  }
}

type AreaExtra = Area2D<Schemes> | ReactArea2D<Schemes>;

const socket = new Classic.Socket('socket');

export async function createEditor(container: HTMLElement) {
  const editor = new NodeEditor<Schemes>();
  const area = new AreaPlugin<Schemes, AreaExtra>(container);
  const connection = new ConnectionPlugin<Schemes, AreaExtra>();
  const reactRender = new ReactPlugin<Schemes, AreaExtra>();

  editor.use(area);

  area.use(reactRender);

  area.use(connection);

  connection.addPreset(ConnectionPresets.classic.setup());
  reactRender.addPreset(ReactPresets.classic.setup());

  const a = new NumberNode(1);
  const b = new NumberNode(1);
  const add = new AddNode();

  await editor.addNode(a);
  await editor.addNode(b);
  await editor.addNode(add);

  await editor.addConnection(new Connection(a, 'value', add, 'a'));
  await editor.addConnection(new Connection(b, 'value', add, 'b'));

  await area.nodeViews.get(a.id)?.translate(100, 100);
  await area.nodeViews.get(b.id)?.translate(100, 300);
  await area.nodeViews.get(add.id)?.translate(400, 150);

  return {
    destroy: () => area.destroy(),
  };
}
