import dotenv from "dotenv";
import prompts from "prompts";
import { executeTasks } from "./tasks/executeTasks.js";
import chalk from "chalk";

dotenv.config();

export default async function generate({ objective }) {
  console.log(chalk.green("Building"), objective);
  await executeTasks({
    objective,
  });
}

(async () => {
  const response = await prompts({
    type: "text",
    name: "objective",
    message: "What do you want to build today?",
  });
  generate({
    objective: response.objective,
  });
})();
