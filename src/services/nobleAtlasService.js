/**
 * Internal Noble Atlas API Service
 * Fetches sedcard data securely through our local Express proxy
 */

function asArray(value) {
    if (Array.isArray(value)) return value.map(String).filter(Boolean);
    if (typeof value === "string" && value.trim()) return [value.trim()];
    return [];
}

function toText(value) {
    if (value == null) return "";
    if (Array.isArray(value)) return value.map(String).join(", ");
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
}

export function mapSedcardForUI(data) {
    const images = Array.isArray(data.images) ? data.images : [];
    const heroImage =
        data.thumbnail_url ||
        images[0]?.full ||
        images[0]?.url ||
        "";

    const about =
        (data.about_text || "").trim() ||
        (data.description || "").trim() ||
        String((data.values || {})?.about_me || "").trim();

    const services = (data.services || []).filter(Boolean);
    const languages = (data.languages || []).filter(Boolean);

    const pricesRaw = data.prices || {};
    const prices = [
        { label: "30 Min", value: pricesRaw.p30 || "" },
        { label: "45 Min", value: pricesRaw.p45 || "" },
        { label: "60 Min", value: pricesRaw.p60 || "" },
        { label: "2 Stunden", value: pricesRaw.p2h || "" },
        { label: "Overnight", value: pricesRaw.overnight || "" },
    ].filter((p) => p.value);

    return {
        id: data.id,
        slug: data.slug,
        permalink: data.permalink,
        hero: {
            name: data.name || "",
            verified: !!data.verified,
            image: heroImage,
            age: data.age || "25",
            origin: data.origin || "",
            city: data.city || "Berlin",
            zip: data.zip || "",
        },
        measurements: toText((data.values || {})["masse"]) || 'Auf Anfrage',
        about: about || 'Exklusive Begleitung in der Relax Lounge.',
        gallery: images.map((img) => ({
            src: img.full || img.url,
            thumb: img.thumb || img.url,
            alt: img.alt || data.name || "Sedcard image",
        })),
        services,
        languages,
        prices,
        location: {
            city: data.city || "",
            zip: data.zip || "",
        },
        rawValues: data.values || {},
    };
}

export const fetchNobleAtlasSedcards = async () => {
    try {
        const response = await fetch('/api/models');

        if (!response.ok) {
            throw new Error(`Internal API returned status: ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data)) {
            return data.map(mapSedcardForUI);
        }
        return [];
    } catch (error) {
        console.error("Error fetching models from internal API:", error);
        return [];
    }
};

export const fetchNobleAtlasSedcard = async (identifier) => {
    try {
        const response = await fetch(`/api/models/${identifier}`);

        if (!response.ok) {
            throw new Error(`Internal API returned status: ${response.status}`);
        }

        const item = await response.json();

        if (item && item.id) {
            return mapSedcardForUI(item);
        }
        return null;
    } catch (error) {
        console.error(`Error fetching single model (${identifier}) from internal API:`, error);
        return null;
    }
};