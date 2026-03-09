import React from 'react';
import { MapPin, Navigation, Clock, Phone } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Location.css';
import Button from '../components/Button';

// Custom Gold Marker Icon
const goldIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const Location = () => {
    const { t } = useTranslation();
    const position = [52.469298, 13.454414];

    return (
        <div className="location-page theme-dark">
            {/* Hero Section - Matching Home Page Style */}
            <section className="hero-section small-hero">
                <div className="hero-video-container">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="hero-video"
                    >
                        <source src="https://www.mona-roses.com/wp-content/uploads/2020/08/bockhaus_dancing.mp4" type="video/mp4" />
                    </video>
                </div>
                <div className="hero-overlay"></div>
                <div className="container hero-content animate-fade-in">
                    <h1 className="heading-lg">{t('location.title')} <br /><span className="text-accent">Relax Lounge</span></h1>
                    <p className="hero-subtitle">{t('location.subtitle')}</p>
                </div>
            </section>

            <section className="section map-section">
                <div className="container">
                    <div className="location-grid">

                        {/* Info Panel - Premium Glass Style */}
                        <div className="info-panel glass-panel animate-fade-in">
                            <h2 className="heading-lg" style={{ fontSize: '2rem', marginBottom: '2.5rem' }}>{t('location.address_contact')}</h2>

                            <div className="info-block">
                                <div className="info-icon-wrapper">
                                    <MapPin className="text-accent" size={24} />
                                </div>
                                <div className="info-text-content">
                                    <h3>{t('location.location')}</h3>
                                    <p>Lahnstraße 12</p>
                                    <p>12055 Berlin - Neukölln</p>
                                    <p className="hint">{t('location.hint_entrance')}</p>
                                </div>
                            </div>

                            <div className="info-block">
                                <div className="info-icon-wrapper">
                                    <Phone className="text-accent" size={24} />
                                </div>
                                <div className="info-text-content">
                                    <h3>{t('impressum.contact')}</h3>
                                    <p>WhatsApp: 0152 - 1362 3235</p>
                                    <p>Telefon: 030 - 8973 1112</p>
                                </div>
                            </div>

                            <div className="info-block">
                                <div className="info-icon-wrapper">
                                    <Clock className="text-accent" size={24} />
                                </div>
                                <div className="info-text-content">
                                    <h3>{t('location.hours')}</h3>
                                    <p>{t('location.daily')}</p>
                                    <p className="hint">{t('location.hint_discretion')}</p>
                                </div>
                            </div>

                            <div className="info-block">
                                <div className="info-icon-wrapper">
                                    <Navigation className="text-accent" size={24} />
                                </div>
                                <div className="info-text-content">
                                    <h3>{t('location.arrival_parking')}</h3>
                                    <p>{t('location.central_location')}</p>
                                    <p>{t('location.parking_info')}</p>
                                </div>
                            </div>

                            <div className="info-actions" style={{ marginTop: '3rem' }}>
                                <Button
                                    to="https://www.google.com/maps/dir/?api=1&destination=Lahnstra%C3%9Fe+12,+12055+Berlin"
                                    variant="primary"
                                    style={{ width: '100%' }}
                                    external
                                >
                                    {t('location.calculate_route')}
                                </Button>
                            </div>
                        </div>

                        {/* Map - Dynamic Leaflet Implementation */}
                        <div className="map-container animate-fade-in" style={{ animationDelay: '0.2s' }}>
                            <MapContainer
                                center={position}
                                zoom={15}
                                scrollWheelZoom={false}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                />
                                <Marker position={position} icon={goldIcon}>
                                    <Popup>
                                        <strong>Relax Lounge bei Kaisers</strong> <br />
                                        Lahnstraße 12, 12055 Berlin
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
};

export default Location;

