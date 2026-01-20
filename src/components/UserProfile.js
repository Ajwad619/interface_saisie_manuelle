import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function UserProfile() {
  const { identifiant, role } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Fermer si clic en dehors
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!identifiant || !role) return null;

  return (
    <div className="user-profile" ref={ref}>
      <button
        type="button"
        className="user-profile-btn"
        onClick={() => setOpen(!open)}
      >
        {identifiant.charAt(0).toUpperCase()}
      </button>

      {open && (
        <div className="user-profile-dropdown">
          <div className="fw-bold">{identifiant}</div>
          <div className="text-muted">{role}</div>
        </div>
      )}
    </div>
  );
}

export default UserProfile;
