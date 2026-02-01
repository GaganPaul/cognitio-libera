import os
import google.generativeai as genai
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from typing import List, Optional
import json

class CodingQuestion(BaseModel):
    title: str = Field(description="The title of the coding problem")
    description: str = Field(description="The detailed description of the problem")
    examples: List[str] = Field(description="Examples of input and output")
    constraints: List[str] = Field(description="Constraints for the problem")
    starter_code: str = Field(description="The function signature/boilerplate ONLY. DO NOT include the solution implementation.")

class MCQQuestion(BaseModel):
    title: str = Field(description="The question text")
    options: List[str] = Field(description="A list of 4 possible answers")
    correct_option_index: int = Field(description="The index (0-3) of the correct option")
    explanation: str = Field(description="Explanation of why the correct answer is correct")

class Evaluation(BaseModel):
    is_correct: bool = Field(description="Whether the user's answer is correct")
    explanation: str = Field(description="Detailed explanation of why it is correct or incorrect")
    tips: List[str] = Field(description="Tips for improvement or optimization")
    rating: int = Field(description="Rating from 1 to 10 based on code quality and correctness")

class LLMManager:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemma-3-27b-it')
        
    def _get_json_response(self, prompt_text: str, pydantic_model) -> dict:
        try:
             # Add explicit JSON instruction
            prompt_text += "\n\nIMPORTANT: Output strictly valid JSON. No markdown formatting. Ensure all keys and string values are enclosed in double quotes."
            
            response = self.model.generate_content(prompt_text)
            text = response.text.strip()
            
            print(f"DEBUG: Raw LLM Response: {text}")

            # Robust JSON extraction
            # Strategy: Locate the substring between the first '{' and the last '}'
            start_idx = text.find("{")
            end_idx = text.rfind("}")
            
            if start_idx != -1 and end_idx != -1:
                json_str = text[start_idx : end_idx + 1]
            else:
                json_str = text # Hope for the best

            # Try to parse
            try:
                json_dict = json.loads(json_str)
                # Helper for Pydantic v1 vs v2 compatibility
                if hasattr(pydantic_model, 'model_validate'):
                    return pydantic_model.model_validate(json_dict)
                else:
                    return pydantic_model.parse_obj(json_dict)
            except json.JSONDecodeError as e:
                print(f"JSON Parsing Failed: {e}")
                # Clean up potential "Expecting property name enclosed in double quotes" if keys are single quoted
                try:
                    import ast
                    # fallback to ast.literal_eval if it's a valid python dict (single quotes)
                    json_dict = ast.literal_eval(json_str)
                    if hasattr(pydantic_model, 'model_validate'):
                        return pydantic_model.model_validate(json_dict)
                    else:
                        return pydantic_model.parse_obj(json_dict)
                except Exception as ast_e:
                    print(f"AST Parsing failed: {ast_e}")
                    raise e
                    
        except Exception as e:
            print(f"Error parsing JSON: {e}")
            if 'response' in locals():
                print(f"Failed Text: {response.text}")
            raise e

    def generate_coding_question(self, language: str, difficulty: str, topic_history: List[str] = []) -> CodingQuestion:
        # Pass the Class directly, not the parser
        
        history_context = ""
        if topic_history:
            history_context = f"Previously asked topics/questions: {', '.join(topic_history[-5:])}. DO NOT repeat these. Choose a different aspect of {language}."

        template = """
        You are an expert coding interviewer. Generate a {difficulty} coding problem in {language} (LeetCode style).
        
        {history_context}
        
        Ensure you cover a wide range of aspects of the language. If the history shows recent questions on one topic (e.g., Arrays), switch to another (e.g., Strings, Recursion, OOP, API usage).
        
        If the difficulty is "Hard", ensure it is a complex DSA problem.
        
        CRITICAL INSTRUCTION:
        - The `starter_code` field MUST contain ONLY the function signature/boilerplate.
        - DO NOT IMPLEMENT THE SOLUTION in `starter_code`. Use `pass` or return default value.
        - Example starter code: `def solve(nums):\n    pass`

        Response format example:
        {{
            "title": "Two Sum",
            "description": "Given array... return indices...",
            "examples": ["Input: nums = [2,7], target = 9\\nOutput: [0,1]"],
            "constraints": ["2 <= nums.length <= 10^4"],
            "starter_code": "def two_sum(nums, target):\\n    pass"
        }}
        """
        
        prompt = PromptTemplate(
            template=template,
            input_variables=["language", "difficulty", "history_context"]
        )
        
        formatted_prompt = prompt.format(language=language, difficulty=difficulty, history_context=history_context)
        return self._get_json_response(formatted_prompt, CodingQuestion)

    def generate_mcq(self, language: str, difficulty: str, topic_history: List[str] = []) -> MCQQuestion:
        # Pass Class directly
        
        history_context = ""
        if topic_history:
            history_context = f"Previously asked topics/questions: {', '.join(topic_history[-5:])}. DO NOT repeat these. Choose a different, unvisited aspect of {language}."

        template = """
        You are a computer science professor. Generate a {difficulty} multiple-choice question (MCQ) about {language}.
        
        {history_context}
        
        Ensure the questions become progressively diverse. Cover syntax, libraries, memory management, quirks, and best practices.
        
        - Provide exactly 4 options.
        - Indicate the correct option index (0-3).
        - Provide a clear explanation.

        Response format example:
        {{
            "title": "Question text here...",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct_option_index": 2,
            "explanation": "Explanation here..."
        }}
        """
        
        prompt = PromptTemplate(
            template=template,
            input_variables=["language", "difficulty", "history_context"]
        )
        
        formatted_prompt = prompt.format(language=language, difficulty=difficulty, history_context=history_context)
        return self._get_json_response(formatted_prompt, MCQQuestion)

    def evaluate_code(self, question, user_code: str, language: str) -> Evaluation:
        # Pass Class directly
        
        template = """
        You are an expert Senior Engineer Mentor. Evaluate the user's solution to the following problem.
        
        Problem: {title}
        Description: {description}
        
        User's Code ({language}):
        ```
        {user_code}
        ```
        
        Analyze the code for correctness, efficiency, and style.
        Explain WHY it is correct or incorrect.
        Provide constructive feedback and tips.
        
        Response format example:
        {{
            "is_correct": true,
            "explanation": "Your code correctly implements...",
            "tips": ["Consider edge case X", "Use a more descriptive variable name"],
            "rating": 9
        }}
        """
        
        prompt = PromptTemplate(
            template=template,
            input_variables=["title", "description", "user_code", "language"]
        )
        
        formatted_prompt = prompt.format(
            title=question.title,
            description=question.description if hasattr(question, 'description') else "MCQ",
            user_code=user_code,
            language=language
        )
        return self._get_json_response(formatted_prompt, Evaluation)

    def generate_report(self, history: List[dict]) -> str:
        template = """
        You are a supportive coding coach. Generate a detailed progress report based on the user's history.
        
        History:
        {history}
        
        Focus on:
        1. Summary of performance (Correct vs Incorrect).
        2. Detailed analysis of questions they got WRONG. Explain the core concept they missed.
        3. Provide clear strategies and learning paths to improve on their weak areas.
        4. Be encouraging but professional.
        
        Output the report in clear Markdown format.
        """
        
        prompt = PromptTemplate(
            template=template,
            input_variables=["history"]
        )
        
        formatted_prompt = prompt.format(history=str(history))
        
        try:
            response = self.model.generate_content(formatted_prompt)
            return response.text
        except Exception as e:
             print(f"Error generating report: {e}")
             return "Could not generate report due to an error."
