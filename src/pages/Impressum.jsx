import React from 'react';

const Impressum = () => {
    return (
        <div className="legal-page theme-dark" style={{ paddingTop: '120px', paddingBottom: '80px', minHeight: '100vh' }}>
            <div className="container">
                <h1 className="heading-lg">Impressum</h1>
                <div className="glass-panel" style={{ padding: '3rem', marginTop: '2rem', lineHeight: '1.8' }}>
                    <h2>Angaben gemäß § 5 TMG</h2>
                    <p>
                        Relax Lounge bei Kaisers<br />
                        [Inhaber/Geschäftsführer Name]<br />
                        Rollbergstraße 70<br />
                        12053 Berlin
                    </p>

                    <h3>Kontakt</h3>
                    <p>
                        Telefon: +49 (0) 30 6813293<br />
                        E-Mail: [Deine E-Mail Adresse]
                    </p>

                    <h3>Umsatzsteuer-ID</h3>
                    <p>
                        Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
                        [Deine USt-IdNr.]
                    </p>

                    <h3>Redaktionell verantwortlich</h3>
                    <p>[Name der verantwortlichen Person]</p>

                    <h3>EU-Streitschlichtung</h3>
                    <p>
                        Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
                        <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer"> https://ec.europa.eu/consumers/odr/</a>.<br />
                        Unsere E-Mail-Adresse finden Sie oben im Impressum.
                    </p>

                    <h3>Verbraucherstreitbeilegung/Universalschlichtungsstelle</h3>
                    <p>
                        Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Impressum;
