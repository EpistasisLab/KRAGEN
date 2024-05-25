import { ClassicPreset as Classic, GetSchemes, NodeEditor } from 'rete';
import { AreaPlugin } from 'rete-area-plugin';

import {
  ReactPlugin,
  ReactArea2D,
  Presets as ReactPresets,
} from 'rete-react-plugin';

class Node extends Classic.Node {
  constructor() {
    super('Perf');

    this.addInput('port', new Classic.Input(socket, 'Input'));
    this.addOutput('port', new Classic.Output(socket, 'Output'));
  }
}

class Connection<A extends Node, B extends Node> extends Classic.Connection<
  A,
  B
> {}

type Schemes = GetSchemes<Node, Connection<Node, Node>>;

type AreaExtra = ReactArea2D<Schemes>;

const socket = new Classic.Socket('socket');

export async function createEditor(container: HTMLElement) {
  const editor = new NodeEditor<Schemes>();
  const area = new AreaPlugin<Schemes, AreaExtra>(container);
  const reactRender = new ReactPlugin<Schemes, AreaExtra>();

  editor.use(area);

  area.use(reactRender);

  reactRender.addPreset(ReactPresets.classic.setup());

  // eslint-disable-next-line no-restricted-globals
  const query = new URLSearchParams(location.search);
  const rows = Number(query.get('rows') || 0) || 12;
  const cols = Number(query.get('cols') || 0) || 12;

  let prev: null | Node = null;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const a = new Node();

      await editor.addNode(a);
      await area.translate(a.id, { x: col * 310, y: row * 190 });

      if (prev) {
        await editor.addConnection(new Connection(prev, 'port', a, 'port'));
      }
      prev = a;
    }
  }

  return {
    destroy: () => area.destroy(),
  };
}
