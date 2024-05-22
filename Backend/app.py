from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
from bson import json_util
from bson.json_util import dumps, loads
from pymongo import DESCENDING
import os
from werkzeug.utils import secure_filename
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from datetime import timedelta




app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# MongoDB configuration
# mongodb://10.8.0.15:27017/phcp_formdata
app.config['MONGO_URI'] = 'mongodb://10.8.0.15:27017/phcp_formdata'
mongo = PyMongo(app)
translations_collection = mongo.db["translations"]
organization_collection = mongo.db["organization"]
medical_assistants= mongo.db["medicalassistants"]
Drive_data = mongo.db["drivedata"]


# JWT configuration
app.config['JWT_SECRET_KEY'] = 'swetha!@#$%S'  # Change this to a secure key
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=1)
jwt = JWTManager(app)


app.config['UPLOAD_FOLDER'] = 'uploads'  # Specify the folder where uploaded files will be stored
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}  # Sp





# Check if connected to MongoDB

# Endpoint to handle form data submission
@app.route('/api/save-data', methods=['POST'])
def save_data():
    try:
        data = request.json  # Get form data from request
        # Validate and process the data as needed
        # For example, you can insert it into MongoDB
        inserted_data = mongo.db.collection_name.insert_one(data)
        # Respond with success message
        return jsonify({'message': 'Data saved successfully', 'inserted_id': str(inserted_data.inserted_id)}), 200
    except Exception as e:
        # Handle exceptions and respond with error message
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/get-data', methods=['GET'])
def get_all_data():
    try:
        # Query MongoDB to retrieve all form data
        form_data = list(mongo.db.collection_name.find({}))
        # Return form data as JSON response
        return jsonify(form_data), 200
    except Exception as e:
        # Handle exceptions and respond with error message
        return jsonify({'error': str(e)}), 500

@app.route('/api/get-latest-documents', methods=['GET'])
def get_latest_documents():
    try:
        # Query MongoDB to retrieve the latest 10 documents
        latest_documents = list(mongo.db.collection_name.find().sort([('_id', DESCENDING)]).limit(10))
        # Reverse the order to get the last 10 documents
        latest_documents.reverse()
        # Convert ObjectId to string representation
        latest_documents = json_util.dumps(latest_documents)
        # Return the latest documents as JSON response
        return latest_documents, 200
    except Exception as e:
        # Handle exceptions and respond with error message
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/get-mongodb-count', methods=['GET'])
def get_mongodb_count():
    try:
        # Get the count of documents in the collection
        count = mongo.db.collection_name.count_documents({})
        return jsonify({'mongoDBCount': count}), 200
    except Exception as e:
        # Handle exceptions and respond with error message
        return jsonify({'error': str(e)}), 500

