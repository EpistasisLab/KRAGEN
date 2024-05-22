<p align="center">
<img src="https://github.com/EpistasisLab/KRAGEN/blob/readme-update/images/OIG4.jpeg" width=400 />
</p>

# KRAGEN

**K**nowledge **R**etrieval **A**ugmented **G**eneration **EN**gine is a tool that combines knowledge graphs, Retrieval Augmented Generation (RAG), and advanced prompting techniques to solve complex problems with natural language. KRAGEN converts knowledge graphs into a vector database and uses RAG to retrieve relevant facts from it. KRAGEN uses advanced prompting techniques: namely graph-of-thoughts (GoT), to dynamically break down a complex problem into smaller subproblems, and proceeds to solve each subproblem by using the relevant knowledge through the RAG framework, which limits the hallucinations, and finally, consolidates the subproblems and provides a solution. KRAGEN’s graph visualization allows the user to interact with and evaluate the quality of the solution’s GoT structure and logic.

KRAGEN will use your formatted data dump (ie Neo4j knowledge base relationships and node information), put it into a vector database using the open source Weaviate database, and deploy a custom Graph of Thoughts viewer using React. You will be able to ask it any question regarding the data, and perform elaborate graph like solutions to resolve your query. Through the viewer you will be able to vet the thought process of answering your question, limiting hallucination and managing the logic of the LLM.

---

## Installation Requirements

### System Requirements:

