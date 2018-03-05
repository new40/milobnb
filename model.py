from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

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

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    uid = db.Column(db.Text)
    password = db.Column(db.Text, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    confirm_email = db.Column(db.SmallInteger)
    phone_num = db.Column(db.Integer, unique=True)
    firstname = db.Column(db.String(255))
    lastname = db.Column(db.String(255))
    date_of_birth = db.Column(db.DateTime)
    login_with = db.Column(db.SmallInteger)
    facebook_id = db.Column(db.String(255))
    twitter_id = db.Column(db.String(255))
    about = db.Column(db.Text)
    img_url = db.Column(db.String(500))
    created = db.Column(db.DateTime)
    modified = db.Column(db.DateTime)
    status = db.Column(db.SmallInteger, default=1)
    properties = db.relationship('Property', backref='user', lazy='dynamic')

class Property(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    description = db.Column(db.Text)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    room_type = db.Column(db.String(50))
    category = db.Column(db.Integer, db.ForeignKey('category.id'))
    subcategory = db.Column(db.Integer)
    space_for = db.Column(db.String(10))
    country = db.Column(db.String(50))
    state = db.Column(db.String(255))
    city = db.Column(db.String(255))
    address = db.Column(db.Text)
    add_opt = db.Column(db.Text)
    zip_code = db.Column(db.String(50))
    google_address = db.Column(db.String(255))
    latitude = db.Column(db.String(50))
    longitude = db.Column(db.String(50))
    guests_cnt = db.Column(db.String(5))
    bedroom_cnt = db.Column(db.String(10))
    bed_cnt = db.Column(db.String(5))
    bathroom_cnt = db.Column(db.String(5))
    private_bathroom = db.Column(db.String(15))
    start_date = db.Column(db.DateTime)
    end_date = db.Column(db.DateTime)
    min_stay = db.Column(db.SmallInteger)
    max_stay = db.Column(db.SmallInteger)
    created = db.Column(db.DateTime, default=datetime.now)
    modified = db.Column(db.DateTime)
    status = db.Column(db.SmallInteger, default=1)
    amenities = db.relationship('Property_amenities', backref='property', lazy='dynamic')

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))
    description = db.Column(db.Text)
    created = db.Column(db.DateTime, default=datetime.now)
    modified = db.Column(db.DateTime)
    status = db.Column(db.SmallInteger, default=1)
    subcategories = db.relationship('Subcategory', backref='category', lazy='dynamic')

class Subcategory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    name = db.Column(db.String(255))
    description = db.Column(db.Text)
    created = db.Column(db.DateTime, default=datetime.now)
    modified = db.Column(db.DateTime)
    status = db.Column(db.SmallInteger, default=1)

    @property
    def serialize(self):
        return {
        'id': self.id,
        'category_id': self.category_id,
        'name': self.name,
        'description': self.description
        }

class Property_amenities(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    property_id = db.Column(db.Integer, db.ForeignKey('property.id'))
    created = db.Column(db.DateTime, default=datetime.now)
    modified = db.Column(db.DateTime)
    status = db.Column(db.SmallInteger, default=1)
    amenity_id = db.relationship('amenity', backref='amenity_id', lazy='dynamic')

class amenity(db.Model):
    id = db.Column(db.Integer, db.ForeignKey('property_amenities.id'), primary_key=True)
    name = db.Column(db.String(255))
    image_url = db.Column(db.String(500))
    created = db.Column(db.DateTime, default=datetime.now)
    modified = db.Column(db.DateTime)
    status = db.Column(db.SmallInteger, default=1)

if __name__ == '__main__':
    manager.run()
