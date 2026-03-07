import React from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Models from './pages/Models';
import ModelDetail from './pages/ModelDetail';
import Prices from './pages/Prices';
import Rooms from './pages/Rooms';
import Location from './pages/Location';
import Impressum from './pages/Impressum';
import Datenschutz from './pages/Datenschutz';
import AgeGate from './components/AgeGate';
import CookieBanner from './components/CookieBanner';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="app-container">
        <AgeGate />
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/damen" element={<Models />} />
            <Route path="/damen/:identifier" element={<ModelDetail />} />
            <Route path="/preise" element={<Prices />} />
            <Route path="/ambiente-vermietung" element={<Rooms />} />
            <Route path="/anfahrt" element={<Location />} />
            <Route path="/impressum" element={<Impressum />} />
            <Route path="/datenschutz" element={<Datenschutz />} />
          </Routes>
        </main>
        <CookieBanner />
        <Footer />
      </div>
    </Router>
  );
}

export default App;
