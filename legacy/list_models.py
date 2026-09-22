import os
import google.generativeai as genai
from dotenv import load_dotenv
import streamlit as st

# Try to look for secrets.toml
try:
    with open(".streamlit/secrets.toml", "r") as f:
        for line in f:
            if "GEMINI_API_KEY" in line:
                key = line.split("=")[1].strip().strip('"')
                os.environ["GOOGLE_API_KEY"] = key
                break
except:
    pass

api_key = os.environ.get("GOOGLE_API_KEY")

if not api_key:
    print("API Key not found.")
else:
    genai.configure(api_key=api_key)
    print("Listing available models...")
    try:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(m.name)
    except Exception as e:
        print(f"Error: {e}")
