import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import FormSaisie from './components/FormSaisie';

function App() {
  return (
    <Router>
      <Routes>

        {/* Page de LOGIN → pas de container */}
        <Route path="/" element={<Login />} />

        {/* Page principale → on applique le layout Bootstrap */}
       <Route path="/cours" element={<FormSaisie />} />

      </Routes>
    </Router>
  );
}

export default App;
