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

// ------------------------
// Fonction pour rechercher des données (sessions ou inscriptions)
// ------------------------
export async function rechercherDonnees(criteria, type) {
  try {
    const response = await fetch(`${API_BASE_URL}/rechercher.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ criteria, type }),
      credentials: 'include'
    });

    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('Réponse non JSON :', text);
      return { success: false, message: 'Réponse serveur invalide' };
    }
  } catch (error) {
    console.error('Erreur API rechercherDonnees:', error);
    return { success: false, message: error.message };
  }
}

// ------------------------
// Fonction pour récupérer les années académiques uniques
// ------------------------
export async function getAnneesAcademiques() {
  try {
    const response = await fetch(`${API_BASE_URL}/options/annees.php`);
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('Réponse non JSON (annees):', text);
      return { success: false, message: 'Réponse serveur invalide' };
    }
  } catch (error) {
    console.error('Erreur API getAnneesAcademiques:', error);
    return { success: false, message: error.message };
  }
}

// ------------------------
// Fonction pour récupérer les codes programme uniques
// ------------------------
export async function getCodesProgramme() {
  try {
    const response = await fetch(`${API_BASE_URL}/options/codes.php`);
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('Réponse non JSON (codes):', text);
      return { success: false, message: 'Réponse serveur invalide' };
    }
  } catch (error) {
    console.error('Erreur API getCodesProgramme:', error);
    return { success: false, message: error.message };
  }
}

// ------------------------
// Fonction pour transférer une session
// ------------------------
export async function transfererSession(data) {
  const response = await fetch(`${API_BASE_URL}/transferer_session.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });

  const result = await response.json();

  if (result.success) {
    return result;
  }

  throw new Error(result.error || 'Erreur inconnue');
  
}

// ------------------------
// Fonction pour récupérer les inscriptions d'une session
// ------------------------
export async function getInscriptionsSession(params) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE_URL}/recuperer_inscriptions_session.php?${query}`, {
    credentials: 'include'
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Erreur');
  return result.data;
}

// ------------------------
// Fonction pour supprimer une inscription
// ------------------------
export async function deleteInscription(id) {
  const response = await fetch(`${API_BASE_URL}/supprimer_inscription.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ id })
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Erreur');
  return result;
}

// ------------------------
// Récupérer une inscription par ID
// ------------------------
export async function getInscriptionById(id) {
  const response = await fetch(`${API_BASE_URL}/recuperer_inscription_par_id.php?id=${id}`, {
    credentials: 'include' 
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Erreur lors du chargement de l’inscription.');
  return result.data;
}

// ------------------------
// Mettre à jour une inscription
// ------------------------
export async function updateInscription(data) {
  const response = await fetch(`${API_BASE_URL}/mettre_a_jour_inscription.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Erreur lors de la mise à jour.');
  return result;
}