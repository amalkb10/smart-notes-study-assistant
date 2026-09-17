import logging
from pymongo import MongoClient, ASCENDING, TEXT
from pymongo.errors import ConnectionFailure
from app.config import settings

logger = logging.getLogger(__name__)

class Database:
    client: MongoClient = None
    db = None

    def connect(self):
        try:
            self.client = MongoClient(settings.MONGO_URI, serverSelectionTimeoutMS=2000)
            # Test connection
            self.client.admin.command("ping")
            self.db = self.client[settings.DB_NAME]
            logger.info(f"Connected to MongoDB at {settings.MONGO_URI} (DB: {settings.DB_NAME})")
            
            # Setup indexes
            self._setup_indexes()
        except ConnectionFailure as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise e

    def _setup_indexes(self):
        if self.db is not None:
            # Text index for search on notes
            try:
                self.db.notes.create_index([("title", TEXT), ("content", TEXT), ("tags", TEXT)])
                self.db.notes.create_index([("updated_at", ASCENDING)])
                self.db.notes.create_index([("subject", ASCENDING)])
                self.db.flashcards.create_index([("note_id", ASCENDING)])
                self.db.quizzes.create_index([("note_id", ASCENDING)])
                self.db.chats.create_index([("note_id", ASCENDING), ("created_at", ASCENDING)])
            except Exception as e:
                logger.warning(f"Could not initialize all indexes: {e}")

    def is_connected(self) -> bool:
        if not self.client:
            return False
        try:
            self.client.admin.command("ping")
            return True
        except Exception:
            return False

    def close(self):
        if self.client:
            self.client.close()
            logger.info("MongoDB connection closed.")

db_instance = Database()

def get_db():
    if db_instance.db is None:
        db_instance.connect()
    return db_instance.db
