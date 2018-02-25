#-*- coding:utf-8 -*-
from flask import Flask, render_template, request, jsonify, make_response, redirect, url_for
import requests
import firebase_admin
from firebase_admin import credentials, auth
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from functools import wraps
import geocoder
# from model import Users

app = Flask(__name__)

#related to firebase
cred = credentials.Certificate('/Users/skw/Documents/milobnb-1512790607233-firebase-adminsdk-u2og9-a54d5f8c48.json')
firebase_admin.initialize_app(cred)

# related to google map
googleMap_key = "AIzaSyChQ8A11Bmn1MlZ8q3-HcSUijfhf3-WtI0"
search_url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
details_url = "https://maps.googleapis.com/maps/api/place/details/json"

app.config.from_pyfile('config.cfg')
db = SQLAlchemy(app)

class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    firstname = db.Column(db.String(255))
    lastname = db.Column(db.String(255))
    password = db.Column(db.Text, nullable=False)
    uid = db.Column(db.Text)
    email = db.Column(db.String(255), unique=True, nullable=False)
    date_of_birth = db.Column(db.DateTime)

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
            current_user = Users.query.filter_by(email=decoded_token['email']).first()
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
            current_user = Users.query.filter_by(email=decoded_token['email']).first()
        except:
            return jsonify({'message' : 'Token is invalid!!', 'token' : token}), 401

        return f(current_user, *args, **kwargs)

    return decorated

@app.route('/')
def index():
    return render_template('index.html')

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
    ex_user = Users.query.filter_by(email=email).first()
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

        db_user = Users(email=email, firstname=firstname, lastname=lastname, password=password, date_of_birth=dt, uid=user.uid)
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
        user = Users.query.filter_by(email=login_email).first()
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

    user = Users.query.filter_by(email=email).first()

    if not user:
        return render_template('section/no_user_navbar.html')

    return render_template('section/user_navbar.html', firstname=user.firstname, email=user.email)

@app.route('/logout')
def logout():
    pass

@app.route('/become-a-host/room', methods=['POST'])
@login_required
def room(current_user):
    return render_template('become-a-host/room.html', user=current_user)

@app.route('/become-a-host/bedrooms', methods=['POST'])
@login_required
def bedrooms(current_user):
    category_type = request.form['category_type']
    property_type = request.form['property_type']
    room_type = request.form['room_type']
    space_radio = request.form['space_radio']

    return render_template('become-a-host/bedrooms.html', user=current_user)

@app.route('/become-a-host/location', methods=['GET', 'POST'])
@login_required
def location(current_user):
    guests_cnt = request.form['guests_cnt']
    how_many_bedrooms = request.form['how_many_bedrooms']
    beds_cnt = request.form['beds_cnt']
    bathrooms_cnt = request.form['bathrooms_cnt']
    bathroom_private = request.form['bathroom_private']

    #return jsonify({ 'guest' : guests_cnt, 'bedroom' : how_many_bedrooms, 'bed': beds_cnt, 'bath':bathrooms_cnt, 'private':bathroom_private })
    return render_template('become-a-host/location.html')

@app.route('/become-a-host/location/submit', methods=['POST'])
def location_submit():
    country_region = request.form['country_region']
    street = request.form['street_address']
    apt = request.form['apt_address']
    city = request.form['city']
    state = request.form['state']
    zip_code = request.form['zip']

    if not apt:
        address = street + ", " + city + ", " + state
    else:
        address = apt + ", " + street + ", " + city + ", " + state

    search_payload = {"key":googleMap_key, "query":address}
    search_req = requests.get(search_url, params=search_payload)
    search_json = search_req.json()

    place_id = search_json["results"][0]["place_id"]

    details_payload = {"key":googleMap_key, "placeid":place_id}
    details_resp = requests.get(details_url, params=details_payload)
    details_json = details_resp.json()

    #TODO : insert data to DB & deprive id(param)

    # return jsonify({ 'address' : details_json["result"]["formatted_address"], "url": details_json["result"]["geometry"]["location"], "postCode": details_json["result"]["address_components"][5]["long_name"] })
    return redirect(url_for('location_saved', id=202020, post=details_json["result"]["address_components"][5]["long_name"], add=details_json["result"]["formatted_address"], loc=details_json["result"]["geometry"]["location"]))

@app.route('/geo', methods=['GET'])
def geo():
    geo = geocoder.ip('me')
    return jsonify({ 'city':geo.city, 'country':geo.country, 'state':geo.state})

@app.route('/become-a-host/<int:id>/location')
def location_saved(id):
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


if __name__ == '__main__':
    app.run(debug=True)
