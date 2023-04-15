import { promisify } from "node:util";
import { exec } from "node:child_process";
import path from "node:path";
import { ROOT_FOLDER } from "./constants.js";

const promisifiedExec = promisify(exec);
const options = {
  cwd: path.join(ROOT_FOLDER),
};

export async function executeCommandOnTerminal(command) {
  try {
    const { stdout, stderr } = await promisifiedExec(command, options);
    if (stderr) return stderr;
    if (stdout) return stdout;
  } catch (err) {
    return err;
  }
}
