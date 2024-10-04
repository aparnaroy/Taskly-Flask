from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/start-up')
def startUp():
    return render_template('start-up.html')

@app.route('/tasks')
def mainPage():
    return render_template('main-page.html')

if __name__ == '__main__':
    app.run(debug=True)
