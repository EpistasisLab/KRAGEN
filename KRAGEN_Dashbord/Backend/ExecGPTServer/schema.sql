-- DROP TABLE IF EXISTS config;

-- CREATE TABLE IF NOT EXISTS config (
--     id INTEGER PRIMARY KEY AUTOINCREMENT,
--     key TEXT NOT NULL,
--     value TEXT NOT NULL,
--     timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
-- );

DROP TABLE IF EXISTS execution;

CREATE TABLE execution (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    src_code TEXT,
    status TEXT,
    result TEXT,
    files TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- DROP TABLE IF EXISTS files;

-- CREATE TABLE files (
--     id INTEGER PRIMARY KEY AUTOINCREMENT,
--     name TEXT NOT NULL,
--     path TEXT NOT NULL,
--     execution_id INTEGER NOT NULL,
--     timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (execution_id) REFERENCES execution(id)
-- );

DROP TABLE IF EXISTS chat;

CREATE TABLE chat (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS chatlog;

CREATE TABLE chatlog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id INTEGER NOT NULL,
    execution_id INTEGER,
    message TEXT NOT NULL,
    message_type TEXT NOT NULL,
    src_code TEXT,
    who TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chat(id),
    FOREIGN KEY (execution_id) REFERENCES execution(id)
);