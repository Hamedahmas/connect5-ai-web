from flask import Flask, request, jsonify
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
import os

app = Flask(__name__)

# لود مدل
MODEL_PATH = "connect5_model.h5"

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")

model = load_model(MODEL_PATH)

ROWS = 7
COLS = 9

@app.route("/")
def home():
    return "✅ Connect5 AI API is running!"

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    if "board" not in data:
        return jsonify({"error": "Missing 'board' key"}), 400

    board = data["board"]
    if len(board) != ROWS or any(len(row) != COLS for row in board):
        return jsonify({"error": "Invalid board size"}), 400

    board_array = np.array(board).flatten().reshape(1, -1)
    predictions = model.predict(board_array, verbose=0)[0]

    valid_moves = [i for i in range(COLS) if board[0][i] == 0]
    if not valid_moves:
        return jsonify({"move": -1})  # مساوی

    best_move = max(valid_moves, key=lambda col: predictions[col])

    return jsonify({"move": int(best_move)})

if __name__ == "__main__":
    app.run(debug=True)
