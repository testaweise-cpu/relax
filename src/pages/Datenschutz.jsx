import React from 'react';
import { useTranslation } from 'react-i18next';

const Datenschutz = () => {
    const { t } = useTranslation();

    return (
        <div className="legal-page theme-dark" style={{ paddingTop: '120px', paddingBottom: '80px', minHeight: '100vh' }}>
            <div className="container">
                <h1 className="heading-lg">{t('datenschutz.title')}</h1>
                <div className="glass-panel" style={{ padding: '3rem', marginTop: '2rem', lineHeight: '1.8' }}>
                    <h2>{t('datenschutz.glance')}</h2>
                    <h3>{t('datenschutz.general_notes')}</h3>
                    <p>
                        {t('datenschutz.p_glance')}
                    </p>

                    <h3>{t('datenschutz.rights')}</h3>
                    <p>
                        {t('datenschutz.p_rights')}
                    </p>

                    <h2>{t('datenschutz.collection')}</h2>
                    <h3>{t('datenschutz.who_responsible')}</h3>
                    <p>
                        {t('datenschutz.p_responsible')}
                    </p>

                    <h3>{t('datenschutz.responsible_notice')}</h3>
                    <p>
                        {t('datenschutz.responsible_entity')}<br /><br />
                        Frau Ute Meusel<br />
                        Lahnstr 12<br />
                        12055 Berlin<br />
                        E-Mail: info@relaxloungebeikaisers.de<br />
                        Telefon: +49 (0) 30 - 89 73 11 12
                    </p>

                    <h3>{t('datenschutz.how_collect')}</h3>
                    <p>
                        {t('datenschutz.p_how_collect')}
                    </p>

                    <h3>{t('datenschutz.what_use')}</h3>
                    <p>
                        {t('datenschutz.p_what_use')}
                    </p>

                    <h2>{t('datenschutz.hosting')}</h2>
                    <p>
                        {t('datenschutz.hosting_railway')}
                    </p>

                    <h2>{t('datenschutz.encryption')}</h2>
                    <p>
                        {t('datenschutz.p_encryption')}
                    </p>

                    <h2>{t('datenschutz.cookies')}</h2>
                    <p>
                        {t('datenschutz.p_cookies')}
                    </p>

                    <h2>{t('datenschutz.analysis')}</h2>
                    <p>
                        {t('datenschutz.p_analysis')}
                    </p>

                    <p style={{ marginTop: '2rem', fontStyle: 'italic', borderTop: '1px solid #333', paddingTop: '1rem' }}>
                        {t('datenschutz.template_notice')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Datenschutz;
