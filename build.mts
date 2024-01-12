import { connect, Client } from "@dagger.io/dagger"

const SNYK_IMAGE_TAG = "alpine";

// initialize Dagger client
connect(
  async (client: Client) => {
    // get Node image
    // get Node version
    const node = client.container().from("node:16").withExec(["node", "-v"])

    // execute
    const version = await node.stdout()

    // print output
    console.log("Hello from Dagger and Node " + version)
  },
  { LogOutput: process.stderr }
)

export const exclude = [".git"];

/**
 * @function
 * @description Checks projects for open source vulnerabilities and license issues
 * @param {string | Directory | undefined} src Source directory
 * @param {string | Secret} token Snyk token
 * @param {string} severityThreshold Snyk severity threshold
 * @returns {Promise<string>}
 */
export async function testCode(
  src: string | undefined = ".",
  token: string,
  severityThreshold?: string
): Promise<string> {
  let result = "";
  const SNYK_SEVERITY_THRESHOLD = severityThreshold || "low";

  // not clear the difference between token and secret here
  // const secret = getSnykToken(new Client(), token);
  // if (!secret) {
  //   console.error("SNYK_TOKEN is not set");
  //   Deno.exit(1);
  // }

  await connect(async (client: Client) => {
    const context = client.host().directory(src);
    const secret = client.setSecret("SNYK_TOKEN", token);
    const ctr = client
      .pipeline("snyk-code")
      .container()
      .from(`snyk/snyk:${SNYK_IMAGE_TAG}`)
      .withDirectory("/app", context, { exclude })
      .withWorkdir("/app")
      .withSecretVariable("SNYK_TOKEN", secret)
      .withExec([
        "snyk",
        "test",
        `--severity-threshold=${SNYK_SEVERITY_THRESHOLD}`,
      ]);

    result = await ctr.stdout();
  });
  return result;
}

// /**
//  * @function
//  * @description Checks projects for infrastructure as code issues
//  * @param {string | Directory | undefined} src Source directory
//  * @param {string | Secret} token Snyk token
//  * @param {string} severityThreshold Snyk severity threshold
//  * @returns {Promise<string>}
//  */
// export async function testIac(
//   src: string | Directory | undefined = ".",
//   token?: string | Secret,
//   severityThreshold?: string
// ): Promise<string> {
//   let result = "";
//   const SNYK_SEVERITY_THRESHOLD =
//     Deno.env.get("SNYK_SEVERITY_THRESHOLD") || severityThreshold || "low";
//   const secret = getSnykToken(new Client(), token);
//   if (!secret) {
//     console.error("SNYK_TOKEN is not set");
//     Deno.exit(1);
//   }

//   await connect(async (client: Client) => {
//     const context = getDirectory(client, src);
//     const ctr = client
//       .pipeline(Job.iacTest)
//       .container()
//       .from(`snyk/snyk:${SNYK_IMAGE_TAG}`)
//       .withDirectory("/app", context, { exclude })
//       .withWorkdir("/app")
//       .withSecretVariable("SNYK_TOKEN", secret)
//       .withExec([
//         "snyk",
//         "iac",
//         "test",
//         `--severity-threshold=${SNYK_SEVERITY_THRESHOLD}`,
//       ]);

//     result = await ctr.stdout();
//   });
//   return result;
// }
