import { promisify } from "node:util";
import { exec } from "node:child_process";
import path from "node:path";

const promisifiedExec = promisify(exec);
const options = {
  cwd: path.join("/Users/agney/code/run-throughs/"),
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
