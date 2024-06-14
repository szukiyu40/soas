from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

from flask_cors import CORS
import cohere
import os
from langchain.schema import HumanMessage
from langchain_openai import ChatOpenAI
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.chains import RetrievalQA

with open('/home/ec2-user/openai/api_key.txt', 'r') as file:
    openai_api_key = file.read().strip()
    
os.environ['OPENAI_API_KEY'] = openai_api_key


app = Flask(__name__)
app.config['DEBUG'] = True
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///messages.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
migrate = Migrate(app, db)

co = cohere.Client(os.environ.get('COHERE_API_KEY'))

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.String(500))
    response = db.Column(db.String(2000))
    upvotes = db.Column(db.Integer, default=0)
    downvotes = db.Column(db.Integer, default=0)
    # The 'comments' backref is declared here in the relationship
    comments = db.relationship('Comment', backref='message', lazy=True)

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(1000))
    message_id = db.Column(db.Integer, db.ForeignKey('message.id'))  # Ensure the foreign key is set correctly


def fetch_all_questions():
    # Assuming Question is your model and it contains a field 'text'
    return Message.query.all()

embeddings = HuggingFaceEmbeddings(
    model_name="intfloat/multilingual-e5-large",
    model_kwargs={'device':'cpu'},
#    encode_kwargs = {'normalize_embeddings': False}
)

# from langchain.vectorstores import FAISS
from langchain_community.vectorstores import FAISS

db2 = FAISS.load_local('joseito.db',embeddings, allow_dangerous_deserialization=True)
retriever = db2.as_retriever() 

llm = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0)

def llm_main(q):
    m = HumanMessage(content=q)
    ans = llm([m])
    return ans.content


@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/share-question')
def share_question():
    # Fetch top 10 latest messages based on the 'id' in descending order
    messages = Message.query.order_by(Message.id.desc()).limit(10).all()
    return render_template('share_question.html', messages=messages)

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/index_figma')
def index_figma():
    return render_template('index_figma.html')


@app.route('/submit', methods=['POST'])
def submit():

    input_message = request.json['message']
    
    """
    print(input_message)
    
    qa = RetrievalQA.from_chain_type(
    llm=llm, 
    retriever=retriever,
    return_source_documents=True,
    )
    ans = qa.invoke(input_message)

    print(ans)

    return jsonify({"response": ans['result']})
    """
    input_message = request.json['message']
    ans = llm_main(input_message)
    return jsonify({"response": ans})
    
    """
    user_input = request.json.get('message')
    if not user_input:
        return jsonify({"error": "No message provided"}), 400
    try:
        # Cohereを使用してメッセージに回答する
        response = co.chat(
            model='command-r-plus',
            message=user_input,
            max_tokens=1024,
            temperature=0.7,
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
    """
    
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
    try:
        recent_messages = Message.query.order_by(Message.upvotes.desc()).limit(3).all()
        results = [{
            'id': message.id,
            'question': message.message,
            'answer': message.response,
            'upvotes': message.upvotes,
            'downvotes': message.downvotes
        } for message in recent_messages]
        return jsonify(results)
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return jsonify({'error': 'Unable to retrieve data'}), 500



@app.route('/api/upvote/<int:message_id>', methods=['POST'])
def upvote(message_id):
    message = Message.query.get(message_id)
    if message:
        if message.upvotes is None:
            message.upvotes = 0
        message.upvotes += 1
        db.session.commit()
        return jsonify({'response': 'Upvoted successfully', 'upvotes': message.upvotes, 'downvotes': message.downvotes}), 200
    else:
        return jsonify({'error': 'Message not found'}), 404

@app.route('/api/downvote/<int:message_id>', methods=['POST'])
def downvote(message_id):
    message = Message.query.get(message_id)
    if message:
        if message.downvotes is None:
            message.downvotes = 0
        message.downvotes += 1
        db.session.commit()
        return jsonify({'response': 'Downvoted successfully', 'upvotes': message.upvotes, 'downvotes': message.downvotes}), 200
    else:
        return jsonify({'error': 'Message not found'}), 404

@app.route('/some-display-route')
def display_questions():
    messages = Message.query.all()  # Ensure this retrieves data
    print(messages)  # Debug: Check the output
    return render_template('your_template.html', messages=messages)

@app.route('/api/comments/<int:message_id>', methods=['POST'])
def post_comment(message_id):
    content = request.json.get('content')
    if not content:
        return jsonify({'error': 'No content provided'}), 400
    comment = Comment(content=content, message_id=message_id)
    db.session.add(comment)
    db.session.commit()
    return jsonify({'message': 'Comment added', 'comment': content}), 201

@app.route('/api/comments/<int:message_id>', methods=['GET'])
def get_comments(message_id):
    comments = Comment.query.filter_by(message_id=message_id).all()
    return jsonify([{'id': comment.id, 'content': comment.content} for comment in comments])

@app.route('/share-question')
def ask_question():
    return render_template('share_question.html')

if __name__ == '__main__':
    with app.app_context():
        #db.create_all()
        db.create_all()  # 新しいスキーマでテーブルを作成
    app.run(debug=True)
