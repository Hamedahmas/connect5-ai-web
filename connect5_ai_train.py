import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
import random
import os

ROWS = 7
COLS = 9
WIN_LENGTH = 5

class Connect5Env:
    def __init__(self):
        self.board = np.zeros((ROWS, COLS), dtype=int)
        self.current_player = 1  # 1 or -1

    def reset(self):
        self.board.fill(0)
        self.current_player = 1
        return self.board.copy()

    def available_moves(self):
        return [c for c in range(COLS) if self.board[0][c] == 0]

    def step(self, action):
        for r in reversed(range(ROWS)):
            if self.board[r][action] == 0:
                self.board[r][action] = self.current_player
                break

        done = self.check_win(self.current_player)
        reward = 1 if done else 0
        self.current_player *= -1
        return self.board.copy(), reward, done

    def check_win(self, player):
        def check_dir(dr, dc):
            for r in range(ROWS):
                for c in range(COLS):
                    try:
                        if all(self.board[r + dr * i][c + dc * i] == player for i in range(WIN_LENGTH)):
                            return True
                    except IndexError:
                        continue
            return False
        return check_dir(1, 0) or check_dir(0, 1) or check_dir(1, 1) or check_dir(1, -1)

class DQN(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc = nn.Sequential(
            nn.Flatten(),
            nn.Linear(ROWS * COLS, 128),
            nn.ReLU(),
            nn.Linear(128, COLS)
        )

    def forward(self, x):
        return self.fc(x)

class Agent:
    def __init__(self):
        self.model = DQN()
        self.target = DQN()
        self.target.load_state_dict(self.model.state_dict())
        self.optimizer = optim.Adam(self.model.parameters(), lr=0.001)
        self.memory = []
        self.batch_size = 64
        self.gamma = 0.99

    def remember(self, s, a, r, s2, done):
        self.memory.append((s, a, r, s2, done))
        if len(self.memory) > 10000:
            self.memory.pop(0)

    def act(self, state, epsilon):
        if random.random() < epsilon:
            return random.choice([c for c in range(COLS) if state[0][c] == 0])
        with torch.no_grad():
            state = torch.FloatTensor(state).unsqueeze(0)
            q_values = self.model(state)
            return int(torch.argmax(q_values))

    def train(self):
        if len(self.memory) < self.batch_size:
            return

        batch = random.sample(self.memory, self.batch_size)
        states, actions, rewards, next_states, dones = zip(*batch)

        states = torch.FloatTensor(states)
        next_states = torch.FloatTensor(next_states)
        rewards = torch.FloatTensor(rewards)
        dones = torch.BoolTensor(dones)

        q_values = self.model(states)
        next_q_values = self.target(next_states)

        targets = q_values.clone()
        for i in range(self.batch_size):
            targets[i][actions[i]] = rewards[i] + self.gamma * torch.max(next_q_values[i]) * (~dones[i])

        loss = nn.MSELoss()(q_values, targets)
        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()

    def update_target(self):
        self.target.load_state_dict(self.model.state_dict())

def train_agent(episodes=10000):
    env = Connect5Env()
    agent = Agent()
    epsilon = 1.0

    for ep in range(episodes):
        state = env.reset()
        done = False
        while not done:
            action = agent.act(state, epsilon)
            next_state, reward, done = env.step(action)
            agent.remember(state, action, reward, next_state, done)
            state = next_state
            agent.train()
        agent.update_target()
        epsilon *= 0.995
        epsilon = max(0.1, epsilon)
        if ep % 500 == 0:
            print(f"Episode {ep}, epsilon {epsilon:.2f}")

    torch.save(agent.model.state_dict(), "connect5_ai.pth")
    print("Model saved to connect5_ai.pth")

if __name__ == "__main__":
    train_agent()