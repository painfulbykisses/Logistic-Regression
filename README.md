# Logistic Regression & Perceptron Algorithm — Interactive Simulation

> **Assignment 3 — Artificial Intelligence Modeling Course**  
> Brawijaya University · Computer Science

An interactive, browser-based simulation that implements and visually compares **Logistic Regression** and the **Perceptron Algorithm** for binary classification. Built as a single HTML file with vanilla JavaScript and Canvas API — no external dependencies required.

## 🎬 Reference

Based on the concepts from:  
📺 [**Luis Serrano — Logistic Regression and the Perceptron Algorithm: A Friendly Introduction**](https://www.youtube.com/watch?v=jbluHIgBmBo)  
📘 *Grokking Machine Learning* (Manning Publications)

## ✨ Features

### Algorithms Implemented
| Algorithm | Method | Update Rule |
|-----------|--------|-------------|
| **Perceptron** | Misclassification-driven | `w = w + α·y·x`, `b = b + α·y` |
| **Logistic Regression** | Gradient Descent + Sigmoid | `w = w - α·∇L(w)` with Log-Loss |

### Interactive Capabilities
- **Click-to-add data points** — place Class 0 (blue) and Class 1 (orange) points on a 2D canvas
- **Preset datasets** — Linearly Separable, Overlapping, and Random configurations
- **Configurable parameters** — Learning rate, epochs, initial weights (w₁, w₂, b)
- **Side-by-side comparison** — run both algorithms simultaneously on the same data
- **Real-time animation** — watch the decision boundary evolve during training
- **Probability heatmap** — visualize sigmoid output across the feature space (Logistic Regression)
- **Loss convergence chart** — track error reduction over epochs
- **Results table** — compare final weights, accuracy, and loss

## 🧮 Mathematical Foundation

### Sigmoid Function
```
σ(z) = 1 / (1 + e⁻ᶻ)
where z = w₁·x₁ + w₂·x₂ + b
```

### Log-Loss (Binary Cross-Entropy)
```
L = -(1/n) Σ [yᵢ·ln(ŷᵢ) + (1 - yᵢ)·ln(1 - ŷᵢ)]
```

### Gradient Descent Update
```
wⱼ = wⱼ - α · (1/n) Σ (ŷᵢ - yᵢ) · xⱼ
b  = b  - α · (1/n) Σ (ŷᵢ - yᵢ)
```

### Perceptron Update (for misclassified points)
```
w = w + α · y · x
b = b + α · y
```

## 🚀 How to Run

Simply open the HTML file in any modern web browser:

```bash
# Clone the repository
git clone https://github.com/painfulbykisses/Logistic-Regression.git

# Open in browser
start Muhammad\ Dzikri\ Hikmatika_Tugas_logistic_regression.html
```

No server, no build step, no dependencies — just open and use.

## 📖 How to Use

1. **Step 1 — Add Data**: Select a class (blue or orange), then click on the canvas to place points. Or use a preset dataset.
2. **Step 2 — Configure**: Set learning rate, number of epochs, initial weights, and choose which algorithm(s) to run.
3. **Step 3 — Run**: Click "Jalankan Simulasi" to start training. Watch the decision boundary animate in real-time.
4. **Results**: Compare algorithm performance in the summary table after training completes.

## 🛠 Tech Stack

- **HTML5 Canvas** — data visualization and animation
- **Vanilla JavaScript** — algorithm implementation (no libraries)
- **CSS3** — premium dark theme with glassmorphism effects
- **Google Fonts** — Inter + JetBrains Mono

## 👤 Author

**Muhammad Dzikri Hikmatika Chairul Hadi**  
NIM: 225090307111007  
Artificial Intelligence Modeling · Brawijaya University

## 📄 License

This project is for educational purposes as part of the AI Modeling course curriculum.
