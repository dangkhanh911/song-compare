from flask import render_template
from flask import Blueprint, jsonify

main = Blueprint('main', __name__)

@main.route('/api/data', methods=['GET'])
def get_data():
    return jsonify({"message": "Hello from the Python backend!"})
    
@main.route('/')
def home():
    return render_template('index.html')