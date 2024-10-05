from flask import Flask, jsonify, request, render_template, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
import config

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'  # SQLite database file
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = config.SECRET_KEY
db = SQLAlchemy(app)

# Initialize Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# User model
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    tasks = db.relationship('Task', backref='owner', lazy=True)  # Relationship to tasks

# Task model
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(200), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # Link to User

    def to_dict(self):
        return {
            "id": self.id,
            "description": self.description,
            "completed": self.completed,
            "user_id": self.user_id
        }


# Create the database tables
with app.app_context():
    db.create_all()

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


# Routes for registration and login
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        # Check if the user already exists
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            flash('Username already exists.<br>Please choose a different username.')
            return redirect(url_for('register'))

        # Hash the password before saving
        hashed_password = generate_password_hash(password)
        new_user = User(username=username, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        flash('<span class="success-message">Registration successful! You can now log in.</span>')
        return redirect(url_for('login'))
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username).first()
        
        if user and check_password_hash(user.password, password):  # Check hashed password
            login_user(user)
            return redirect(url_for('startUp'))  # Take user to start up page
        else:
            flash('Invalid username or password')
    return render_template('login.html')

@app.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))


# All other page routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/start-up')
@login_required
def startUp():
    return render_template('start-up.html')

@app.route('/tasks')
@login_required
def mainPage():
    return render_template('main-page.html')


# RESTful API Endpoints

# GET All Tasks
@app.route('/api/tasks', methods=['GET'])
@login_required
def get_tasks():
    tasks = Task.query.filter_by(user_id=current_user.id).all()  # Filter tasks by user
    return jsonify([task.to_dict() for task in tasks])

# GET Specific Task
@app.route('/api/tasks/<int:task_id>', methods=['GET'])
@login_required
def get_task(task_id):
    task = Task.query.filter_by(id=task_id, user_id=current_user.id).first()
    return jsonify(task.to_dict()) if task else ('', 404)

# CREATE/POST a Task
@app.route('/api/tasks', methods=['POST'])
@login_required
def create_task():
    new_task = Task(description=request.json['description'], user_id=current_user.id)
    db.session.add(new_task)
    db.session.commit()
    return jsonify(new_task.to_dict()), 201

# UPDATE/PUT a Specific Task
@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
@login_required
def update_task(task_id):
    task = Task.query.filter_by(id=task_id, user_id=current_user.id).first()
    if task:
        task.description = request.json.get('description', task.description)
        task.completed = request.json.get('completed', task.completed)
        db.session.commit()
        return jsonify(task.to_dict())
    return ('', 404)

# DELETE a Specific Task
@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
@login_required
def delete_task(task_id):
    task = Task.query.filter_by(id=task_id, user_id=current_user.id).first()
    if task:
        db.session.delete(task)
        db.session.commit()
        return ('', 204)
    return ('', 404)

if __name__ == '__main__':
    app.run(debug=True)