Any machine capable of running Docker should be able to run KRAGEN. So if your Linux or Mac system meets Docker's
system requirement for [Linux](https://docs.docker.com/desktop/install/linux-install/#system-requirements) or for [Mac](https://docs.docker.com/desktop/install/mac-install/) then your machine can run KRAGEN!  
KRAGEN was tested using the following system configurations:  
Linux:

- Operating System: Ubuntu 22.04.4 LTS
- Processor: 11th Gen Intel Core i7
- RAM: 32 GB
- Architecture: x86-64

Mac:

- Operating System: MacOS 14.4
- Processor: Apple M1 Max
- RAM: 64 GB
- Architecture: ARM64

### Software Requirements:

Docker is required. For installation instructions see the [Official Docker Installation Guide.](https://docs.docker.com/engine/install/)  
If you are not familiar with Docker concepts, see the [Official Docker Getting Started Guide.](https://docs.docker.com/engine/getstarted/step_one/)

## Installation

1. **Clone the repository:**  
   `git clone https://github.com/EpistasisLab/KRAGEN.git`
2. **Change directory into the KRAGEN directory:**  
   `cd KRAGEN`
3. **Copy the .env.sample file:**  
   `cp .env.sample .env`
4. **Update the variables in the `.env` file in a text editor:**
   - **OPENAI_API_KEY**: Set this to your own OpenAI api key, for instructions on
     how to obtain a key, see the [OpenAI documentation](https://help.openai.com/en/articles/4936850-where-do-i-find-my-openai-api-key)
   - **WEAVIATE_URL**: Set this to your local IP address and port 8080, for example. http://192.168.1.49:8080
     - **NOTE:** Weaviate can be run locally or hosted on a server. The `docker-compose-weaviate.yml` file is provided for convenience. However, other setups can also work with KRAGEN.
       For complete instructions on how to deploy a Weaviate Vector Database, please see the [Weaviate Documentation](https://weaviate.io/developers/weaviate/installation/docker-compose#starter-docker-compose-file)
   - **WEAVIATE_API_KEY** (optional): This is required only if the Weaviate Server you are connecting to requires an API Key.
5. **Configure the KRAGEN GUI:**  
   `cp KRAGEN_Dashboard/Frontend/.env.sample KRAGEN_Dashboard/Frontend/.env` - **NOTE**: there is no need to update the variables in the **KRAGEN_Dashboard/Frontend/.env** file, KRAGEN will work with the current default values.
6. **Build the Docker images:**  
   `docker compose build` - This command will build all Docker images required to run KRAGEN. - Building these images for the first time may take a few minutes.
7. **Convert your data and prime the Weaviate Database:**  
**_(Optional Step)_** If you already have a Weaviate Vector DB with your vectorized data, you may skip to step 8.  
**⚠️ Some VPN services may block OpenAI API Calls. So, if this step fails, you may want to run it when not connected to a VPN Service.**
   `docker compose run kragen setup test.csv` - This runs the `setup` command targeting your data (we are using test.csv as an example). This process will go through multiple steps ensuring that your knowledge graph data dump is properly _formatted_, _vectorized_, and _uploaded_ to your local Weaviate server.
   - Please follow the format of **test.csv** and upload your own dataset. To generate our **test.csv**, we used the publicly accesible knowledge graph AlzKB (https://alzkb.ai/) as our resource. To check out how we generated the CSV using the public knowledge graph, see the Jupyter notebook in [src/extract_data.ipynb](https://github.com/EpistasisLab/KRAGEN/blob/main/src/extract_data.ipynb). - For more details about the conversion process see [conversion.md](https://github.com/EpistasisLab/KRAGEN/blob/main/conversion.md)

8. **Boot up KRAGEN!**  
   `docker compose up gui`
9. Visit http://localhost:3000 to start using KRAGEN!

If you used the sample dataset, try asking "what genes are associated with caffeine?" and analyze the thought flow!

<p align="center">
<img src="https://github.com/EpistasisLab/KRAGEN/blob/readme-update/images/KG2Diagram.png" />
</p>

## Using KRAGEN

### Querying with KRAGEN:

- Access KRAGEN via the provided interface or command line.
- Enter your query or problem statement into the designated input field.
- KRAGEN utilizes its integrated knowledge graphs and RAG framework to process the query.
- Expect to receive a comprehensive solution or relevant information to your query.

### Understanding the Output:

- In the main area of the interface, explore the knowledge graph and the information retrieved by the RAG framework.
- Navigate through the nodes and connections to gain insights into the problem domain and the retrieved facts.
- Evaluate the thoughts generated by KRAGEN as it breaks down the problem into smaller subproblems.
- Assess the relevance and accuracy of the retrieved knowledge and how it contributes to the final solution.

### Query History:

- Use the query history tab on the left to revisit past queries and solutions.
- Access previous interactions to review or build upon previous findings.
- Leverage the query history feature to maintain continuity in problem-solving or knowledge exploration sessions.

---

## Stopping KRAGEN

To stop KRAGEN from running, you can use this command:  
While the KRAGEN **GUI** is running, press `ctrl+c` to stop it and wait for the process to exit.
Then, to stop all running containers, run: `docker compose stop`, or to remove the containers, run: `docker compose down`

## Reconfiguring the Backend

Once all the **Installation** steps are performed, KRAGEN is fully configured. However, if you update any configuration variables in your `.env` or `config/kragen.env` file, you will need to run a command to update KRAGEN's Backend configuration. Make sure KRAGEN is [stopped](#stopping-kragen) and then run:  
`docker compose run kragen config_backend`  
and then boot up KRAGEN:  
`docker compose up gui`

## Performance Evaluation and Reproducibility

<img src="images/radar_chart_kragen.png" alt="Radar Chart of KRAGEN Performance" width="80%" height ="80%">

The radar chart above illustrates the comparative performances of the methods.

Please refer to [Benchmark_Comparison_and_Setup.md](Benchmark_Comparison_and_Setup.md) for detailed insights into the Performance Comparison across Various Question Types, experiment setup configurations, and datasets.

---

## Special Thanks To:

- Forked the original Graph of Thoughts logic from https://github.com/spcl/graph-of-thoughts/

## License

Please see the [repository license](https://github.com/EpistasisLab/KRAGEN/blob/master/LICENSE) for the licensing and usage information for KRAGEN.

Generally, we have licensed KRAGEN to make it as widely usable as possible.
