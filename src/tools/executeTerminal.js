import { promisify } from "node:util";
import { exec } from "node:child_process";

const promisifiedExec = promisify(exec);

export async function executeCommandOnTerminal(command) {
  try {
    const { stdout, stderr } = await promisifiedExec(command);
    if (stderr) return stderr;
    if (stdout) return stdout;
  } catch (err) {
    return err;
  }
}
