# The got_main function is based on the got() function in the chatapi.py. However the got_main function is modified to receive the prompt_question, model, and got_config_dir as arguments, and return the response from the language model.
from KRAGEN_GOT.got_main import got_main
import json
import os
import re

# read json files from the directory
def read_json_files_from_directory(directory, type_of_question):
    files = os.listdir(directory)
    json_files = []
    total_problems=[]
    for file in files:
        if file.endswith(".json") and type_of_question in file:
            json_files.append(file)

    for json_file in json_files:
        with open(os.path.join(directory, json_file), "r") as f:
                data = json.load(f)
                # print(data)
        # if True_or_False in the file name
        if "True_or_False" in json_file:
            total_problems.extend(data)
        elif "MCQ" in json_file:
            total_problems.extend(data)
        elif "OpenEnded" in json_file:
            total_problems.extend(data)
        
    return total_problems

# Combine the prompt and the question
def combine_prompt_question(question, type_question ):
    prompt = ""
    if "MCQ" in type_question:
        prompt = question + " Please respond in the format 'Answer:<number>'. For instance, if the correct answer to the question falls within choices 1 to 5 and the correct answer is 1, simply respond with 'Answer:1'."
    elif "True_or_False" in type_question:
        prompt = question + " Please reply to the question with 'Answer: True' if the statement is correct, or 'Answer: False' if the statement is incorrect. Ensure you choose only one of these options."
    # for other types of questions, we need to add more elif statements
    return prompt

# Convert the unofficial algorithm name to the official model name
def convert_model_name(unofficial_algo_name):

    if unofficial_algo_name == "openai-chatgpt-3.5":
        # model = "gpt-3.5-turbo-16k"
        official_model = "chatgpt"
        
    elif unofficial_algo_name == "openai-chatgpt-4":
        official_model= "chatgpt4"

    # for other models, we need to add more elif statements
    return official_model

# Check the response from the language model and extract the answer
def check_response(ans_by_llm,type_of_question):
    # extract integer from string , which is the answer from LLM
    # drop : from ans_by_llm
    ans_by_llm = ans_by_llm.replace(":", "")
    # parse ans_by_llm with space as delimiter
    ans_by_llm_parsed = ans_by_llm.split(" ")
    #find any element which has number string in ans_by_llm_parsed
    num_ans_by_llm = "-1"

    # if type_of_question == "MCQ":
    if "MCQ" in type_of_question:
        for i in ans_by_llm_parsed:
            # Use regular expression to find digits
            match = re.search(r'\d+', i)
            if match:
                num_ans_by_llm = int(match.group())
                break
    
    # elif type_of_question == "True_or_False":
    elif "True_or_False" in type_of_question:
        # lower case ans_by_llm
        ans_by_llm = ans_by_llm.lower()

        if "true" in ans_by_llm and "false" not in ans_by_llm:
            num_ans_by_llm = "True"
        elif "false" in ans_by_llm and "true" not in ans_by_llm:
            num_ans_by_llm = "False"
        else:
            print("Either both True and False are found, or neither is in ans_by_llm")
            num_ans_by_llm = "-1"

    
    return num_ans_by_llm

if __name__ == "__main__":

    # There are four types of questions: True_or_False_1hop, True_or_False_2hop, MCQ_1hop, MCQ_2hop
    # please choose one of the following types of questions
    type_of_question = "True_or_False_1hop"
    # type_of_question = "True_or_False_2hop"
    # type_of_question = "MCQ_1hop"
    # type_of_question = "MCQ_2hop"

    # test_set_dir is the directory where the test set is located
    test_set_dir = "PATH_TO_TEST_SET_DIRECTORY" 
    
    # got_config_dir is the directory where the config.json file is located
    got_config_dir = "PATH_TO_CONFIG.JSON_FILE"

    # results_directory is the directory where the results will be saved
    results_directory = "PATH_TO_RESULTS_DIRECTORY"

    # results_file is the name of the file where the results will be saved
    results_file = "RESULTS_FILE_NAME.json"

    # read the data from the test set directory
    data=read_json_files_from_directory(test_set_dir, type_of_question)
    
    # models
    models_list = [
        "openai-chatgpt-3.5",
        # "openai-chatgpt-4",
    ]

    # sort models_list
    models_list.sort()

    # time_to_repeat = 10, and current_time_to_repeat = 0, then exp_time = 0,1,2,3,4,5,6,7,8,9
    time_to_repeat = 1
    current_time_to_repeat = 0

    # # Iterate over each model
    for model_path in models_list:
        model_path_temp = model_path.replace("/", "_")
        
        # Repeat the evaluation for the specified number of times
        # time_to_repeat = 10, and current_time_to_repeat = 0, then exp_time = 0,1,2,3,4,5,6,7,8,9
        for exp_time in range(current_time_to_repeat, time_to_repeat):
            submitted_questions_answers_by_llm = []
            
            # data_with_replacement
            num_of_questions = len(data)

            # Iterate over each question
            for question_num in range(len(data)):

                prompt_question=combine_prompt_question(data[question_num]['question'],type_of_question)
                model=convert_model_name(model_path_temp)
                returned_got=got_main(prompt_question,model,got_config_dir)
                ans_by_llm=check_response(returned_got,type_of_question)
                submitted_questions_answers_by_llm.append({"question":data[question_num]['question'], "answer":data[question_num]['answer'], "response_by_llm":ans_by_llm})

            # Create the directory if it doesn't exist
            if not os.path.exists(results_directory):
                os.makedirs(results_directory)

            # Save the results to a JSON file
            with open(results_directory + results_file, 'w') as json_file:
                json.dump(submitted_questions_answers_by_llm, json_file)
            
            

    



