#-*- coding:utf-8 -*-
from flask import Flask, render_template, request, jsonify, make_response, redirect, url_for
import requests, os, json
import firebase_admin
from firebase_admin import credentials, auth
from firebase_admin import storage
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from functools import wraps
from flask_uploads import UploadSet, configure_uploads, IMAGES
import geocoder
# from model import *

app = Flask(__name__)

#related to firebase
cred = credentials.Certificate('/Users/skw/Documents/milobnb-1512790607233-firebase-adminsdk-u2og9-a54d5f8c48.json')
firebase_admin.initialize_app(cred, {
    'storageBucket': 'milobnb-1512790607233.appspot.com'
})

bucket = storage.bucket()

# related to google map
googleMap_key = "AIzaSyChQ8A11Bmn1MlZ8q3-HcSUijfhf3-WtI0"
search_url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
details_url = "https://maps.googleapis.com/maps/api/place/details/json"
geo_url = "https://maps.googleapis.com/maps/api/geocode/json"

app.config.from_pyfile('config.cfg')
db = SQLAlchemy(app)

photos = UploadSet('photos', IMAGES)
app.config['UPLOADED_PHOTOS_DEST'] = 'static/img/upload'
configure_uploads(app, photos)

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

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']

        if not token:
            return jsonify({'message' : 'Token is missing!'}), 401

        try:
            decoded_token = auth.verify_id_token(token)
            current_user = User.query.filter_by(email=decoded_token['email']).first()
        except:
            return jsonify({'message' : 'Token is invalid!', 'token' : token}), 401

        return f(current_user, *args, **kwargs)

    return decorated

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.form['hidden_input_token']

        if not token:
            return jsonify({'message' : 'Token is missing!'}), 401

        try:
            decoded_token = auth.verify_id_token(token)
            current_user = User.query.filter_by(email=decoded_token['email']).first()
        except:
            return jsonify({'message' : 'Token is invalid!!', 'token' : token}), 401

        return f(current_user, *args, **kwargs)

    return decorated

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/testing', methods=['GET'])
def testing():
    return render_template('testing.html')

@app.route('/signup', methods=['POST'])
def signup():
    email = request.form['email']
    firstname = request.form['firstname']
    lastname = request.form['lastname']
    name = lastname + firstname
    password = generate_password_hash(request.form['password'], method='sha256')
    dt = datetime(int(request.form['year']), int(request.form['month']), int(request.form['day']))
    birthday = dt.strftime("%Y-%m-%d")

    #login modal for already signed up user
    ex_user = User.query.filter_by(email=email).first()
    if ex_user:
        return render_template('section/logged_user_modal.html', firstname=ex_user.firstname, email=email)

    #when new user
    if not ex_user:
        user = auth.create_user(
            email=email,
            email_verified=False,
            password=password,
            display_name=name,
            disabled=False)

        if not user.uid:
            return jsonify({ 'message' : 'Sign up failed!'}), 401

        db_user = User(email=email, firstname=firstname, lastname=lastname, password=password, date_of_birth=dt, uid=user.uid)
        db.session.add(db_user)
        db.session.commit()

    uid = user.uid
    #returns a bytes literal and bytes literal are not JSON serializable. convert the byte literal to string using decode()
    custom_token = (auth.create_custom_token(uid)).decode()

    return jsonify({ 'token' : custom_token })

@app.route('/login', methods=['POST'])
def login():
    login_email = request.form['email']
    login_password = request.form['password']
    login_check = request.form['login_check']

    if not login_email or not login_password:
        return jsonify({ 'err_msg' : 'Login failed!'}), 401

    try:
        user = User.query.filter_by(email=login_email).first()
    except:
        return jsonify({ 'err-msg' : 'Do not exit input email'})

    if check_password_hash(user.password, login_password):
        user = auth.get_user_by_email(login_email)
        custom_token = (auth.create_custom_token(user.uid)).decode()

        return jsonify({ 'token' : custom_token })

    return jsonify({ 'err-msg' : 'Confirm your email or password'}), 401

@app.route('/test', methods=['GET', 'POST'])
@token_required
def test(current_user):
    return jsonify({ 'email' : current_user.lastname})

@app.route('/navbar', methods=['POST'])
def navbar():
    email = request.form['email']

    user = User.query.filter_by(email=email).first()

    if not user:
        return render_template('section/no_user_navbar.html')

    return render_template('section/user_navbar.html', firstname=user.firstname, email=user.email)

@app.route('/logout')
def logout():
    pass

@app.route('/become-a-host/room', methods=['POST'])
@login_required
def room(current_user):
    categories = Category.query.all()
    subcate = Subcategory.query.all()
    prop = Property.query.filter_by(user_id=current_user.id).first()

    return render_template('become-a-host/room.html', user=current_user, categories=categories, subcate=subcate, prop=prop)

@app.route('/subcategories', methods=['GET'])
def subcategories():
    subs = Subcategory.query.all()
    return jsonify([i.serialize for i in subs])

