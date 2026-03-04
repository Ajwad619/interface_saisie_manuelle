// === Composant pour l'arborescence de navigation (breadcrumb) ===

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Breadcrumb({ customPath, parentPaths = [] }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Définir les chemins standards
  const routes = [
    { path: '/admin-dashboard', label: 'Accueil' },
    { path: '/cours', label: 'Insérer des données' },
    { path: '/search-modify', label: 'Rechercher et Modifier' },
    { path: '/edit-session', label: 'Détails de la session' },
    { path: '/transfer-session', label: 'Transférer le cours' },
    { path: '/session-inscriptions', label: 'Inscriptions de la session' }
  ];

  // Construire le chemin complet
  let breadcrumbItems = [];

  // Ajouter "Accueil"
  breadcrumbItems.push({ label: 'Accueil', path: '/admin-dashboard' });

  // Ajouter les parents
  parentPaths.forEach(path => {
    const route = routes.find(r => r.path === path);
    if (route) {
      breadcrumbItems.push(route);
    }
  });

  // Ajouter le chemin courant
  let currentRoute = routes.find(r => r.path === location.pathname);
  if (customPath) {
    currentRoute = customPath;
  }

  if (currentRoute && currentRoute.path !== '/admin-dashboard') {
    breadcrumbItems.push(currentRoute);
  }

  return (
    <div style={{
      padding: '10px 20px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #dee2e6',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '14px',
      color: '#666666'
    }}>
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={item.label}>
          {index > 0 && <span>&gt;</span>}
          <span 
            onClick={() => navigate(item.path)}
            style={{
              cursor: 'pointer',
              fontWeight: item.path === location.pathname ? 'bold' : 'normal',
              color: item.path === location.pathname ? '#000' : '#666'
            }}
          >
            {item.label}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}

export default Breadcrumb;
