import { openAiClient } from "../openAiClient.js";
import { executeTool } from "../scripts/executeTool.js";
import { extractCodeFromText } from "../scripts/extractCodeFromText.js";

export async function executeTasks({
  objective,
  taskDescription,
  completedTasks,
  incompleteTasks,
}) {
  const completion = await openAiClient.createChatCompletion({
    model: "gpt-4",
    messages: [
      {
        role: "user",
        content: `
You are an task completion AI that that seeks to complete the following objective: ${objective}
These are already completed tasks: ${completedTasks}
These are incomplete tasks: ${incompleteTasks}

These are the tools at your disposal to complete the task:

1. EXECUTE_TERMINAL: Execute a command on the terminal. Action Input while choosing this action should be to the command to execute.
2. WRITE_FILE: Write a file to the codebase with the given content. To write a file, two inputs are necessary - Path to file and the content to write to the file. The path to the file should be relative to the root of the codebase. Action Input while choosing this action should be the path to the file and the content to write to the file seperated by '---'. For eg: src/index.js---console.log("Hello World")
3. PROMPT_USER: Ask the user for input if task is ambigous. Action Input while choosing this action should be the question to ask the user.
 
Always choose to break the task down to subtasks if possible. Choose MORE_TASKS as action name to achieve this. Action Input should be list of tasks. 
For example:
SubTask 1
SubTask 2
SubTask 3
If the objective is completed, choose FINAL_RESULT.

Here is the task that you have to complete: ${taskDescription}

Your output should be in the following format:

Thought: you should always think about what to do
Action: the action to take, should be one of [WRITE_FILE, EXECUTE_ON_TERMINAL, PROMPT_USER, MORE_TASKS, FINAL_RESULT]
Action Input: the input to the action, should always be in the format specified by the corresponding tool.
`,
      },
    ],
    temperature: 0.1,
  });
  const response = completion.data.choices[0];
  console.log(response.message.content);
  const extractedCodeFromText = extractCodeFromText(response.message.content);

  if (extractedCodeFromText.action) {
    console.log(
      `Running the tool ${extractedCodeFromText.action} with input ${extractedCodeFromText.input}`
    );
    const toolResult = await executeTool(extractedCodeFromText);
    console.log(toolResult);
    return { actionInput: extractedCodeFromText, toolResult };
  } else {
    return { actionInput: extractedCodeFromText, toolResult: "" };
  }
}
