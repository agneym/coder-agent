import dotenv from "dotenv";
import { executeTasks } from "./tasks/executeTasks.js";
import { prioritiseTasks } from "./tasks/prioritiseTasks.js";

dotenv.config();

export default async function generate({
  completedTasks = [],
  incompletedTasks = [],
  objective,
  result = "",
  taskDescription = "",
}) {
  const { completeTasks, incompleteTasks } = await prioritiseTasks({
    objective,
    result,
    taskDescription,
    completedTasks: completedTasks,
    incompletedTasks: incompletedTasks,
  });
  const nextTask = incompleteTasks.shift();
  if (!nextTask) {
    console.log("Ran out of tasks!", { completeTasks, incompleteTasks });
    return null;
  }
  const { actionInput, toolResult } = await executeTasks({
    objective,
    taskDescription: nextTask,
    completedTasks: completeTasks,
    incompleteTasks: incompleteTasks,
  });

  if (actionInput.action === "FINAL_RESULT") {
    console.log("Completed");
    return toolResult;
  }
  generate({
    objective,
    taskDescription,
    completedTasks: completeTasks,
    incompletedTasks: incompleteTasks,
    result: toolResult,
  });
}

const OBJECTIVE = "Create a ReactJS app that displays a list of movies";
generate({
  objective: OBJECTIVE,
  incompletedTasks: [OBJECTIVE],
});
