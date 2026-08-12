import os
import sys
from llm_manager import LLMManager

# 1. Load API Key
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    # Try reading from secrets.toml manually
    try:
        with open(".streamlit/secrets.toml", "r") as f:
            for line in f:
                if "GEMINI_API_KEY" in line:
                    api_key = line.split("=")[1].strip().strip('"')
                    break
    except:
        pass

if not api_key:
    print("Error: Could not find GEMINI_API_KEY")
    sys.exit(1)

print(f"API Key found: {api_key[:5]}...")

manager = LLMManager(api_key)

# 2. Test Custom Prompt Generation
print("\n--- Testing Custom Prompt Generation ---")
custom_topic = "Python Recursion with Fibonacci"
print(f"Requesting question with custom topic: {custom_topic}")

try:
    q = manager.generate_coding_question("Python", "Easy", [], custom_topic)
    print(f"Question Title: {q.title}")
    print(f"Question Desc: {q.description}")
    if "Fibonacci" in q.title or "Fibonacci" in q.description:
        print("SUCCESS: Custom topic influencing generation.")
    else:
        print("WARNING: Custom topic might not have influenced generation strongly.")
except Exception as e:
    print(f"FAILED: {e}")

# 3. Test Chat Response
print("\n--- Testing Chat Response ---")
question_context = {
    "title": "Test Question",
    "description": "Write a function to add two numbers.",
    "details": "def add(a, b):\n    pass"
}
chat_history = []
user_query = "Can you give me a hint?"

print(f"User Query: {user_query}")
try:
    response = manager.get_chat_response(question_context, chat_history, user_query)
    print(f"AI Response: {response}")
    if response:
        print("SUCCESS: Chat response received.")
    else:
        print("FAILED: Empty response.")
except Exception as e:
    print(f"FAILED: {e}")
