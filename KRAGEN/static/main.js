const graph = new LGraph();
const canvas = new LGraphCanvas("#graph-canvas", graph);

function createNode(id, title, inputs, outputs) {
    const node = LiteGraph.createNode("basic/node");
    node.id = id;
    node.title = title;
    node.inputs = inputs;
    node.outputs = outputs;
    graph.add(node);
    return node;
}

function createEdge(fromNode, fromOutput, toNode, toInput) {
    fromNode.connect(fromOutput, toNode, toInput);
}



async function generateGraph() {
    const response = await fetch('/generate_graph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: 'Your input here' })
    });
    const data = await response.json();
    
    // Create nodes
    const nodes = data.nodes.map(node => createNode(node.id, node.title, node.inputs, node.outputs));
    
    // Create edges
    data.edges.forEach(edge => {
        const fromNode = nodes.find(n => n.id === edge.from);
        const toNode = nodes.find(n => n.id === edge.to);
        createEdge(fromNode, edge.fromOutput, toNode, edge.toInput);
    });
    
    graph.start();
}

async function runNode(nodeId) {
    const response = await fetch('/run_node', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ node_id: nodeId })
    });
    const data = await response.json();
    console.log(data.result);
}

async function runGraph() {
    const response = await fetch('/run_graph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    console.log(data.result);
}

async function pullKnowledge(input) {
    const response = await fetch('/pull_knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: input })
    });
    const data = await response.json();
    return data.knowledge;
}

document.getElementById('run-graph').addEventListener('click', runGraph);

// Initialize the graph
generateGraph();
