# Dagger Snyk module

Check code, infrastructure-as-code and containers using Snyk from your Dagger pipelines.

```
export SNYK_TOKEN=<your-snyk-token>
```

Get this from your [Snyk Account page](https://app.snyk.io/account).


## Code

Check the code in the current directory for vulnerabilities:

```
dagger call test-code --src . --token $SNYK_TOKEN
```


## Infrastructure-as-Code

Check the infrastructure-as-code (e.g. Terraform etc) in the current directory for issues:

```
dagger call test-iac --src . --token $SNYK_TOKEN
```


## Containers

Check the given container image for vulnerabilities:

```
dagger --focus=false call test-container --image "alpine:latest" --token $SNYK_TOKEN
```