import React from 'react';
import { useTranslation } from 'react-i18next';

const Impressum = () => {
    const { t } = useTranslation();

    return (
        <div className="legal-page theme-dark" style={{ paddingTop: '120px', paddingBottom: '80px', minHeight: '100vh' }}>
            <div className="container">
                <h1 className="heading-lg">{t('impressum.title')}</h1>
                <div className="glass-panel" style={{ padding: '3rem', marginTop: '2rem', lineHeight: '1.8' }}>
                    <h2>{t('impressum.info_tmg')}</h2>
                    <p>
                        Relax Lounge bei Kaisers<br />
                        Lahnstr. 12<br />
                        12055 Berlin<br />
                        Telefon +49 (0) 30 - 89 73 11 12
                    </p>

                    <h2 style={{ marginTop: '2rem' }}>{t('impressum.responsible')}</h2>
                    <p>
                        Frau Ute Meusel<br />
                        Lahnstr 12<br />
                        12055 Berlin<br />
                        E-Mail: info (at) relaxloungebeikaisers.de<br />
                        Telefon +49 (0) 30 - 89 73 11 12
                    </p>

                    <h3>{t('impressum.eu_settlement')}</h3>
                    <p>
                        {t('impressum.eu_p1')}
                        <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer"> https://ec.europa.eu/consumers/odr/</a>.<br />
                        {t('impressum.eu_p2')}
                    </p>

                    <h3>{t('impressum.consumer_settlement')}</h3>
                    <p>
                        {t('impressum.consumer_p1')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Impressum;

