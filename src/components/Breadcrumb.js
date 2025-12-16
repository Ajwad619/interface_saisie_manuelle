// === BREADCRUMB POUR ME MONTRER LE CHEMIN ===

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Breadcrumb() {
  const navigate = useNavigate();
  const location = useLocation();

  // Définir les chemins et titres
  const routes = [
    { path: '/admin-dashboard', label: 'Accueil' },
    { path: '/cours', label: 'Insérer des données' },
    { path: '/search-modify', label: 'Rechercher et Modifier' }
  ];

  // Trouver le chemin courant
  const currentRoute = routes.find(r => r.path === location.pathname);

  // Construire le breadcrumb
  const breadcrumbItems = [
    { label: 'Accueil', path: '/admin-dashboard' }
  ];

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