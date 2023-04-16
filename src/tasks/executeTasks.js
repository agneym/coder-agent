import chalk from "chalk";
import ora from "ora";
import { openAiClient } from "../openAiClient.js";
import { executeTool } from "../scripts/executeTool.js";
import { extractCodeFromText } from "../scripts/extractCodeFromText.js";

export async function executeTasks({ objective, context = [] }) {
  ora("Getting AI").start();
  const completion = await openAiClient.createChatCompletion({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `
You are an task completion AI that that seeks to complete the objective provided by user.
You will break down the objective into tasks and complete them one by one. Keep tabs of completed and to do tasks.

These are the tools at your disposal to complete a task:

1. EXECUTE_TERMINAL: Execute a command on the terminal. Action Input while choosing this action should be to the command to execute.
2. WRITE_FILE: Write a file to the codebase with the given content. To write a file, two inputs are necessary - Path to file and the content to write to the file. The path to the file should be relative to the root of the codebase. Action Input while choosing this action should be the path to the file and the content to write to the file seperated by '---'. For eg: src/index.js---console.log("Hello World")
3. PROMPT_USER: Ask the user for input if task is ambigous. Action Input while choosing this action should be the question to ask the user.

To use the tools at your disposal, you can use the following syntax:
{"action": "EXECUTE_TERMINAL", "input": "npm install", completedTasks: ["Task 1", "Task 2"], toDoTasks: ["Task 3"]}
{"action": "WRITE_FILE", "filePath": "src/index.js", "content": "console.log('Hello World')", completedTasks: ["Task 1", "Task 2"], toDoTasks: ["Task 3"]}}
{"action": "PROMPT_USER", "input": "What is your name?", completedTasks: ["Task 1", "Task 2"], toDoTasks: ["Task 3"]}}
{"action": "MORE_TASKS", "input": ["Task 4", "Task 5", "Task 6"], completedTasks: ["Task 1", "Task 2"], toDoTasks: ["Task 3"]}}

Do not write explanations and output in this syntax. Make sure it is valid JSON string before output.
`,
      },
      {
        role: "user",
        content: `
Create an action plan to complete objective ${objective}

Pick up the first uncompleted task and try to complete it. 

If it cannot be completed using these tools, break down further into subtasks and return the tasks list in format:
{action: "MORE_TASKS", input: "Task 1\nTask 2\nTask 3"}
        `,
      },
      ...context,
    ],
    temperature: 0.1,
  });
  ora("Getting AI").succeed();
  const response = completion.data.choices[0];
  console.log(chalk.yellow("Message from assistant"), response.message.content);
  try {
    const extractedCodeFromText = extractCodeFromText(response.message.content);

    if (extractedCodeFromText.action === "MORE_TASKS") {
      await executeTasks({
        objective,
        context: [
          {
            role: "assistant",
            content: response.message.content,
          },
          {
            role: "user",
            content: `Pick the first uncompleted task from list to complete or reprioritize if necessary. All instructions that were provided earlier apply, your objective is still ${objective}
        
        ${extractedCodeFromText.input}
        `,
          },
        ],
      });
    }
    if (extractedCodeFromText.action) {
      console.log(
        `Running the tool`,
        chalk.blue.bold(extractedCodeFromText.action)
      );
      const toolResult = await executeTool(extractedCodeFromText);
      await executeTasks({
        objective,
        context: [
          {
            role: "assistant",
            content: response.message.content,
          },
          {
            role: "user",
            content: `Completed the task with result: ${toolResult}
If result is satisfactory, clear this task and move on to the next task. If not use the result to try again.
        `,
          },
        ],
      });
    }
  } catch (err) {
    await executeTasks({
      objective,
      context: [
        {
          role: "assistant",
          content: response.message.content,
        },
        {
          role: "user",
          content: `The response from the assistant was not in the correct format. Please try again.`,
        },
      ],
    });
  }
}
