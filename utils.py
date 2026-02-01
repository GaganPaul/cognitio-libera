import streamlit as st
import base64

def init_session_state():
    if "messages" not in st.session_state:
        st.session_state.messages = []
    if "current_question" not in st.session_state:
        st.session_state.current_question = None
    if "history" not in st.session_state:
        st.session_state.history = []
    if "score" not in st.session_state:
        st.session_state.score = 0
    if "question_start_time" not in st.session_state:
        st.session_state.question_start_time = None

def get_base64_download_link(text, filename, label):
    b64 = base64.b64encode(text.encode()).decode()
    return f'<a href="data:file/txt;base64,{b64}" download="{filename}" class="download-button">{label}</a>'
