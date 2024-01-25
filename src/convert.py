import os
import pandas as pd
import json
import pprint
import ast

import dask.dataframe as dd

def mk_dir(directory):
    os.makedirs(directory, exist_ok=True)

# def read_file(input_csv_file):
#     df = pd.read_csv(input_csv_file)
#     return df

def read_file(input_csv_file, chunk_size=5):
    ddf = dd.read_csv(input_csv_file, blocksize=chunk_size * 1000)
    return ddf

def convert_csv(ddf):
    # processed_ddf = ddf.map_partitions(lambda part: part.apply(process_row, axis=1, column_mapping=column_mapping), meta=ddf)
    # processed_ddf = ddf.map_partitions(lambda part: part.apply(process_row, axis=1), meta=ddf)
    unique_nodes = get_unique_nodes(ddf)
    # node property dataset (gets the definition of certain nodes)
    dataset1 = generate_unique_node_dataset(unique_nodes)
    dataset2 = generate_relationship_dataset(ddf)
    dataset_1 = pd.DataFrame(dataset1).T
    dataset_2 = pd.DataFrame(dataset2).T
    processed_ddf = pd.concat([dataset_1,dataset_2])
    return processed_ddf

def get_unique_nodes(df):
    unique_nodes = pd.DataFrame(df[["source","source_label"]].values)
    unique_nodes = pd.concat([unique_nodes,pd.DataFrame(df[["target","target_label"]].values)])
    unique_nodes = unique_nodes.drop_duplicates()
    unique_nodes.columns = ["id","label"]
    #reindex unique nodes
    unique_nodes = unique_nodes.reset_index(drop=True)
    return unique_nodes

def generate_unique_node_dataset(unique_nodes):
    dataset = {}
    index = 0
    
    
    for type in unique_nodes["label"].unique():
        temp = unique_nodes[unique_nodes["label"]==type].copy()
        for i in range(temp.shape[0]):
            # print(temp.iloc[i]["id"])
            id = temp.iloc[i]["id"]
            # pprint.pprint(id)
            # json.dumps(id)
            #escape single quotes
            # id = id.replace("'","\\'")
            # convert string into json after escaping single and double quotes. replace single quotes with double quotes
            # id = json.dumps(eval(id))
            id = ast.literal_eval(id)
            # print(id)
            # id = parse_json_string(id)
    
            match type:
                case "Gene":
                    statement = "Gene " + id["geneSymbol"] + " is a "+id["typeOfGene"] + " gene for " + id["commonName"]
                    # print(statement)
                    query = "What does the gene " + id["geneSymbol"] + " do?"
                    # print(query)
    
                #drugs should be set as relationships to the disease
                case "Drug":
                    continue
                #disease should be set as relationships to the gene
                case "Disease":
                    continue
                case "Symptom":
                    continue
                case "BodyPart":
                    continue
                case "Pathway":
                    continue
                case "BiologicalProcess":
                    continue
                case "CellularComponent":
                    continue
                case "MolecularFunction":
                    continue
                case "DrugClass":
                    continue
            dataset[index] = {"query":query,"statement":statement}
            index += 1
    return dataset

def convert_relation(relation):
    match relation:
        case "chemical or drug binds the gene" | "chemical or drug increases the gene expression" | "chemical or drug decreases the gene expression" | \
            "chemical or drug in the drug class" | "chemical or drug treats the disease" | "chemical or drug causes effect to the disease" | \
                "gene participates in the biological process" | "gene interacts with the gene" | "body part over-expresses the gene" | \
                    "body part under-expresses the gene":
            return " because the " + relation
        case "gene in the pathway":
            return " because the gene is in the pathway"
        case "symptom manifestation of the disease":
            return " because the symptom is a manifestation of the disease"
        case "disease localizes to anatomy or body part":
            return " because the disease localizes to the body part"
        case _:
            return ""
