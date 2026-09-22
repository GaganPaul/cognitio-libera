import os
import sys

try:
    print("Verifying imports...")
    import streamlit
    import langchain
    import langchain_google_genai
    from langchain.prompts import PromptTemplate
    
    print("Imports successful.")
    
    # Check if files exist
    files = ["app.py", "llm_manager.py", "utils.py", "style.css", ".streamlit/secrets.toml"]
    for f in files:
        if not os.path.exists(f):
             print(f"MISSING FILE: {f}")
             sys.exit(1)
        else:
             print(f"Found {f}")

    print("Environment structure looks correct.")

except ImportError as e:
    print(f"ImportError: {e}")
    print("Please run: pip install -r requirements.txt")
except Exception as e:
    print(f"An error occurred: {e}")
