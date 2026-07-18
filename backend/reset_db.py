from app.database import Base, engine
from app.seed.seed import run_seed

print("Dropping all tables...")
Base.metadata.drop_all(bind=engine)
print("Tables dropped. Running seed...")
run_seed()
print("Done.")
