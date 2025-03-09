var webgl_canvas = null;

LiteGraph.node_images_path = "../nodes_data/";

var editor = new LiteGraph.Editor("main", {
    miniwindow: false,
    skip_load_counter: true
});
window.graphcanvas = editor.graphcanvas;
window.graph = editor.graph;
updateEditorHiPPICanvas();
window.addEventListener("resize", function() { 
  editor.graphcanvas.resize();
  updateEditorHiPPICanvas();
} );
//window.addEventListener("keydown", editor.graphcanvas.processKey.bind(editor.graphcanvas) );
window.onbeforeunload = function(){
	var data = JSON.stringify( graph.serialize() );
	localStorage.setItem("litegraphg demo backup", data );
}

function updateEditorHiPPICanvas() {
  const ratio = window.devicePixelRatio;
  if(ratio == 1) { return }
  const rect = editor.canvas.parentNode.getBoundingClientRect();
  const { width, height } = rect;
  editor.canvas.width = width * ratio;
  editor.canvas.height = height * ratio;
  editor.canvas.style.width = width + "px";
  editor.canvas.style.height = height + "px";
  editor.canvas.getContext("2d").scale(ratio, ratio);
  return editor.canvas;
}

//enable scripting
LiteGraph.allow_scripts = true;

//test
//editor.graphcanvas.viewport = [200,200,400,400];

//create scene selector
var elem = document.createElement("span");
elem.id = "LGEditorTopBarSelector";
elem.className = "selector";
elem.innerHTML = `
    <button class='btn' id='quicksave'>Quick Save</button>
    <button class='btn' id='quickload'>Quick Load</button>
    <button class='btn' id='save'>Save As...</button>
    <button class='btn' id='load'>Load...</button>
    <button class='btn' id='download'>Download</button>
    <span id='feedback' style='margin-left: 10px; color: #8f8;'></span>
`;
editor.tools.appendChild(elem);

// Function to show feedback message
function showFeedback(message, isSuccess = true) {
    var feedback = elem.querySelector("#feedback");
    feedback.style.color = isSuccess ? "#8f8" : "#f88";
    feedback.textContent = message;
    // Clear the message after 2 seconds
    setTimeout(() => {
        feedback.textContent = "";
    }, 2000);
}

