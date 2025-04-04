from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error

app = Flask(__name__)
CORS(app)  # Esto permite solicitudes CORS desde tu aplicación React

# Configuración de la base de datos
db_config = {
    'host': 'bglucmgbm4ndh8uojido-mysql.services.clever-cloud.com',
    'database': 'bglucmgbm4ndh8uojido',
    'user': 'u0mi0h3vk85jpjrk',
    'password': '2OMj4BJWJKwHLrC6HfEa',
    'port': '3306'
}

# Función para conectar a la base de datos
def get_db_connection():
    try:
        connection = mysql.connector.connect(**db_config)
        return connection
    except Error as e:
        print(f"Error al conectar a MySQL: {e}")
        return None

# Ruta para obtener todos los recolectores
@app.route('/api/recolectores', methods=['GET'])
def get_recolectores():
    try:
        connection = get_db_connection()
        if connection and connection.is_connected():
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT * FROM recolectores")
            recolectores = cursor.fetchall()
            cursor.close()
            connection.close()
            return jsonify(recolectores)
    except Error as e:
        return jsonify({"error": str(e)}), 500
    
    return jsonify([])

# Ruta para obtener un recolector por ID
@app.route('/api/recolectores/<int:id>', methods=['GET'])
def get_recolector(id):
    try:
        connection = get_db_connection()
        if connection and connection.is_connected():
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT * FROM recolectores WHERE id = %s", (id,))
            recolector = cursor.fetchone()
            cursor.close()
            connection.close()
            if recolector:
                return jsonify(recolector)
            return jsonify({"message": "Recolector no encontrado"}), 404
    except Error as e:
        return jsonify({"error": str(e)}), 500
    
    return jsonify({"message": "Error en la solicitud"}), 400

# Ruta para crear un nuevo recolector
@app.route('/api/recolectores', methods=['POST'])
def create_recolector():
    try:
        data = request.get_json()
        if not data or not 'recolector' in data or not 'finca' in data:
            return jsonify({"message": "Datos incompletos"}), 400
        
        connection = get_db_connection()
        if connection and connection.is_connected():
            cursor = connection.cursor()
            query = "INSERT INTO recolectores (recolector, finca) VALUES (%s, %s)"
            cursor.execute(query, (data['recolector'], data['finca']))
            connection.commit()
            new_id = cursor.lastrowid
            cursor.close()
            connection.close()
            return jsonify({"id": new_id, "message": "Recolector creado exitosamente"}), 201
    except Error as e:
        return jsonify({"error": str(e)}), 500
    
    return jsonify({"message": "Error al crear el recolector"}), 500

# Ruta para actualizar un recolector
@app.route('/api/recolectores/<int:id>', methods=['PUT'])
def update_recolector(id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"message": "Datos incompletos"}), 400
        
        connection = get_db_connection()
        if connection and connection.is_connected():
            cursor = connection.cursor()
            query = "UPDATE recolectores SET recolector = %s, finca = %s WHERE id = %s"
            cursor.execute(query, (data['recolector'], data['finca'], id))
            connection.commit()
            affected_rows = cursor.rowcount
            cursor.close()
            connection.close()
            
            if affected_rows > 0:
                return jsonify({"message": "Recolector actualizado exitosamente"})
            return jsonify({"message": "No se encontró el recolector"}), 404
    except Error as e:
        return jsonify({"error": str(e)}), 500
    
    return jsonify({"message": "Error al actualizar el recolector"}), 500

# Ruta para eliminar un recolector
@app.route('/api/recolectores/<int:id>', methods=['DELETE'])
def delete_recolector(id):
    try:
        connection = get_db_connection()
        if connection and connection.is_connected():
            cursor = connection.cursor()
            query = "DELETE FROM recolectores WHERE id = %s"
            cursor.execute(query, (id,))
            connection.commit()
            affected_rows = cursor.rowcount
            cursor.close()
            connection.close()
            
            if affected_rows > 0:
                return jsonify({"message": "Recolector eliminado exitosamente"})
            return jsonify({"message": "No se encontró el recolector"}), 404
    except Error as e:
        return jsonify({"error": str(e)}), 500
    
    return jsonify({"message": "Error al eliminar el recolector"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)