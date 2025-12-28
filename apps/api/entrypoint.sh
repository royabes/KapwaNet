#!/bin/bash
set -e

# Wait for database to be ready
echo "Waiting for database..."
while ! python -c "
import os
import psycopg2
import dj_database_url
db_config = dj_database_url.parse(os.environ.get('DATABASE_URL', 'postgres://kapwanet:kapwanet@db:5432/kapwanet'))
conn = psycopg2.connect(
    host=db_config['HOST'],
    port=db_config['PORT'],
    user=db_config['USER'],
    password=db_config['PASSWORD'],
    dbname=db_config['NAME']
)
conn.close()
" 2>/dev/null; do
    sleep 1
done
echo "Database is ready!"

# Run migrations
echo "Running migrations..."
python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start the server
echo "Starting server..."
exec "$@"
