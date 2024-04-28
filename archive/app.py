from flask import Flask, request, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/submit', methods=['POST'])
def submit():
    message = request.form['message']
    # ここでメッセージを処理する
    return f'Received message: {message}'

if __name__ == '__main__':
    app.run(debug=True)