// Create modal dialog for save/load
function createDialog(title, onAccept, options = {}) {
    var dialog = document.createElement("div");
    dialog.className = "graphdialog";
    dialog.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #2a2a2a;
        padding: 20px;
        border-radius: 5px;
        z-index: 1000;
        min-width: 300px;
        box-shadow: 0 0 10px rgba(0,0,0,0.5);
    `;

    var content = `
        <h3 style="margin-top: 0; color: #fff;">${title}</h3>
        ${options.type === 'load' ? 
            `<select id="loadSelect" style="width: 100%; margin-bottom: 10px; padding: 5px;">
                ${options.saves.map(save => `<option value="${save}">${save}</option>`).join('')}
            </select>` :
            `<input type="text" id="saveName" placeholder="Enter graph name" style="width: 100%; margin-bottom: 10px; padding: 5px;">`
        }
        <div style="text-align: right;">
            <button id="cancelBtn" style="margin-right: 10px;">Cancel</button>
            <button id="acceptBtn">${options.type === 'load' ? 'Load' : 'Save'}</button>
        </div>
    `;
    
    dialog.innerHTML = content;
    document.body.appendChild(dialog);

    dialog.querySelector("#cancelBtn").onclick = () => {
        document.body.removeChild(dialog);
    };

    dialog.querySelector("#acceptBtn").onclick = () => {
        const value = options.type === 'load' ? 
            dialog.querySelector("#loadSelect").value :
            dialog.querySelector("#saveName").value;
        onAccept(value);
        document.body.removeChild(dialog);
    };
}

// Quick Save/Load handlers
elem.querySelector("#quicksave").addEventListener("click", function() {
    try {
        localStorage.setItem("graphdemo_save", JSON.stringify(graph.serialize()));
        showFeedback("Graph quick-saved successfully!");
    } catch (error) {
        showFeedback("Error quick-saving graph: " + error.message, false);
    }
});

elem.querySelector("#quickload").addEventListener("click", function() {
    try {
        var data = localStorage.getItem("graphdemo_save");
        if(data) {
            graph.configure(JSON.parse(data));
            showFeedback("Graph quick-loaded successfully!");
        } else {
            showFeedback("No quick-saved graph found", false);
        }
    } catch (error) {
        showFeedback("Error loading graph: " + error.message, false);
    }
});

// Full Save/Load handlers
elem.querySelector("#save").addEventListener("click", function() {
    createDialog("Save Graph", (graphName) => {
        if (!graphName) {
            showFeedback("Please enter a name for the graph", false);
            return;
        }
        try {
            // Get existing saves
            let saves = JSON.parse(localStorage.getItem("kragen_saves") || "{}");
            // Add new save
            saves[graphName] = graph.serialize();
            // Store back
            localStorage.setItem("kragen_saves", JSON.stringify(saves));
            showFeedback(`Graph "${graphName}" saved successfully!`);
        } catch (error) {
            showFeedback("Error saving graph: " + error.message, false);
        }
    }, { type: 'save' });
});

elem.querySelector("#load").addEventListener("click", function() {
    try {
        // Get existing saves
        let saves = JSON.parse(localStorage.getItem("kragen_saves") || "{}");
        let saveNames = Object.keys(saves);
        
        if (saveNames.length === 0) {
            showFeedback("No saved graphs found", false);
            return;
        }

        createDialog("Load Graph", (graphName) => {
            try {
                let graphData = saves[graphName];
                if (graphData) {
                    graph.configure(graphData);
                    showFeedback(`Graph "${graphName}" loaded successfully!`);
                }
            } catch (error) {
                showFeedback("Error loading graph: " + error.message, false);
            }
        }, { type: 'load', saves: saveNames });
    } catch (error) {
        showFeedback("Error loading saved graphs: " + error.message, false);
    }
});

elem.querySelector("#download").addEventListener("click",function(){
    try {
        var data = JSON.stringify(graph.serialize());
        var file = new Blob([data]);
        var url = URL.createObjectURL(file);
        var element = document.createElement("a");
        element.setAttribute('href', url);
        element.setAttribute('download', "graph.JSON");
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        setTimeout(function(){ URL.revokeObjectURL(url); }, 1000*60); //wait one minute to revoke url
        showFeedback("Graph downloaded successfully!");
    } catch (error) {
        showFeedback("Error downloading graph: " + error.message, false);
    }
});

// Simplified initialization function
function initializeDefaultGraph() {
    // Clear the current graph
    graph.clear();

    // Create a Generate Plans node
    var node = LiteGraph.createNode("KRAGEN/Generate_Plans");
    
    // Position in center of canvas
    var canvasWidth = editor.canvas.width / window.devicePixelRatio;
    var canvasHeight = editor.canvas.height / window.devicePixelRatio;
    node.pos = [(canvasWidth - node.size[0]) / 2, (canvasHeight - node.size[1]) / 2];
    
    // Add to graph
    graph.add(node);

    // Configure default properties
    node.properties = {
        prompt: "Enter your prompt here",
        response: ""
    };
}

// Run initialization automatically when page loads
window.addEventListener('load', function() {
    setTimeout(initializeDefaultGraph, 100); // Small delay to ensure everything is loaded
});

LiteGraph.clearRegisteredTypes();

// Tests
// CopyPasteWithConnectionToUnselectedOutputTest();
// demo();

// Add default demo with KRAGEN Generate Plans node
/*
function setupDefaultDemo() {
    // Create a Generate Plans node
    var node = LiteGraph.createNode("KRAGEN/Generate_Plans");
    
    // Position in center of canvas
    var canvasWidth = editor.canvas.width / window.devicePixelRatio;
    var canvasHeight = editor.canvas.height / window.devicePixelRatio;
    node.pos = [(canvasWidth - node.size[0]) / 2, (canvasHeight - node.size[1]) / 2];
    
    // Add to graph
    graph.add(node);
}
*/

// Call setup after all node types are registered
/*
setupDefaultDemo();
*/

/********************* KRAGEN Generate Plans Node******************************/

// GeneratePlansNode
function GeneratePlansNode() {
    this.addInput("trigger", LiteGraph.ACTION);
    this.addOutput("plans", "string");
    this.addProperty("prompt", "Enter your prompt here");
    this.addProperty("response", "");
    this.size = [300, 200];
    this.serialize_widgets = true;
    this.widgets_up = true;
    this.resizable = true;
    this.start_endpoint = "/generate_plans"
}

GeneratePlansNode.title = "Generate Plans";
GeneratePlansNode.desc = "Generate a plan based on the input prompt";

GeneratePlansNode.prototype.onDrawForeground = function(ctx) {
    if (!this.flags.collapsed) {
        ctx.save();
        ctx.font = "12px Arial";
        
        var headerHeight = 40;
        var padding = 15;
        var availableHeight = (this.size[1] - headerHeight - padding * 3) / 3;

        ctx.fillStyle = "#AAA";
        ctx.fillText("Prompt:", padding, headerHeight);
        ctx.fillStyle = "#CCC";
        this.drawMultilineText(ctx, this.properties.prompt, padding, headerHeight + padding, this.size[0] - padding * 2, availableHeight);
        
        ctx.fillStyle = "#AAA";
        ctx.fillText("Response:", padding, headerHeight + availableHeight + padding * 2);
        ctx.fillStyle = "#CCC";
        this.drawMultilineText(ctx, this.properties.response, padding, headerHeight + availableHeight + padding * 3, this.size[0] - padding * 2, availableHeight*2);
        
        ctx.restore();
    }
};

GeneratePlansNode.prototype.drawMultilineText = function(ctx, text, x, y, maxWidth, maxHeight) {
    var lines = text.split('\n');
    var lineHeight = 15;
    var currentY = y;

    for (var i = 0; i < lines.length; i++) {
        var words = lines[i].split(' ');
        var line = '';

        for (var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + ' ';
            var metrics = ctx.measureText(testLine);
            var testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, currentY);
                line = words[n] + ' ';
                currentY += lineHeight;
                if (currentY > y + maxHeight) {
                    ctx.fillText('...', x, currentY);
                    return;
                }
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentY);
        currentY += lineHeight;
        if (currentY > y + maxHeight) {
            ctx.fillText('...', x, currentY);
            return;
        }
    }
};

GeneratePlansNode.prototype.onExecute = function() {
    var that = this;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", this.start_endpoint, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            that.setOutputData(0, response.thoughts);

            // Create a new GenerateCodeFromPlansNode
            var graph = that.graph;
            var newNode = LiteGraph.createNode("KRAGEN/Generate_Code_From_Plans");
            console.log(newNode);
            newNode.pos = [that.pos[0] + 500, that.pos[1]]; // Position to the right of the current node
            graph.add(newNode);
            
            // Connect the output of GeneratePlansNode to the input of GenerateCodeFromPlansNode
            that.connect(0, newNode.id, 0);

            //

            // Update the response property
            that.properties.response = response.thoughts;

            // Draw the updated response in the node
            that.graphcanvas.draw(true);

            // Show the response in the console
            console.log(response);
        }
    };
    xhr.send(JSON.stringify({ input: this.properties.prompt }));
};

GeneratePlansNode.prototype.showDialog = function(graphcanvas) {
    var that = this;
    var dialog = document.createElement("div");
    dialog.className = "graphdialog";
    dialog.innerHTML = `
        <div style="display: flex; height: calc(100% - 40px);">
            <div style="flex: 1; padding-right: 10px;">
                <label for="node-prompt-text">Prompt:</label>
                <textarea id="node-prompt-text" rows="30" cols="20" style="width:100%; height: calc(100% - 30px);">${that.properties.prompt}</textarea>
            </div>
            <div style="width: 1px; background-color: #666;"></div>
            <div style="flex: 1; padding-left: 10px;">
                <label for="node-response-text">Response:</label>
                <textarea id="node-response-text" rows="30" cols="40" style="width:100%; height: calc(100% - 30px);">${that.properties.response}</textarea>
            </div>
        </div>
        <div style="text-align:center; margin-top:10px;">
            <button id="node-dialog-submit">Submit</button>
            <button id="node-dialog-cancel">Cancel</button>
        </div>
    `;
    
    dialog.style.position = "fixed";
    dialog.style.top = "50%";
    dialog.style.left = "50%";
    dialog.style.transform = "translate(-50%, -50%)";
    dialog.style.backgroundColor = "#444";
    dialog.style.padding = "20px";
    dialog.style.borderRadius = "5px";
    dialog.style.zIndex = "1000";
    dialog.style.width = "80%";
    dialog.style.height = "80%";
    dialog.style.display = "flex";
    dialog.style.flexDirection = "column";

    var root = graphcanvas.canvas.parentNode;
    root.appendChild(dialog);

    var promptTextarea = dialog.querySelector("#node-prompt-text");
    var responseTextarea = dialog.querySelector("#node-response-text");
    var submit = dialog.querySelector("#node-dialog-submit");
    var cancel = dialog.querySelector("#node-dialog-cancel");

    submit.addEventListener("click", function() {
        that.properties.prompt = promptTextarea.value;
        that.properties.response = responseTextarea.value;
        root.removeChild(dialog);
    });

    cancel.addEventListener("click", function() {
        root.removeChild(dialog);
    });
};

// Handle double-click event
GeneratePlansNode.prototype.onDblClick = function(e, pos, graphcanvas) {
    this.showDialog(graphcanvas);
};

// Custom property widget for larger text area
GeneratePlansNode.prototype.getExtraMenuOptions = function(graphcanvas) {
    var that = this;
    return [
        {
            content: "Edit Prompt and Response",
            callback: function() {
                that.showDialog(graphcanvas);
            }
        }
    ];
};

// Define how the properties should be shown in the inspector
GeneratePlansNode.prototype.onInspect = function(inspector) {
    var that = this;
    inspector.addTextarea("prompt", this.properties.prompt, { callback: function(v) { that.properties.prompt = v; } });
    inspector.addTextarea("response", this.properties.response, { callback: function(v) { that.properties.response = v; } });
};

LiteGraph.registerNodeType("KRAGEN/Generate_Plans", GeneratePlansNode);

/********************* Python Prompt Node******************************/

function LLMPromptNode() {
    this.addInput("trigger", LiteGraph.ACTION);
    this.addOutput("result", "string");
    this.addProperty("prompt", "Enter your prompt here");
    this.addProperty("response", "");
    this.size = [300, 200];
    this.serialize_widgets = true;
    this.widgets_up = true;
    this.resizable = true;
}

LLMPromptNode.title = "LLM Prompt";
LLMPromptNode.desc = "Send a prompt to the LLM and display response";

LLMPromptNode.prototype.onDrawForeground = function(ctx) {
    if (!this.flags.collapsed) {
        ctx.save();
        ctx.font = "12px Arial";
        
        var headerHeight = 40;
        var padding = 15;
        var availableHeight = (this.size[1] - headerHeight - padding * 3) / 2;

        ctx.fillStyle = "#AAA";
        ctx.fillText("Prompt:", padding, headerHeight);
        ctx.fillStyle = "#CCC";
        this.drawMultilineText(ctx, this.properties.prompt, padding, headerHeight + padding, this.size[0] - padding * 2, availableHeight);
        
        ctx.fillStyle = "#AAA";
        ctx.fillText("Response:", padding, headerHeight + availableHeight + padding * 2);
        ctx.fillStyle = "#CCC";
        this.drawMultilineText(ctx, this.properties.response, padding, headerHeight + availableHeight + padding * 3, this.size[0] - padding * 2, availableHeight);
        
        ctx.restore();
    }
};

LLMPromptNode.prototype.drawMultilineText = function(ctx, text, x, y, maxWidth, maxHeight) {
    var lines = text.split('\n');
    var lineHeight = 15;
    var currentY = y;

    for (var i = 0; i < lines.length; i++) {
        var words = lines[i].split(' ');
        var line = '';

        for (var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + ' ';
            var metrics = ctx.measureText(testLine);
            var testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, currentY);
                line = words[n] + ' ';
                currentY += lineHeight;
                if (currentY > y + maxHeight) {
                    ctx.fillText('...', x, currentY);
                    return;
                }
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentY);
        currentY += lineHeight;
        if (currentY > y + maxHeight) {
            ctx.fillText('...', x, currentY);
            return;
        }
    }
};

LLMPromptNode.prototype.onExecute = function() {
    // This will be handled by the Python backend
};

LLMPromptNode.prototype.showDialog = function(graphcanvas) {
    var that = this;
    var dialog = document.createElement("div");
    dialog.className = "graphdialog";
    dialog.innerHTML = `
        <div style="display: flex; height: calc(100% - 40px);">
            <div style="flex: 1; padding-right: 10px;">
                <label for="node-prompt-text">Prompt:</label>
                <textarea id="node-prompt-text" rows="30" cols="40" style="width:100%; height: calc(100% - 30px);">${that.properties.prompt}</textarea>
            </div>
            <div style="width: 1px; background-color: #666;"></div>
            <div style="flex: 1; padding-left: 10px;">
                <label for="node-response-text">Response:</label>
                <textarea id="node-response-text" rows="30" cols="40" style="width:100%; height: calc(100% - 30px);">${that.properties.response}</textarea>
            </div>
        </div>
        <div style="text-align:center; margin-top:10px;">
            <button id="node-dialog-submit">Submit</button>
            <button id="node-dialog-cancel">Cancel</button>
        </div>
    `;
    
    dialog.style.position = "fixed";
    dialog.style.top = "50%";
    dialog.style.left = "50%";
    dialog.style.transform = "translate(-50%, -50%)";
    dialog.style.backgroundColor = "#444";
    dialog.style.padding = "20px";
    dialog.style.borderRadius = "5px";
    dialog.style.zIndex = "1000";
    dialog.style.width = "80%";
    dialog.style.height = "80%";
    dialog.style.display = "flex";
    dialog.style.flexDirection = "column";

    var root = graphcanvas.canvas.parentNode;
    root.appendChild(dialog);

    var promptTextarea = dialog.querySelector("#node-prompt-text");
    var responseTextarea = dialog.querySelector("#node-response-text");
    var submit = dialog.querySelector("#node-dialog-submit");
    var cancel = dialog.querySelector("#node-dialog-cancel");

    submit.addEventListener("click", function() {
        that.properties.prompt = promptTextarea.value;
        that.properties.response = responseTextarea.value;
        root.removeChild(dialog);
    });

    cancel.addEventListener("click", function() {
        root.removeChild(dialog);
    });
};

// Handle double-click event
LLMPromptNode.prototype.onDblClick = function(e, pos, graphcanvas) {
    this.showDialog(graphcanvas);
};

// Custom property widget for larger text area
LLMPromptNode.prototype.getExtraMenuOptions = function(graphcanvas) {
    var that = this;
    return [
        {
            content: "Edit Prompt and Response",
            callback: function() {
                that.showDialog(graphcanvas);
            }
        }
    ];
};

// Define how the properties should be shown in the inspector
LLMPromptNode.prototype.onInspect = function(inspector) {
    var that = this;
    inspector.addTextarea("prompt", this.properties.prompt, { callback: function(v) { that.properties.prompt = v; } });
    inspector.addTextarea("response", this.properties.response, { callback: function(v) { that.properties.response = v; } });
};

LiteGraph.registerNodeType("KRAGEN/llmprompt", LLMPromptNode);

/********************* Python Code Node******************************/

function PythonCodeNode() {
    this.addInput("input", "string");
    this.addOutput("output", "string");
    this.addProperty("code", "# Enter your Python code here");
    this.addWidget("textarea", "Code", this.properties.code, "code", { rows:10, cols:40 });
    this.size = [400, 200]; // Increase the size of the node
}

PythonCodeNode.title = "Python Code";
PythonCodeNode.desc = "Execute Python code";

PythonCodeNode.prototype.onDrawForeground = function(ctx) {
    if (!this.flags.collapsed) {
        ctx.save();
        ctx.font = "12px Arial";
        ctx.fillStyle = "#AAA";
        ctx.fillText("Code:", 10, 30);
        ctx.fillStyle = "#CCC";
        var lines = this.properties.code.split('\n');
        for (var i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], 10, 50 + i * 20, this.size[0] - 20);
        }
        ctx.restore();
    }
};

PythonCodeNode.prototype.onExecute = function() {
    // This will be handled by the Python backend
};

LiteGraph.registerNodeType("KRAGEN/pythoncode", PythonCodeNode);

/********************* Code From Plans Node******************************/

function GenerateCodeFromPlansNode() {
    this.addInput("plans", "string");
    this.addOutput("code", "string");
    this.addProperty("prompt", "Enter your prompt here");
    this.addProperty("response", "");
    this.size = [300, 200];
    this.serialize_widgets = true;
    this.widgets_up = true;
    this.resizable = true;
    this.start_endpoint = "/generate_code_from_plans";
}

GenerateCodeFromPlansNode.title = "Generate Code From Plans";
GenerateCodeFromPlansNode.desc = "Generate code based on the input plans";

GenerateCodeFromPlansNode.prototype.onDrawForeground = function(ctx) {
    if (!this.flags.collapsed) {
        ctx.save();
        ctx.font = "12px Arial";
        
        var headerHeight = 40;
        var padding = 15;
        var availableHeight = (this.size[1] - headerHeight - padding * 3) / 2;

        ctx.fillStyle = "#AAA";
        ctx.fillText("Prompt:", padding, headerHeight);
        ctx.fillStyle = "#CCC";
        this.drawMultilineText(ctx, this.properties.prompt, padding, headerHeight + padding, this.size[0] - padding * 2, availableHeight);
        
        ctx.fillStyle = "#AAA";
        ctx.fillText("Response:", padding, headerHeight + availableHeight + padding * 2);
        ctx.fillStyle = "#CCC";
        this.drawMultilineText(ctx, this.properties.response, padding, headerHeight + availableHeight + padding * 3, this.size[0] - padding * 2, availableHeight);
        
        ctx.restore();
    }
};

GenerateCodeFromPlansNode.prototype.drawMultilineText = function(ctx, text, x, y, maxWidth, maxHeight) {
    var lines = text.split('\n');
    var lineHeight = 15;
    var currentY = y;

    for (var i = 0; i < lines.length; i++) {
        var words = lines[i].split(' ');
        var line = '';

        for (var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + ' ';
            var metrics = ctx.measureText(testLine);
            var testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, currentY);
                line = words[n] + ' ';
                currentY += lineHeight;
                if (currentY > y + maxHeight) {
                    ctx.fillText('...', x, currentY);
                    return;
                }
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentY);
        currentY += lineHeight;
        if (currentY > y + maxHeight) {
            ctx.fillText('...', x, currentY);
            return;
        }
    }
};

GenerateCodeFromPlansNode.prototype.onExecute = function() {
    var that = this;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", this.start_endpoint, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            that.setOutputData(0, response.code);

            // Update the response property
            that.properties.response = response.code;

            // Draw the updated response in the node
            that.graphcanvas.draw(true);

            // Show the response in the console
            console.log(response);
        }
    };
    xhr.send(JSON.stringify({ input: this.getInputData(0) }));
};

GenerateCodeFromPlansNode.prototype.showDialog = function(graphcanvas) {
    var that = this;
    var dialog = document.createElement("div");
    dialog.className = "graphdialog";
    dialog.innerHTML = `
        <div style="display: flex; height: calc(100% - 40px);">
            <div style="flex: 1; padding-right: 10px;">
                <label for="node-prompt-text">Prompt:</label>
                <textarea id="node-prompt-text" rows="30" cols="40" style="width:100%; height: calc(100% - 30px);">${that.properties.prompt}</textarea>
            </div>
            <div style="width: 1px; background-color: #666;"></div>
            <div style="flex: 1; padding-left: 10px;">
                <label for="node-response-text">Response:</label>
                <textarea id="node-response-text" rows="30" cols="40" style="width:100%; height: calc(100% - 30px);">${that.properties.response}</textarea>
            </div>
        </div>
        <div style="text-align:center; margin-top:10px;">
            <button id="node-dialog-submit">Submit</button>
            <button id="node-dialog-cancel">Cancel</button>
        </div>
    `;
    
    dialog.style.position = "fixed";
    dialog.style.top = "50%";
    dialog.style.left = "50%";
    dialog.style.transform = "translate(-50%, -50%)";
    dialog.style.backgroundColor = "#444";
    dialog.style.padding = "20px";
    dialog.style.borderRadius = "5px";
    dialog.style.zIndex = "1000";
    dialog.style.width = "80%";
    dialog.style.height = "80%";
    dialog.style.display = "flex";
    dialog.style.flexDirection = "column";

    var root = graphcanvas.canvas.parentNode;
    root.appendChild(dialog);

    var promptTextarea = dialog.querySelector("#node-prompt-text");
    var responseTextarea = dialog.querySelector("#node-response-text");
    var submit = dialog.querySelector("#node-dialog-submit");
    var cancel = dialog.querySelector("#node-dialog-cancel");

    submit.addEventListener("click", function() {
        that.properties.prompt = promptTextarea.value;
        that.properties.response = responseTextarea.value;
        root.removeChild(dialog);
    });

    cancel.addEventListener("click", function() {
        root.removeChild(dialog);
    });
};

// Handle double-click event
GenerateCodeFromPlansNode.prototype.onDblClick = function(e, pos, graphcanvas) {
    this.showDialog(graphcanvas);
};

// Custom property widget for larger text area
GenerateCodeFromPlansNode.prototype.getExtraMenuOptions = function(graphcanvas) {
    var that = this;
    return [
        {
            content: "Edit Prompt and Response",
            callback: function() {
                that.showDialog(graphcanvas);
            }
        }
    ];
};

// Define how the properties should be shown in the inspector
GenerateCodeFromPlansNode.prototype.onInspect = function(inspector) {
    var that = this;
    inspector.addTextarea("prompt", this.properties.prompt, { callback: function(v) { that.properties.prompt = v; } });
    inspector.addTextarea("response", this.properties.response, { callback: function(v) { that.properties.response = v; } });
};

LiteGraph.registerNodeType("KRAGEN/Generate_Code_From_Plans", GenerateCodeFromPlansNode);