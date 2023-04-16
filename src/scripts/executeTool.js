import { executeCommandOnTerminal } from "../tools/executeTerminal.js";
import { writeToFile } from "../tools/writeToFile.js";
import { writeCode } from "../tools/writeCode.js";
import { promptUser } from "../tools/promptUser.js";

export async function executeTool({ action, input }) {
  switch (action) {
    case "EXECUTE_TERMINAL":
      return executeCommandOnTerminal(input);
    case "WRITE_FILE":
      return writeToFile(input);
    case "WRITE_CODE":
      return writeCode(input);
    case "PROMPT_USER":
      return promptUser(input);
    case "MORE_TASKS":
      return "This run is not complete. Split the task into more managable subtasks and prioritise again.";
    default:
      break;
  }
}
