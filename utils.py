from fpdf import FPDF
import io
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
    if "feedback" not in st.session_state:
        st.session_state.feedback = None
    if "question_answered" not in st.session_state:
        st.session_state.question_answered = False

def create_pdf_report(markdown_text):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_margins(10, 10, 10)
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.set_font("Arial", size=12)
    
    # Calculate effective width: 210mm (A4) - 20mm (margins) = 190mm
    effective_width = 190

    # Sanitize text to latin-1 to avoid font issues with core fonts
    def sanitize(text):
        return text.encode('latin-1', 'replace').decode('latin-1')

    lines = markdown_text.split('\n')
    
    for line in lines:
        line = sanitize(line.strip())
        if not line:
            pdf.ln(5)
            continue
            
        try:
            if line.startswith('# '):
                pdf.set_font("Arial", 'B', 16)
                pdf.multi_cell(effective_width, 10, line.replace('# ', ''))
                pdf.set_font("Arial", size=12)
            elif line.startswith('## '):
                pdf.set_font("Arial", 'B', 14)
                pdf.multi_cell(effective_width, 10, line.replace('## ', ''))
                pdf.set_font("Arial", size=12)
            elif line.startswith('### '):
                pdf.set_font("Arial", 'B', 12)
                pdf.multi_cell(effective_width, 10, line.replace('### ', ''))
                pdf.set_font("Arial", size=12)
            else:
                line = line.replace('**', '')
                # Ensure no single word is too long (break on 90 chars roughly ~190mm)
                 # This acts as a safety for "Not enough horizontal space" errors on single tokens
                import textwrap
                wrapped_lines = textwrap.wrap(line, width=90) 
                for wrapped_line in wrapped_lines:
                     pdf.multi_cell(effective_width, 6, wrapped_line)
        except Exception as e:
            print(f"Skipped line in PDF due to error: {e}")
            continue
            
    return pdf.output(dest='S').encode('latin-1', errors='replace') # Output as bytes

def get_base64_download_link(file_data, filename, label, mime_type='text/plain'):
    if isinstance(file_data, str):
        file_data = file_data.encode() # Convert string to bytes if needed
        
    b64 = base64.b64encode(file_data).decode()
    return f'<a href="data:{mime_type};base64,{b64}" download="{filename}" class="download-button">{label}</a>'
