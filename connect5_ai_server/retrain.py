import json
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from tensorflow.keras.optimizers import Adam

DATA_PATH = "connect5_data.jsonl"
MODEL_PATH = "connect5_model.h5"

COLS = 9
ROWS = 7

def load_data():
    X = []
    y = []
    with open(DATA_PATH, "r") as f:
        for line in f:
            entry = json.loads(line)
            board = np.array(entry["board"]).flatten()
            move = entry["move"]
            label = np.zeros(COLS)
            label[move] = 1  # One-hot target

            X.append(board)
            y.append(label)
    return np.array(X), np.array(y)

def build_model(input_size, output_size):
    model = Sequential([
        Dense(128, activation="relu", input_shape=(input_size,)),
        Dense(128, activation="relu"),
        Dense(output_size, activation="softmax")
    ])
    model.compile(optimizer=Adam(0.001), loss="categorical_crossentropy", metrics=["accuracy"])
    return model

def main():
    print("🔁 Loading data...")
    X, y = load_data()
    print(f"✅ Loaded {len(X)} samples.")

    print("📦 Building model...")
    model = build_model(X.shape[1], y.shape[1])

    print("🎓 Training...")
    model.fit(X, y, epochs=10, batch_size=32, verbose=1)

    print("💾 Saving model...")
    model.save(MODEL_PATH)
    print("✅ Model saved to", MODEL_PATH)

if __name__ == "__main__":
    main()
