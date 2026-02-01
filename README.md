# Cognitio Libera 🚀
*A clean, elegant, and AI-powered coding practice platform*

**Cognitio Libera** is a professional-grade Streamlit application designed to help developers master coding and computer science concepts. Powered by **Google's Gemma 3 27B IT** model, it offers a personalized, mentor-like experience for both algorithmic problem-solving and conceptual knowledge.

## Try it out here:
https://gaganpaul-cognitio-libera-app-6kkk0k.streamlit.app/
---

## ✨ Key Features

### 1. Dual Practice Modes
*   **💻 Coding Challenge (LeetCode Style)**:
    *   Solve algorithmic problems tailored to your difficulty level.
    *   **Real LeetCode Experience**: You receive *only* the function signature. No starter code spoilers!
    *   **Senior Mentor Feedback**: Detailed evaluation of correctness, time/space complexity, and code style.
*   **📝 Quiz Mode (MCQ)**:
    *   Test your theoretical knowledge with conceptual multiple-choice questions.
    *   Immediate validation with detailed explanations for every option.

### 2. Smart Question Engine
*   **🔄 No Repeats**: Intelligently tracks your session history to ensure every question is unique.
*   **📈 Progressive Variety**: Automatically shifts topics (e.g., Arrays → Strings → OOP) to ensure broad coverage.
*   **Java (BlueJ) Support**: Specifically tailored support for BlueJ/School-level Java syntax.

### 3. Polish & Professional UI
*   **Midnight Blue Theme**: A stunning, distraction-free dark interface with glassmorphism effects.
*   **Smooth Navigation**: Dedicated **Refresh** 🔄 and **Skip** ⏩ controls for seamless practice.
*   **Timer**: Built-in stopwatch to track your speed per question.

### 4. Comprehensive Reporting
*   Generate detailed **Markdown Progress Reports** summarizing your session.
*   Identifies weak spots and suggests personalized learning paths.

---

## 🛠️ Technology Stack

*   **Frontend**: Streamlit
*   **AI Model**: Google Gemma 3 27B IT (via Google Generative AI SDK)
*   **Orchestration**: LangChain Core
*   **Logic**: Python

---

## 📦 Installation & Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/GaganPaul/cognitio-libera.git
    cd cognitio-libera
    ```

2.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Configure API Key**:
    *   Get your key from [Google AI Studio](https://aistudio.google.com/).
    *   Create a file `.streamlit/secrets.toml`:
        ```toml
        GEMINI_API_KEY = "your_api_key_here"
        ```

4.  **Run the App**:
    ```bash
    streamlit run app.py
    ```

---

## 🎮 How to Use

1.  **Select Mode**: Choose between **Coding Challenge** or **Quiz Mode** in the sidebar.
2.  **Choose Language**: Python, Java, Java (BlueJ), JavaScript, C++, etc.
3.  **Set Difficulty**: Easy, Medium, or Hard (DSA focused).
4.  **Practice**:
    *   **Coding**: Write your solution in the editor and click **Submit**.
    *   **Quiz**: Select the right option and click **Check Answer**.
5.  **Review**: Read the AI mentor's feedback.
6.  **Progress**: Click **Next Question** to continue or **Generate Report** to analyze your session.

---

## 📜 License

Created by **Gagan Paul**. Free for educational and personal use.

*Cognitio Libera — Learn freely. Think deeply. Code better.* ✨
