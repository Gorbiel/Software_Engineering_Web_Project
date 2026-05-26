# Kubernetes Secrets

These files document the secrets required by the Kubernetes manifests.

Do not commit real secret files.

## Required secrets

Each environment namespace needs:

- `django-secret`
- `postgres-secret`

Namespaces:

- `staging`
- `production`

## Create Django secret

```bash
kubectl create secret generic django-secret \
  -n staging \
  --from-literal=SECRET_KEY="$(openssl rand -base64 48)"
