// Ceci est comme une boîte aux lettres. Chaque fonction est une lettre que React envoie au PHP.
const API_BASE_URL = 'http://localhost:8005'; 

// ------------------------
// Fonction pour se connecter (lettre à auth.php)
// ------------------------
export async function login(login, password) {
  const response = await fetch(`${API_BASE_URL}/auth.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ login, password }),
    credentials: 'include', // on garde
  });
  return response.json();
}


// ------------------------
// Fonction pour rechercher des cours (critères = objet {param: valeur})
// ------------------------
export async function rechercherCours(criteres) {
  try {
    const response = await fetch(`${API_BASE_URL}/rechercher_cours.php?${new URLSearchParams(criteres)}`, {
      method: 'GET',
    });
    if (!response.ok) throw new Error('Erreur lors de la recherche de cours');
    return await response.json();
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
}

// ------------------------
// Fonction pour rechercher des cours par query simple 
// ------------------------
export async function rechercherCoursParQuery(query) {
  try {
    const response = await fetch(`${API_BASE_URL}/rechercher_cours.php?query=${encodeURIComponent(query)}`, {
      method: 'GET',
    });
    if (!response.ok) throw new Error('Erreur lors de la recherche de cours par query');
    return await response.json();
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
}

// ------------------------
// Fonction pour ajouter un cours
// ------------------------ 
export async function ajouterCours(payload) {
  try {
    const response = await fetch(`${API_BASE_URL}/enregistrer_cours.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Erreur HTTP lors de l’ajout du cours');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur API ajouterCours:', error);
    throw error;
  }
}

// ------------------------
// Fonction pour enregistrer un cours
// ------------------------
export async function enregistrerCours(donneesCours) {
  try {
    const response = await fetch(`${API_BASE_URL}/enregistrer_cours.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(donneesCours),
    });
    if (!response.ok) throw new Error('Erreur lors de l\'enregistrement du cours');
    return await response.json();
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
}

// ------------------------
// Fonction pour obtenir la liste des programmes
// ------------------------
export async function getProgramme() {
  try {
    const response = await fetch(`${API_BASE_URL}/lire_programme.php`);
    if (!response.ok) throw new Error("Erreur lecture programmes");
    return await response.json();
  } catch (error) {
    console.error("Erreur API:", error);
    throw error;
  }
}


// ------------------------
// Fonction pour enregistrer un programme
// ------------------------
export async function enregistrerProgramme(donneesProgramme) {
  try {
    const response = await fetch(`${API_BASE_URL}/enregistrer_programme.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(donneesProgramme),
    });
    if (!response.ok) throw new Error('Erreur lors de l\'enregistrement du programme');
    return await response.json();
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
}

// ------------------------
// Fonction pour rechercher des étudiants
// ------------------------
export async function rechercherEtudiants({ matricule, nom, prenoms }) {
  const params = new URLSearchParams();

  if (matricule) params.append("matricule", matricule);
  if (nom) params.append("nom", nom);
  if (prenoms) params.append("prenoms", prenoms);

  const response = await fetch(`http://localhost:8005/rechercher_etudiants.php?${params}`);

  if (!response.ok) {
    throw new Error("Erreur API lors de la recherche d'étudiants");
  }

  return await response.json();
}

// ------------------------
// Fonction générique pour insérer des données
// ------------------------
export async function insererDonnees(donnees) {
  try {
    const response = await fetch(`${API_BASE_URL}/insertion.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(donnees),
    });
    if (!response.ok) throw new Error('Erreur lors de l\'insertion des données');
    return await response.json();
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
}

// ------------------------
// Fonction pour enregistrer une inscription
// ------------------------
export async function enregistrerInscription(data) {
  try {
    const response = await fetch(`${API_BASE_URL}/traitement_inscription.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      credentials: "include"
    });

    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('Réponse non JSON reçue :', text);
      return { success: false, message: 'Réponse serveur invalide', raw: text };
    }
  } catch (error) {
    console.error(error);
    return { success: false, message: error.message };
  }
}

