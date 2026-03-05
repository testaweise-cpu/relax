import React from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Models from './pages/Models';
import ModelDetail from './pages/ModelDetail';
import Prices from './pages/Prices';
import Rooms from './pages/Rooms';
import Location from './pages/Location';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/damen" element={<Models />} />
            <Route path="/damen/:identifier" element={<ModelDetail />} />
            <Route path="/preise" element={<Prices />} />
            <Route path="/ambiente-vermietung" element={<Rooms />} />
            <Route path="/anfahrt" element={<Location />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
