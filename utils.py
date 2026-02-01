from fpdf import FPDF
import io

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

def create_pdf_report(markdown_text):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    
    # Clean up simple markdown for better PDF readability
    # Basic cleanup: remove ** for bold, # for headers (and make them look bigger manually if needed, or just keep simple)
    lines = markdown_text.split('\n')
    
    for line in lines:
        line = line.strip()
        if not line:
            pdf.ln(5)
            continue
            
        if line.startswith('# '):
            pdf.set_font("Arial", 'B', 16)
            pdf.cell(0, 10, line.replace('# ', ''), ln=True)
            pdf.set_font("Arial", size=12)
        elif line.startswith('## '):
            pdf.set_font("Arial", 'B', 14)
            pdf.cell(0, 10, line.replace('## ', ''), ln=True)
            pdf.set_font("Arial", size=12)
        elif line.startswith('### '):
            pdf.set_font("Arial", 'B', 12)
            pdf.cell(0, 10, line.replace('### ', ''), ln=True)
            pdf.set_font("Arial", size=12)
        else:
            # Handle bolding inside lines (simple removal)
            line = line.replace('**', '')
            # Multi_cell for wrapping text
            pdf.multi_cell(0, 6, line)
            
    return pdf.output(dest='S').encode('latin-1', errors='replace') # Output as bytes

def get_base64_download_link(file_data, filename, label, mime_type='text/plain'):
    if isinstance(file_data, str):
        file_data = file_data.encode() # Convert string to bytes if needed
        
    b64 = base64.b64encode(file_data).decode()
    return f'<a href="data:{mime_type};base64,{b64}" download="{filename}" class="download-button">{label}</a>'
