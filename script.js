const SUPABASE_URL = "https://supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnaGlnd3hjc3Vuam56aGRvZnpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0ODYyOTksImV4cCI6MjEwODA2MjI5OX0.o8BKi2YiPzPZVxZxLqRwPxAFh3SXkxMbb6f9Pck_5ss";

const IMAGES = {
  espresso: "https://unsplash.com",
  cappuccino: "https://unsplash.com",
  latte: "https://unsplash.com",
  chocolat: "https://unsplash.com",
  froid: "https://unsplash.com",
  gaufre: "https://unsplash.com",
  gateau: "https://unsplash.com",
  def_cafe: "https://unsplash.com",
  def_food: "https://unsplash.com"
};

function findImg(nom, cat) {
  const n = nom.toLowerCase();
  if (n.includes("espresso") || n.includes("serré")) return IMAGES.espresso;
  if (n.includes("cappuccino")) return IMAGES.cappuccino;
  if (n.includes("latte") || n.includes("macchiato")) return IMAGES.latte;
  if (n.includes("chocolat")) return IMAGES.chocolat;
  if (n.includes("glacé") || n.includes("froid") || n.includes("jus") || n.includes("thé")) return IMAGES.froid;
  if (n.includes("gaufre") || n.includes("waffle") || n.includes("mhersa") || n.includes("harcha")) return IMAGES.gaufre;
  if (n.includes("gâteau") || n.includes("cake") || n.includes("tarte")) return IMAGES.gateau;
  return (cat.includes("Chaude") || cat.includes("Froide") || cat.includes("cafes") || cat.includes("Boisson")) ? IMAGES.def_cafe : IMAGES.def_food;
}

async function loadMenu() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/menu_cafe?select=*`, {
      method: "GET",
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json"
      }
    });
    const data = await res.json();
    const gridCafes = document.getElementById("grid-cafes");
    const gridPatisseries = document.getElementById("grid-patisseries");
    
    gridCafes.innerHTML = ""; gridPatisseries.innerHTML = "";

    if (!data || data.length === 0) {
      gridCafes.innerHTML = "<p>Aucune boisson disponible.</p>";
      gridPatisseries.innerHTML = "<p>Aucune pâtisserie disponible.</p>";
      return;
    }

    data.forEach(p => {
      const img = findImg(p.nom, p.categorie);
      const html = `
        <div class="menu-item">
          <div class="menu-image" style="background-image:url('${img}')"></div>
          <div class="menu-info">
            <h3><span>${p.nom}</span><span class="price">${p.prix} €</span></h3>
          </div>
        </div>`;
      
      const cat = p.categorie ? p.categorie.toLowerCase() : "";
      if (cat.includes("chaude") || cat.includes("froide") || cat.includes("cafe") || cat.includes("boisson")) { 
          gridCafes.insertAdjacentHTML('beforeend', html); 
      } else { 
          gridPatisseries.insertAdjacentHTML('beforeend', html); 
      }
    });
  } catch (e) { 
      console.error(e);
      document.getElementById("grid-cafes").innerHTML = "<p style='color:red;'>⚠️ Erreur de chargement des données.</p>";
  }
}

// GESTION DU FORMULAIRE DE CONTACT
document.getElementById("contact-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/messages_cafe`, {
      method: "POST",
      headers: { 
          "Content-Type": "application/json", 
          "apikey": SUPABASE_ANON_KEY, 
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}` 
      },
      body: JSON.stringify({ 
          nom: document.getElementById("name").value, 
          email: document.getElementById("email").value, 
          message: document.getElementById("message").value 
      })
    });
    alert("Message envoyé avec succès ! 📬");
    document.getElementById("contact-form").reset();
  } catch (err) { 
      alert("Erreur lors de l'envoi du message."); 
  }
});

// INITIALISATION AU CHARGEMENT DE LA PAGE
window.onload = loadMenu;
