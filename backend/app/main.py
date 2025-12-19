# Load environment variables
# We need to load them BEFORE importing other modules that might rely on them at the module level
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from app.api.routes import router as api_router
import os

app = FastAPI(
    title="Grammario API",
    description="A deep-dive linguistic deconstruction tool.",
    version="1.0.0"
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Welcome to Grammario API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)



