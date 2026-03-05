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
    if (!data) return null;

    // Grid mapping
    const images = Array.isArray(data.images) ? data.images : [];
    const heroImage =
        data.thumbnail_full_url ||
        data.thumbnail_url ||
        images[0]?.full ||
        images[0]?.url ||
        "";

    // About text fallbacks: about_text -> description -> values.about_me
    const about =
        (data.about_text || "").trim() ||
        (data.description || "").trim() ||
        String((data.values || {})?.about_me || "").trim() ||
        'Exklusive Begleitung in der Relax Lounge.';

    const services = (data.services || []).filter(Boolean);
    const languages = (data.languages || []).filter(Boolean);

    // Specific price mapping
    const pricesRaw = data.prices || {};
    const prices = [
        { label: "30 Min", value: pricesRaw.p30 || "" },
        { label: "45 Min", value: pricesRaw.p45 || "" },
        { label: "60 Min", value: pricesRaw.p60 || "" },
        { label: "2 Std", value: pricesRaw.p2h || "" },
        { label: "Nacht", value: pricesRaw.overnight || "" },
    ].filter((p) => p.value);

    return {
        id: data.id,
        slug: data.slug,
        name: data.name || "Model",
        verified: !!data.verified,
        hero: {
            name: data.name || "",
            image: heroImage,
            age: data.age || "",
            origin: data.origin || "",
            city: data.city || "",
        },
        about,
        services,
        languages,
        prices,
        gallery: images.map((img) => ({
            src: img.full || img.url,
            thumb: img.thumb || img.url,
            alt: img.alt || data.name || "Galerie Bild",
        })),
        details: {
            age: data.age || "",
            origin: data.origin || "",
            city: data.city || "",
            zip: data.zip || "",
        }
    };
}

export const fetchNobleAtlasSedcards = async (params = {}) => {
    try {
        const { page = 1, per_page = 15, search = '' } = params;
        let url = `/api/models?page=${page}&per_page=${per_page}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Internal API returned status: ${response.status}`);
        }

        const data = await response.json();

        return {
            items: (data.items || []).map(mapSedcardForUI),
            pagination: data.pagination || {},
            bordell: data.bordell || {}
        };
    } catch (error) {
        console.error("Error fetching models:", error);
        return { items: [], pagination: {}, bordell: {} };
    }
};

export const fetchNobleAtlasSedcard = async (identifier) => {
    try {
        const response = await fetch(`/api/models/${identifier}`);

        if (!response.ok) {
            throw new Error(`Internal API returned status: ${response.status}`);
        }

        const data = await response.json();
        // data factorily contains the raw model object from upstream
        return mapSedcardForUI(data);
    } catch (error) {
        console.error(`Error fetching model (${identifier}):`, error);
        return null;
    }
};