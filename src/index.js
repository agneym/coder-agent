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
    console.log("Ran out of tasks!", {
      newCompletedTasks,
      newIncompleteTasks,
    });
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
  if (actionInput.action === "MORE_TASKS") {
    console.log("actionInput", actionInput.input);
    return await generate({
      objective,
      taskDescription: nextTask,
      completedTasks: newCompletedTasks,
      incompletedTasks: [...actionInput.input, ...newIncompleteTasks],
      result: null,
    });
  }
  if (!actionInput.action) {
    return await generate({
      objective,
      taskDescription: nextTask,
      completedTasks: newCompletedTasks,
      incompletedTasks: [actionInput.thought, ...newIncompleteTasks],
      result: null,
    });
  }

  return await generate({
    objective,
    taskDescription: nextTask,
    completedTasks: newCompletedTasks,
    incompletedTasks: newIncompleteTasks,
    result: toolResult,
  });
}

const OBJECTIVE = `
Create a NodeJS Express API that can store and retrieve dad jokes.
The API should have the following endpoints:
1. GET /jokes - Returns all the jokes
2. GET /jokes/:id - Returns the joke with the given id
3. POST /jokes - Creates a new joke
4. PUT /jokes/:id - Updates the joke with the given id
5. DELETE /jokes/:id - Deletes the joke with the given id
Use Postgres database to store the jokes.
`.replace(/\n/g, " ");
generate({
  objective: OBJECTIVE,
  incompletedTasks: [OBJECTIVE],
});
