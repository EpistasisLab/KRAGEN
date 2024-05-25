import { NodeEditor, GetSchemes, ClassicPreset } from 'rete';

import { AreaPlugin } from 'rete-area-plugin';
import {
  ConnectionPlugin,
  Presets as ConnectionPresets,
} from 'rete-connection-plugin';
import {
  ReactPlugin,
  ReactArea2D,
  Presets as ReactPresets,
} from 'rete-react-plugin';

import { CustomNode } from '../customization/CustomNode';
import { StyledNode } from '../customization/StyledNode';
import { CustomSocket } from '../customization/CustomSocket';
import { CustomConnection } from '../customization/CustomConnection';

import { addCustomBackground } from '../customization/custom-background';

type Schemes = GetSchemes<
  ClassicPreset.Node,
  ClassicPreset.Connection<ClassicPreset.Node, ClassicPreset.Node>
>;
type AreaExtra = ReactArea2D<Schemes>;

const socket = new ClassicPreset.Socket('socket');

export async function createEditor(container: HTMLElement) {
  const editor = new NodeEditor<Schemes>();
  const area = new AreaPlugin<Schemes, AreaExtra>(container);
  const connection = new ConnectionPlugin<Schemes, AreaExtra>();
  const reactRender = new ReactPlugin<Schemes, AreaExtra>();

  reactRender.addPreset(
    ReactPresets.classic.setup({
      customize: {
        node(context) {
          if (context.payload.label === 'Fully customized') {
            return CustomNode;
          }
          if (context.payload.label === 'Override styles') {
            return StyledNode;
          }
          return ReactPresets.classic.Node;
        },
        socket() {
          return CustomSocket;
        },
        connection() {
          return CustomConnection;
        },
      },
    })
  );

  connection.addPreset(ConnectionPresets.classic.setup());

  addCustomBackground(area);

  editor.use(area);
  area.use(connection);
  area.use(reactRender);

  const aLabel = 'Override styles';
  const bLabel = 'Fully customized';

  const a = new ClassicPreset.Node(aLabel);
  a.addOutput('a', new ClassicPreset.Output(socket));
  a.addInput('a', new ClassicPreset.Input(socket));
  await editor.addNode(a);

  const b = new ClassicPreset.Node(bLabel);
  b.addOutput('a', new ClassicPreset.Output(socket));
  b.addInput('a', new ClassicPreset.Input(socket));
  await editor.addNode(b);

  await area.translate(a.id, { x: 0, y: 0 });
  await area.translate(b.id, { x: 300, y: 0 });

  await editor.addConnection(new ClassicPreset.Connection(a, 'a', b, 'a'));

  return {
    destroy: () => area.destroy(),
  };
}
