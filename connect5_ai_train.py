import numpy as np
import random
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import Dense, Flatten
from tensorflow.keras.optimizers import Adam
import os
import json

ROWS, COLS = 7, 9
WIN_LENGTH = 5
MODEL_FILE = 'connect5_model.h5'
DATA_FILE = 'training_data.json'

def create_model():
    model = Sequential([
        Flatten(input_shape=(ROWS, COLS, 2)),
        Dense(128, activation='relu'),
        Dense(64, activation='relu'),
        Dense(COLS, activation='softmax')
    ])
    model.compile(optimizer=Adam(0.001), loss='categorical_crossentropy')
    return model

def encode_board(board, player):
    human_board = (board == 1).astype(int)
    ai_board = (board == 2).astype(int)
    return np.stack([human_board, ai_board], axis=-1)

def simulate_random_game():
    board = np.zeros((ROWS, COLS), dtype=int)
    states = []
    current_player = 1  # 1: human, 2: ai

    for _ in range(ROWS * COLS):
        available_cols = [c for c in range(COLS) if board[0][c] == 0]
        if not available_cols:
            break

        col = random.choice(available_cols)
        for row in reversed(range(ROWS)):
            if board[row][col] == 0:
                board[row][col] = current_player
                break

        state = encode_board(board.copy(), current_player)
        states.append((state, col))

        if check_win(board, current_player):
            winner = current_player
            break
        current_player = 3 - current_player
    else:
        winner = 0  # Draw

    return states, winner

def check_win(board, player):
    for row in range(ROWS):
        for col in range(COLS):
            if check_direction(board, row, col, player, 0, 1) or \
               check_direction(board, row, col, player, 1, 0) or \
               check_direction(board, row, col, player, 1, 1) or \
               check_direction(board, row, col, player, 1, -1):
                return True
    return False

def check_direction(board, row, col, player, drow, dcol):
    count = 0
    for i in range(WIN_LENGTH):
        r, c = row + i * drow, col + i * dcol
        if 0 <= r < ROWS and 0 <= c < COLS and board[r][c] == player:
            count += 1
        else:
            break
    return count == WIN_LENGTH

def collect_training_data(games=100):
    data = []
    for _ in range(games):
        states, winner = simulate_random_game()
        if winner == 2:  # فقط بازی‌هایی که AI برده
            for state, col in states:
                label = np.zeros(COLS)
                label[col] = 1
                data.append((state, label))
    return data

def save_data(data, path):
    with open(path, 'w') as f:
        json.dump([
            (s.tolist(), l.tolist()) for s, l in data
        ], f)

def load_data(path):
    with open(path, 'r') as f:
        raw = json.load(f)
        return [(np.array(s), np.array(l)) for s, l in raw]

def train_model(model, data):
    X = np.array([x[0] for x in data])
    y = np.array([x[1] for x in data])
    model.fit(X, y, epochs=10, batch_size=16)
    return model

# --- Main Execution ---
if __name__ == "__main__":
    model = create_model() if not os.path.exists(MODEL_FILE) else load_model(MODEL_FILE)

    if not os.path.exists(DATA_FILE):
        data = collect_training_data(100)
        save_data(data, DATA_FILE)
    else:
        data = load_data(DATA_FILE)

    model = train_model(model, data)
    model.save(MODEL_FILE)
    print("✅ مدل ذخیره شد: ", MODEL_FILE)
