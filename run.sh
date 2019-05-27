git pull
cd back/
python server.py &
celery -A server.celery worker --loglevel=debug &
cd ./../front/
npm start &
