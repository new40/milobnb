from flask import Flask
from flask_sqlalchemy import SQLAlchemy

from flask_script import Manager
from flask_migrate import Migrate, MigrateCommand

app = Flask(__name__)
app.config.from_pyfile('config.cfg')
# app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://milo:05skw123@localhost/flask_db'
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

migrate = Migrate(app, db)
manager = Manager(app)

manager.add_command('db', MigrateCommand)

class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    firstname = db.Column(db.String(255))
    lastname = db.Column(db.String(255))
    password = db.Column(db.Text, nullable=False)
    uid = db.Column(db.Text)
    email = db.Column(db.String(255), unique=True, nullable=False)
    date_of_birth = db.Column(db.DateTime)




if __name__ == '__main__':
    manager.run()
