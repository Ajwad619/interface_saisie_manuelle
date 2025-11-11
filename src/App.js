import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import SectionCours from './components/SectionCours';
import FormSaisie from './components/FormSaisie';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />       {/* page de connexion */}
        <Route path="/cours" element={<FormSaisie />} />  {/* page principale */}
      </Routes>
    </Router>
  );
}

export default App;
