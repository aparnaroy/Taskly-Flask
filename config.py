import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

SECRET_KEY = os.getenv('FLASK_SECRET_KEY', 'default_secret_key')

# MySQL database info
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_HOST = os.getenv('DB_HOST')
DB_NAME = os.getenv('DB_NAME')
SQLALCHEMY_DATABASE_URI = f'mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}'
