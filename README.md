# RAG-Based AI Interview Assistant

An AI-powered interview assistant that conducts standardized and personalized technical interviews using a candidate's resume and predefined question datasets.

## Features

- Candidate registration
- Standardized conceptual interview
- Coding interview
- Resume-based personalized interview
- Resume question generation using RAG
- Resume text extraction and chunking
- Embedding-based resume retrieval
- FAISS vector search
- LLM-based personalized question generation
- Answer evaluation and scoring
- Voice-based question reading
- Voice-based answer recording and speech-to-text
- Candidate score storage using MongoDB Atlas
- Final interview result and skill assessment

## Technologies Used

### Frontend
- React
- Vite
- JavaScript
- Web Speech API

### Backend
- Python
- FastAPI
- OpenRouter
- MongoDB Atlas
- FAISS
- Sentence Transformers

### AI / RAG

Resume:

PDF/DOCX
↓
Text Extraction
↓
Chunking
↓
Embeddings
↓
FAISS Vector Store
↓
Relevant Resume Information
↓
LLM
↓
Personalized Interview Question

## Project Structure

```text
RAG-Interview-Assistant/
│
├── backend/
│   ├── api/
│   ├── config/
│   ├── data/
│   ├── database/
│   ├── embeddings/
│   ├── engine/
│   ├── faiss_store/
│   ├── llm/
│   ├── resume/
│   └── retrieval/
│
├── frontend/
│   ├── public/
│   └── src/
│
├── .gitignore
├── README.md
└── requirements.txt