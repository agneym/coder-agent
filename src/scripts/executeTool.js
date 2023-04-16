import { executeCommandOnTerminal } from "../tools/executeTerminal.js";
import { writeToFile } from "../tools/writeToFile.js";
import { promptUser } from "../tools/promptUser.js";

export async function executeTool(action) {
  const { action: actionName } = action;
  switch (actionName) {
    case "EXECUTE_TERMINAL":
      return executeCommandOnTerminal(action.input);
    case "WRITE_FILE":
      return writeToFile(action.filePath, action.content);
    case "PROMPT_USER":
      return promptUser(action.input);
    case "MORE_TASKS":
      return action.input;
    default:
      break;
  }
}
