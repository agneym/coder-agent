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

Evaluate the result to check if the task is successful and generate and prioritise the next tasks to complete the objective: ${objective}
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
