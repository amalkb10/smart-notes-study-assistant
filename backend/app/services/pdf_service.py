import io
import logging
from typing import Dict, Any
from pypdf import PdfReader

logger = logging.getLogger(__name__)

class DocumentService:
    @staticmethod
    def extract_text_from_pdf(file_bytes: bytes, filename: str = "document.pdf") -> Dict[str, Any]:
        try:
            reader = PdfReader(io.BytesIO(file_bytes))
            num_pages = len(reader.pages)
            extracted_text = []

            for i, page in enumerate(reader.pages):
                text = page.extract_text() or ""
                if text.strip():
                    extracted_text.append(f"--- Page {i+1} ---\n{text.strip()}")

            full_content = "\n\n".join(extracted_text)
            
            # Suggest a title from filename or first line
            clean_title = filename.rsplit(".", 1)[0].replace("-", " ").replace("_", " ").title()

            return {
                "title": clean_title,
                "content": full_content,
                "pages": num_pages,
                "char_count": len(full_content)
            }
        except Exception as e:
            logger.error(f"Failed to extract PDF text: {e}")
            raise ValueError(f"Could not parse PDF file: {str(e)}")

    @staticmethod
    def extract_text_from_txt(file_bytes: bytes, filename: str = "document.txt") -> Dict[str, Any]:
        try:
            content = file_bytes.decode("utf-8", errors="replace")
            clean_title = filename.rsplit(".", 1)[0].replace("-", " ").replace("_", " ").title()
            return {
                "title": clean_title,
                "content": content,
                "pages": 1,
                "char_count": len(content)
            }
        except Exception as e:
            logger.error(f"Failed to extract text file: {e}")
            raise ValueError(f"Could not parse text file: {str(e)}")

document_service = DocumentService()
