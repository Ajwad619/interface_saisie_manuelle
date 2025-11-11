import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

function Login() {
  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await login(loginInput, passwordInput);
      console.log('=> réponse login:', res);

      console.log('Réponse du serveur:', res);

      if (res.success) {
        navigate('/cours'); 
      } else {
        setError(res.message || 'Login ou mot de passe incorrect');
      }
    } catch (err) {
      console.error(err);
      setError('Erreur serveur. Veuillez réessayer.');
    }
  };

  return (
    <div className="login-container" style={{ maxWidth: '400px', margin: '50px auto' }}>
      <h2>Connexion</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Identifiant</label>
          <input
            type="text"
            className="form-control"
            value={loginInput}
            onChange={(e) => setLoginInput(e.target.value)}
            required
          />
        </div>

        <div className="form-group mt-3">
          <label>Mot de passe</label>
          <input
            type="password"
            className="form-control"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary mt-4 w-100">
          Se connecter
        </button>
      </form>
    </div>
  );
}

export default Login;
