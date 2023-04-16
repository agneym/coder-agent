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
  const {
    completedTasks: newCompletedTasks,
    incompleteTasks: newIncompleteTasks,
  } = await prioritiseTasks({
    objective,
    result,
    taskDescription,
    completeTasks: completedTasks,
    incompleteTasks: incompletedTasks,
  });
  const nextTask = newIncompleteTasks.shift();
  if (!nextTask) {
    console.log("Ran out of tasks!", { newCompletedTasks, newIncompleteTasks });
    return null;
  }
  const { actionInput, toolResult } = await executeTasks({
    objective,
    taskDescription: nextTask,
    completedTasks: newCompletedTasks,
    incompleteTasks: newIncompleteTasks,
  });

  if (actionInput.action === "FINAL_RESULT") {
    console.log("Completed");
    return toolResult;
  }
  return await generate({
    objective,
    taskDescription,
    completedTasks: newCompletedTasks,
    incompletedTasks: newIncompleteTasks,
    result: toolResult,
  });
}

const OBJECTIVE = "Create a ReactJS app that displays a list of movies";
generate({
  objective: OBJECTIVE,
  incompletedTasks: [OBJECTIVE],
});
