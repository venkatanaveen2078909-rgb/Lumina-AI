from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker

Base = declarative_base()

class MemoryItem(Base):
    __tablename__ = 'memory'
    id = Column(Integer, primary_key=True)
    role = Column(String)
    content = Column(String)

engine = create_engine('sqlite:///memory.db')
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)

def save_memory(role, content):
    session = Session()
    new_memory = MemoryItem(role=role, content=content)
    session.add(new_memory)
    session.commit()
    session.close()

def get_all_memory():
    session = Session()
    records = session.query(MemoryItem).all()
    session.close()
    return [{"role": r.role, "content": r.content} for r in records]
