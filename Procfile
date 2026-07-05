web: python manage.py collectstatic --noinput && python manage.py migrate && gunicorn company.wsgi --log-file - --bind 0.0.0.0:$PORT
