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

function MultiLineFunc(ctx, text, x, y, maxWidth, maxHeight) {
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

    // Enable colored node boxes based on mode
    LiteGraph.node_box_coloured_by_mode = true;
    // Define custom node mode colors - normal, processing, executed, error
    LiteGraph.NODE_MODES_COLORS = ["#555", "#993", "#393", "#933"];
}

// Run initialization automatically when page loads
window.addEventListener('load', function() {
    setTimeout(initializeDefaultGraph, 100); // Small delay to ensure everything is loaded
});

LiteGraph.clearRegisteredTypes();

/********************* KRAGEN Base Node Class******************************/

function KragenBaseNode() {
    // Common properties
    this.size = [300, 200];
    this.serialize_widgets = true;
    this.widgets_up = true;
    this.resizable = true;
    
    // Common properties for all nodes
    this.addProperty("executed", false);
    this.addProperty("error", false);
    
    // Initialize mode to normal
    this.mode = 0;
}

// Common drawing functions
KragenBaseNode.prototype.drawMultilineText = MultiLineFunc;

// Update mode based on node state
KragenBaseNode.prototype.updateMode = function() {
    if (this.properties.error) {
        this.mode = 3; // Error
    } else if (this.properties.executed) {
        this.mode = 2; // Executed
    } else if (this.properties.input && this.properties.input.trim() !== "") {
        this.mode = 1; // Processing
    } else {
        this.mode = 0; // Normal
    }
    
    if (this.graph) {
        this.graph.setDirtyCanvas(true, true);
    }
};

