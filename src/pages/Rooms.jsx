import React from 'react';
import Button from '../components/Button';
import './Rooms.css';

// Import Ambiente images
import img5 from '../bilder/5.jpg';
import img6 from '../bilder/6.jpg';
import img7 from '../bilder/7.jpg';
import img8 from '../bilder/8.jpg';

const Rooms = () => {
    return (
        <div className="rooms-page theme-dark">
            <section className="section page-header text-center">
                <div className="container animate-fade-in">
                    <h1 className="heading-lg">Ambiente & <span className="text-accent">Zimmervermietung</span></h1>
                    <p className="page-subtitle">
                        Dein Arbeitsraum in der Relax Lounge. <br />
                        Wir bieten einen stressfreien Ort für selbständige Damen.
                    </p>
                </div>
            </section>

            <section className="section rooms-split-section">
                <div className="container">
                    <div className="split-layout">
                        <div className="split-text animate-fade-in">
                            <h2 className="heading-lg">Dein Arbeitsraum</h2>
                            <p>
                                Hallo liebe Kollegin! Wir bieten ab sofort lieben Damen mit Erfahrung und Lebensreife einen Raum zum Arbeiten.
                                Die Relax Lounge bietet dir in stressfreier und sehr ungezwungener Atmosphäre die Möglichkeit hier wochen-, tage- oder nur stundenweise,
                                als selbstständig tätige Dienstleisterin deinem Beruf nachzugehen.
                            </p>
                            <p>
                                Wir bieten Euch in gemütlicher und familiärer Atmosphäre eine neue Arbeitsmöglichkeit mit guten Verdienstaussichten.
                                In unseren sauberen und mit Liebe zum Detail eingerichteten hellen Räumen fühlst Du dich bestimmt ganz schnell wie zu Hause.
                            </p>
                            <div style={{ marginTop: '2rem' }}>
                                <Button to="/anfahrt" variant="primary">Komm vorbei</Button>
                            </div>
                        </div>
                        <div className="split-image glass-panel animate-fade-in" style={{ animationDelay: '0.2s', padding: '1.5rem' }}>
                            <div className="rooms-image-grid">
                                <img src={img5} alt="Relax Lounge Ambiente 1" />
                                <img src={img6} alt="Relax Lounge Ambiente 2" />
                                <img src={img7} alt="Relax Lounge Ambiente 3" />
                                <img src={img8} alt="Relax Lounge Ambiente 4" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Seitensprung Section - Light Theme for contrast */}
            <section className="section theme-light seitensprung-section">
                <div className="container text-center">
                    <h2 className="heading-lg">Dein Abenteuer in der <span className="text-accent">Relax Lounge</span></h2>
                    <h3 style={{ fontSize: '1.5rem', marginTop: '1rem', color: '#555' }}>Du brauchst einen Ort für deinen Seitensprung?</h3>
                    <p style={{ maxWidth: '600px', margin: '2rem auto' }}>
                        Wir bieten diskrete und private Räumlichkeiten für ungestörte Stunden zu zweit.
                        Genieße die absolute Privatsphäre in unserem gepflegten Ambiente.
                    </p>
                    <Button variant="outline" onClick={() => window.location.href = 'tel:015151576857'}>
                        Jetzt Anrufen für Details
                    </Button>
                </div>
            </section>
        </div>
    );
};

export default Rooms;
