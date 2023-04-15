import dotenv from "dotenv";
import { openAiClient } from "./openAiClient.js";
import { executeCommandOnTerminal } from "./tools/executeTerminal.js";
import { writeToFile } from "./tools/writeToFile.js";
import { writeCode } from "./tools/writeCode.js";
import { promptUser } from "./tools/promptUser.js";

dotenv.config();

function extractCodeFromText(inputText) {
  const questionRegex = /Question:\s*(.*)/;
  const thoughtRegex = /Thought:\s*(.*)/;
  const actionRegex = /Action:\s*(.*)/;
  const inputRegex = /Action Input:\s*(.*)/;

  const questionMatch = inputText.match(questionRegex);
  const thoughtMatch = inputText.match(thoughtRegex);
  const actionMatch = inputText.match(actionRegex);
  const inputMatch = inputText.match(inputRegex);

  if (actionMatch && inputMatch) {
    const action = actionMatch[1];
    const input = inputMatch[1];
    return { questionMatch, thoughtMatch, action, input };
  } else {
    console.error("No action or input found");
  }
}

async function executeTool({ action, input }) {
  switch (action) {
    case "EXECUTE_TERMINAL":
      return executeCommandOnTerminal(input);
    case "WRITE_FILE":
      return writeToFile(input);
    case "WRITE_CODE":
      return writeCode(input);
    case "PROMPT_USER":
      return promptUser(input);
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

1. EXECUTE_TERMINAL: Execute a command on the terminal. Action Input while choosing this action should be to the command to execute.
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
  const extractedCodeFromText = extractCodeFromText(response.message.content);
  const toolResult = await executeTool(extractedCodeFromText);
  console.log(toolResult);
  return { actionInput: extractedCodeFromText, toolResult };
}

export default async function generate({
  tasks = [],
  objective,
  result = "",
  taskDescription = "",
}) {
  const { actionInput, toolResult } = await generateTasks({
    result,
    taskDescription,
    incompleteTasks: [objective],
    objective: objective,
  });
  if (actionInput.action === "MORE_TASKS") {
    await generate({
      tasks: [...toolResult, ...tasks],
      objective,
      result,
      taskDescription,
    });
  } else {
    await generate({
      objective,
      result: toolResult,
      taskDescription: actionInput.questionMatch ?? actionInput.thoughtMatch,
    });
  }
}

generate({
  objective:
    "Create a Express app with postgres database and NextJS frontend that allows users to create and view posts",
});
