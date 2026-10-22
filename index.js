const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// CONFIGURATION FORCEE SUPABASE (Évite les conflits de variables Render)
const SUPABASE_CONNECTION_STRING = "postgresql://postgres:CafeChiadmi2026@db.xghigwxcsunjnzhdofzs.supabase.co:5432/postgres";

const pool = new Pool({
  connectionString: SUPABASE_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 5000,
});

app.get("/api/menu", async (req, res) => {
  try {
    const resultat = await pool.query("SELECT nom, categorie, prix FROM menu_cafe WHERE disponible = TRUE ORDER BY id DESC;");
    res.json(resultat.rows);
  } catch (erreur) {
    res.status(500).json({ erreur: erreur.message });
  }
});

app.post("/api/menu", async (req, res) => {
  const { nom, categorie, prix } = req.body;
  if (!nom || !categorie || !prix) return res.status(400).json({ erreur: "Données incomplètes." });
  try {
    const requete = "INSERT INTO menu_cafe (nom, categorie, prix) VALUES (\$1, \$2, \$3) RETURNING *;";
    const resultat = await pool.query(requete, [nom, categorie, parseFloat(prix)]);
    res.status(201).json({ message: "Article ajouté !", article: resultat.rows });
  } catch (erreur) {
    res.status(500).json({ erreur: erreur.message });
  }
});

pool.connect(async (err, client, release) => {
  if (err) { process.exit(1); }
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS menu_cafe (
          id SERIAL PRIMARY KEY,
          nom VARCHAR(100) NOT NULL,
          categorie VARCHAR(50) NOT NULL,
          prix NUMERIC(4, 2) NOT NULL,
          disponible BOOLEAN DEFAULT TRUE
      );
    `);
  } catch (errTable) {}
  release();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Serveur actif sur le port ${PORT}`);
  });
});

