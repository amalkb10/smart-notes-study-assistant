import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "AI-Powered Smart Notes & Study Assistant"
    VERSION: str = "1.0.0"
    
    # Database
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    DB_NAME: str = os.getenv("DB_NAME", "smart_notes_db")
    
    # AI Keys
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip()
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.0-flash").strip()
    
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "").strip()
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile").strip()
    
    # Server
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

settings = Settings()
