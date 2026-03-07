import React from 'react';

const Datenschutz = () => {
    return (
        <div className="legal-page theme-dark" style={{ paddingTop: '120px', paddingBottom: '80px', minHeight: '100vh' }}>
            <div className="container">
                <h1 className="heading-lg">Datenschutz­erklärung</h1>
                <div className="glass-panel" style={{ padding: '3rem', marginTop: '2rem', lineHeight: '1.8' }}>
                    <h2>1. Datenschutz auf einen Blick</h2>
                    <h3>Allgemeine Hinweise</h3>
                    <p>
                        Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
                    </p>

                    <h2>2. Datenerfassung auf dieser Website</h2>
                    <h3>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</h3>
                    <p>
                        Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Abschnitt „Hinweis zur Verantwortlichen Stelle“ in dieser Datenschutzerklärung entnehmen.
                    </p>

                    <h3>Wie erfassen wir Ihre Daten?</h3>
                    <p>
                        Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z. B. um Daten handeln, die Sie in ein Kontaktformular eingeben. Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere IT-Systeme erfasst.
                    </p>

                    <h3>Wofür nutzen wir Ihre Daten?</h3>
                    <p>
                        Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu gewährleisten. Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden.
                    </p>

                    <h2>3. Cookies</h2>
                    <p>
                        Unsere Internetseiten verwenden so genannte „Cookies“. Cookies sind kleine Textdateien und richten auf Ihrem Endgerät keinen Schaden an. Sie werden entweder vorübergehend für die Dauer einer Sitzung (Session-Cookies) oder dauerhaft (permanente Cookies) auf Ihrem Endgerät gespeichert.
                    </p>

                    <h2>4. Analyse-Tools und Tools von Dritt­anbietern</h2>
                    <p>
                        Wir nutzen die Noble Atlas Sync API zur Darstellung von Sedcards. Hierbei können technisch notwendige Daten an den Anbieter übertragen werden, um die korrekte Anzeige der Profile zu ermöglichen.
                    </p>

                    <p style={{ marginTop: '2rem', fontStyle: 'italic' }}>
                        Hinweis: Dies ist eine Vorlage. Bitte lassen Sie diese Datenschutzerklärung durch einen Fachanwalt prüfen und vervollständigen.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Datenschutz;
