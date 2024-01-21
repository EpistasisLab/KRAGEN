// worker.js
// self.onmessage = (event) => {
//   switch (event.data.task) {
//     case "getEngines":
//       const enginesResult = getEngines(); // Simulating the async function
//       self.postMessage({ task: "getEngines", result: enginesResult });
//       break;
//   }
// };

// Simulating the getEngines function
// async function getEngines() {
//   // fetch("http://localhost:3080/models")
//   await fetch("http://127.0.0.1:5050/openai/v1/models")
//     .then((res) => res.json())
//     .then((data) => {
//       // filter elements whose id include "gpt"

//       let filteredModel = data.data.filter((item) => item.id.includes("gpt"));

//       console.log("filteredModel", filteredModel);

//       setModels(filteredModel);
//     });
// }
