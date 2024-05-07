import {
  dag,
  object,
  func,
  Directory,
  Secret,
  Container,
  File,
  ExecError,
} from "@dagger.io/dagger";
import "./utils/containerExtensions";

const exclude = [".git"];
const SNYK_IMAGE_TAG = "alpine";

@object()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Snyk {
  /**
   * example usage: "dagger call snyk-test --src . --token env:SNYK_TOKEN"
   */
  @func()
  async snykTest(
    src: Directory,
    token: Secret,
    severityThreshold?: string,
    org?: string,
    policyPath?: string[],
    snykImageTag?: string
  ): Promise<string> {
    const policyPaths = this.formatPolicyPaths(policyPath);
    const SNYK_SEVERITY_THRESHOLD = severityThreshold || "low";
    const ctr = this.baseSnykContainer("code", token, snykImageTag)
      .withDirectory("/app", src, { exclude })
      .withWorkdir("/app")
      .withExec([
        "snyk",
        "test",
        `--severity-threshold=${SNYK_SEVERITY_THRESHOLD}`,
        `${org ? `--org=${org}` : ""}`,
        ...policyPaths,
      ]);

    return ctr.tryStdout();
  }

  /**
   * example usage: "dagger call snyk-code-test --src . --token env:SNYK_TOKEN"
   */
  @func()
  async snykCodeTest(
    src: Directory,
    token: Secret,
    severityThreshold?: string,
    org?: string,
    policyPath?: string[],
    snykImageTag?: string
  ): Promise<string> {
    const policyPaths = this.formatPolicyPaths(policyPath);
    const SNYK_SEVERITY_THRESHOLD = severityThreshold || "low";
    const ctr = this.baseSnykContainer("code", token, snykImageTag)
      .withDirectory("/app", src, { exclude })
      .withWorkdir("/app")
      .withExec([
        "snyk",
        "code",
        "test",
        `--severity-threshold=${SNYK_SEVERITY_THRESHOLD}`,
        `${org ? `--org=${org}` : ""}`,
        ...policyPaths,
      ]);

    return ctr.tryStdout();
  }

  /**
   * example usage: "dagger call snyk-iac-test --src . --token env:SNYK_TOKEN"
   */
  @func()
  async snykIacTest(
    src: Directory,
    token: Secret,
    severityThreshold?: string,
    org?: string,
    policyPath?: string[],
    snykImageTag?: string
  ): Promise<string> {
    const SNYK_SEVERITY_THRESHOLD = severityThreshold || "low";
    const policyPaths = this.formatPolicyPaths(policyPath);
    this.baseSnykContainer("iac", token);
    const ctr = this.baseSnykContainer("iac", token, snykImageTag)
      .withDirectory("/app", src, { exclude })
      .withWorkdir("/app")
      .withExec([
        "snyk",
        "iac",
        "test",
        `--severity-threshold=${SNYK_SEVERITY_THRESHOLD}`,
        `${org ? `--org=${org}` : ""}`,
        ...policyPaths,
      ]);

    return ctr.tryStdout();
  }

  /**
   * example usage: "dagger call snyk-container-test --image alpine:latest --token env:SNYK_TOKEN"
   */
  @func()
  async snykContainerTest(
    image: string,
    token: Secret,
    org?: string,
    policyPath?: string[],
    snykImageTag?: string
  ): Promise<string> {
    const policyPaths = this.formatPolicyPaths(policyPath);
    const ctr = this.baseSnykContainer(
      "container",
      token,
      snykImageTag
    ).withExec([
      "snyk",
      "container",
      "test",
      image,
      `${org ? `--org=${org}` : ""}`,
      ...policyPaths,
    ]);

    return ctr.tryStdout();
  }

  baseSnykContainer(
    label: string,
    token: Secret,
    snykImageTag = SNYK_IMAGE_TAG
  ): Container {
    return dag
      .pipeline(`snyk-${label}`)
      .container()
      .from(`snyk/snyk:${snykImageTag}`)
      .withSecretVariable("SNYK_TOKEN", token);
  }

  formatPolicyPaths(policyPath?: string[]) {
    return policyPath
      ? policyPath.map((path) => (policyPath ? `--policy-path=${path}` : ""))
      : [];
  }
}
