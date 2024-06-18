from flask import Flask, request, jsonify
from flask_cors import CORS
import redis
import os
import hashlib
import dotenv

dotenv.load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"*": {"origins": "*"}})

HOST = os.getenv('REDIS_HOST', 'localhost')
PORT = os.getenv('REDIS_PORT', 6379)

r = redis.Redis(host=HOST, port=PORT, db=0)

@app.route('/api/save_token', methods=['POST'])
def save_token():
    token = request.json.get('token')
    print('input token:', token)
    if token:
        r.set(token, 1)
        return jsonify({'res': 'Token saved successfully.'}), 200
    else:
        return jsonify({'error': 'Token not found in the request.'}), 400

@app.route('/api/check_duplicate', methods=['POST'])
def check_duplicate():
    image = request.json.get('image')
    if image:
        token = hashlib.sha256(image.encode()).hexdigest()
        print('out token:', token)
        if r.get(token):
            return jsonify({'res': True}), 200
        else:
            return jsonify({'res': False}), 200
    else:
        return jsonify({'error': 'File not found in the request.'}), 400

@app.route('/', methods=['POST'])
def get():
    return "ok"

if __name__ == '__main__':
    app.run(host=os.getenv('FLASK_IP'), port=os.getenv('FLASK_PORT'))
