# Dagger Snyk module

Known to work with Dagger v0.9.5.

Check code, infrastructure-as-code and containers using Snyk from your Dagger pipelines.

```
export SNYK_TOKEN=<your-snyk-token>
```

Get this from your [Snyk Account page](https://app.snyk.io/account).


## Code

Check the code in the current directory for vulnerabilities:

```
dagger call -m github.com/lukemarsden/dagger-snyk test-code --src . --token $SNYK_TOKEN
```


## Infrastructure-as-Code

Check the infrastructure-as-code (e.g. Terraform etc) in the current directory for issues:

```
dagger call -m github.com/lukemarsden/dagger-snyk test-iac --src . --token $SNYK_TOKEN
```


## Containers

Check the given container image for vulnerabilities:

```
dagger call -m github.com/lukemarsden/dagger-snyk test-container --image "alpine:latest" --token $SNYK_TOKEN
```