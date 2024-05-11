from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

from flask_cors import CORS
import cohere
import os

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///messages.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
migrate = Migrate(app, db)

co = cohere.Client(os.environ.get('COHERE_API_KEY'))

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.String(500))
    response = db.Column(db.String(2000))  # 前回の応答を格納するカラムを追加

@app.route('/submit', methods=['POST'])
def submit():
    user_input = request.json.get('message')
    if not user_input:
        return jsonify({"error": "No message provided"}), 400
    try:
        # Cohereを使用してメッセージに回答する
        response = co.chat(
            model='command-nightly',
            message=user_input,
            max_tokens=3999,
            temperature=0.5,
            #chat_stream=True,
            connectors=[{"id": "web-search"}]  
        )
        print(response)
        response=response.text
    except Exception as e:
        response = f"Error generating response: {str(e)}"
    new_message = Message(message=user_input, response=response)
    db.session.add(new_message)
    db.session.commit()
    return jsonify({'response': response})

@app.route('/search', methods=['GET'])
def search():
    query = request.args.get('query')
    if not query:
        return jsonify({"error": "No search query provided"}), 400
    search_results = Message.query.filter(Message.message.contains(query)).all()
    messages = [{'id': message.id, 'message': message.message} for message in search_results]
    return jsonify(messages)

@app.route('/api/recent-qa', methods=['GET'])
def recent_qa():
    recent_messages = Message.query.order_by(Message.id.desc()).limit(3).all()
    results = [{'question': message.message, 'answer': message.response} for message in recent_messages]
    return jsonify(results)


@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    with app.app_context():
        #db.create_all()
        db.create_all()  # 新しいスキーマでテーブルを作成
    app.run(debug=True)
