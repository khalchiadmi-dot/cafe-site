const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Autorise votre fichier index.html à interroger le serveur
app.use(cors());
app.use(express.json());

// Configuration PostgreSQL connectée à votre base Cloud Render
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://khalid:x55T7fKZ2j9DtNkdfbOuXqErIItMeZcE@://render.com",
  ssl: {
    rejectUnauthorized: false, // Obligatoire pour se connecter de manière sécurisée aux bases de données Cloud Render
  },
  connectionTimeoutMillis: 5000,
});

// --- ROUTE API : Récupère le menu du café pour le Front-End ---
app.get("/api/menu", async (req, res) => {
  try {
    const resultat = await pool.query(
      "SELECT nom, categorie, prix FROM menu_cafe WHERE disponible = TRUE;",
    );
    res.json(resultat.rows); // Renvoie les lignes de la table au format JSON
  } catch (erreur) {
    console.error("❌ Erreur lors de la requête SQL :", erreur.message);
    res.status(500).json({ erreur: `Erreur Postgres : ${erreur.message}` });
  }
});

// --- TEST DE CONNEXION ET CRÉATION DE LA TABLE AUTOMATIQUE ---
pool.connect(async (err, client, release) => {
  if (err) {
    console.error("❌ LA CONNEXION À POSTGRESQL CLOUD A ÉCHOUÉ !");
    console.error("Détail du problème :", err.message);
    process.exit(1);
  }

  console.log("✅ Connexion réussie à PostgreSQL sur Render Cloud !");

  try {
    // Crée la table sur Render si elle n'existe pas encore
    await client.query(`
      CREATE TABLE IF NOT EXISTS menu_cafe (
          id SERIAL PRIMARY KEY,
          nom VARCHAR(100) NOT NULL,
          categorie VARCHAR(50) NOT NULL,
          prix NUMERIC(4, 2) NOT NULL,
          disponible BOOLEAN DEFAULT TRUE
      );
    `);

    // Vérifie si la table est vide pour y ajouter vos boissons de base
    const verif = await client.query("SELECT COUNT(*) FROM menu_cafe;");
    if (parseInt(verif.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO menu_cafe (nom, categorie, prix) VALUES 
        ('Espresso', 'Boisson Chaude', 2.20),
        ('Cappuccino', 'Boisson Chaude', 3.80),
        ('Cookie Chocolat', 'Pâtisserie', 2.50),
        ('Thé Vert Matcha', 'Boisson Chaude', 4.00);
      `);
      console.log("☕ Boissons de base injectées sur Render avec succès !");
    }
  } catch (errTable) {
    console.error(
      "❌ Erreur lors de l'initialisation de la table :",
      errTable.message,
    );
  }

  release(); // Libère le client de connexion

  // Lancement du serveur web sur toutes les interfaces ('0.0.0.0') pour Windows 11
  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `🚀 Serveur du café actif en continu sur http://localhost:${PORT}`,
    );
    console.log(
      `👉 Laissez cette fenêtre ouverte et allez actualiser votre index.html !`,
    );
  });
});

// Capture les crashs imprévus pour afficher un message propre dans le terminal
process.on("uncaughtException", (err) => {
  console.error("💥 Erreur critique système :", err.message);
});
