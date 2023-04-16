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
You are a task prioritisation AI that that seeks to complete the following objective: ${objective}
The last completed task has the result: ${result}
This result was based on this task description: ${taskDescription}
These are already completed tasks: ${
          completeTasks.length === 0 ? "None" : completeTasks
        }
These are incomplete tasks: ${
          incompleteTasks.length === 0 ? "None" : incompleteTasks
        }

Your reponsibilities are to:
If there is a result, evaluate the result based on task description. Based on this check if the task was successfully executed.
If the task is deemed unsuccessful, add the task to the incomplete queue. If the task is deemed successful, add the task to the completed queue.

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
