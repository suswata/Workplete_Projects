from flask import Flask, request, jsonify
import requests
import os
from dotenv import find_dotenv,load_dotenv
  
app = Flask(__name__)

API_KEY = load_dotenv(find_dotenv())
@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json['data']
  
    try:
        response = requests.post(
              'https://api.openai.com/v4/models/gpt-4:vision',
              headers={'Authorization': f'Bearer {API_KEY}'},
              json={'prompt': data, 'max_tokens': 60}
          )
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify(error=str(e)), 500
    
if __name__ == '__main__':
    app.run(port=3000)