from flask import Flask, request, jsonify, abort, render_template
from flask_cors import CORS
import cohere
import os


app = Flask(__name__)
co = cohere.Client(os.environ.get('COHERE_API_KEY'))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/', methods=['POST'])  # GETメソッドを削除
def chatbot():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    user_input = request.json.get('message')
    if not user_input:
        return jsonify({"error": "No message provided"}), 400

    try:
        print(user_input)
        response = co.generate(
            model='command-nightly',  # 使用可能なモデル名に変更
            prompt=user_input,
            max_tokens=512,
            temperature=0.5
        )
        print(response)
        return jsonify({"response": response.generations[0].text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#if __name__ == '__main__':
#    app.run(host='0.0.0.0', port=5000, debug=True)

if __name__ == '__main__':
    app.run(debug=True)
