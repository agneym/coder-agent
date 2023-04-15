import dotenv from "dotenv";
import { openAiClient } from "./openAiClient.js";
import { executeCommandOnTerminal } from "./tools/executeTerminal.js";
import { writeToFile } from "./tools/writeToFile.js";

dotenv.config();

const CODE_WRITING_PROMPT = `
Your responsibility is to write code. 

Write code for described use case and return the results. Do not write explanations. 
`;

const TASK_PROMPT = `
You will be given a task to perform. Performing the task would lead to completing codebase.
You have certain tools at your disposal to achieve this:
1. EXECUTE_TERMINAL: Execute a command on the terminal. Action Input while choosing this action should be to the command to execute. It will be executed in project folder.
2. WRITE_FILE: Write a file to the codebase with the given content. Action Input while choosing this action should be of the format {Path to file---Content in the file}.
3. WRITE_CODE: An AI to write code as you describe. Action Input while choosing this action should be the description of the code to write.
4. PROMPT_USER: Ask the user for input. Action Input while choosing this action should be the question to ask the user.

Your output should be in the following format:
Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [WRITE_FILE, EXECUTE_ON_TERMINAL, WRITE_CODE]
Action Input: the input to the action
Expected result: the expected result of the action
`;

function extractAction(inputText) {
  const actionRegex = /Action:\s*(\w+)/;
  const inputRegex = /Action Input:\s*([\w.]+)/;

  const actionMatch = inputText.match(actionRegex);
  const inputMatch = inputText.match(inputRegex);

  if (actionMatch && inputMatch) {
    const action = actionMatch[1];
    const input = inputMatch[1];
    return { action, input };
  } else {
    console.log("No action or input found");
  }
}

async function executeTool({ action, input }) {
  console.log({ action, input });
  switch (action) {
    case "EXECUTE_TERMINAL":
      await executeCommandOnTerminal(input);
      break;
    case "WRITE_FILE":
      writeToFile("", "content");
      break;
    case "WRITE_CODE":
      break;
    case "PROMPT_USER":
      break;
    case "MORE_TASKS":
      return input.split("/n");
    default:
      break;
  }
}

async function generateTasks({
  objective,
  result,
  taskDescription,
  incompleteTasks,
}) {
  const completion = await openAiClient.createChatCompletion({
    model: "gpt-4",
    messages: [
      {
        role: "user",
        content: `
You are an task completion AI that that seeks to complete the following objective: ${objective}
The last completed task has the result: ${result}
This result was based on this task description: ${taskDescription}
These are incomplete tasks: ${incompleteTasks}

These are the tools at your disposal to complete the task:

1. EXECUTE_TERMINAL: Execute a command on the terminal. Action Input while choosing this action should be to the command to execute. It will be executed in project folder.
2. WRITE_FILE: Write a file to the codebase with the given content. Action Input while choosing this action should be of the format {Path to file---Content in the file}.
3. WRITE_CODE: An AI to write code as you describe. Action Input while choosing this action should be the description of the code to write.
4. PROMPT_USER: Ask the user for input. Action Input while choosing this action should be the question to ask the user.
5. MORE_TASKS: Based on the result, create new tasks to be completed that do not overlap with existing tasks. Return tasks as an array in Action Input. 
 
Your output should be in the following format:
Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [WRITE_FILE, EXECUTE_ON_TERMINAL, WRITE_CODE, PROMPT_USER, MORE_TASKS]
Action Input: the input to the action
Expected result: the expected result of the action
`,
      },
    ],
    temperature: 0.1,
  });
  const response = completion.data.choices[0];
  console.log(response);
  const actionInput = extractAction(response.message.content);
  const toolResult = await executeTool(actionInput);
  return toolResult;
}

export default async function generate(objective) {
  const tasks = await generateTasks({
    result: "",
    taskDescription: "",
    incompleteTasks: [objective],
  });
  console.log({ tasks });
}

generate(
  "Create a rails app with a postgresql database and a react frontend to submit and display the form data"
);
