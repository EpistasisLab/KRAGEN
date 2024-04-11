# Data Conversion
## Use Cases
### Alzheimer's Knowledgebase Conversion
The Alzheimer's Knowledgebase contains relationships that were converted into
natural language.  
The conversion process consisted of the following steps:
1. Relationships were extracted using Cypher Query Language and output as a CSV
file.  
2. The CSV file was then parsed and converted into English sentences using
language that is specific to the existing structure and relationships in the
Alzheimer's Knowledgebase.
3. This natural language was then vectorized using the `text-embedding-ada-002`
model via OpenAI's API.
4. The vectorized data was then uploaded into a Weaviate Vector Database.

All source code for this conversion process is available in the **src** folder.