// Common dialog for editing input/output
KragenBaseNode.prototype.showDialog = function(graphcanvas) {
    var that = this;
    var dialog = document.createElement("div");
    dialog.className = "graphdialog";
    dialog.innerHTML = `
        <div style="display: flex; height: calc(100% - 40px);">
            <div style="flex: 1; padding-right: 10px;">
                <label for="node-prompt-text">Input:</label>
                <textarea id="node-prompt-text" rows="30" cols="40" style="width:100%; height: calc(100% - 30px);">${that.properties.input || ""}</textarea>
            </div>
            <div style="width: 1px; background-color: #666;"></div>
            <div style="flex: 1; padding-left: 10px;">
                <label for="node-response-text">Output:</label>
                <textarea id="node-response-text" rows="30" cols="40" style="width:100%; height: calc(100% - 30px);">${that.properties.output || ""}</textarea>
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
        that.properties.input = promptTextarea.value;
        that.properties.output = responseTextarea.value;
        root.removeChild(dialog);
    });

    cancel.addEventListener("click", function() {
        root.removeChild(dialog);
    });
};

// Handle double-click event
KragenBaseNode.prototype.onDblClick = function(e, pos, graphcanvas) {
    this.showDialog(graphcanvas);
};

// Common extra menu options
KragenBaseNode.prototype.getExtraMenuOptions = function(graphcanvas) {
    var that = this;
    return [
        {
            content: "Edit Input/Output",
            callback: function() {
                that.showDialog(graphcanvas);
            }
        }
    ];
};

// Common inspector properties
KragenBaseNode.prototype.onInspect = function(inspector) {
    var that = this;
    inspector.addTextarea("input", this.properties.input || "", { callback: function(v) { that.properties.input = v; } });
    inspector.addTextarea("output", this.properties.output || "", { callback: function(v) { that.properties.output = v; } });
};

// Common HTTP request handling with error handling
KragenBaseNode.prototype.sendRequest = function(endpoint, data, successCallback, errorCallback) {
    var that = this;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    var response = JSON.parse(xhr.responseText);
                    successCallback(response);
                } catch (error) {
                    console.error("Error parsing JSON response:", error);
                    that.properties.error = true;
                    errorCallback("Error parsing response: " + error.message);
                }
            } else {
                console.error("HTTP Error:", xhr.status, xhr.statusText);
                that.properties.error = true;
                errorCallback("Server error: " + xhr.status + " " + xhr.statusText);
            }
        }
    };
    
    xhr.onerror = function() {
        console.error("Network Error");
        that.properties.error = true;
        errorCallback("Network error: Could not connect to server");
    };
    
    try {
        xhr.send(JSON.stringify(data));
    } catch (error) {
        console.error("Error sending request:", error);
        that.properties.error = true;
        errorCallback("Error sending request: " + error.message);
    }
};

/********************* KRAGEN Generate Plans Node******************************/

function GeneratePlansNode() {
    // Call the base class constructor
    KragenBaseNode.call(this);
    
    // Node-specific inputs/outputs
    this.addOutput("plans", "string");
    
    // Node-specific properties
    this.addProperty("input", "Enter your query here");
    this.addProperty("output", "");
    this.addProperty("question", "");
    this.addProperty("filename", "");
    
    // Node-specific endpoint
    this.start_endpoint = "/generate_plans";
}

// Inherit from base class
GeneratePlansNode.prototype = Object.create(KragenBaseNode.prototype);
GeneratePlansNode.prototype.constructor = GeneratePlansNode;

// Override only what's specific to this node
GeneratePlansNode.title = "Generate Plans";
GeneratePlansNode.desc = "Generate a plan based on the input prompt";
GeneratePlansNode.title_color = "#555";

GeneratePlansNode.prototype.onDrawForeground = function(ctx) {
    if (!this.flags.collapsed) {
        ctx.save();
        ctx.font = "12px Arial";
        
        var padding = 15;
        var contentY = 40; // Start below the built-in title bar
        
        // Update the mode to reflect current state
        this.updateMode();
        
        ctx.fillStyle = "#AAA";
        ctx.fillText("Input:", padding, contentY);
        ctx.fillStyle = "#CCC";
        // Use the full available height for input since we're not showing output
        var availableHeight = this.size[1] - contentY - padding * 2;
        this.drawMultilineText(ctx, this.properties.input, padding, contentY + padding, this.size[0] - padding * 2, availableHeight);
        
        ctx.restore();
    }
};

GeneratePlansNode.prototype.onExecute = function() {
    const that = this;
    
    if(!that.properties.executed && !that.properties.error) {
        // Reset any previous error state
        that.properties.error = false;
        
        // Include chat_id in request if available
        const requestData = { 
            input: this.properties.input 
        };
        
        // Add chat_id if available from window
        if (window.currentChatId) {
            requestData.chat_id = window.currentChatId;
        }
        
        that.sendRequest(
            this.start_endpoint,
            requestData,
            function(response) {
                // Update chat with a summary of the response
                if (response.thoughts) {
                    const summary = response.thoughts.length > 150 ? 
                        response.thoughts.substring(0, 150) + "..." : 
                        response.thoughts;
                    
                    window.addMessage("Plan generated: " + summary, 'assistant');
                }
                
                // Continue with the original execution
                that.setOutputData(0, response.thoughts);

                // Create a new GenerateCodeFromPlansNode
                var graph = that.graph;
                var newNode = LiteGraph.createNode("KRAGEN/Generate_Code");
                newNode.pos = [that.pos[0] + 500, that.pos[1]]; // Position to the right of the current node
                graph.add(newNode);
                
                // Connect the output of GeneratePlansNode to the input of GenerateCodeFromPlansNode
                that.connect(0, newNode.id, 0);

                // Update the response property
                that.properties.output = response.thoughts;
                that.properties.executed = true;
                newNode.properties.input = response.thoughts;
                newNode.properties.question = that.properties.input;
                newNode.properties.filename = response.filename;

                // Update mode to executed
                that.updateMode();
                
                // Draw the updated response in the node
                that.graph.setDirtyCanvas(true, true);

                // Show the response in the console
                console.log(response);
                
                // Add a message about the automatic execution
                window.addMessage("Generated a plan and automatically executing the next node in the workflow.", 'assistant');
                
                // Save the updated graph state with the executed node and connection
                if (window.currentChatId && window.saveCurrentGraphState) {
                    window.saveCurrentGraphState();
                }
                
                // Automatically execute the next node
                setTimeout(function() {
                    newNode.onExecute();
                }, 500);
            },
            function(errorMsg) {
                that.properties.error = true;
                that.properties.output = errorMsg;
                that.updateMode();
                window.addMessage("Error: " + errorMsg, 'assistant');
                that.graph.setDirtyCanvas(true, true);
            }
        );
    }
};

LiteGraph.registerNodeType("KRAGEN/Generate_Plans", GeneratePlansNode);

/********************* LLM Prompt Node******************************/

function LLMPromptNode() {
    // Call the base class constructor
    KragenBaseNode.call(this);
    
    // Node-specific inputs/outputs
    this.addInput("trigger", LiteGraph.ACTION);
    this.addOutput("result", "string");
    
    // Node-specific properties
    this.addProperty("input", "Enter your prompt here");
    this.addProperty("output", "");
    
    // Node-specific endpoint
    this.start_endpoint = "/llm_chat";
}

// Inherit from base class
LLMPromptNode.prototype = Object.create(KragenBaseNode.prototype);
LLMPromptNode.prototype.constructor = LLMPromptNode;

// Override only what's specific to this node
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
        this.drawMultilineText(ctx, this.properties.input, padding, headerHeight + padding, this.size[0] - padding * 2, availableHeight);
        
        ctx.fillStyle = "#AAA";
        ctx.fillText("Response:", padding, headerHeight + availableHeight + padding * 2);
        ctx.fillStyle = "#CCC";
        this.drawMultilineText(ctx, this.properties.output, padding, headerHeight + availableHeight + padding * 3, this.size[0] - padding * 2, availableHeight);
        
        ctx.restore();
    }
};

LLMPromptNode.prototype.onExecute = function() {
    var that = this;
    
    // Create request data with optional chat_id
    const requestData = { 
        input: this.properties.input 
    };
    
    // Add chat_id if available from window
    if (window.currentChatId) {
        requestData.chat_id = window.currentChatId;
    }
    
    that.sendRequest(
        this.start_endpoint,
        requestData,
        function(response) {
            that.setOutputData(0, response.thoughts);

            // Update the response property
            that.properties.output = response.thoughts;
            // Draw the updated response in the node
            that.graph.setDirtyCanvas(true, true);

            // Show the response in the console
            console.log(response);
            that.properties.executed = true;
            
            // Save the updated graph state after node execution
            if (window.currentChatId && window.saveCurrentGraphState) {
                window.saveCurrentGraphState();
            }
        },
        function(errorMsg) {
            that.properties.error = true;
            that.properties.output = errorMsg;
            that.updateMode();
            window.addMessage("Error: " + errorMsg, 'assistant');
            that.graph.setDirtyCanvas(true, true);
        }
    );
};

LiteGraph.registerNodeType("KRAGEN/llmprompt", LLMPromptNode);

/********************* Full Python Code Node******************************/

function FullPythonCodeNode() {
    // Call the base class constructor
    KragenBaseNode.call(this);
    
    // Node-specific inputs/outputs
    this.addInput("code", "string");
    this.addOutput("GraphOfThoughts", "string");
    
    // Node-specific properties
    this.addWidget("textarea", "Code", this.properties.code, "code", { rows:10, cols:40 });
    this.addProperty("edgeList", []); // Store the edge list
    
    // Increase size for code display
    this.size = [400, 240];
    
    // Node-specific endpoint
    this.start_endpoint = "/python_got";
}

// Inherit from base class
FullPythonCodeNode.prototype = Object.create(KragenBaseNode.prototype);
FullPythonCodeNode.prototype.constructor = FullPythonCodeNode;

// Override only what's specific to this node
FullPythonCodeNode.title = "Full Python Code";
FullPythonCodeNode.desc = "Full Python code";

FullPythonCodeNode.prototype.onDrawForeground = function(ctx) {
    if (!this.flags.collapsed) {
        ctx.save();
        ctx.font = "12px Arial";
        
        // Draw execution status
        if (this.properties.executed) {
            ctx.fillStyle = "#8F8";
            ctx.fillText("✓ Executed", this.size[0] - 80, 20);
        } else if (this.properties.error) {
            ctx.fillStyle = "#F88";
            ctx.fillText("✗ Error", this.size[0] - 80, 20);
        } else if (this.mode === 1) {
            ctx.fillStyle = "#FF8";
            ctx.fillText("⟳ Processing", this.size[0] - 100, 20);
        }
        
        // Draw code area
        ctx.fillStyle = "#AAA";
        ctx.fillText("Code:", 10, 30);
        ctx.fillStyle = "#CCC";
        
        // Use the drawMultilineText function from the base class
        this.drawMultilineText(ctx, this.properties.code, 10, 50, this.size[0] - 20, this.size[1] - 110);
        
        // Draw edge list if available with detailed explanation
        if (this.properties.edgeList && this.properties.edgeList.length > 0) {
            ctx.fillStyle = "#AAA";
            ctx.fillText("EdgeList:", 10, this.size[1] - 60);
            ctx.fillStyle = "#9CF"; // Highlight edge list in blue
            
            var edgeText = this.properties.edgeList.join(", ");
            ctx.fillText(edgeText, 80, this.size[1] - 60, this.size[0] - 90);
            
            // Add a visual explanation of the connections
            ctx.fillStyle = "#CCC";
            var connExplanation = "";
            for (var i = 0; i < this.properties.edgeList.length; i++) {
                var edge = this.properties.edgeList[i];
                var parts = edge.split("-");
                if (parts.length === 2) {
                    if (connExplanation) connExplanation += ", ";
                    connExplanation += "node " + parts[0] + " → node " + parts[1];
                }
            }
            ctx.fillText("Connections: " + connExplanation, 10, this.size[1] - 40, this.size[0] - 20);
        }
        
        ctx.restore();
    }
};

FullPythonCodeNode.prototype.onExecute = function() {
    var that = this;
    if(!that.properties.executed){
        // Set as processing
        that.properties.executed = false; // Reset execution state
        that.mode = 1; // Set to processing mode
        that.graph.setDirtyCanvas(true, true);
        
        // Get input value; if not available, use the property value
        var input_value = this.getInputData(0);
        if (input_value === undefined) {
            input_value = this.properties.code;
        }
        
        // Create request data with optional chat_id
        const requestData = { 
            input: input_value, 
            question: this.properties.question, 
            filename: this.properties.filename
        };
        
        // Add chat_id if available from window
        if (window.currentChatId) {
            requestData.chat_id = window.currentChatId;
        }
        
        that.sendRequest(
            this.start_endpoint,
            requestData,
            function(response) {
                that.setOutputData(0, response.instructions);
                that.properties.GraphOfThoughts = response.instructions;
                
                // Store the edge list
                if (response.edgeList && response.edgeList.length > 0) {
                    that.properties.edgeList = response.edgeList;
                    console.log("EdgeList received:", response.edgeList);
                }
                
                // Set as executed and update node appearance
                that.properties.executed = true;
                that.mode = 2; // Executed mode
                that.graph.setDirtyCanvas(true, true);
                
                // Create PythonSnippet nodes
                var graph = that.graph;

                console.log(response.instructions);
                window.addMessage("Generated code execution plan with " + response.instructions.length + " steps.", 'assistant');
                if (response.edgeList && response.edgeList.length > 0) {
                    window.addMessage("EdgeList detected: " + response.edgeList.join(", "), 'assistant');
                }

                var createdNodes = [];
                var nodeMap = {}; // Map step IDs to nodes
                
                // First pass: create all nodes
                for(var i = 0; i < response.instructions.length; i++){
                    console.log(response.instructions[i]);
                    var newNode = LiteGraph.createNode("KRAGEN/pythonsnippet");
                    
                    // Position nodes in a grid layout rather than just vertically
                    // This works better for complex edge graphs
                    var rowSize = 2; // 2 nodes per row
                    var row = Math.floor(i / rowSize);
                    var col = i % rowSize;
                    var xOffset = col * 450;
                    var yOffset = row * 350;
                    
                    newNode.pos = [that.pos[0] + 500 + xOffset, that.pos[1] - 200 + yOffset]; 
                    graph.add(newNode);
                    
                    // Configure the node
                    newNode.properties.code = response.instructions[i]['Code'][0];
                    newNode.properties.question = that.properties.question;
                    newNode.properties.filename = response.filename;
                    newNode.properties.stepID = (i+1).toString(); // Ensure step IDs are strings and sequential
                    newNode.properties.instruction = response.instructions[i]['instruction'];
                    
                    // Store node in our maps
                    createdNodes.push(newNode);
                    nodeMap[newNode.properties.stepID] = newNode;
                }
                
                // Second pass: connect nodes based on edge list if available
                if (response.edgeList && response.edgeList.length > 0) {
                    console.log("Using EdgeList for connections:", response.edgeList);
                    window.addMessage("Using custom edge connections for the workflow", 'assistant');
                    
                    // Connect this node to the first node(s) with no incoming edges
                    // Find nodes that are never on the receiving end of an edge
                    var sourceNodes = new Set();
                    var targetNodes = new Set();
                    var allEdgeNodes = new Set(); // Track all nodes mentioned in edges
                    
                    // Collect all source and target nodes
                    for (var i = 0; i < response.edgeList.length; i++) {
                        var edge = response.edgeList[i];
                        var parts = edge.split("-");
                        if (parts.length === 2) {
                            var fromNodeId = parts[0];
                            var toNodeId = parts[1];
                            sourceNodes.add(fromNodeId);
                            targetNodes.add(toNodeId);
                            allEdgeNodes.add(fromNodeId);
                            allEdgeNodes.add(toNodeId);
                        }
                    }
                    
                    // Find starting nodes (nodes that are sources but not targets)
                    var startingNodes = [];
                    for (var nodeId of sourceNodes) {
                        if (!targetNodes.has(nodeId)) {
                            startingNodes.push(nodeId);
                        }
                    }
                    
                    // If no starting nodes found (might be a cycle), use the first node
                    if (startingNodes.length === 0 && createdNodes.length > 0) {
                        startingNodes.push("1");
                    }
                    
                    // Find nodes not mentioned in any edge - they might need to be connected as starting nodes too
                    for (var i = 0; i < createdNodes.length; i++) {
                        var nodeId = createdNodes[i].properties.stepID;
                        if (!allEdgeNodes.has(nodeId)) {
                            startingNodes.push(nodeId);
                        }
                    }
                    
                    // Connect this node to all starting nodes
                    for (var i = 0; i < startingNodes.length; i++) {
                        var startNodeId = startingNodes[i];
                        if (nodeMap[startNodeId]) {
                            that.connect(0, nodeMap[startNodeId].id, 0);
                            console.log("Connected FullPythonCodeNode to starting node " + startNodeId);
                        }
                    }
                    
                    // Pre-calculate dependency for all nodes as a dictionary of node IDs to list of node IDs
                    var dependencyMap = {};
                    for (var i = 0; i < createdNodes.length; i++) {
                        var nodeId = createdNodes[i].properties.stepID;
                        dependencyMap[nodeId] = [];
                    }
                    
                    // Count incoming edges for each node
                    for (var i = 0; i < response.edgeList.length; i++) {
                        var edge = response.edgeList[i];
                        var parts = edge.split("-");
                        if (parts.length === 2) {
                            var toNodeId = parts[1];
                            dependencyMap[toNodeId].push(parts[0]);
                            // create new inputs for the node based on the dependency map
                            nodeMap[toNodeId].addInput(parts[0], "string");
                        }
                    }
                    
                    console.log("Dependency map:", dependencyMap);
                    
                    // Connect according to the edge list and set dependency counts
                    for (var i = 0; i < response.edgeList.length; i++) {
                        var edge = response.edgeList[i];
                        var parts = edge.split("-");
                        if (parts.length === 2) {
                            var fromNodeId = parts[0];
                            var toNodeId = parts[1];
                            
                            if (nodeMap[fromNodeId] && nodeMap[toNodeId]) {
                                // use the dependency map to find the input index
                                let input_index = dependencyMap[parseInt(toNodeId)].indexOf(fromNodeId);
                                nodeMap[fromNodeId].connect(0, nodeMap[toNodeId].id, input_index);
                                
                                // Set the dependency count for target node
                                nodeMap[toNodeId].properties.dependenciesRequired = dependencyMap[toNodeId].length;
                                console.log("Connected node " + fromNodeId + " to node " + toNodeId + 
                                           " (dependencies: " + dependencyMap[toNodeId].length + ")");
                            }
                        }
                    }
                    
                    // Verify all nodes have proper dependency settings
                    for (var i = 0; i < createdNodes.length; i++) {
                        var node = createdNodes[i];
                        var nodeId = node.properties.stepID;
                        
                        // If not in EdgeList as target, it's a starting node with one dependency (from FullPythonCodeNode)
                        if (dependencyMap[nodeId].length === 0) {
                            node.properties.dependenciesRequired = 1;
                        } else {
                            node.properties.dependenciesRequired = dependencyMap[nodeId].length;
                        }
                        
                        // Reset completion count to 0 for all nodes
                        node.properties.dependenciesCompleted = 0;
                        
                        console.log("Node " + nodeId + " final dependency settings: " + 
                                   node.properties.dependenciesCompleted + "/" + node.properties.dependenciesRequired);
                    }
                } else {
                    // Use default sequential connections if no edge list
                    console.log("No EdgeList found, using sequential connections");
                    
                    // Connect this node to the first node
                    if (createdNodes.length > 0) {
                        that.connect(0, createdNodes[0].id, 0);
                    }
                    
                    // Connect nodes sequentially
                    for (var i = 0; i < createdNodes.length - 1; i++) {
                        createdNodes[i].connect(1, createdNodes[i+1].id, 0);
                    }
                }

                // Draw the updated response in the node
                that.graph.setDirtyCanvas(true, true);
                
                // Execute the first PythonSnippet node if any were created
                if (createdNodes.length > 0) {
                    // Start with the appropriate nodes based on the edge list
                    var nodesToStart = [];
                    
                    if (response.edgeList && response.edgeList.length > 0) {
                        // Find nodes with no incoming edges in the edgeList
                        var targetOfEdge = {};
                        for (var i = 0; i < response.edgeList.length; i++) {
                            var edge = response.edgeList[i];
                            var parts = edge.split("-");
                            if (parts.length === 2) {
                                targetOfEdge[parts[1]] = true;
                            }
                        }
                        
                        // Find nodes that are not targets of any edge
                        for (var i = 0; i < createdNodes.length; i++) {
                            var nodeId = createdNodes[i].properties.stepID;
                            if (!targetOfEdge[nodeId]) {
                                nodesToStart.push(createdNodes[i]);
                            }
                        }
                        
                        // If no starting nodes found, start with the first node
                        if (nodesToStart.length === 0) {
                            nodesToStart.push(createdNodes[0]);
                        }
                    } else {
                        // Start with the first node if no edge list
                        nodesToStart.push(createdNodes[0]);
                    }
                    
                    window.addMessage("Automatically executing " + nodesToStart.length + 
                                      " starting step(s): " + nodesToStart.map(n => n.properties.stepID).join(", "), 
                                     'assistant');
                    
                    // Save the updated graph state with all nodes created
                    if (window.currentChatId && window.saveCurrentGraphState) {
                        window.saveCurrentGraphState();
                    }
                    
                    // Start execution of all starting nodes
                    for (var i = 0; i < nodesToStart.length; i++) {
                        var startNode = nodesToStart[i];
                        (function(node) {
                            setTimeout(function() {
                                node.onExecute();
                            }, 500 * (i + 1)); // Stagger execution start times
                        })(startNode);
                    }
                }
            },
            function(errorMsg) {
                that.properties.executed = false;
                that.properties.error = true;
                that.mode = 3; // Error mode
                window.addMessage("Error: " + errorMsg, 'assistant');
                that.graph.setDirtyCanvas(true, true);
            }
        );
    }
};

LiteGraph.registerNodeType("KRAGEN/fullpythoncode", FullPythonCodeNode);

/********************* Python Snippet Node******************************/

function PythonSnippetNode() {
    // Call the base class constructor
    KragenBaseNode.call(this);
    
    // Node-specific inputs/outputs
    this.addInput("code", "string");
    this.addOutput("output", "string");
    this.addOutput("nextStep", "boolean");
    
    // Node-specific properties
    this.addProperty("stepID", "");
    this.addProperty("instruction", "");
    this.addProperty("question", "");
    this.addProperty("filename", "");
    this.addProperty("localContext", "{}");
    this.addProperty("stepOutput", "");
    this.addProperty("dependenciesCompleted", 0); // Track number of dependencies completed
    this.addProperty("dependenciesRequired", 1);  // Number of dependencies required to execute
    this.addWidget("textarea", "Code", this.properties.code, "code", { rows:10, cols:40 });
    
    // Increase size for code display
    this.size = [400, 300];
    
    // Node-specific endpoint
    this.start_endpoint = "/execute_python_step";
}

// Inherit from base class
PythonSnippetNode.prototype = Object.create(KragenBaseNode.prototype);
PythonSnippetNode.prototype.constructor = PythonSnippetNode;

// Override only what's specific to this node
PythonSnippetNode.title = "Python Snippet";
PythonSnippetNode.desc = "Python snippet running within graph of thoughts";

PythonSnippetNode.prototype.onDrawForeground = function(ctx) {
    if (!this.flags.collapsed) {
        ctx.save();
        ctx.font = "12px Arial";
        
        var padding = 10;
        var baseHeaderHeight = 30;
        
        // Calculate dynamic header height based on number of inputs/dependencies
        var dependencyCount = Math.max(1, this.inputs ? this.inputs.length : 0);
        var headerHeight = baseHeaderHeight + (dependencyCount - 1) * 20; // Add 20px per additional dependency
        
        var codeAreaHeight = 120;
        
        // Draw execution status
        if (this.properties.executed) {
            ctx.fillStyle = "#8F8";
            ctx.fillText("✓ Executed", this.size[0] - 80, baseHeaderHeight);
        } else if (this.properties.error) {
            ctx.fillStyle = "#F88";
            ctx.fillText("✗ Error", this.size[0] - 80, baseHeaderHeight);
        } else if (this.properties.dependenciesCompleted > 0 && 
                  this.properties.dependenciesCompleted < this.properties.dependenciesRequired) {
            // Show waiting status
            ctx.fillStyle = "#FF8";
            ctx.fillText("⧗ Waiting " + this.properties.dependenciesCompleted + "/" + 
                        this.properties.dependenciesRequired, this.size[0] - 120, baseHeaderHeight);
        }
        
        // Draw step ID and instruction
        ctx.fillStyle = "#AAA";
        ctx.fillText("Step ID: " + this.properties.stepID, padding, baseHeaderHeight);
        ctx.fillText("Instruction: " + this.properties.instruction, padding, baseHeaderHeight + 20);
        
        // Draw dependencies if there are any
        if (this.inputs && this.inputs.length > 1) { // Skip the default 'code' input
            for (var i = 1; i < this.inputs.length; i++) {
                ctx.fillText("Dependency: " + this.inputs[i].name, padding, baseHeaderHeight + 20 + i * 20);
            }
        }
        
        // Draw code area
        ctx.fillStyle = "#AAA";
        ctx.fillText("Code:", padding, headerHeight + 40);
        ctx.fillStyle = "#CCC";
        this.drawMultilineText(ctx, this.properties.code, padding, headerHeight + 60, this.size[0] - padding * 2, codeAreaHeight);
        
        // Draw output area
        ctx.fillStyle = "#AAA";
        ctx.fillText("Output:", padding, headerHeight + codeAreaHeight + 70);
        ctx.fillStyle = "#CCC";
        this.drawMultilineText(ctx, this.properties.stepOutput, padding, headerHeight + codeAreaHeight + 90, this.size[0] - padding * 2, 60);
        
        ctx.restore();
    }
};

// Handle dependencies - called when a dependency completes
PythonSnippetNode.prototype.notifyExecution = function() {
    if (this.properties.executed || this.properties.error) {
        console.log("Node " + this.properties.stepID + " already executed or has error, ignoring notification");
        return;
    }
    
    this.properties.dependenciesCompleted++;
    console.log("Node " + this.properties.stepID + " notified of dependency completion (" + 
               this.properties.dependenciesCompleted + "/" + this.properties.dependenciesRequired + ")");
    
    // Update the visual state
    this.graph.setDirtyCanvas(true, true);
    
    // Check if all dependencies are done
    if (this.properties.dependenciesCompleted >= this.properties.dependenciesRequired) {
        console.log("All dependencies complete for node " + this.properties.stepID + ", executing");
        setTimeout(() => this.onExecute(), 100); // Small delay to ensure UI updates
    }
};

// Update to handle onAction too
PythonSnippetNode.prototype.onAction = function(action, param) {
    // Trigger execution via action
    if (action === "execute") {
        this.notifyExecution();
    }
};

PythonSnippetNode.prototype.onExecute = function() {
    var that = this;
    if(that.properties.executed || that.properties.error){
        console.log("Node " + that.properties.stepID + " already executed or has error, skipping execution");
        return;
    }
    
    // Double check dependency count before executing
    if (that.properties.dependenciesCompleted < that.properties.dependenciesRequired) {
        console.warn("Node " + that.properties.stepID + " tried to execute before all dependencies complete, waiting");
        return;
    }
    
    // Set as executing
    that.mode = 1; // Processing mode
    that.graph.setDirtyCanvas(true, true);
    
    // Add a message about execution
    window.addMessage("Executing step " + that.properties.stepID + ": " + that.properties.instruction, 'assistant');
    
    // Get input value; if not available, use the property value
    var code_value = this.getInputData(0);
    if (code_value === undefined || code_value === null) {
        code_value = this.properties.code;
    }
    
    // Create request data with optional chat_id
    const requestData = { 
        code: code_value, 
        question: this.properties.instruction, // Use instruction as the context for this step
        filename: this.properties.filename,
        step_id: this.properties.stepID
    };
    
    // Add chat_id if available from window
    if (window.currentChatId) {
        requestData.chat_id = window.currentChatId;
    }
    
    that.sendRequest(
        this.start_endpoint,
        requestData,
        function(response) {
            // Update properties with response data
            that.properties.executed = response.success;
            that.properties.localContext = response.local_context;
            that.properties.stepOutput = response.step_output;
            that.properties.filename = response.filename;
            
            // Set output data
            that.setOutputData(0, response.step_output);
            that.setOutputData(1, true); // Signal for next step
            
            // Update mode to executed
            that.mode = 2; // Executed mode
            that.graph.setDirtyCanvas(true, true);
            
            window.addMessage("Successfully completed step " + that.properties.stepID + ". Output: " + 
                (response.step_output.length > 100 ? response.step_output.substring(0, 100) + "..." : response.step_output), 
                'assistant');
            
            // Save the updated graph state
            if (window.currentChatId && window.saveCurrentGraphState) {
                window.saveCurrentGraphState();
            }
            
            // Find connected nodes to trigger next
            var connected = that.getOutputNodes(1); // Get nodes connected to the nextStep output
            if (connected && connected.length > 0) {
                // We have nodes connected via edgelist or sequential order
                window.addMessage("Triggering " + connected.length + " next step(s) from step " + that.properties.stepID, 'assistant');
                
                // For each connected node
                for (var i = 0; i < connected.length; i++) {
                    var nextNode = connected[i];
                    
                    // Pass context to next node via filename
                    nextNode.properties.filename = response.filename;
                    
                    // Notify the node of execution completion
                    setTimeout(function(node) {
                        return function() {
                            node.notifyExecution();
                        };
                    }(nextNode), 200);
                }
            } else {
                // No connected nodes - we're done with this branch
                window.addMessage("Branch complete! No more connected steps from " + that.properties.stepID, 'assistant');
            }
        },
        function(errorMsg) {
            that.properties.executed = false;
            that.properties.error = true;
            that.properties.stepOutput = "ERROR: " + errorMsg;
            that.mode = 3; // Error mode
            window.addMessage("Error in step " + that.properties.stepID + ": " + errorMsg, 'assistant');
            that.graph.setDirtyCanvas(true, true);
        }
    );
};

LiteGraph.registerNodeType("KRAGEN/pythonsnippet", PythonSnippetNode);

/********************* Code From Plans Node******************************/

function GenerateCodeFromPlansNode() {
    // Call the base class constructor
    KragenBaseNode.call(this);
    
    // Node-specific inputs/outputs
    this.addInput("input", "string");
    this.addOutput("output", "string");
    
    // Node-specific properties
    this.addProperty("input", "Enter your plan here");
    this.addProperty("output", "");
    this.addProperty("question", "");
    this.addProperty("filename", "");
    
    // Node-specific endpoint
    this.start_endpoint = "/generate_code_from_plans";
}

// Inherit from base class
GenerateCodeFromPlansNode.prototype = Object.create(KragenBaseNode.prototype);
GenerateCodeFromPlansNode.prototype.constructor = GenerateCodeFromPlansNode;

// Override only what's specific to this node
GenerateCodeFromPlansNode.title = "Generate Code";
GenerateCodeFromPlansNode.desc = "Generate code based on the input plans";
GenerateCodeFromPlansNode.title_color = "#555";

GenerateCodeFromPlansNode.prototype.onDrawForeground = function(ctx) {
    if (!this.flags.collapsed) {
        ctx.save();
        ctx.font = "12px Arial";
        
        var padding = 15;
        var contentY = 40; // Start below the built-in title bar
        
        // Update the mode to reflect current state
        this.updateMode();
        
        ctx.fillStyle = "#AAA";
        ctx.fillText("Input:", padding, contentY);
        ctx.fillStyle = "#CCC";
        // Use the full available height for input since we're not showing output
        var availableHeight = this.size[1] - contentY - padding * 2;
        this.drawMultilineText(ctx, this.properties.input, padding, contentY + padding, this.size[0] - padding * 2, availableHeight);
        
        ctx.restore();
    }
};

GenerateCodeFromPlansNode.prototype.onExecute = function() {
    const that = this;
    
    if(!that.properties.executed && !that.properties.error) {
        // Set mode to processing
        that.mode = 1;
        that.graph.setDirtyCanvas(true, true);
        
        // Reset any previous error state
        that.properties.error = false;
        
        // Get input value; if not available, use the property value
        var input_value = this.getInputData(0);
        if (input_value === undefined) {
            input_value = this.properties.input;
        }
        
        // Create request data with optional chat_id
        const requestData = { 
            input: input_value, 
            question: this.properties.question,
            filename: this.properties.filename
        };
        
        // Add chat_id if available from window
        if (window.currentChatId) {
            requestData.chat_id = window.currentChatId;
        }
        
        that.sendRequest(
            this.start_endpoint,
            requestData,
            function(response) {
                if (!response.thoughts) {
                    throw new Error("No code content received from server");
                }
                
                that.setOutputData(0, response.thoughts);

                // Create a new FullPythonCodeNode
                var graph = that.graph;
                var newNode = LiteGraph.createNode("KRAGEN/fullpythoncode");
                newNode.pos = [that.pos[0] + 500, that.pos[1]]; // Position to the right of the current node
                graph.add(newNode);
                
                // Connect the output of GenerateCodeFromPlansNode to the input of FullPythonCodeNode
                that.connect(0, newNode.id, 0);

                // Update the response property
                that.properties.output = response.thoughts;
                that.properties.executed = true;
                newNode.properties.code = response.thoughts;
                newNode.properties.question = that.properties.question;
                newNode.properties.filename = response.filename;

                // Update mode to executed
                that.updateMode();
                
                // Draw the updated response in the node
                that.graph.setDirtyCanvas(true, true);
                
                // Add a message about the automatic execution
                window.addMessage("Generated code and automatically executing the next node in the workflow.", 'assistant');
                
                // Save the updated graph state with the executed node and connection
                if (window.currentChatId && window.saveCurrentGraphState) {
                    window.saveCurrentGraphState();
                }
                
                // Automatically execute the next node
                setTimeout(function() {
                    newNode.onExecute();
                }, 500);
            },
            function(errorMsg) {
                that.properties.error = true;
                that.properties.output = errorMsg;
                that.updateMode();
                window.addMessage("Error: " + errorMsg, 'assistant');
                that.graph.setDirtyCanvas(true, true);
            }
        );
    }
};

LiteGraph.registerNodeType("KRAGEN/Generate_Code", GenerateCodeFromPlansNode);

// Function to save current graph state
window.saveCurrentGraphState = function() {
    if (!window.currentChatId) {
        console.warn("Cannot save graph state: No current chat ID");
        return;
    }
    
    try {
        var graphData = graph.serialize();
        
        // Send graph data to backend
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/save_graph", true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    console.log("Graph state saved successfully");
                } else {
                    console.error("Failed to save graph state:", xhr.status, xhr.statusText);
                }
            }
        };
        
        xhr.send(JSON.stringify({
            chat_id: window.currentChatId,
            graph_data: graphData
        }));
    } catch (error) {
        console.error("Error saving graph state:", error);
    }
};