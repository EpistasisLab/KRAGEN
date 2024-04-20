# Performance Comparison on Various Question Types

| Methods              | Question Type 1 (T/F-1hop) #560 | Question Type 2 (T/F-2hop) # 540 | Question Type 3 (MCQ-1hop) # 498 | Question Type 4 (MCQ-2hop) # 419 |
| -------------------- | ------------------------------- | -------------------------------- | -------------------------------- | -------------------------------- |
| ChatGPT3.5           | 45.2%                           | 55.4%                            | 47.6%                            | 58.5%                            |
| OpenChat3.5          | 59.1%                           | 58.7%                            | 48.8%                            | 62.8%                            |
| ChatGPT4             | 68.6%                           | 62.4%                            | 56.6%                            | 53.1%                            |
| KRAGEN with ChatGPT4 | **80.3%**                       | **62.9%**                        | **70.4%**                        | **71.8%**                        |

# Experiment Setup

This document outlines the configurations and hyperparameters used for the performance comparison of various baseline models and KRAGEN.

## Baseline Models Configuration

### Azure AI ChatGPT3.5

- **Model:** gpt-3.5-turbo-16k
- **Temperature:** 0
- **Top P:** 1
- **Reference:** [Azure AI OpenAI Service Documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/reference)

### Azure AI ChatGPT4

- **Model:** gpt-4
- **Temperature:** 0
- **Top P:** 1
- **Reference:** [Azure AI OpenAI Service Documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/reference)

### OpenChat3.5

- **Model:** OpenChat 3.5
- **Temperature:** 0
- **Top P:** 1
- **Reference:** [Hugging Face OpenChat 3.5](https://huggingface.co/openchat/openchat_3.5)

### KRAGEN Configuration

- **Model:** gpt-4
- **Temperature:** 0
- **Top P:** 1
- **Embedding model:** text-embedding-ada-002
- **Reference:** [Azure AI OpenAI Service Documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/reference)

## Data Configuration

The evaluation encompasses four distinct question types, each representing a different level of complexity. The dataset for these evaluations is located within the `test_data` directory at the root of the GitHub repository.
:

- **Question Type 1 (T/F-1hop)**: Consists of 560 questions where each is a True/False question that can be answered with a single inference step.
- **Question Type 2 (T/F-2hop)**: Comprises 540 True/False questions, each necessitating two logical inference steps for resolution.
- **Question Type 3 (MCQ-1hop)**: Includes 498 multiple-choice questions (MCQs), each of which requires a single inference step to determine the correct option.
- **Question Type 4 (MCQ-2hop)**: Contains 419 multiple-choice questions that each require two inference steps to answer correctly.
