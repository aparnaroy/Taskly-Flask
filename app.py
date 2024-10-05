from flask import Flask, jsonify, request, render_template
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'  # SQLite database file
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Task model
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    completed = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {"id": self.id, "title": self.title, "completed": self.completed}

# Create the database tables
with app.app_context():
    db.create_all()

# All page routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/start-up')
def startUp():
    return render_template('start-up.html')

@app.route('/tasks')
def mainPage():
    return render_template('main-page.html')


# RESTful API Endpoints

# GET All Tasks
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    tasks = Task.query.all()
    return jsonify([task.to_dict() for task in tasks])

# GET Specific Task
@app.route('/api/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    task = Task.query.get(task_id)
    return jsonify(task.to_dict()) if task else ('', 404)

# CREATE/POST a Task
@app.route('/api/tasks', methods=['POST'])
def create_task():
    new_task = Task(title=request.json['title'])
    db.session.add(new_task)
    db.session.commit()
    return jsonify(new_task.to_dict()), 201

# UPDATE/PUT a Specific Task
@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    task = Task.query.get(task_id)
    if task:
        task.title = request.json.get('title', task.title)
        task.completed = request.json.get('completed', task.completed)
        db.session.commit()
        return jsonify(task.to_dict())
    return ('', 404)

# DELETE a Specific Task
@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get(task_id)
    if task:
        db.session.delete(task)
        db.session.commit()
        return ('', 204)
    return ('', 404)

if __name__ == '__main__':
    app.run(debug=True)
