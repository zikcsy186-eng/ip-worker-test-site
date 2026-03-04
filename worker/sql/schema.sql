CREATE TABLE IF NOT EXISTS visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  at TEXT NOT NULL,
  ip TEXT NOT NULL,
  ua TEXT,
  country TEXT,
  asn INTEGER,
  colo TEXT,
  page_url TEXT,
  event TEXT,
  company_name TEXT,
  company_domain TEXT,
  company_type TEXT,
  org TEXT
);

CREATE INDEX IF NOT EXISTS idx_visits_at ON visits(at);
CREATE INDEX IF NOT EXISTS idx_visits_ip ON visits(ip);
