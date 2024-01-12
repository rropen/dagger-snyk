import { dag, Container, Directory, object, func } from "@dagger.io/dagger"

const exclude = [".git"];
const SNYK_IMAGE_TAG = "alpine";

@object
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Snyk {
  /**
   * example usage: "dagger call test-code --src . --token <your-snyk-token>"
   */
  @func
  async testCode(
      src: string | undefined = ".",
      token: string,
      severityThreshold?: string
  ): Promise<string> {
    const SNYK_SEVERITY_THRESHOLD = severityThreshold || "low";
    const context = dag.host().directory(src);
    const secret = dag.setSecret("SNYK_TOKEN", token);
    const ctr = dag
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
    return ctr.stdout()
  }

  /**
   * example usage: "dagger call test-iac --src . --token <your-snyk-token>"
   */
  @func
  async testIac(
      src: string | undefined = ".",
      token: string,
      severityThreshold?: string
  ): Promise<string> {
    const SNYK_SEVERITY_THRESHOLD = severityThreshold || "low";
    const context = dag.host().directory(src);
    const secret = dag.setSecret("SNYK_TOKEN", token);
    const ctr = dag
      .pipeline("snyk-iac")
      .container()
      .from(`snyk/snyk:${SNYK_IMAGE_TAG}`)
      .withDirectory("/app", context, { exclude })
      .withWorkdir("/app")
      .withSecretVariable("SNYK_TOKEN", secret)
      .withExec([
        "snyk",
        "iac",
        "test",
        `--severity-threshold=${SNYK_SEVERITY_THRESHOLD}`,
      ]);
    return ctr.stdout()
  }

  /**
   * example usage: "dagger call test-container --image alpine:latest --token <your-snyk-token>"
   */
  @func
  async testContainer(
      image: string | undefined = "alpine:latest",
      token: string,
  ): Promise<string> {
    const secret = dag.setSecret("SNYK_TOKEN", token);
    const ctr = dag
      .pipeline("snyk-container")
      .container()
      .from(`snyk/snyk:${SNYK_IMAGE_TAG}`)
      .withSecretVariable("SNYK_TOKEN", secret)
      .withExec([
        "snyk",
        "container",
        "test",
        image,
      ]);
    return ctr.stdout()
  }
}