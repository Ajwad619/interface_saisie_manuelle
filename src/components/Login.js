// === Page de connexion ===

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin} from '../services/api';
import { useAuth } from '../context/AuthContext';

function Login() {
  const { role , login: contextLogin } = useAuth();
  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
      if (role === 'admin') {
        navigate('/admin-dashboard');
      } else if (role === 'user') {
        navigate('/cours');
      }
  }, [role, navigate]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  try {
      const res = await apiLogin(loginInput, passwordInput);

      if (res.success) {
        // === Stocker le rôle et l'identifiant dans localStorage ===
        contextLogin(res.role, res.identifiant);
      } else {
        setError(res.message || 'Login ou mot de passe incorrect');
      }
      } catch {
      setError('Erreur serveur. Veuillez réessayer.');
      }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 col-lg-4">

          <div className="form-section">
            <h2 className="text-center mb-4">Connexion</h2>

            {error && (
              <div className="alert alert-danger text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Identifiant</label>
                <input
                  type="text"
                  className="form-control"
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Mot de passe</label>
                <input
                  type="password"
                  className="form-control"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-100 mt-3">
                Se connecter
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;
