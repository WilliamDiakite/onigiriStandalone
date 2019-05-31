git pull
cd back/
python server.py &
celery -A server.celery worker &
cd ./../front/
npm start &
