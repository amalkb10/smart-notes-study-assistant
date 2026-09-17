import json
import re
import logging
from typing import List, Dict, Any, Optional
from app.config import settings

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.gemini_client = None
        if settings.GEMINI_API_KEY:
            try:
                from google import genai
                self.gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)
                logger.info("Initialized Google Gemini client.")
            except Exception as e:
                logger.error(f"Failed to initialize Gemini client: {e}")

    def _call_gemini(self, prompt: str) -> Optional[str]:
        if not self.gemini_client:
            # Check if key was updated dynamically
            if settings.GEMINI_API_KEY:
                try:
                    from google import genai
                    self.gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)
                except Exception:
                    return None
            else:
                return None

        try:
            response = self.gemini_client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt
            )
            return response.text
        except Exception as e:
            logger.error(f"Gemini API call failed: {e}")
            return None

    def _clean_json_str(self, text: str) -> str:
        # Strip markdown code blocks ```json ... ``` or ``` ... ```
        cleaned = re.sub(r"^```(?:json)?\s*", "", text.strip(), flags=re.MULTILINE)
        cleaned = re.sub(r"```\s*$", "", cleaned.strip(), flags=re.MULTILINE)
        return cleaned.strip()

    # ================= SUMMARIZATION & KEY TAKEAWAYS =================
    def summarize(self, content: str) -> Dict[str, Any]:
        prompt = f"""You are an elite academic tutor and study specialist. Analyze the following study notes and return a strictly valid JSON object.
Do NOT wrap with backticks or Markdown formatting, just valid raw JSON.

JSON Schema:
{{
  "summary": "Concise executive summary of 2-3 paragraphs highlighting core themes, definitions, and applications.",
  "key_takeaways": [
    "Takeaway 1 (concise high-yield concept)",
    "Takeaway 2",
    "Takeaway 3",
    "Takeaway 4",
    "Takeaway 5"
  ]
}}

Study Material / Notes:
{content}
"""
        response_text = self._call_gemini(prompt)
        if response_text:
            try:
                data = json.loads(self._clean_json_str(response_text))
                return {
                    "summary": data.get("summary", ""),
                    "key_takeaways": data.get("key_takeaways", []),
                    "source": "gemini"
                }
            except Exception as err:
                logger.warning(f"Failed to parse Gemini JSON summary: {err}")

        # Fallback offline generator
        return self._offline_summary(content)

    def _offline_summary(self, content: str) -> Dict[str, Any]:
        lines = [line.strip() for line in content.split("\n") if line.strip()]
        if not lines:
            return {"summary": "No content provided to summarize.", "key_takeaways": [], "source": "offline"}

        # Extract potential bullet points and title
        headings = [l.lstrip("#").strip() for l in lines if l.startswith("#")]
        paragraphs = [l for l in lines if not l.startswith("#") and len(l) > 40]
        
        preview = " ".join(paragraphs[:3]) if paragraphs else " ".join(lines[:4])
        if len(preview) > 500:
            preview = preview[:497] + "..."

        takeaways = []
        for line in lines:
            if line.startswith("- ") or line.startswith("* ") or line.startswith("• "):
                takeaways.append(line[2:].strip())
            elif any(marker in line.lower() for marker in ["important:", "note:", "key:", "definition:"]):
                takeaways.append(line.strip())
            if len(takeaways) >= 5:
                break

        if not takeaways:
            takeaways = [
                f"Core topic focus: {headings[0] if headings else lines[0][:60]}",
                "Key foundations and architectural principles outlined in the notes.",
                "Review foundational definitions and core terminologies.",
                "Apply theoretical concepts to practical study examples.",
                "Test comprehension using the Flashcards & Quiz tools."
            ]

        summary = (
            f"{preview}\n\n"
            f"(Generated via offline smart parser. Configure GEMINI_API_KEY in .env for advanced generative synthesis.)"
        )

        return {
            "summary": summary,
            "key_takeaways": takeaways[:6],
            "source": "offline"
        }

    # ================= FLASHCARDS GENERATION =================
    def generate_flashcards(self, content: str, count: int = 5) -> List[Dict[str, Any]]:
        prompt = f"""You are an expert educator. Based on the study material below, create exactly {count} high-yield study flashcards for spaced repetition.
Return strictly a valid JSON array of objects without Markdown formatting or backticks.

JSON Schema:
[
  {{
    "question": "Clear, direct test question testing understanding or recall",
    "answer": "Concise, highly accurate answer explaining the concept",
    "hint": "Helpful memory cue or mnemonic"
  }}
]

Study Material:
{content}
"""
        response_text = self._call_gemini(prompt)
        if response_text:
            try:
                cards = json.loads(self._clean_json_str(response_text))
                if isinstance(cards, list) and len(cards) > 0:
                    for c in cards:
                        c["source"] = "gemini"
                    return cards
            except Exception as err:
                logger.warning(f"Failed to parse Gemini flashcards: {err}")

        return self._offline_flashcards(content, count)

    def _offline_flashcards(self, content: str, count: int = 5) -> List[Dict[str, Any]]:
        lines = [line.strip() for line in content.split("\n") if line.strip()]
        cards = []

        # Find lines with definitions or colons: 'Concept: Explanation'
        for line in lines:
            if ":" in line and len(line) > 15:
                parts = line.split(":", 1)
                term = parts[0].lstrip("#*-• ").strip()
                definition = parts[1].strip()
                if len(term) < 60 and len(definition) > 10:
                    cards.append({
                        "question": f"What is {term}?",
                        "answer": definition,
                        "hint": f"Key concept related to {term}",
                        "source": "offline"
                    })
                    if len(cards) >= count:
                        break

        # Fallback card templates if not enough colon pairs
        if len(cards) < count:
            topics = [l.lstrip("#*-• ").strip() for l in lines if 10 < len(l) < 100]
            for i, topic in enumerate(topics):
                if len(cards) >= count:
                    break
                cards.append({
                    "question": f"Explain the significance of: {topic[:60]}",
                    "answer": f"This is a fundamental pillar of the subject covered in the study notes.",
                    "hint": "Recall the context and definitions provided in your notes.",
                    "source": "offline"
                })

        # Ensure at least 1 card exists
        if not cards:
            cards.append({
                "question": "What is the primary topic of these study notes?",
                "answer": lines[0] if lines else "Key concepts outlined in your study session.",
                "hint": "Refer to the top section of the note.",
                "source": "offline"
            })

        return cards[:count]

    # ================= QUIZ GENERATION =================
    def generate_quiz(self, content: str, num_questions: int = 5, difficulty: str = "medium") -> List[Dict[str, Any]]:
        prompt = f"""You are an exam creator. Based on the notes below, generate {num_questions} multiple-choice questions ({difficulty} difficulty) to test student mastery.
Each question must have exactly 4 options labeled A, B, C, D, with one correct option and an insightful explanation.
Return strictly a valid JSON array of objects without Markdown formatting or backticks.

JSON Schema:
[
  {{
    "question": "Question text?",
    "options": [
      {{"id": "A", "text": "Option A"}},
      {{"id": "B", "text": "Option B"}},
      {{"id": "C", "text": "Option C"}},
      {{"id": "D", "text": "Option D"}}
    ],
    "correct_option": "A",
    "explanation": "Why option A is correct and why the concept matters."
  }}
]

Study Notes:
{content}
"""
        response_text = self._call_gemini(prompt)
        if response_text:
            try:
                questions = json.loads(self._clean_json_str(response_text))
                if isinstance(questions, list) and len(questions) > 0:
                    return questions
            except Exception as err:
                logger.warning(f"Failed to parse Gemini quiz: {err}")

        return self._offline_quiz(content, num_questions)

    def _offline_quiz(self, content: str, num_questions: int = 5) -> List[Dict[str, Any]]:
        lines = [line.strip() for line in content.split("\n") if line.strip()]
        questions = []

        headers = [l.lstrip("#*-• ").strip() for l in lines if l.startswith("#") or (len(l) < 60 and not l.endswith("."))]
        sample_title = headers[0] if headers else "the central subject"

        questions.append({
            "question": f"What is the primary focus of '{sample_title}' in these study materials?",
            "options": [
                {"id": "A", "text": "Synthesizing core domain concepts and high-yield principles"},
                {"id": "B", "text": "Random unrelated trivia"},
                {"id": "C", "text": "Outdated historical anomalies without modern application"},
                {"id": "D", "text": "None of the above"}
            ],
            "correct_option": "A",
            "explanation": f"The study material systematically focuses on core foundational principles of {sample_title}."
        })

        if num_questions > 1:
            questions.append({
                "question": "Which of the following best enhances long-term retention according to cognitive study science?",
                "options": [
                    {"id": "A", "text": "Passive re-reading of highlighting text multiple times"},
                    {"id": "B", "text": "Active recall, self-quizzing, and spaced repetition"},
                    {"id": "C", "text": "Cramming the night before an assessment"},
                    {"id": "D", "text": "Listening to high-volume background noise"}
                ],
                "correct_option": "B",
                "explanation": "Active recall through flashcards and practice quizzes forces cognitive retrieval, cementing synaptic pathways."
            })

        if num_questions > 2:
            questions.append({
                "question": f"When analyzing the structure of {sample_title}, what is the recommended next step?",
                "options": [
                    {"id": "A", "text": "Break complex ideas down into modular, atomic flashcards"},
                    {"id": "B", "text": "Delete the notes immediately"},
                    {"id": "C", "text": "Avoid reviewing key takeaways"},
                    {"id": "D", "text": "Ignore practical implementation details"}
                ],
                "correct_option": "A",
                "explanation": "Modularizing complex knowledge into bite-sized units allows for targeted spaced repetition."
            })

        while len(questions) < num_questions:
            idx = len(questions) + 1
            questions.append({
                "question": f"Practice Question #{idx}: How does active self-testing reinforce mastery of this subject?",
                "options": [
                    {"id": "A", "text": "It exposes knowledge gaps and triggers targeted learning"},
                    {"id": "B", "text": "It has no measurable impact on exam preparedness"},
                    {"id": "C", "text": "It slows down concept assimilation"},
                    {"id": "D", "text": "It only works for mathematics"}
                ],
                "correct_option": "A",
                "explanation": "Formative self-assessment immediately pinpoints misunderstandings before high-stakes exams."
            })

        return questions[:num_questions]

    # ================= AI STUDY TUTOR CHAT =================
    def chat_tutor(self, message: str, note_context: Optional[str] = None, history: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        context_block = f"\nContext Note:\n\"\"\"{note_context}\"\"\"\n" if note_context else ""
        
        history_formatted = ""
        if history:
            for h in history[-5:]:
                role = "Student" if h.get("role") == "user" else "Tutor"
                history_formatted += f"{role}: {h.get('content')}\n"

        prompt = f"""You are 'Athena', a friendly, encouraging, and razor-sharp AI Academic Tutor and Study Assistant.
Your mission is to help the student truly understand, remember, and master the material.
Explain concepts clearly, use intuitive real-world analogies, highlight memory tricks/mnemonics when helpful, and ask thought-provoking questions to verify understanding.

{context_block}
Recent Chat History:
{history_formatted}

Student's Question / Request:
{message}

Respond in a supportive, beautifully structured markdown format with clear headings or bullet points where appropriate.
At the very end of your response, provide 3 short follow-up questions the student might want to ask, in this exact format:
SUGGESTIONS:
- First follow-up question
- Second follow-up question
- Third follow-up question
"""
        response_text = self._call_gemini(prompt)
        if response_text:
            # Extract suggestions
            reply = response_text
            suggested = []
            if "SUGGESTIONS:" in response_text:
                parts = response_text.split("SUGGESTIONS:")
                reply = parts[0].strip()
                sugg_lines = parts[1].strip().split("\n")
                for s in sugg_lines:
                    s_clean = s.lstrip("-*• 123456789.) ").strip()
                    if s_clean:
                        suggested.append(s_clean)
            return {
                "reply": reply,
                "suggested_questions": suggested[:3] if suggested else [
                    "Can you give me a real-world analogy for this?",
                    "What is a good mnemonic to remember this?",
                    "Give me a tricky practice question on this topic"
                ]
            }

        return self._offline_chat(message, note_context)

    def _offline_chat(self, message: str, note_context: Optional[str] = None) -> Dict[str, Any]:
        msg_lower = message.lower()
        
        if "mnemonic" in msg_lower or "remember" in msg_lower:
            reply = (
                "### 💡 Memory Trick / Mnemonic\n\n"
                "To cement this concept in your memory, use the **FAST** framework:\n"
                "- **F**ocus on the core principle first.\n"
                "- **A**ssociate with a familiar real-world object.\n"
                "- **S**implify the technical definition into one plain-English sentence.\n"
                "- **T**est yourself within 24 hours using flashcards!\n\n"
                "*(Tip: Set `GEMINI_API_KEY` in `.env` to unlock custom generated mnemonics tailored to any exact term!)*"
            )
        elif "analogy" in msg_lower or "explain like" in msg_lower:
            reply = (
                "### 🧩 Real-World Analogy\n\n"
                "Think of this concept like an orchestra conductor:\n"
                "Each individual component (instrument) has a distinct role and rhythm, but they only create harmony when synchronized through a structured framework.\n\n"
                "In your notes, notice how each section builds upon the previous one to construct a cohesive system."
            )
        elif "summary" in msg_lower or "tldr" in msg_lower:
            reply = (
                "### 📝 Quick Study Recap\n\n"
                "Here is the high-yield breakdown:\n"
                "1. **Core Subject**: Focus on the fundamental rules and definitions.\n"
                "2. **Key Mechanism**: Understand *how* components interact, not just what they are named.\n"
                "3. **Practical Application**: Relate the theory to real scenarios.\n\n"
                "Would you like me to generate a 3-question quiz to test your mastery?"
            )
        else:
            snippet = f" regarding '{note_context[:80]}...'" if note_context else ""
            reply = (
                f"### 🎓 Study Tutor Guidance\n\n"
                f"Great question! When studying this material{snippet}, "
                f"the most effective approach is to break down the concept into:\n\n"
                f"1. **The Definition**: What is it at its core?\n"
                f"2. **The Purpose**: Why was it invented or why does it matter?\n"
                f"3. **The Workflow**: How does it operate in practice?\n\n"
                f"> **Study Tip**: Review your flashcard deck for 5 minutes after reading this section to maximize retention."
            )

        return {
            "reply": reply,
            "suggested_questions": [
                "Give me a real-world analogy for this",
                "Create a mnemonic to help me memorize this",
                "What are the most common exam questions on this topic?"
            ]
        }

ai_service = AIService()
