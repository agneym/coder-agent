import readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";

export function promptUser(prompt) {
  const rl = readline.createInterface({
    input,
    output,
  });

  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}
