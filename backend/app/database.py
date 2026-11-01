from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

# For SQLite, ensure check_same_thread is False
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
    if engine.dialect.name == "sqlite":
        with engine.begin() as conn:
            try:
                table_info = conn.exec_driver_sql("PRAGMA table_info(users)").fetchall()
                for col in table_info:
                    # col[1] is name, col[3] is notnull (1 for NOT NULL, 0 for nullable)
                    if col[1] == "password_hash" and col[3] == 1:
                        conn.exec_driver_sql("PRAGMA foreign_keys=OFF;")
                        conn.exec_driver_sql("DROP INDEX IF EXISTS ix_users_email;")
                        conn.exec_driver_sql("DROP TABLE IF EXISTS _users_old;")
                        conn.exec_driver_sql("ALTER TABLE users RENAME TO _users_old;")
                        conn.exec_driver_sql("""
                            CREATE TABLE users (
                                id VARCHAR(36) NOT NULL PRIMARY KEY,
                                name VARCHAR(255) NOT NULL,
                                email VARCHAR(255) NOT NULL,
                                password_hash VARCHAR(255),
                                role VARCHAR(50) DEFAULT 'user',
                                created_at DATETIME,
                                updated_at DATETIME
                            );
                        """)
                        conn.exec_driver_sql("CREATE UNIQUE INDEX ix_users_email ON users (email);")
                        conn.exec_driver_sql("""
                            INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at)
                            SELECT id, name, email, password_hash, role, created_at, updated_at FROM _users_old;
                        """)
                        conn.exec_driver_sql("DROP TABLE _users_old;")
                        conn.exec_driver_sql("PRAGMA foreign_keys=ON;")
                        break
            except Exception as e:
                print(f"Notice during SQLite schema check: {e}")