@app.route('/searchMedicalData', methods=['GET'])
def search_medical_data():
    try:
        # Get the location parameter from the query string
        location = request.args.get('location')

        if not location:
            return jsonify({"error": "location parameter is required"}), 400

        # Create a query to find medical records based on the location
        query = {'location': {'$regex': location, '$options': 'i'}}

        medical_records = mongo.db.collection_name.find(query)

        # Convert ObjectId to string in the response using dumps
        serialized_data = dumps(medical_records)

        return serialized_data

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# New route for signup
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/api/signup', methods=['POST'])
def signup():
    try:
        # Get signup data from request
        signup_data = request.form.to_dict()
        # Check if a file is uploaded
        if 'logo' in request.files:
            file = request.files['logo']
            if file.filename != '' and allowed_file(file.filename):
                # Save the uploaded file
                filename = secure_filename(file.filename)
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                signup_data['logo'] = filename
            else:
                return jsonify({'error': 'Invalid file format. Allowed formats: png, jpg, jpeg, gif'}), 400
        # Validate signup data (you can add more validation as needed)
        if 'email' not in signup_data or 'password' not in signup_data or 'organization' not in signup_data:
            return jsonify({'error': 'Incomplete signup data'}), 400
        # Insert signup data into MongoDB
        inserted_data = mongo.db.signup_collection.insert_one(signup_data)
        # Respond with success message
        return jsonify({'message': 'Signup successful', 'inserted_id': str(inserted_data.inserted_id)}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Endpoint for user login
from bson import ObjectId

@app.route('/api/login', methods=['POST'])
def login():
    try:
        # Get login data from request
        login_data = request.json
        # Validate login data (you can add more validation as needed)
        if 'email' not in login_data or 'password' not in login_data:
            return jsonify({'error': 'Incomplete login data'}), 400
        # Check if user exists in the signup collection
        user = mongo.db.signup_collection.find_one({'email': login_data['email'], 'password': login_data['password']})
        if user:
            # Generate JWT token
            access_token = create_access_token(identity=str(user['_id']))
            # Return success message along with the token
            return jsonify({'message': 'Login successful', 'access_token': access_token}), 200
        else:
            # If user does not exist or password is incorrect, return error message
            return jsonify({'error': 'Invalid email or password'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/get-role', methods=['GET'])
@jwt_required()
def get_role():
    try:
        current_user = get_jwt_identity()
        print("c",current_user)  # Check the current_user object to ensure it contains the expected data
        user = mongo.db.signup_collection.find_one({'_id': ObjectId(current_user)})

        if user:
            user_role = user.get('role')
            return jsonify({'role': user_role}), 200
        else:
            return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500



@app.route("/api/translations/<language>", methods=["GET"])
def get_translations(language):
    # Query MongoDB to find translations for the requested language

    translation_doc = translations_collection.find_one({"language": language})

    if translation_doc:
        return jsonify(translation_doc["translations"])
    else:
        return jsonify({"error": f"Translations not found for language: {language}"}), 404
    

from bson import ObjectId

@app.route("/api/organization/<organizationname>", methods=["GET"])
def get_organization(organizationname):
    # Query MongoDB to find translations for the requested language
    organizationname = organizationname.lower() 

    organization_doc = organization_collection.find_one({"organizationname": organizationname})

    if organization_doc:
        return jsonify(organization_doc["logo_url"])
    else:
        return jsonify({"error": f"Translations not found for language: {organizationname}"}), 404
    
UPLOAD_FOLDER = 'uploads'
    
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except Exception as e:
        # Log the error
        print(f"Error serving file '{filename}': {str(e)}")
        # Return a generic error response
        return jsonify({'error': 'Internal server error'}), 500
    
@app.route('/api/medicalassistants', methods=['POST'])

def add_medical_assistant():
    print("inside")
    data = request.json
    print(data)
    if 'username' not in data or 'location' not in data:
        return jsonify({'error': 'Username and location are required'}), 400
    
    
    medicalassistant_id = medical_assistants.insert_one(data).inserted_id
    return jsonify({'message': 'Medical assistant added successfully', 'id': str(medicalassistant_id)}), 201

# Route to get all medical assistants

@app.route('/api/medicalassistants', methods=['GET'])
def get_medical_assistants():
    medicalassistants = mongo.db.medicalassistants.find()
    result = [
        {
            'id': str(assistant['_id']),  # Convert ObjectId to string
            'username': assistant['username'],
            'location': assistant['location']
        }
        for assistant in medicalassistants
    ]
    print(result)
    return jsonify(result), 200

@app.route('/create_drive', methods=['POST'])
def save_drive():
    try:
        drive_data = request.json  # Assuming the data is sent in JSON format
        Drive_data = mongo.db["drivedata"]
        # Insert the drive data into the MongoDB collection
        result = Drive_data.insert_one(drive_data)
        return jsonify({'message': 'Drive data saved successfully', 'drive_id': str(result.inserted_id)}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get_drives', methods=['GET'])
def get_drives():
    try:
        Drive_data = mongo.db["drivedata"]
        # Fetch all drives from the MongoDB collection
        drives = list(Drive_data.find())
        # Convert ObjectId to string for JSON serialization
        for drive in drives:
            drive['_id'] = str(drive['_id'])
        return jsonify({'drives': drives}), 200, {'Content-Type': 'application/json'}
    except Exception as e:
        return jsonify({'error': str(e)}), 500, {'Content-Type': 'application/json'}


if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5401)
