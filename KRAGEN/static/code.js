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
    
    // Increase size for code display
    this.size = [400, 200];
    
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
        ctx.fillStyle = "#AAA";
        ctx.fillText("Code:", 10, 30);
        ctx.fillStyle = "#CCC";
        var lines = this.properties.code ? this.properties.code.split('\n') : [];
        for (var i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], 10, 50 + i * 20, this.size[0] - 20);
        }
        ctx.restore();
    }
};

FullPythonCodeNode.prototype.onExecute = function() {
    var that = this;
    if(!that.properties.executed){
        // Set as processing
        that.properties.executed = true;
        
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
                
                // Create PythonSnippet nodes
                var graph = that.graph;

                console.log(response.instructions);
                window.addMessage("Generated code execution plan with " + response.instructions.length + " steps.", 'assistant');

                var createdNodes = [];
                for(var i = 0; i < response.instructions.length; i++){
                    console.log(response.instructions[i]);
                    var newNode = LiteGraph.createNode("KRAGEN/pythonsnippet");
                    newNode.pos = [that.pos[0] + 500, that.pos[1] - 250 + i*500]; // Position to the right of the current node
                    graph.add(newNode);
                    
                    // Connect the output of FullPythonCodeNode to the input of PythonSnippetNode
                    that.connect(0, newNode.id, 0);

                    // Update the node properties
                    newNode.properties.code = response.instructions[i]['Code'][0];
                    newNode.properties.question = that.properties.question;
                    newNode.properties.filename = response.filename;
                    newNode.properties.stepID = response.instructions[i]['StepID'];
                    newNode.properties.instruction = response.instructions[i]['instruction'];
                    
                    createdNodes.push(newNode);
                }

                // Draw the updated response in the node
                that.graph.setDirtyCanvas(true, true);
                
                // Execute the first PythonSnippet node if any were created
                if (createdNodes.length > 0) {
                    window.addMessage("Automatically executing the first step in the workflow.", 'assistant');
                    
                    // Save the updated graph state with all nodes created
                    if (window.currentChatId && window.saveCurrentGraphState) {
                        window.saveCurrentGraphState();
                    }
                    
                    setTimeout(function() {
                        createdNodes[0].onExecute();
                    }, 500);
                }
            },
            function(errorMsg) {
                that.properties.executed = false;
                that.properties.error = true;
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
    
    // Node-specific properties
    this.addProperty("stepID", "");
    this.addProperty("instruction", "");
    this.addProperty("question", "");
    this.addProperty("filename", "");
    this.addWidget("textarea", "Code", this.properties.code, "code", { rows:10, cols:40 });
    
    // Increase size for code display
    this.size = [400, 200];
    
    // Node-specific endpoint
    this.start_endpoint = "/";
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
        ctx.fillStyle = "#AAA";
        ctx.fillText("Code:", 10, 30);
        ctx.fillStyle = "#CCC";
        var lines = this.properties.code ? this.properties.code.split('\n') : [];
        for (var i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], 10, 50 + i * 20, this.size[0] - 20);
        }
        ctx.restore();
    }
};

PythonSnippetNode.prototype.onExecute = function() {
    var that = this;
    if(!that.properties.executed){
        // Set as executing
        that.properties.executed = true;
        
        // Add a message about execution
        window.addMessage("Executing step " + that.properties.stepID + ": " + that.properties.instruction, 'assistant');
        
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
                that.setOutputData(0, response.thoughts);
                window.addMessage("Successfully completed step " + that.properties.stepID, 'assistant');
                
                // Save the updated graph state after node execution
                if (window.currentChatId && window.saveCurrentGraphState) {
                    window.saveCurrentGraphState();
                }
            },
            function(errorMsg) {
                that.properties.executed = false;
                that.properties.error = true;
                window.addMessage("Error in step " + that.properties.stepID + ": " + errorMsg, 'assistant');
                that.graph.setDirtyCanvas(true, true);
            }
        );
    }
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