import dotenv from "dotenv";
import { executeTasks } from "./tasks/executeTasks.js";

dotenv.config();

export default async function generate({ objective }) {
  await executeTasks({
    objective,
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
