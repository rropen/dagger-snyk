# Dagger Snyk module

Known to work with Dagger v0.9.8 only (for v0.9.5 support, see v0.1.0 release).

Check code, infrastructure-as-code and containers using Snyk from your Dagger pipelines.

## Prerequisites

| Environment Variable    | Required | Default | Description                                                                                       | Command                                           |
| ----------------------- | -------- | ------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| SNYK_TOKEN              | Yes      | --      | Your Snyk API token. You can get this from your [Snyk Account page](https://app.snyk.io/account). | `export SNYK_TOKEN=<your-snyk-token>`             |
| SNYK_SEVERITY_THRESHOLD | No       | Low     | The severity threshold to filter by. (low, medium, high, critical)                                | `export SNYK_SEVERITY_THRESHOLD=<your-threshold>` |

## Available Flags

| Flag    | Required | Description                                                                                             | Command          | Available On |
| ------- | -------- | ------------------------------------------------------------------------------------------------------- | ---------------- | ------------ |
| --org   | No       | Your Snyk organization ID. You can get this from your [Snyk Account page](https://app.snyk.io/account). | `--org myorg`    | All          |
| --image | Yes      | The container image to test.                                                                            | `--image alpine` | Containers   |

## Available Tests

### Code

Check the code in the current directory for vulnerabilities:

```
dagger call -m github.com/rropen/dagger-snyk test-code --src . --org myorg --token env:SNYK_TOKEN
```

### Infrastructure-as-Code

Check the infrastructure-as-code (e.g. Terraform etc) in the current directory for issues:

```
dagger call -m github.com/rropen/dagger-snyk test-iac --src . --org myorg --token $SNYK_TOKEN
```

### Containers

Check the given container image for vulnerabilities:

```
dagger call -m github.com/rropen/dagger-snyk test-container --image "alpine:latest" --org myorg --token $SNYK_TOKEN
```