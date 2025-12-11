import os
import random
from typing import List
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.orm import sessionmaker, Session, declarative_base
from pydantic import BaseModel
from dotenv import load_dotenv

# 1. Load Environment Variables (Database URL)
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("⚠️ WARNING: DATABASE_URL not found in .env file!")

# 2. Database Setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 3. SQLAlchemy Model (Matches your Database Table)
class CampaignDB(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    status = Column(String)
    clicks = Column(Integer)
    cost = Column(Float)
    impressions = Column(Integer)
    color = Column(String)  # We store the hex color here

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

# 4. Pydantic Models (Validation for Request/Response)

# Model for CREATING a campaign (What the Frontend sends)
class CampaignCreate(BaseModel):
    name: str
    status: str
    clicks: int
    cost: float
    impressions: int

# Model for READING a campaign (What the Backend sends back)
class CampaignResponse(BaseModel):
    id: int
    name: str
    status: str
    clicks: int
    cost: float
    impressions: int
    color: str

    class Config:
        from_attributes = True # Allows Pydantic to read SQLAlchemy objects

# 5. FastAPI App Setup
app = FastAPI()

# Allow your Next.js frontend to talk to this backend
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- ENDPOINTS ---

@app.get("/")
def read_root():
    return {"message": "Grippi Campaign API is running!"}

# GET: Fetch all campaigns
@app.get("/campaigns", response_model=List[CampaignResponse])
def get_campaigns(db: Session = Depends(get_db)):
    return db.query(CampaignDB).all()

# POST: Create a new campaign (Connected to your Modal)
@app.post("/campaigns", response_model=CampaignResponse)
def create_campaign(campaign: CampaignCreate, db: Session = Depends(get_db)):
    # 1. Pick a random color for the graph line
    graph_colors = ["#2563eb", "#16a34a", "#d97706", "#dc2626", "#8b5cf6", "#0891b2"]
    selected_color = random.choice(graph_colors)

    # 2. Create the DB Object
    new_campaign = CampaignDB(
        name=campaign.name,
        status=campaign.status,
        clicks=campaign.clicks,
        cost=campaign.cost,
        impressions=campaign.impressions,
        color=selected_color
    )

    # 3. Save to NeonDB
    db.add(new_campaign)
    db.commit()
    db.refresh(new_campaign)
    
    return new_campaign
