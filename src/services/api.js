// Ceci est comme une boîte aux lettres. Chaque fonction est une lettre que React envoie à ton PHP.
const API_BASE_URL = 'http://localhost:8005'; // Adresse de ton backend PHP local

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
// Fonction pour rechercher des cours par query simple (ancienne version, renommée pour éviter doublon)
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
