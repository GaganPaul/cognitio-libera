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
        self.model = genai.GenerativeModel('gemini-3.6-flash')
        
    def _get_json_response(self, prompt_text: str, pydantic_model) -> dict:
        # Ensure the model is instructed to return strict JSON
        prompt_text += "\n\nIMPORTANT: Output strictly valid JSON. No markdown formatting. Ensure all keys and string values are enclosed in double quotes."

        try:
            response = self.model.generate_content(prompt_text)
            text = response.text.strip()
            print(f"DEBUG: Raw LLM Response: {text}")

            import re, ast

            # Try direct JSON load first
            try:
                return_obj = json.loads(text)
            except Exception:
                # Try extracting the first JSON-like object
                match = re.search(r"\{.*\}", text, re.DOTALL)
                candidate = match.group() if match else text
                try:
                    return_obj = json.loads(candidate)
                except Exception:
                    # Final fallback to ast.literal_eval to handle single quotes / python dict literals
                    try:
                        return_obj = ast.literal_eval(candidate)
                    except Exception as e:
                        print(f"Failed to parse model response as JSON/AST: {e}")
                        if 'response' in locals():
                            print(f"Failed Text: {response.text}")
                        raise

            # Convert to pydantic model (supports v1 and v2)
            if hasattr(pydantic_model, 'model_validate'):
                return pydantic_model.model_validate(return_obj)
            else:
                return pydantic_model.parse_obj(return_obj)
        except Exception:
            raise

    def generate_coding_question(self, language: str, difficulty: str, topic_history: List[str] = [], custom_prompt: Optional[str] = None) -> CodingQuestion:
        # Pass the Class directly, not the parser
        
        history_context = ""
        if topic_history:
            history_context = f"Previously asked topics/questions: {', '.join(topic_history[-5:])}. DO NOT repeat these. Choose a different aspect of {language}."

        custom_instruction = ""
        if custom_prompt:
            custom_instruction = f"USER SPECIFIC REQUEST: {custom_prompt}. Focus the question on this topic/requirement."

        template = """
        You are an expert coding interviewer. Generate a {difficulty} coding problem in {language} (LeetCode style).
        
        {history_context}
        {custom_instruction}
        
        Ensure you cover a wide range of aspects of the language. If the history shows recent questions on one topic (e.g., Arrays), switch to another (e.g., Strings, Recursion, OOP, API usage), unless the USER SPECIFIC REQUEST overrides this.
        
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
            input_variables=["language", "difficulty", "history_context", "custom_instruction"]
        )
        
        formatted_prompt = prompt.format(language=language, difficulty=difficulty, history_context=history_context, custom_instruction=custom_instruction)
        return self._get_json_response(formatted_prompt, CodingQuestion)

    def generate_mcq(self, language: str, difficulty: str, topic_history: List[str] = [], custom_prompt: Optional[str] = None) -> MCQQuestion:
        # Pass Class directly
        
        history_context = ""
        if topic_history:
            history_context = f"Previously asked topics/questions: {', '.join(topic_history[-5:])}. DO NOT repeat these. Choose a different, unvisited aspect of {language}."

        custom_instruction = ""
        if custom_prompt:
            custom_instruction = f"USER SPECIFIC REQUEST: {custom_prompt}. Focus the question on this topic/requirement."

        template = """
        You are a computer science professor. Generate a {difficulty} multiple-choice question (MCQ) about {language}.
        
        {history_context}
        {custom_instruction}
        
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
            input_variables=["language", "difficulty", "history_context", "custom_instruction"]
        )
        
        formatted_prompt = prompt.format(language=language, difficulty=difficulty, history_context=history_context, custom_instruction=custom_instruction)
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

    def get_chat_response(self, question_context: dict, chat_history: List[dict], user_query: str) -> str:
        """
        Generate a response to a user's follow-up question about the current coding problem/MCQ.
        """
        template = """
        You are an expert AI Mentor assisting a student with a specific coding problem.
        
        Current Problem Context:
        Title: {title}
        Description: {description}
        Details (Code/Options): {details}
        
        Chat History:
        {chat_history}
        
        Student's Question: {user_query}
        
        Instructions:
        - Provide a helpful, clear, and concise answer.
        - If the user asks for the solution, give hints instead of the full answer first, unless they explicitly ask to see the solution because they give up.
        - Explain concepts if asked.
        - Be encouraging.
        """
        
        prompt = PromptTemplate(
            template=template,
            input_variables=["title", "description", "details", "chat_history", "user_query"]
        )
        
        formatted_prompt = prompt.format(
            title=question_context.get("title", "Unknown"),
            description=question_context.get("description", "N/A"),
            details=question_context.get("details", "N/A"),
            chat_history=chat_history,
            user_query=user_query
        )
        
        try:
            response = self.model.generate_content(formatted_prompt)
            return response.text
        except Exception as e:
            print(f"Error getting chat response: {e}")
            return "I'm having trouble connecting right now. Please try again."
