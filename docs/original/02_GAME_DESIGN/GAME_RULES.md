# DADASHMODE GAME DESIGN SPECIFICATION

## 1. Game Philosophy
- **One Currency:** Banked seconds.
- **Starting Bank:** Both players start with exactly **20 seconds**.
- **Player Personas:**
  - **ELIAS (اِلیاس):** Red colorway (#FF2738), Triangle symbol (▲), Key [A]
  - **EMAD (عِماد):** Green colorway (#00C98D), Circle symbol (●), Key [L]

## 2. Invariants & Rules
1. Scores can never drop below 0 seconds.
2. The model/AI never mutates scores autonomously. It emits structured intent; human confirmation is mandatory.
3. Every score delta is appended as an immutable event in the journal with millisecond timestamps.
4. VAR (Video Assistant Referee) freezes scores while active; no mutations can occur until resolved.