@app.route('/become-a-host/bedrooms', methods=['POST'])
@login_required
def bedrooms(current_user):
    bedroom_cnt_array=['Studio','1','2','3','4','5','6','7','8','9','10']

    category_type = request.form['category_type']
    property_type = request.form['property_type']
    room_type = request.form['room_type']
    space_radio = request.form['space_radio']

    user = User.query.filter_by(email=current_user.email).first()
    user_prop = Property.query.filter_by(user_id=user.id).first()

    #if new user, insert
    if not user_prop:
        prop = Property(user_id=user.id, room_type=room_type, category=category_type, subcategory=property_type, space_for=space_radio)
        db.session.add(prop)
        db.session.commit()

    # if current user, update
    prop = Property.query.filter_by(user_id=user.id).first()
    prop.room_type = room_type
    prop.category=category_type
    prop.subcategory=property_type
    prop.space_for=space_radio
    db.session.add(prop)
    db.session.commit()

    return render_template('become-a-host/bedrooms.html', prop=prop, cnt=bedroom_cnt_array)

@app.route('/become-a-host/location', methods=['POST'])
@login_required
def location(current_user):
    guests_cnt = request.form['guests_cnt']
    bedroom_cnt = request.form['how_many_bedrooms']
    bed_cnt = request.form['beds_cnt']
    bathroom_cnt = request.form['bathrooms_cnt']
    bathroom_private = request.form['bathroom_private']

    user = User.query.filter_by(email=current_user.email).first()

    prop = Property.query.filter_by(user_id=user.id).first()
    prop.guests_cnt = guests_cnt
    prop.bedroom_cnt = bedroom_cnt
    prop.bed_cnt=bed_cnt
    prop.bathroom_cnt=bathroom_cnt
    prop.private_bathroom=bathroom_private
    db.session.add(prop)
    db.session.commit()

    return render_template('become-a-host/location.html', prop=prop)

@app.route('/become-a-host/location/submit', methods=['POST'])
@login_required
def location_submit(current_user):
    country = request.form['country_region']
    street = request.form['street_address']
    add_opt = request.form['apt_address']
    city = request.form['city']
    state = request.form['state']
    zip_code = request.form['zip']

    # make address from request data
    address = street + ", " + city + ", " + state

    # google map
    search_payload = {"key":googleMap_key, "query":address}
    search_req = requests.get(search_url, params=search_payload)
    search_json = search_req.json()

    place_id = search_json["results"][0]["place_id"]

    details_payload = {"key":googleMap_key, "placeid":place_id}
    details_resp = requests.get(details_url, params=details_payload)
    details_json = details_resp.json()

    #insert data to DB & deprive id(param)
    user = User.query.filter_by(email=current_user.email).first()

    prop = Property.query.filter_by(user_id=user.id).first()
    prop.country = details_json["result"]["address_components"][4]["short_name"]
    prop.address = details_json["result"]["address_components"][0]["long_name"] + " " + details_json["result"]["address_components"][1]["long_name"]
    prop.add_opt = add_opt
    prop.city = details_json["result"]["address_components"][2]["long_name"]
    prop.state = details_json["result"]["address_components"][3]["long_name"]
    prop.zip_code = details_json["result"]["address_components"][5]["long_name"]
    prop.google_address = details_json["result"]["formatted_address"]
    prop.latitude = details_json["result"]["geometry"]["location"]["lat"]
    prop.longitude = details_json["result"]["geometry"]["location"]["lng"]
    db.session.add(prop)
    db.session.commit()

    # return jsonify(details_json)
    return redirect(url_for('location_saved', post=details_json["result"]["address_components"][5]["long_name"], add=details_json["result"]["formatted_address"], loc=details_json["result"]["geometry"]["location"]))

@app.route('/geo', methods=['GET'])
def geo():
    geo = geocoder.ip('me')
    return jsonify({ 'city':geo.city, 'country':geo.country, 'state':geo.state})

@app.route('/become-a-host/location')
def location_saved():
    return render_template('become-a-host/location_map.html', address=request.args.get('add'), post=request.args.get('post'), loc=request.args.get('loc'))

@app.route('/become-a-host/amenities', methods=['POST'])
@login_required
def amenities(current_user):
    return render_template('become-a-host/amenities.html')

@app.route('/become-a-host/step1', methods=['POST'])
@login_required
def step1(current_user):
    return render_template('become-a-host/step1.html', user=current_user)

@app.route('/become-a-host/photo', methods=['POST'])
@login_required
def photo(current_user):
    return render_template('become-a-host/photos.html', user=current_user)

@app.route('/upload', methods=['GET', 'POST'])
def upload():
    # if request.method == 'POST':
    # TODO: add a folder name using date
    filename = photos.save(request.files['file'])
    return filename
    # return "Do not uploaded"

@app.route('/delete/<filename>')
def delete(filename):
    os.remove(os.path.join(app.config['UPLOADED_PHOTOS_DEST'], filename))
    return jsonify({'result': True})

if __name__ == '__main__':
    app.run(debug=True)
