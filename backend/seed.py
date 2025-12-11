import random
from faker import Faker
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from main import CampaignDB, DATABASE_URL
from pydantic import BaseModel
# Setup Faker and DB
fake = Faker()
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

print("🌱 Seeding database with fake campaigns...")

# Clear existing data (optional, prevents duplicates)
db.query(CampaignDB).delete()
db.commit()

statuses = ["Active", "Paused"]
colors = ["#2563eb", "#94a3b8", "#16a34a", "#d97706", "#8b5cf6", "#ef4444"]

# Generate 10 Fake Campaigns
for _ in range(10):
    campaign = CampaignDB(
        name=fake.catch_phrase(),  # Generates cool marketing names like "Proactive clear-thinking monitoring"
        status=random.choice(statuses),
        clicks=random.randint(100, 5000),
        cost=round(random.uniform(50.0, 1000.0), 2),
        impressions=random.randint(5000, 50000),
        color=random.choice(colors)
    )
    db.add(campaign)

db.commit()
print("✅ Database successfully seeded with 10 records!")
db.close()
