import os
import random
from typing import List
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.orm import sessionmaker, Session, declarative_base
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

# Database Setup
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("WARNING: DATABASE_URL not found in .env file")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class CampaignDB(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    status = Column(String)
    clicks = Column(Integer)
    cost = Column(Float)
    impressions = Column(Integer)
    color = Column(String)

Base.metadata.create_all(bind=engine)

# Pydantic Models
class CampaignCreate(BaseModel):
    name: str
    status: str
    clicks: int
    cost: float
    impressions: int

class CampaignResponse(BaseModel):
    id: int
    name: str
    status: str
    clicks: int
    cost: float
    impressions: int
    color: str

    class Config:
        from_attributes = True

app = FastAPI()

# CORS
frontend_url = os.getenv("FRONTEND_URL")
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

if frontend_url:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Endpoints
@app.get("/")
def read_root():
    return {"message": "Grippi Campaign API is running"}

@app.get("/campaigns", response_model=List[CampaignResponse])
def get_campaigns(db: Session = Depends(get_db)):
    return db.query(CampaignDB).all()

@app.post("/campaigns", response_model=CampaignResponse)
def create_campaign(campaign: CampaignCreate, db: Session = Depends(get_db)):
    graph_colors = ["#2563eb", "#16a34a", "#d97706", "#dc2626", "#8b5cf6", "#0891b2"]
    selected_color = random.choice(graph_colors)

    new_campaign = CampaignDB(
        name=campaign.name,
        status=campaign.status,
        clicks=campaign.clicks,
        cost=campaign.cost,
        impressions=campaign.impressions,
        color=selected_color
    )

    db.add(new_campaign)
    db.commit()
    db.refresh(new_campaign)
    
    return new_campaign