def generate_relationship_dataset(df):
    df = pd.DataFrame(df[["source","source_label","target","target_label","relationship_type"]].values)
    df.columns = ["source","source_label","target","target_label","relationship_type"]
    
    dataset2 = {}
    index = 0
    for source_label in df["source_label"].unique():
        temp = df[df["source_label"]==source_label].copy()
        print(temp)
        #'Gene', 'Drug', 'Disease', 'Symptom', 'BodyPart'
        match source_label:
            case "Gene":
                print(source_label)
                # print(temp["relationship_type"].unique())
                print(temp["target_label"].unique())
                for target_label in temp["target_label"].unique():
                    temp2 = temp[temp["target_label"]==target_label].copy()
                    temp2 = temp2.reset_index(drop=True)
                    for i in temp2.index:
                        source = temp2.iloc[i]["source"]
                        source = ast.literal_eval(source)
                        target = temp2.iloc[i]["target"]
                        target = ast.literal_eval(target)
                        relation = temp2.iloc[i]["relationship_type"]
                        match target_label:
                            #['Pathway' 'Gene' 'BiologicalProcess' 'CellularComponent' 'MolecularFunction' 'Disease']
                            case "Pathway":
                                query = "What pathway is the gene " + source["geneSymbol"] + " involved in?"
                                statement = "The gene " + source["geneSymbol"] + " is involved in the " + target["commonName"] + " pathway"
                                # print(query,statement)
                            case "Gene":
                                query = "What gene is associated with " + source["geneSymbol"] + "?"
                                statement = "The gene " + source["geneSymbol"] + " is associated with the gene " + target["geneSymbol"]
                                # print(query,statement)
                            case "BiologicalProcess":
                                query = "What biological process is the gene " + source["geneSymbol"] + " involved in?"
                                statement = "The gene " + source["geneSymbol"] + " is involved in the biological process " + target["commonName"]
                                # print(query,statement)
                            case "CellularComponent":
                                query = "What cellular component is the gene " + source["geneSymbol"] + " involved in?"
                                statement = "The gene " + source["geneSymbol"] + " is involved in the cellular component " + target["commonName"]
                                # print(query,statement)
                            case "MolecularFunction":
                                query = "What molecular function is the gene " + source["geneSymbol"] + " involved in?"
                                statement = "The gene " + source["geneSymbol"] + " is involved in the molecular function " + target["commonName"]
                                # print(query,statement)
                            case "Disease":
                                query = "What disease is the gene " + source["geneSymbol"] + " associated with?"
                                statement = "The gene " + source["geneSymbol"] + " is associated with the disease " + target["commonName"]
                                # print(query,statement)
    
                        statement += convert_relation(relation)
                        dataset2[index] = {"query":query,"statement":statement}
                        index += 1
                continue
            case "Drug": 
                print(source_label,temp["target_label"].unique())
                for target_label in temp["target_label"].unique():
                    temp2 = temp[temp["target_label"]==target_label].copy()
                    temp2 = temp2.reset_index(drop=True)
                    for i in temp2.index:
                        source = temp2.loc[i]["source"]
                        source = ast.literal_eval(source)
                        target = temp2.loc[i]["target"]
                        target = ast.literal_eval(target)
                        relation = temp2.loc[i]["relationship_type"]
                        match target_label:
                            #['Gene' 'DrugClass' 'Disease']
                            case "Gene":
                                query = "What gene is the drug " + source["commonName"] + " associated with?"
                                statement = "The gene " + target["geneSymbol"] + " is associated with the drug " + source["commonName"]
                                # print(query,statement)
                            case "DrugClass":
                                query = "What drug class is the drug " + source["commonName"] + " part of?"
                                statement = "The drug " + source["commonName"] + " is part of the " + target["commonName"] + " drug class"
                                # print(query,statement)
                            case "Disease":
                                query = "What disease is the drug " + source["commonName"] + " associated with?"
                                statement = "The drug " + source["commonName"] + " is associated with " + target["commonName"]
                                # print(query,statement)
                        statement += convert_relation(relation)
                        dataset2[index] = {"query":query,"statement":statement}
                        index += 1
                    
                
                continue
            case "Disease":
                print(source_label)
                print(temp["target_label"].unique())
                for target_label in temp["target_label"].unique():
                    temp2 = temp[temp["target_label"]==target_label].copy()
                    temp2 = temp2.reset_index(drop=True)
                    for i in temp2.index:
                        source = temp2.iloc[i]["source"]
                        source = ast.literal_eval(source)
                        target = temp2.iloc[i]["target"]
                        target = ast.literal_eval(target)
                        relation = temp2.iloc[i]["relationship_type"]
                        match target_label:
                            #['BodyPart' 'Disease']
                            case "BodyPart":
                                query = "What body part is affected by " + source["commonName"] + "?"
                                statement = "The "+target["commonName"] + " is associated with " + source["commonName"]
                                # print(query,statement)
                            case "Disease":
                                query = "What disease is associated with " + source["commonName"] + "?"
                                statement = "The disease " + source["commonName"] + " is associated with " + target["commonName"]
                                # print(query,statement)
                        statement += convert_relation(relation)
                        dataset2[index] = {"query":query,"statement":statement}
                        index += 1
                continue
            case "Symptom":
                print(source_label)
                print(temp["target_label"].unique())
                for target_label in temp["target_label"].unique():
                    temp2 = temp[temp["target_label"]==target_label].copy()
                    temp2 = temp2.reset_index(drop=True)
                    for i in temp2.index:
                        source = temp2.iloc[i]["source"]
                        source = ast.literal_eval(source)
                        target = temp2.iloc[i]["target"]
                        target = ast.literal_eval(target)
                        relation = temp2.iloc[i]["relationship_type"]
                        match target_label:
                            #[['Disease']
                            case "Disease":
                                query = "What symptom is associated with " + target["commonName"] + "?"
                                statement = source["commonName"] + " is associated with " + target["commonName"]
                                # print(query,statement)
                        statement += convert_relation(relation)
                        dataset2[index] = {"query":query,"statement":statement}
                        index += 1
                continue
            case "BodyPart":
                print(source_label)
                print(temp["target_label"].unique())
                for target_label in temp["target_label"].unique():
                    temp2 = temp[temp["target_label"]==target_label].copy()
                    temp2 = temp2.reset_index(drop=True)
                    for i in temp2.index:
                        source = temp2.iloc[i]["source"]
                        source = ast.literal_eval(source)
                        target = temp2.iloc[i]["target"]
                        target = ast.literal_eval(target)
                        relation = temp2.iloc[i]["relationship_type"]
                        match target_label:
                            #['Gene' ]
                            case "Gene":
                                query = "What body part is the gene " + target["geneSymbol"] + " associated with?"
                                statement = "The gene " + target["geneSymbol"] + " is associated with the " + source["commonName"]
                                # print(query,statement)
                        statement += convert_relation(relation)
                        dataset2[index] = {"query":query,"statement":statement}
                        index += 1
                continue

    return dataset2

# Save the Dask DataFrame to CSV files
def save_csv(ddf, output_directory):
    ddf.to_csv(os.path.join(output_directory, 'output_chunk_*.csv'))

def run(config):
    ddf = read_file(config['input_file'])
    converted_ddf = convert_csv(ddf)
    mk_dir(config['output_directory'])
    save_csv(converted_ddf, config['output_directory'])
