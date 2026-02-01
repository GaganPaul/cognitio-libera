import os
import streamlit as st
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate

# Load API key
try:
    if "GEMINI_API_KEY" in st.secrets:
        os.environ["GOOGLE_API_KEY"] = st.secrets["GEMINI_API_KEY"]
    elif "general" in st.secrets and "GEMINI_API_KEY" in st.secrets["general"]:
         os.environ["GOOGLE_API_KEY"] = st.secrets["general"]["GEMINI_API_KEY"]
except:
    # Fallback for manual run if secrets not loaded (but we are running via streamlit so it should work if we run via streamlit, 
    # but for python script validaton we need to read file manually)
    with open(".streamlit/secrets.toml", "r") as f:
         for line in f:
            if "GEMINI_API_KEY" in line:
                os.environ["GOOGLE_API_KEY"] = line.split("=")[1].strip().strip('"')

print(f"Key loaded: {bool(os.environ.get('GOOGLE_API_KEY'))}")

try:
    llm = ChatGoogleGenerativeAI(
        model="gemma-3-27b-it",
        temperature=0.7,
        max_retries=0
    )
    
    print("Attempting invocation...")
    response = llm.invoke("Hello, are you working?")
    print(response.content)

except Exception as e:
    print(f"ERROR: {e}")
