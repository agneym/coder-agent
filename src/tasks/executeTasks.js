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
3. WRITE_CODE: An AI to write code as you describe. Action Input while choosing this action should be the description of the code to write.
4. PROMPT_USER: Ask the user for input if task is ambigous. Action Input while choosing this action should be the question to ask the user.
5. MORE_TASKS: If the task is too big to completed in one go, use this tool. Action Input is not necessary for this tool.
6. FINAL_RESULT: If the task is completed, use this tool. Action Input is not necessary for this tool.
 
Here is the task that you have to complete: ${taskDescription}
If the task cannot be completed entirely by using [EXECUTE_TERMINAL, WRITE_FILE, WRITE_CODE, PROMPT_USER, FINAL_RESULT], choose MORE_TASKS.
If the task is completed, choose FINAL_RESULT.
Keep in mind the language and libraries choosen for achiving the objective from completed tasks. 

Your output should be in the following format:

Thought: you should always think about what to do
Action: the action to take, should be one of [WRITE_FILE, EXECUTE_ON_TERMINAL, WRITE_CODE, PROMPT_USER, MORE_TASKS, FINAL_RESULT]
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
