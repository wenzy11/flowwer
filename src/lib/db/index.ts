import crypto from "crypto";
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "quoteflow.db");

let db: Database.Database | null = null;

function migrate(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS company_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      company_name TEXT NOT NULL DEFAULT 'QuoteFlow',
      email TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      address TEXT DEFAULT '',
      default_markup REAL NOT NULL DEFAULT 20,
      default_tax REAL NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'USD'
    );

    CREATE TABLE IF NOT EXISTS company_settings_by_user (
      user_id TEXT PRIMARY KEY,
      company_name TEXT NOT NULL DEFAULT 'QuoteFlow',
      email TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      address TEXT DEFAULT '',
      tax_id TEXT DEFAULT '',
      tax_office TEXT DEFAULT '',
      default_markup REAL NOT NULL DEFAULT 20,
      default_tax REAL NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'USD',
      default_terms TEXT NOT NULL DEFAULT '',
      logo_url TEXT DEFAULT '',
      license_number TEXT DEFAULT '',
      insurance_info TEXT DEFAULT '',
      default_deposit_percent REAL NOT NULL DEFAULT 0,
      payments_enabled INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS materials (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'legacy',
      name TEXT NOT NULL,
      unit TEXT NOT NULL,
      unit_cost REAL NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'legacy',
      name TEXT NOT NULL,
      email TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      address TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quotes (
      id TEXT PRIMARY KEY,
      quote_number TEXT NOT NULL UNIQUE,
      user_id TEXT NOT NULL DEFAULT 'legacy',
      client_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      markup_percent REAL NOT NULL DEFAULT 0,
      tax_percent REAL NOT NULL DEFAULT 0,
      notes TEXT DEFAULT '',
      valid_until TEXT,
      subtotal REAL NOT NULL DEFAULT 0,
      markup_amount REAL NOT NULL DEFAULT 0,
      tax_amount REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (client_id) REFERENCES clients(id)
    );

    CREATE TABLE IF NOT EXISTS quote_line_items (
      id TEXT PRIMARY KEY,
      quote_id TEXT NOT NULL,
      material_id TEXT,
      name TEXT NOT NULL,
      unit TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit_cost REAL NOT NULL,
      line_total REAL NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
    CREATE INDEX IF NOT EXISTS idx_quotes_client ON quotes(client_id);
    CREATE INDEX IF NOT EXISTS idx_line_items_quote ON quote_line_items(quote_id);
  `);

  const settings = database
    .prepare("SELECT id FROM company_settings WHERE id = 1")
    .get();

  if (!settings) {
    database
      .prepare(
        `INSERT INTO company_settings (id, company_name, default_markup, default_tax, currency)
         VALUES (1, 'QuoteFlow', 20, 0, 'USD')`
      )
      .run();
  }

  const columns = database
    .prepare("PRAGMA table_info(company_settings)")
    .all() as { name: string }[];

  if (!columns.some((c) => c.name === "default_terms")) {
    database.exec(
      `ALTER TABLE company_settings ADD COLUMN default_terms TEXT NOT NULL DEFAULT ''`
    );
  }
  if (!columns.some((c) => c.name === "logo_url")) {
    database.exec(`ALTER TABLE company_settings ADD COLUMN logo_url TEXT DEFAULT ''`);
  }
  if (!columns.some((c) => c.name === "license_number")) {
    database.exec(
      `ALTER TABLE company_settings ADD COLUMN license_number TEXT DEFAULT ''`
    );
  }
  if (!columns.some((c) => c.name === "insurance_info")) {
    database.exec(
      `ALTER TABLE company_settings ADD COLUMN insurance_info TEXT DEFAULT ''`
    );
  }
  if (!columns.some((c) => c.name === "default_deposit_percent")) {
    database.exec(
      `ALTER TABLE company_settings ADD COLUMN default_deposit_percent REAL NOT NULL DEFAULT 0`
    );
  }
  if (!columns.some((c) => c.name === "payments_enabled")) {
    database.exec(
      `ALTER TABLE company_settings ADD COLUMN payments_enabled INTEGER NOT NULL DEFAULT 0`
    );
  }
  if (!columns.some((c) => c.name === "tax_id")) {
    database.exec(`ALTER TABLE company_settings ADD COLUMN tax_id TEXT DEFAULT ''`);
  }
  if (!columns.some((c) => c.name === "tax_office")) {
    database.exec(
      `ALTER TABLE company_settings ADD COLUMN tax_office TEXT DEFAULT ''`
    );
  }

  const materialCols = database
    .prepare("PRAGMA table_info(materials)")
    .all() as { name: string }[];
  if (!materialCols.some((c) => c.name === "user_id")) {
    database.exec(
      `ALTER TABLE materials ADD COLUMN user_id TEXT NOT NULL DEFAULT 'legacy'`
    );
  }

  const clientCols = database
    .prepare("PRAGMA table_info(clients)")
    .all() as { name: string }[];
  if (!clientCols.some((c) => c.name === "user_id")) {
    database.exec(
      `ALTER TABLE clients ADD COLUMN user_id TEXT NOT NULL DEFAULT 'legacy'`
    );
  }

  const quoteCols = database
    .prepare("PRAGMA table_info(quotes)")
    .all() as { name: string }[];

  const addQuoteCol = (sql: string, name: string) => {
    if (!quoteCols.some((c) => c.name === name)) {
      database.exec(sql);
    }
  };

  addQuoteCol(
    `ALTER TABLE quotes ADD COLUMN document_type TEXT NOT NULL DEFAULT 'estimate'`,
    "document_type"
  );
  addQuoteCol(
    `ALTER TABLE quotes ADD COLUMN source_estimate_id TEXT`,
    "source_estimate_id"
  );
  addQuoteCol(
    `ALTER TABLE quotes ADD COLUMN deposit_percent REAL NOT NULL DEFAULT 0`,
    "deposit_percent"
  );
  addQuoteCol(
    `ALTER TABLE quotes ADD COLUMN deposit_amount REAL NOT NULL DEFAULT 0`,
    "deposit_amount"
  );
  addQuoteCol(
    `ALTER TABLE quotes ADD COLUMN amount_paid REAL NOT NULL DEFAULT 0`,
    "amount_paid"
  );
  addQuoteCol(
    `ALTER TABLE quotes ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'unpaid'`,
    "payment_status"
  );
  addQuoteCol(
    `ALTER TABLE quotes ADD COLUMN personal_message TEXT DEFAULT ''`,
    "personal_message"
  );
  addQuoteCol(`ALTER TABLE quotes ADD COLUMN sent_at TEXT`, "sent_at");
  addQuoteCol(`ALTER TABLE quotes ADD COLUMN viewed_at TEXT`, "viewed_at");
  addQuoteCol(
    `ALTER TABLE quotes ADD COLUMN public_token TEXT`,
    "public_token"
  );
  addQuoteCol(
    `ALTER TABLE quotes ADD COLUMN user_id TEXT NOT NULL DEFAULT 'legacy'`,
    "user_id"
  );

  database.exec(`
    CREATE TABLE IF NOT EXISTS payment_records (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'legacy',
      invoice_id TEXT NOT NULL,
      amount REAL NOT NULL,
      method TEXT NOT NULL DEFAULT 'manual',
      note TEXT DEFAULT '',
      paid_at TEXT NOT NULL,
      FOREIGN KEY (invoice_id) REFERENCES quotes(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_payment_records_invoice ON payment_records(invoice_id);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_quotes_public_token ON quotes(public_token);
    CREATE INDEX IF NOT EXISTS idx_materials_user ON materials(user_id);
    CREATE INDEX IF NOT EXISTS idx_clients_user ON clients(user_id);
    CREATE INDEX IF NOT EXISTS idx_quotes_user ON quotes(user_id);
    CREATE INDEX IF NOT EXISTS idx_payment_records_user ON payment_records(user_id);
  `);

  const missingTokens = database
    .prepare(`SELECT id FROM quotes WHERE public_token IS NULL OR public_token = ''`)
    .all() as { id: string }[];
  const setToken = database.prepare(
    `UPDATE quotes SET public_token = ? WHERE id = ?`
  );
  for (const row of missingTokens) {
    setToken.run(crypto.randomUUID().replace(/-/g, ""), row.id);
  }

  const paymentCols = database
    .prepare("PRAGMA table_info(payment_records)")
    .all() as { name: string }[];
  if (!paymentCols.some((c) => c.name === "user_id")) {
    database.exec(
      `ALTER TABLE payment_records ADD COLUMN user_id TEXT NOT NULL DEFAULT 'legacy'`
    );
  }

  database.exec(`
    INSERT OR IGNORE INTO company_settings_by_user (
      user_id, company_name, email, phone, address, tax_id, tax_office,
      default_markup, default_tax, currency, default_terms, logo_url,
      license_number, insurance_info, default_deposit_percent, payments_enabled
    )
    SELECT
      'legacy',
      company_name,
      email,
      phone,
      address,
      COALESCE(tax_id, ''),
      COALESCE(tax_office, ''),
      default_markup,
      default_tax,
      currency,
      COALESCE(default_terms, ''),
      COALESCE(logo_url, ''),
      COALESCE(license_number, ''),
      COALESCE(insurance_info, ''),
      COALESCE(default_deposit_percent, 0),
      COALESCE(payments_enabled, 0)
    FROM company_settings
    WHERE id = 1;
  `);
}

export function getDb(): Database.Database {
  if (db) return db;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);

  return db;
}
