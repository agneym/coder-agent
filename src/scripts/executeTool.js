import { executeCommandOnTerminal } from "../tools/executeTerminal.js";
import { writeToFile } from "../tools/writeToFile.js";
import { promptUser } from "../tools/promptUser.js";

export async function executeTool({ action, input }) {
  switch (action) {
    case "EXECUTE_TERMINAL":
      return executeCommandOnTerminal(input);
    case "WRITE_FILE":
      return writeToFile(input);
    case "PROMPT_USER":
      return promptUser(input);
    case "MORE_TASKS":
      console.log("MORE_TASKS", input);
      return input.split("\n");
    default:
      break;
  }
}
