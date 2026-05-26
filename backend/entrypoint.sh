#!/bin/sh
set -e

# optional: wait for postgres (pg_isready must be available in image)
# until pg_isready -h "$POSTGRES_HOST" -p "${POSTGRES_PORT:-5432}" -U "$POSTGRES_USER"; do
#   echo "Waiting for postgres..."
#   sleep 1
# done

# try migrations (retry a few times)
n=0
until python manage.py migrate --noinput || [ $n -ge 5 ]; do
  n=$((n+1))
  echo "Migrate failed, attempt $n/5 - retrying in 3s..."
  sleep 3
done

exec "$@"