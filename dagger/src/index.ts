import { dag, object, func, Directory, Secret } from "@dagger.io/dagger";

const exclude = [".git"];
const SNYK_IMAGE_TAG = "alpine";

@object()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Snyk {
  /**
   * example usage: "dagger call test-code --src . --token env:SNYK_TOKEN"
   */
  @func()
  async testCode(
    src: Directory,
    token: Secret,
    severityThreshold?: string,
    org?: string
  ): Promise<string> {
    const SNYK_SEVERITY_THRESHOLD = severityThreshold || "low";
    const ctr = dag
      .pipeline("snyk-code")
      .container()
      .from(`snyk/snyk:${SNYK_IMAGE_TAG}`)
      .withDirectory("/app", src, { exclude })
      .withWorkdir("/app")
      .withSecretVariable("SNYK_TOKEN", token)
      .withExec([
        "snyk",
        "test",
        `--severity-threshold=${SNYK_SEVERITY_THRESHOLD}`,
        `${org ? `--org=${org}` : ""}`,
      ]);
    return ctr.stdout();
  }

  /**
   * example usage: "dagger call test-iac --src . --token env:SNYK_TOKEN"
   */
  @func()
  async testIac(
    src: Directory,
    token: Secret,
    severityThreshold?: string,
    org?: string
  ): Promise<string> {
    const SNYK_SEVERITY_THRESHOLD = severityThreshold || "low";
    const ctr = dag
      .pipeline("snyk-iac")
      .container()
      .from(`snyk/snyk:${SNYK_IMAGE_TAG}`)
      .withDirectory("/app", src, { exclude })
      .withWorkdir("/app")
      .withSecretVariable("SNYK_TOKEN", token)
      .withExec([
        "snyk",
        "iac",
        "test",
        `--severity-threshold=${SNYK_SEVERITY_THRESHOLD}`,
        `${org ? `--org=${org}` : ""}`,
      ]);
    return ctr.stdout();
  }

  /**
   * example usage: "dagger call test-container --image alpine:latest --token env:SNYK_TOKEN"
   */
  @func()
  async testContainer(
    image: string,
    token: Secret,
    org?: string
  ): Promise<string> {
    const ctr = dag
      .pipeline("snyk-container")
      .container()
      .from(`snyk/snyk:${SNYK_IMAGE_TAG}`)
      .withSecretVariable("SNYK_TOKEN", token)
      .withExec([
        "snyk",
        "container",
        "test",
        image,
        `${org ? `--org=${org}` : ""}`,
      ]);
    return ctr.stdout();
  }
}
