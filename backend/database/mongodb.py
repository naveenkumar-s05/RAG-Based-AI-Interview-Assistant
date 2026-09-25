import os

from dotenv import load_dotenv

from pymongo import (
    MongoClient,
    ASCENDING,
    DESCENDING
)

load_dotenv()


MONGODB_URI = os.getenv(
    "MONGODB_URI"
)

if not MONGODB_URI:
    raise RuntimeError(
        "MONGODB_URI is not configured in .env"
    )


client = MongoClient(
    MONGODB_URI
)


database = client[
    "AIInterviewAssistant"
]


candidates_collection = database[
    "candidates"
]


candidates_collection.create_index(
    [
        (
            "candidate_id",
            ASCENDING
        )
    ],
    unique=True
)


candidates_collection.create_index(
    [
        (
            "created_at",
            DESCENDING
        )
    ]
)