import { openAiClient } from "../openAiClient.js";

export async function prioritiseTasks({
  objective,
  result,
  taskDescription,
  completeTasks,
  incompleteTasks,
}) {
  const completion = await openAiClient.createChatCompletion({
    model: "gpt-4",
    messages: [
      {
        role: "user",
        content: `
The last completed task has the result: ${result}
This result was based on this task description: ${taskDescription}
These are already completed tasks: ${
          completeTasks.length === 0 ? "None" : completeTasks
        }
These are incomplete tasks: ${
          incompleteTasks.length === 0 ? "None" : incompleteTasks
        }

You are a task prioritisation AI that that seeks to complete the following objective: ${objective}
Your reponsibilities are to:
1. If there is no previous result, disregard and move to point 6. 
2. If there is result, Evaluate the result of the last completed task and decide if it was successful.
3. If the result was successful, then you should add the task to the completed tasks list.
4. If the result was not successful, then you should add the task to the incomplete tasks list.
5. If the result has tasks that are to be completed in the future, then you should add those tasks to the incomplete tasks list.
6. Prioritise the incomplete tasks list.

Return completed and incompleted tasks in an array seperated by "---". Do not label the categories. For eg:
  completed task 1
  completed task 2
  ---
  incomplete task 1
  incomplete task 2
`,
      },
    ],
    temperature: 0.1,
  });
  const response = completion.data.choices[0];
  const content = response.message.content;
  console.log("Prioritised tasks: \n", content);
  const [newCompleteTasks, newIncompleteTasks] = content.split("---");
  return {
    completedTasks: newCompleteTasks.split("\n").filter((task) => task),
    incompleteTasks: newIncompleteTasks.split("\n").filter((task) => task),
  };
}
