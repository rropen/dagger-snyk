import { Container, ExecError } from "@dagger.io/dagger";

declare module "@dagger.io/dagger" {
  interface Container {
    tryStdout(): Promise<string>;
  }
}

// Due to the the way that Promises work in Typescript, if we do not wrap `stdout` in a try/catch,
// the only information being output to the log will be that the command did not execute successfully.
// This allows us to continue to fail the operation in the event that the script detects vulnerabilities,
// but will provide the user with information within the output, meaning they won't need to dig into the dagger containers
// to investigate.

Container.prototype.tryStdout = async function () {
  let output;
  try {
    output = await this.stdout();
  } catch (e) {
    if (e instanceof ExecError) {
      throw new Error(e.stdout);
    }
    throw e;
  }
  return output;
};
