import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation files (I'll create these next)
const resources = {
    de: {
        translation: {
            "nav": {
                "home": "Home",
                "models": "Damen",
                "prices": "Preise",
                "atmosphere": "Ambiente & Vermietung",
                "anfahrt": "Anfahrt",
                "contact_now": "Jetzt anfragen"
            },
            "footer": {
                "tagline": "Dein exklusiver Club in Berlin Neukölln.",
                "navigation": "Navigation",
                "information": "Information",
                "fkk_disclaimer": "Wir möchten ausdrücklich darauf hinweisen, dass wir kein FKK-Club sind und keinen Eintritt erheben.",
                "impressum": "Impressum",
                "datenschutz": "Datenschutz",
                "rights": "Alle Rechte vorbehalten."
            },
            "home": {
                "welcome": "Heiße polnische Ladys begrüßen dich in der",
                "subtitle": "Dein exklusiver Treffpunkt in Berlin Neukölln.",
                "to_models": "Zu den Damen",
                "discover_atmosphere": "Ambiente entdecken",
                "intro_title": "Entspanne in purer Eleganz",
                "intro_p1": "Wir begrüßen Dich herzlich in der Relax Lounge bei Kaisers. Erlebe unvergessliche Momente in einer stressfreien und diskreten Atmosphäre.",
                "intro_p2": "Jetzt auch Sonntags von 10 Uhr bis 22 Uhr für euch da!",
                "feature_fkk": "Kein FKK-Club",
                "feature_entry": "Kein Eintritt",
                "feature_vibe": "Familiäre Atmosphäre",
                "enjoy_stay": "Wir wünschen Ihnen einen",
                "enjoy_stay_accent": "schönen Aufenthalt",
                "p_outro": "Lass den Alltag hinter dir und genieße die Zeit bei uns. Unser Team aus ständig wechselnden, bezaubernden Damen freut sich auf deinen Besuch.",
                "directions": "Wegbeschreibung"
            },
            "impressum": {
                "title": "Impressum",
                "info_tmg": "Angaben gemäß § 5 TMG",
                "contact": "Kontakt",
                "responsible": "Redaktionell verantwortlich",
                "eu_settlement": "EU-Streitschlichtung",
                "eu_p1": "Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:",
                "eu_p2": "Unsere E-Mail-Adresse finden Sie oben im Impressum.",
                "consumer_settlement": "Verbraucherstreitbeilegung/Universalschlichtungsstelle",
                "consumer_p1": "Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen."
            },
            "location": {
                "title": "Dein Weg zur",
                "subtitle": "Mitten im Herzen von Berlin Neukölln.",
                "address_contact": "Adresse & Kontakt",
                "location": "Standort",
                "hint_entrance": "Eingang im Hinterhaus Souterrain",
                "hours": "Öffnungszeiten",
                "daily": "Täglich von 10:00 - 22:00 Uhr",
                "hint_discretion": "Diskretion ist unsere Priorität",
                "arrival_parking": "Anfahrt & Parken",
                "central_location": "Zentrale Lage in Neukölln.",
                "parking_info": "Gute Parkmöglichkeiten in der Nähe.",
                "calculate_route": "Route berechnen"
            },
            "prices": {
                "title": "Unsere",
                "title_accent": "Preise",
                "disclaimer_p1": "Liebe Gäste! Bitte beachten Sie, dass die anwesenden Damen ihren Service alle selbständig anbieten und in keinem rechtlichen Tätigkeitsverhältnis zu Relax Lounge bei Kaisers stehen. Verbindliche Absprachen, bezüglich Art des Services, Höhe der Entgelts, finden ausschließlich zwischen den Damen und deren Gästen statt.",
                "disclaimer_p2": "Jedes Zimmer verfügt über eigenes Duschbad.",
                "basic_prices": "Unsere Grundpreise inklusive Zimmermiete betragen:",
                "min_30": "30 Minuten",
                "min_45": "45 Minuten",
                "min_60": "60 Minuten",
                "incl_room": "Inklusive Zimmermiete",
                "incl_shower": "Duschen ohne Aufpreis",
                "incl_towel": "Inkl. Duschtuch & Duschgel",
                "vat_included": "* alle Preise inklusive gesetzlicher MwSt.",
                "ask_service": "Servicepreise erfragst du bitte bei der Dame deiner Wahl.",
                "general_title": "Allgemeine Hinweise!",
                "general_p": "Bitte beachten Sie, dass die anwesenden Damen ihren Service als selbständige Unternehmerinnen anbieten und in keinem rechtlichen Tätigkeitsverhältnis zum Relax Lounge bei Kaisers stehen. Verbindliche Absprachen bezüglich Art des Services, Höhe der Vergütung sowie die Modalitäten der Bezahlung finden ausschließlich zwischen den Damen und deren Gästen statt. Die Dienstleistungen und Präsentationen erfolgen ausschließlich im Auftrag, auf eigenen Namen und Rechnung, der Damen. Es besteht zu keiner Zeit ein begründetes Vertragsverhältnis und keine geschäftliche Beziehung zur Relax Lounge bei Kaisers. Die Fotos der Damen, werden ausschließlich von den betreffenden Damen zur Verfügung gestellt. Diese sind allein verantwortlich für die Darstellung. Die gesamte Präsentation, der Damen auf den Internetseiten von Relax Lounge bei Kaisers, erfolgt ausschließlich im Auftrag, auf eigenen Namen und Rechnung, der Damen."
            },
            "models": {
                "title": "Unsere",
                "title_accent": "Damen",
                "subtitle": "Wir sind ein Team ständig wechselnder Damen. Die individuelle Anwesenheit erfragst du bitte telefonisch.",
                "noble_atlas": "Direkt von Noble Atlas Sync",
                "loading": "Sedcards werden geladen...",
                "view_profile": "Profil ansehen",
                "years": "Jahre",
                "looking_for": "Auf der Suche nach",
                "termindamen": "Termindamen?",
                "termindamen_p": "Diese Damen sind immer nur für kurze Zeit bei uns! Alle Damen sind selbständig tätig. Auf Nachfrage werden auch Sonderwünsche erfüllt!",
                "view_termindamen": "Termindamen ansehen"
            },
            "rooms": {
                "title": "Ambiente &",
                "title_accent": "Zimmervermietung",
                "subtitle": "Dein Arbeitsraum in der Relax Lounge. Wir bieten einen stressfreien Ort für selbständige Damen.",
                "your_workspace": "Dein Arbeitsraum",
                "p1": "Hallo liebe Kollegin! Wir bieten ab sofort lieben Damen mit Erfahrung und Lebensreife einen Raum zum Arbeiten. Die Relax Lounge bietet dir in stressfreier und sehr ungezwungener Atmosphäre die Möglichkeit hier wochen-, tage- oder nur stundenweise, als selbstständig tätige Dienstleisterin deinem Beruf nachzugehen.",
                "p2": "Wir bieten Euch in gemütlicher und familiärer Atmosphäre eine neue Arbeitsmöglichkeit mit guten Verdienstaussichten. In unseren sauberen und mit Liebe zum Detail eingerichteten hellen Räumen fühlst Du dich bestimmt ganz schnell wie zu Hause.",
                "come_by": "Komm vorbei",
                "adventure_title": "Dein Abenteuer in der",
                "adventure_accent": "Relax Lounge",
                "need_place": "Du brauchst einen Ort für deinen Seitensprung?",
                "discrete_p": "Wir bieten diskrete und private Räumlichkeiten für ungestörte Stunden zu zweit. Genieße die absolute Privatsphäre in unserem gepflegten Ambiente.",
                "call_for_details": "Jetzt Anrufen für Details"
            },
            "datenschutz": {
                "title": "Datenschutzerklärung",
                "glance": "1. Datenschutz auf einen Blick",
                "general_notes": "Allgemeine Hinweise",
                "p_glance": "Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.",
                "collection": "2. Datenerfassung auf dieser Website",
                "who_responsible": "Wer ist verantwortlich für die Datenerfassung auf dieser Website?",
                "p_responsible": "Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem folgenden Abschnitt „Hinweis zur Verantwortlichen Stelle“ entnehmen.",
                "responsible_notice": "Hinweis zur Verantwortlichen Stelle",
                "responsible_entity": "Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:",
                "how_collect": "Wie erfassen wir Ihre Daten?",
                "p_how_collect": "Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z. B. um Daten handeln, die Sie in ein Kontaktformular eingeben. Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere IT-Systeme erfasst.",
                "what_use": "Wofür nutzen wir Ihre Daten?",
                "p_what_use": "Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu gewährleisten. Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden.",
                "cookies": "3. Cookies",
                "p_cookies": "Unsere Internetseiten verwenden so genannte „Cookies“. Cookies sind kleine Textdateien und richten auf Ihrem Endgerät keinen Schaden an. Sie werden entweder vorübergehend für die Dauer einer Sitzung (Session-Cookies) oder dauerhaft (permanente Cookies) auf Ihrem Endgerät gespeichert.",
                "analysis": "4. Analyse-Tools und Tools von Drittanbietern",
                "p_analysis": "Wir nutzen die Noble Atlas Sync API zur Darstellung von Sedcards. Hierbei können technisch notwendige Daten an den Anbieter übertragen werden, um die korrekte Anzeige der Profile zu ermöglichen.",
                "template_notice": "Hinweis: Dies ist eine Vorlage. Bitte lassen Sie diese Datenschutzerklärung durch einen Fachanwalt prüfen und vervollständigen."
            }
        }
    },
    en: {
        translation: {
            "nav": {
                "home": "Home",
                "models": "Ladies",
                "prices": "Prices",
                "atmosphere": "Atmosphere & Rental",
                "anfahrt": "Location",
                "contact_now": "Enquire Now"
            },
            "footer": {
                "tagline": "Your exclusive club in Berlin Neukölln.",
                "navigation": "Navigation",
                "information": "Information",
                "fkk_disclaimer": "We would like to expressly point out that we are not an FKK club and do not charge admission.",
                "impressum": "Legal Notice",
                "datenschutz": "Privacy Policy",
                "rights": "All rights reserved."
            },
            "home": {
                "welcome": "Hot Polish ladies welcome you to",
                "subtitle": "Your exclusive meeting point in Berlin Neukölln.",
                "to_models": "To the ladies",
                "discover_atmosphere": "Discover atmosphere",
                "intro_title": "Relax in pure elegance",
                "intro_p1": "We warmly welcome you to Relax Lounge bei Kaisers. Experience unforgettable moments in a stress-free and discreet atmosphere.",
                "intro_p2": "Now also open on Sundays from 10 am to 10 pm!",
                "feature_fkk": "No FKK club",
                "feature_entry": "No admission fee",
                "feature_vibe": "Family atmosphere",
                "enjoy_stay": "We wish you a",
                "enjoy_stay_accent": "pleasant stay",
                "p_outro": "Leave everyday life behind and enjoy your time with us. Our team of constantly changing, charming ladies looks forward to your visit.",
                "directions": "Directions"
            },
            "impressum": {
                "title": "Legal Notice",
                "info_tmg": "Information according to § 5 TMG",
                "contact": "Contact",
                "responsible": "Responsible for Content",
                "eu_settlement": "EU Dispute Resolution",
                "eu_p1": "The European Commission provides a platform for online dispute resolution (OS):",
                "eu_p2": "You can find our e-mail address at the top of the legal notice.",
                "consumer_settlement": "Consumer dispute resolution/Universal arbitration board",
                "consumer_p1": "We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board."
            },
            "location": {
                "title": "Your way to",
                "subtitle": "In the heart of Berlin Neukölln.",
                "address_contact": "Address & Contact",
                "location": "Location",
                "hint_entrance": "Entrance in the rear building (basement)",
                "hours": "Opening Hours",
                "daily": "Daily from 10:00 AM - 10:00 PM",
                "hint_discretion": "Discretion is our priority",
                "arrival_parking": "Arrival & Parking",
                "central_location": "Central location in Neukölln.",
                "parking_info": "Good parking facilities nearby.",
                "calculate_route": "Calculate Route"
            },
            "prices": {
                "title": "Our",
                "title_accent": "Prices",
                "disclaimer_p1": "Dear guests! Please note that the ladies present offer all their services independently and are not in a legal employment relationship with Relax Lounge bei Kaisers. Binding agreements regarding the type of service, amount of fees, take place exclusively between the ladies and their guests.",
                "disclaimer_p2": "Each room has its own shower room.",
                "basic_prices": "Our basic prices including room rent are:",
                "min_30": "30 Minutes",
                "min_45": "45 Minutes",
                "min_60": "60 Minutes",
                "incl_room": "Including room rent",
                "incl_shower": "Shower at no extra charge",
                "incl_towel": "Incl. shower towel & shower gel",
                "vat_included": "* all prices including statutory VAT.",
                "ask_service": "Please ask the lady of your choice for service prices.",
                "general_title": "General Information!",
                "general_p": "Please note that the ladies present offer their services as independent entrepreneurs and are not in a legal employment relationship with Relax Lounge bei Kaisers. Binding agreements regarding the type of service, amount of remuneration and the modalities of payment take place exclusively between the ladies and their guests. The services and presentations take place exclusively on behalf of, in their own name and account, the ladies. There is at no time a justified contractual relationship and no business relationship with Relax Lounge bei Kaisers. The photos of the ladies are provided exclusively by the ladies concerned. They are solely responsible for the representation. The entire presentation of the ladies on the websites of Relax Lounge bei Kaisers takes place exclusively on behalf of, in their own name and account, the ladies."
            },
            "models": {
                "title": "Our",
                "title_accent": "Ladies",
                "subtitle": "We are a team of constantly changing ladies. Please ask by phone for individual availability.",
                "noble_atlas": "Directly from Noble Atlas Sync",
                "loading": "Loading sedcards...",
                "view_profile": "View Profile",
                "years": "years",
                "looking_for": "Looking for",
                "termindamen": "visiting ladies?",
                "termindamen_p": "These ladies are only with us for a short time! All ladies are self-employed. Special requests are also fulfilled on request!",
                "view_termindamen": "View visiting ladies"
            },
            "rooms": {
                "title": "Atmosphere &",
                "title_accent": "Room Rental",
                "subtitle": "Your workspace in the Relax Lounge. We offer a stress-free place for independent ladies.",
                "your_workspace": "Your Workspace",
                "p1": "Hello dear colleague! We are now offering lovely ladies with experience and maturity a space to work. The Relax Lounge offers you a stress-free and very informal atmosphere in which to practice your profession as a self-employed service provider on a weekly, daily or hourly basis.",
                "p2": "We offer you a new working opportunity with good earning prospects in a cozy and informal atmosphere. You will soon feel right at home in our clean and bright rooms, which have been furnished with great attention to detail.",
                "come_by": "Come by",
                "adventure_title": "Your Adventure in",
                "adventure_accent": "Relax Lounge",
                "need_place": "Do you need a place for a secret rendezvous?",
                "discrete_p": "We offer discreet and private rooms for undisturbed hours for two. Enjoy absolute privacy in our well-kept atmosphere.",
                "call_for_details": "Call now for details"
            },
            "datenschutz": {
                "title": "Privacy Policy",
                "glance": "1. Privacy at a Glance",
                "general_notes": "General Information",
                "p_glance": "The following information provides a simple overview of what happens to your personal data when you visit this website. Personal data is any data with which you can be personally identified.",
                "collection": "2. Data Collection on this Website",
                "who_responsible": "Who is responsible for the data collection on this website?",
                "p_responsible": "Data processing on this website is carried out by the website operator. You can find their contact details in the following section \"Information on the Responsible Body\".",
                "responsible_notice": "Information on the Responsible Body",
                "responsible_entity": "The responsible body for data processing on this website is:",
                "how_collect": "How do we collect your data?",
                "p_how_collect": "Your data is collected on the one hand by the fact that you provide it to us. This can be, for example, data that you enter into a contact form. Other data is collected automatically or with your consent when you visit the website through our IT systems.",
                "what_use": "What do we use your data for?",
                "p_what_use": "Part of the data is collected to ensure that the website is provided without errors. Other data can be used to analyze your user behavior.",
                "cookies": "3. Cookies",
                "p_cookies": "Our Internet pages use so-called \"cookies\". Cookies are small text files and do not cause any damage to your end device. They are stored either temporarily for the duration of a session (session cookies) or permanently (permanent cookies) on your end device.",
                "analysis": "4. Analysis Tools and Tools from Third-Party Providers",
                "p_analysis": "We use the Noble Atlas Sync API to display sedcards. In this process, technically necessary data can be transferred to the provider to enable the correct display of the profiles.",
                "template_notice": "Note: This is a template. Please have this privacy policy checked and completed by a specialist lawyer."
            }
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'de',
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
