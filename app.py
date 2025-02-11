from flask import Flask, request, jsonify, send_from_directory
import psycopg2
from psycopg2.extras import RealDictCursor
import datetime
import os

app = Flask(__name__, static_folder='')

# Настройка подключения к базе данных через URI
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:admin@localhost:5432/noteapp')
conn = psycopg2.connect(DATABASE_URL)
cursor = conn.cursor(cursor_factory=RealDictCursor)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/add_note', methods=['POST'])
def add_note():
    data = request.get_json()
    title = data['title']
    content = data['content']
    date = datetime.datetime.now()

    cursor.execute("INSERT INTO notes (title, content, date) VALUES (%s, %s, %s) RETURNING *", (title, content, date))
    new_note = cursor.fetchone()
    conn.commit()
    return jsonify(new_note), 201

@app.route('/get_notes', methods=['GET'])
def get_notes():
    cursor.execute("SELECT * FROM notes ORDER BY date DESC")
    notes = cursor.fetchall()
    return jsonify(notes)

@app.route('/delete_note/<int:id>', methods=['DELETE'])
def delete_note(id):
    cursor.execute("DELETE FROM notes WHERE id = %s RETURNING *", (id,))
    deleted_note = cursor.fetchone()
    conn.commit()
    if deleted_note:
        return jsonify(deleted_note), 200
    else:
        return jsonify({"error": "Note not found"}), 

if __name__ == '__main__':
    app.run(debug=True)