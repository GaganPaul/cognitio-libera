import streamlit as st
import time
from llm_manager import LLMManager
from utils import init_session_state, get_base64_download_link

# Page Config
st.set_page_config(page_title="Cognitio Libera", page_icon="🚀", layout="wide")

# Load CSS
def load_css():
    with open("style.css") as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)
load_css()

# Initialize Session State
init_session_state()

# Sidebar Setup
with st.sidebar:
    st.image("https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Google_Gemini_logo.svg/2560px-Google_Gemini_logo.svg.png", width=150)
    st.title("⚙️ Settings")
    
    # API Key Handling
    # Try to fetch from root or [general] section
    api_key = st.secrets.get("GEMINI_API_KEY")
    if not api_key and "general" in st.secrets:
        api_key = st.secrets["general"].get("GEMINI_API_KEY")
    
    if not api_key:
        st.error("❌ GEMINI_API_KEY is missing in .streamlit/secrets.toml")
        st.stop()

    language = st.selectbox("Programming Language", ["Python", "Java", "Java (BlueJ)", "JavaScript", "PHP", "HTML5", "CSS", "XHTML"])
    difficulty = st.selectbox("Difficulty", ["Easy", "Medium", "Hard (DSA)"])
    
    # Practice Mode Selection
    practice_mode = st.radio("Practice Mode", ["Coding Challenge (LeetCode)", "Quiz Mode (MCQ)"])
    if "practice_mode" not in st.session_state or st.session_state.practice_mode != practice_mode:
        st.session_state.practice_mode = practice_mode
        st.session_state.current_question = None # Reset question on mode switch
        st.rerun()

    st.markdown("---")
    if st.button("Generate Report 📊"):
        if st.session_state.history:
            try:
                llm_manager = LLMManager(api_key)
                with st.spinner("Generating detailed report..."):
                    report = llm_manager.generate_report(st.session_state.history)
                    st.markdown(get_base64_download_link(report, "progress_report.md", "📥 Download Report"), unsafe_allow_html=True)
            except Exception as e:
                    st.error(f"Error generating report: {e}")
        else:
            st.info("No practice history yet.")

# Main App Logic
st.title("🚀 Cognitio Libera")

# No longer checking if api_key is missing here because we stop earlier if it is.
llm_manager = LLMManager(api_key)

# Question Generation Section
if st.session_state.current_question is None:
    if st.button("Start New Question", type="primary"):
        # Get history of topics/questions to avoid repeats
        topic_history = [item["question"] for item in st.session_state.history]
        
        with st.spinner(f"Generating {difficulty} {practice_mode}..."):
            try:
                if "Coding" in practice_mode:
                    q = llm_manager.generate_coding_question(language, difficulty, topic_history)
                else:
                    q = llm_manager.generate_mcq(language, difficulty, topic_history)
                
                st.session_state.current_question = q
                st.session_state.question_start_time = time.time()
                st.rerun()
            except Exception as e:
                st.error(f"Failed to generate question: {e}")

else:
    # Display Question
    q = st.session_state.current_question
    
    # Timer
    elapsed_time = int(time.time() - st.session_state.question_start_time)
    minutes, seconds = divmod(elapsed_time, 60)
    st.markdown(f"### ⏱️ Time: {minutes:02d}:{seconds:02d}")
    
    # Render UI based on Mode
    if "Coding" in practice_mode:
        st.markdown(f"""
        <div class="question-card">
            <h2>{q.title}</h2>
            <p>{q.description}</p>
            <h4>Examples:</h4>
            <ul>{"".join([f"<li>{ex}</li>" for ex in q.examples])}</ul>
            <h4>Constraints:</h4>
            <ul>{"".join([f"<li>{c}</li>" for c in q.constraints])}</ul>
        </div>
        """, unsafe_allow_html=True)
        
        # Code Input
        user_code = st.text_area("Your Solution:", value=q.starter_code, height=300)
        
        col1, col2, col3 = st.columns([1.5, 1, 1])
        with col1:
            submit = st.button("Submit Solution", type="primary")
        with col2:
            if st.button("🔄 Refresh"):
                st.session_state.current_question = None
                st.rerun()
        with col3:
            if st.button("⏩ Skip"):
                st.session_state.current_question = None
                st.rerun()

        if submit:
            with st.spinner("Evaluating your solution..."):
                try:
                    evaluation = llm_manager.evaluate_code(q, user_code, language)
                    
                    # Update history
                    st.session_state.history.append({
                        "question": q.title,
                        "mode": "coding",
                        "difficulty": difficulty,
                        "language": language,
                        "user_code": user_code,
                        "is_correct": evaluation.is_correct,
                        "explanation": evaluation.explanation
                    })
                    
                    if evaluation.is_correct:
                        st.session_state.score += 1
                        st.balloons()
                        st.markdown(f"""
                        <div class="feedback-card correct">
                            <h3>✅ Correct!</h3>
                            <p>{evaluation.explanation}</p>
                            <h4>Thinking Process:</h4>
                            <ul>{"".join([f"<li>{tip}</li>" for tip in evaluation.tips])}</ul>
                        </div>
                        """, unsafe_allow_html=True)
                    else:
                        st.markdown(f"""
                        <div class="feedback-card incorrect">
                            <h3>❌ Incorrect</h3>
                            <p>{evaluation.explanation}</p>
                            <h4>How to Improve:</h4>
                            <ul>{"".join([f"<li>{tip}</li>" for tip in evaluation.tips])}</ul>
                        </div>
                        """, unsafe_allow_html=True)
                        
                    if st.button("Next Question"):
                        st.session_state.current_question = None
                        st.rerun()
                        
                except Exception as e:
                    st.error(f"Error evaluating code: {e}")

    else: # Quiz Mode
        st.markdown(f"""
        <div class="question-card">
            <h2>{q.title}</h2>
        </div>
        """, unsafe_allow_html=True)
        
        selected_option = st.radio("Choose the correct answer:", q.options)
        
        col1, col2, col3 = st.columns([1.5, 1, 1])
        with col1:
            submit = st.button("Check Answer", type="primary")
        with col2:
            if st.button("🔄 Refresh"):
                st.session_state.current_question = None
                st.rerun()
        with col3:
             if st.button("⏩ Skip"):
                st.session_state.current_question = None
                st.rerun()
        
        if submit:
            user_index = q.options.index(selected_option)
            is_correct = (user_index == q.correct_option_index)
            
            st.session_state.history.append({
                "question": q.title,
                "mode": "quiz",
                "difficulty": difficulty,
                "language": language,
                "user_answer": selected_option,
                "is_correct": is_correct,
                "explanation": q.explanation
            })

            if is_correct:
                st.session_state.score += 1
                st.balloons()
                st.success(f"✅ Correct! {q.explanation}")
            else:
                st.error(f"❌ Incorrect. The correct answer was: {q.options[q.correct_option_index]}")
                st.info(f"Explanation: {q.explanation}")
            
            if st.button("Next Question"):
                st.session_state.current_question = None
                st.rerun()
