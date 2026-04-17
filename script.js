// ============================================================
//  Puure – Chatbot EcoVerse
//  Moteur IA : Pollinations.ai (sans clé) + fallback local intelligent
// ============================================================

const POLLINATIONS_URL = 'https://text.pollinations.ai/openai';

const SYSTEM_PROMPT = `Tu es Puure, l'assistant intelligent de la plateforme EcoVerse. Tu es chaleureux, enthousiaste, et profondément engagé pour l'écologie.

RÈGLES STRICTES :
- Tu répondras UNIQUEMENT aux questions liées à l'écologie, l'environnement, le développement durable, et aux applications EcoVerse.
- Si une question n'a aucun rapport avec l'écologie ou EcoVerse, réponds poliment que tu n'es spécialisé que dans ces domaines.
- Tes réponses sont concises (3-5 phrases maximum), claires et encourageantes.
- Tu peux utiliser des emojis avec modération.
- Tu t'exprimes toujours en français.
- N'utilise pas de titres markdown avec #. Utilise du texte simple ou **gras**.

CONNAISSANCES SUR ECOVERSE :
EcoVerse est un écosystème numérique regroupant 4 applications pour la transition écologique.

1. ⚡ EnerGreen : Suivi et réduction de la consommation énergétique. Tableau de bord temps réel, conseils personnalisés, calcul empreinte carbone, objectifs, alertes. 12 000 utilisateurs, -18% de consommation en moyenne.

2. 🧠 EcoQuizz : Éducation écologique par le jeu. Quiz interactifs, défis, badges, classements, thèmes variés (biodiversité, énergie, déchets, eau). 5 000+ quiz complétés, 200+ questions.

3. 🗺️ GreenMap : Cartographie des points d'intérêt écologiques. Géolocalisation, 850 points verts (bornes recharge, déchetteries, marchés bio), itinéraires. 30+ villes couvertes.

4. ♻️ CleanSpot : Gestion communautaire du tri des déchets. Guide de tri, points de collecte, défis communautaires, reporting dépôts sauvages. 3,2 tonnes triées, 15+ associations partenaires.

CHIFFRES CLÉS : 4 apps · 20 000+ utilisateurs · 30+ villes · -18% CO₂`;

// ------------------------------------------------------------------
//  Base de connaissances locale (fallback si API indisponible)
//  Couvre : apps EcoVerse + écologie générale
// ------------------------------------------------------------------
const LOCAL_KB = [

    // ===== APPLICATIONS ECOVERSE =====
    {
        patterns: ['greenmap', 'green map', 'à quoi sert greenmap', 'cartographie', 'points verts', 'géolocalisation'],
        response: '🗺️ **GreenMap** est notre application de cartographie écologique ! Elle référence **850 points verts** dans plus de **30 villes** : bornes de recharge, déchetteries, marchés bio, espaces verts… Grâce à la géolocalisation, tu trouves en un instant les ressources écologiques les plus proches de chez toi. 🌿'
    },
    {
        patterns: ['energreen', 'ener green', 'énergie électricité', 'consommation énergétique', 'kwh', 'facture énergétique'],
        response: '⚡ **EnerGreen** t\'aide à maîtriser ta consommation énergétique ! Tableau de bord temps réel, conseils personnalisés, calcul d\'empreinte carbone et objectifs. Nos 12 000 utilisateurs ont réduit leur consommation de **-18% en moyenne**. Un vrai impact pour la planète ! 🌍'
    },
    {
        patterns: ['ecoquizz', 'eco quizz', 'quiz écologique', 'jouer quiz', 'apprendre écologie'],
        response: '🧠 **EcoQuizz** rend l\'apprentissage écologique fun ! Des quiz interactifs, des défis hebdomadaires, des badges et des classements. **5 000+ quiz** complétés sur des thèmes variés : biodiversité, énergie, eau, déchets… Prêt à tester tes connaissances ? 🎯'
    },
    {
        patterns: ['cleanspot', 'clean spot'],
        response: '♻️ **CleanSpot** révolutionne la gestion des déchets ! Guide de tri intelligent, localisation des points de collecte, défis communautaires et signalement des dépôts sauvages. **3,2 tonnes de déchets** ont déjà été triées grâce à l\'application. 🌱'
    },
    {
        patterns: ['applications ecoverse', 'quelles applications', 'les 4 apps', 'présente les apps', 'toutes les applications'],
        response: 'EcoVerse regroupe **4 applications** pour agir pour l\'écologie 🌍\n\n⚡ **EnerGreen** – Gérer sa consommation d\'énergie\n🧠 **EcoQuizz** – Apprendre de façon ludique\n🗺️ **GreenMap** – Trouver les points verts\n♻️ **CleanSpot** – Mieux trier ses déchets\n\nEnsemble : **20 000+ utilisateurs**, **30+ villes**, **-18% CO₂** en moyenne !'
    },

    // ===== TRI DES DÉCHETS =====
    {
        patterns: ['plastique poubelle', 'jeter plastique', 'plastique dans quelle', 'bac plastique', 'recycler plastique', 'bouteille plastique'],
        response: '♻️ Le plastique va dans la **poubelle jaune** (bac recyclage) ! Cela concerne : bouteilles, flacons, emballages rigides, barquettes propres. En revanche, les sacs plastiques, films, et plastiques souples vont à la **poubelle grise** (ordures ménagères) car ils bloquent les machines de tri. Rince toujours tes emballages avant de les trier ! 🧴'
    },
    {
        patterns: ['verre poubelle', 'jeter verre', 'bouteille verre', 'bocal', 'pot en verre'],
        response: '🫙 Le verre va dans la **borne à verre** (bac vert/blanc) ! Cela inclut bouteilles, bocaux, pots. Attention : la vaisselle cassée, miroirs, vitres et ampoules ne vont PAS dans la borne à verre — ils vont en déchetterie car leur composition est différente. Le verre est recyclable à l\'infini ! 🔄'
    },
    {
        patterns: ['carton poubelle', 'papier poubelle', 'jeter carton', 'jeter papier', 'emballage carton'],
        response: '📦 Cartons et papiers vont dans la **poubelle jaune** (bac recyclage) ! Aplatissez bien les cartons pour gagner de la place. Exception : essuie-tout, mouchoirs et papier gras — ceux-là vont dans les **ordures ménagères** car ils sont souillés et non recyclables. 📰'
    },
    {
        patterns: ['pile poubelle', 'jeter pile', 'batterie poubelle', 'recyclage pile', 'piles usagées'],
        response: '🔋 Les piles et batteries ne vont **jamais** dans les poubelles ordinaires ! Elles contiennent des métaux lourds toxiques. Dépose-les dans les **bacs à piles** présents dans les supermarchés, pharmacies ou en déchetterie. Notre app **CleanSpot** te localise les points de collecte les plus proches ! ⚡'
    },
    {
        patterns: ['médicament poubelle', 'jeter médicament', 'recyclage médicament'],
        response: '💊 Les médicaments périmés ne vont **jamais** à la poubelle ordinaire ni dans l\'évier ! Rapporte-les en **pharmacie** — elles sont toutes équipées pour les collecter (programme Cyclamed). Jeter des médicaments dans la nature ou les égouts pollue gravement les eaux et la faune. 🌊'
    },
    {
        patterns: ['déchets électroniques', 'vieux téléphone', 'recyclage ordinateur', 'DEEE', 'appareil électroménager', 'jeter téléphone'],
        response: '📱 Les appareils électroniques (téléphones, ordinateurs, TV, électroménager) sont des **DEEE** (Déchets d\'Équipements Électriques et Électroniques). Ils vont en **déchetterie** ou peuvent être repris en magasin lors d\'un achat. Ils contiennent des métaux rares précieux et des substances toxiques. **GreenMap** te localisera le point de collecte le plus proche ! 🗺️'
    },
    {
        patterns: ['composte', 'compost', 'déchets alimentaires', 'épluchures', 'restes repas'],
        response: '🌱 Les déchets organiques (épluchures, restes de repas, marc de café, thé) peuvent être compostés ! Dans une **poubelle marron** si ta ville l\'a mise en place, ou dans ton propre **composteur**. Le compost enrichit la terre et réduit de 30% le volume de tes ordures. Un geste simple à fort impact ! 🌍'
    },
    {
        patterns: ['dépôt sauvage', 'décharge sauvage', 'déchet abandonné', 'nature déchet'],
        response: '⚠️ Les dépôts sauvages de déchets sont **illégaux** et dévastateurs pour l\'environnement : pollution des sols, eaux, risques sanitaires. Tu peux les **signaler** aux autorités locales ou utiliser notre application **CleanSpot** qui permet de les signaler directement pour qu\'ils soient pris en charge rapidement ! 📍'
    },

    // ===== LE 7ÈME CONTINENT =====
    {
        patterns: ['7ème continent', 'septième continent', 'continent déchets', 'continent plastique', 'great pacific', 'vortex plastique', 'océan plastique', 'continent rempli de déchet'],
        response: '🌊 Le **"7ème continent"** (ou Vortex de déchets du Pacifique Nord) est une immense zone de l\'océan Pacifique où s\'accumulent des plastiques. Il couvre **1,6 million de km²** — 3 fois la France ! Ce n\'est pas une île solide mais une soupe de micro-plastiques en suspension. Chaque année, **8 millions de tonnes** de plastique finissent dans les océans. Trier ses déchets et réduire le plastique à la source est essentiel pour stopper ce fléau ! ♻️'
    },

    // ===== CHANGEMENT CLIMATIQUE =====
    {
        patterns: ['réchauffement climatique', 'changement climatique', 'effet de serre', 'température planète', 'dérèglement climatique', 'cop'],
        response: '🌡️ Le **réchauffement climatique** est causé par l\'accumulation de gaz à effet de serre (CO₂, méthane…) dans l\'atmosphère, principalement due aux activités humaines. La Terre s\'est déjà réchauffée de **+1,2°C** depuis l\'ère préindustrielle. Sans action, on vise +2,5 à +4°C d\'ici 2100, avec des conséquences dramatiques : montée des eaux, événements extrêmes, extinctions massives. Chaque dixième de degré compte ! 🌍'
    },
    {
        patterns: ['empreinte carbone', 'réduire co2', 'bilan carbone', 'comment réduire', 'gestes écologiques', 'quotidien écologique'],
        response: '🌍 Pour réduire ton empreinte carbone au quotidien :\n\n🚲 **Transport** : vélo, marche, covoiturage, transports en commun\n🥗 **Alimentation** : moins de viande rouge, plus de local et saison\n💡 **Énergie** : éteindre les veilles, isolation, énergie verte\n✈️ **Voyage** : privilégie les destinations proches\n🛍️ **Consommation** : achètes moins, achètes mieux\n\nNotre app **EnerGreen** calcule précisément ton empreinte ! ⚡'
    },

    // ===== ÉNERGIES RENOUVELABLES =====
    {
        patterns: ['énergie renouvelable', 'solaire', 'panneau solaire', 'éolienne', 'éolien', 'hydroélectrique', 'géothermie'],
        response: '☀️ Les **énergies renouvelables** sont la clé de la transition écologique ! Solaire, éolien, hydraulique, géothermie… Elles produisent de l\'énergie sans épuiser les ressources ni émettre de CO₂. En 2023, elles représentent déjà **30% de la production mondiale** d\'électricité et ce chiffre augmente chaque année. Notre app **EnerGreen** peut t\'aider à optimiser ta consommation d\'énergie ! ⚡'
    },

    // ===== PLASTIQUE & POLLUTION =====
    {
        patterns: ['micro-plastiques', 'microplastiques', 'polluant eau', 'pollution eau', 'pollution océan', 'mer plastique'],
        response: '🔬 Les **micro-plastiques** sont des fragments de plastique inférieurs à 5mm qui contaminent nos océans, rivières, sols… et même notre corps ! Ils proviennent de la dégradation de plastiques, des fibres synthétiques lavées (vêtements polyester) et des cosmétiques. On en retrouve dans l\'air que l\'on respire et dans le sang humain. Réduire sa consommation de plastique à usage unique est le premier geste ! ♻️'
    },
    {
        patterns: ['plastique usage unique', 'paille plastique', 'sac plastique', 'emballage plastique', 'réduire plastique'],
        response: '🚫 Le **plastique à usage unique** (sacs, pailles, couverts, bouteilles d\'eau) est l\'un des polluants les plus dévastateurs. Des alternatives existent : **gourde réutilisable**, **sac en tissu**, **paille en inox ou bambou**, **beeswax** pour remplacer le film alimentaire. Moins de plastique produit = moins de plastique à traiter ! 🌱'
    },

    // ===== BIODIVERSITÉ =====
    {
        patterns: ['biodiversité', 'espèces menacées', 'extinction', 'pollinisateurs', 'abeilles', 'insectes', 'faune flore'],
        response: '🦋 La **biodiversité** est en crise : on estime qu\'**1 million d\'espèces** sont menacées d\'extinction. Les causes : destruction des habitats, pesticides, changement climatique, espèces invasives. Pour agir : **plante des espèces locales**, **arrête les pesticides**, **crée un espace naturel** chez toi, **soutiens les associations**. **EcoQuizz** te permet d\'approfondir tes connaissances sur la biodiversité ! 🌿'
    },
    {
        patterns: ['abeilles mourir', 'abeilles disparaissent', 'pollinisation', 'insectes déclin'],
        response: '🐝 Les **abeilles** et pollinisateurs sont vitaux : ils assurent la pollinisation de **75% de nos cultures alimentaires** ! Leur déclin est alarmant à cause des pesticides, de la perte d\'habitats et des maladies. Pour les aider : **plante des fleurs mellifères**, **évite les pesticides**, **installe un hôtel à insectes**, **laisse pousser les herbes folles** dans un coin de jardin. 🌸'
    },
    {
        patterns: ['forêt déforestation', 'déboiser', 'amazonie', 'arbre couper', 'reforestation'],
        response: '🌳 La **déforestation** détruit chaque année environ **10 millions d\'hectares** de forêt — l\'équivalent du Portugal. Les forêts absorbent le CO₂, abritent 80% de la biodiversité terrestre et régulent le cycle de l\'eau. Principales causes : agriculture intensive, élevage, exploitation du bois. Tu peux agir en **consommant moins de viande**, en **choisissant du bois certifié FSC** et en soutenant des projets de reforestation. 🌱'
    },

    // ===== EAU =====
    {
        patterns: ['économiser eau', 'gaspillage eau', 'consommer moins eau', 'eau potable', 'ressource eau'],
        response: '💧 L\'eau douce ne représente que **2,5% de l\'eau sur Terre**, et seulement 0,3% est accessible ! Quelques gestes simples pour économiser : **ferme le robinet** en te brossant les dents (économise 12L), **douche courte** (5 min = 50L vs 200L pour un bain), **récupère l\'eau de pluie**, **répare les fuites** rapidement. Un robinet qui goutte, c\'est 35L gaspillés par jour ! 🌊'
    },

    // ===== ALIMENTATION =====
    {
        patterns: ['alimentation durable', 'manger écologique', 'végétarien', 'vegan', 'local', 'bio', 'circuit court', 'gaspillage alimentaire'],
        response: '🥗 L\'alimentation représente **30% de notre empreinte écologique**. Quelques actions efficaces :\n\n🥛 **Moins de viande rouge** (la viande bovine émet 20x plus de CO₂ que les légumes)\n🛒 **Local et de saison** (moins de transport et de chambre froide)\n🌱 **Anti-gaspi** : 1/3 de la nourriture mondiale est gaspillée\n🍎 **Bio quand possible** : moins de pesticides\n\nGreenMap localise les marchés bio près de toi ! 🗺️'
    },

    // ===== FAST FASHION =====
    {
        patterns: ['fast fashion', 'vêtement pollution', 'textile écologie', 'mode rapide', 'habit durable', 'seconde main'],
        response: '👕 La **fast fashion** est la 2ème industrie la plus polluante au monde ! Elle consomme 20% des eaux usées mondiales et émet 10% des GES. Un jean nécessite **7 500L d\'eau** pour être produit. Alternatives : **seconde main**, **location**, **swap entre amis**, **acheter moins mais mieux**, **marques éco-responsables**. Chaque vêtement que tu gardes plus longtemps fait la différence ! 🌱'
    },

    // ===== TRANSPORT =====
    {
        patterns: ['véhicule électrique', 'voiture électrique', 'mobilité douce', 'vélo électrique', 'covoiturage', 'avion pollue'],
        response: '🚲 Les **transports** représentent **30% des émissions CO₂** en France. Le levier le plus efficace : **marche et vélo** (0g de CO₂), puis **transports en commun**, puis **covoiturage**. L\'avion est le mode de transport le plus émetteur : 1 aller-retour Paris-New York = 1,7 tonne de CO₂ (la moitié du budget carbone annuel recommandé !). Le train émet **50x moins** que l\'avion. ✈️'
    },

    // ===== RÉPONSE GÉNÉRIQUE =====
    {
        patterns: ['écologie', 'environnement', 'nature', 'pollution', 'durable', 'vert', 'planète'],
        response: '🌿 Bonne question ! L\'écologie est au cœur de tout ce que fait EcoVerse. Je peux te renseigner sur le **tri des déchets**, la **réduction du CO₂**, les **énergies renouvelables**, la **biodiversité**, l\'**eau**, l\'**alimentation durable**, le **7ème continent**, ou nos **4 applications** (EnerGreen, EcoQuizz, GreenMap, CleanSpot). Qu\'est-ce qui t\'intéresse ? 😊'
    }
];


// ------------------------------------------------------------------
//  Fallback local intelligent
// ------------------------------------------------------------------
function localFallback(userMessage) {
    const lower = userMessage.toLowerCase();

    for (const kb of LOCAL_KB) {
        if (kb.patterns.some(p => lower.includes(p))) {
            return kb.response;
        }
    }

    // Réponse générique si aucun pattern ne correspond
    return '🌿 Je suis Puure, spécialisé dans l\'écologie et les applications EcoVerse. Tu peux me demander des informations sur **EnerGreen**, **EcoQuizz**, **GreenMap** ou **CleanSpot**, ou me poser des questions sur le recyclage, l\'empreinte carbone, la biodiversité, l\'eau ou l\'alimentation durable !';
}

// ------------------------------------------------------------------
//  Historique de conversation
// ------------------------------------------------------------------
let conversationHistory = [];

// ------------------------------------------------------------------
//  Détection hors-sujet
// ------------------------------------------------------------------
const OFF_TOPIC_KEYWORDS = [
    // Sport
    'foot', 'football', 'basketball', 'tennis', 'sport', 'match', 'équipe', 'joueur', 'but', 'score',
    'ligue', 'champion', 'nba', 'psg', 'om', 'rugby',
    // Divertissement
    'film', 'cinéma', 'série', 'netflix', 'acteur', 'musique', 'chanson', 'album', 'concert',
    'jeu vidéo', 'gaming', 'youtube', 'tiktok', 'instagram',
    // Politique / Actualité non-éco
    'élection', 'président', 'politique', 'gouvernement', 'parti', 'vote', 'guerre', 'armée',
    'impôt', 'taxe', 'économie', 'bourse', 'crypto', 'bitcoin',
    // Cuisine non-éco
    'recette', 'cuisine', 'plat', 'restaurant', 'gastronomie',
    // Santé / Médecine
    'médicament', 'maladie', 'médecin', 'symptôme', 'traitement', 'hôpital', 'covid',
    // Technologie non-éco
    'iphone', 'android', 'application mobile', 'logiciel', 'ordinateur', 'intelligence artificielle',
    'chatgpt', 'programmation', 'code',
    // Voyage / Loisirs non-éco
    'hôtel', 'vacances', 'plage', 'voyage touristique', 'vol pas cher',
    // Finances
    'salaire', 'prêt', 'banque', 'argent', 'investissement',
    // Divers
    'météo', 'horoscope', 'astrologie', 'blague', 'jeu', 'devinette'
];

function isOffTopic(userMessage) {
    const lower = userMessage.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Compter les mots-clés hors-sujet détectés
    const offTopicHits = OFF_TOPIC_KEYWORDS.filter(kw =>
        lower.includes(kw.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
    );

    // Mots-clés "sauvetage" : si présents, le sujet reste écologique même si hors-sujet aussi détecté
    const ecoRescue = [
        'ecol', 'environnement', 'recycle', 'plastique', 'dechet', 'nature', 'co2', 'carbone',
        'vert', 'pollution', 'durable', 'energie', 'solaire', 'eau', 'foret', 'biodiversite',
        'ecoverse', 'energreen', 'ecoquizz', 'greenmap', 'cleanspot', 'puure'
    ];
    const hasEcoRescue = ecoRescue.some(kw => lower.includes(kw));

    return offTopicHits.length > 0 && !hasEcoRescue;
}

// ------------------------------------------------------------------
//  Fallback local intelligent (scoring par nombre de mots-clés trouvés)
// ------------------------------------------------------------------
function localFallback(userMessage) {
    // 1. Vérifier si le sujet est clairement hors périmètre
    if (isOffTopic(userMessage)) {
        return `😊 Ce sujet ne fait pas partie de mon domaine ! Je suis **Puure**, spécialisé uniquement en **écologie et développement durable**.\n\nVoici ce dont je peux te parler :\n\n♻️ **Tri des déchets** (plastique, verre, piles…)\n🌍 **Empreinte carbone** et gestes quotidiens\n🌊 **Pollution des océans** (7ème continent…)\n🦋 **Biodiversité** et espèces menacées\n☀️ **Énergies renouvelables**\n📱 Nos apps **EnerGreen, EcoQuizz, GreenMap, CleanSpot**\n\nQu'est-ce qui t'intéresse ? 🌿`;
    }

    // 2. Chercher la meilleure correspondance dans la base écologique
    const lower = userMessage.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    let bestMatch = null;
    let bestScore = 0;

    for (const kb of LOCAL_KB) {
        let score = 0;
        for (const pattern of kb.patterns) {
            const p = pattern.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            if (lower.includes(p)) score += p.split(' ').length;
        }
        if (score > bestScore) {
            bestScore = score;
            bestMatch = kb;
        }
    }

    if (bestMatch) return bestMatch.response;

    // 3. Réponse par défaut si aucun pattern ne correspond (sujet éco non couvert)
    return `🌿 Je n'ai pas encore de réponse précise sur ce sujet ! Mais je peux t'aider sur :\n\n♻️ **Tri des déchets** (plastique, verre, piles, médicaments…)\n🌍 **Empreinte carbone** et gestes du quotidien\n🌊 **Le 7ème continent** de plastique\n🦋 **Biodiversité** et espèces menacées\n☀️ **Énergies renouvelables**\n🍃 **Alimentation durable**, fast fashion, transport\n📱 Nos **4 applications** EcoVerse\n\nQu'est-ce qui t'intéresse ? 😊`;
}

// ------------------------------------------------------------------
//  Appel à l'API Pollinations.ai (avec fallback local)
// ------------------------------------------------------------------
async function askAI(userMessage) {

    conversationHistory.push({ role: 'user', content: userMessage });

    try {
        const recentHistory = conversationHistory.slice(-16);

        const body = {
            model: 'openai',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...recentHistory
            ],
            temperature: 0.7,
            max_tokens: 400
            // Note: pas de "private: true" pour éviter d'être classé comme utilisateur authentifié
        };

        const response = await fetch(POLLINATIONS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const rawText = await response.text();
        console.log('[Puure API] Réponse:', rawText.substring(0, 200));

        const data = JSON.parse(rawText);
        const reply = data.choices?.[0]?.message?.content || '';

        // Si l'API renvoie le message de dépréciation comme contenu → fallback local
        if (!reply || reply.includes('IMPORTANT NOTICE') || reply.includes('being deprecated')) {
            console.warn('[Puure] API instable → fallback local');
            const fallback = localFallback(userMessage);
            conversationHistory.push({ role: 'assistant', content: fallback });
            return fallback;
        }

        conversationHistory.push({ role: 'assistant', content: reply.trim() });
        return reply.trim();

    } catch (err) {
        // En cas d'erreur réseau ou autre → fallback local
        console.warn('[Puure] Erreur API (' + err.message + ') → fallback local');
        const fallback = localFallback(userMessage);
        conversationHistory.push({ role: 'assistant', content: fallback });
        return fallback;
    }
}

// ------------------------------------------------------------------
//  DOM & Interface
// ------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {

    const toggleChatBtn   = document.getElementById('toggleChat');
    const closeChatBtn    = document.getElementById('closeChat');
    const puureChat       = document.getElementById('puureChat');
    const notificationDot = document.querySelector('.notification-dot');
    const chatInput       = document.querySelector('.chat-input');
    const btnSend         = document.querySelector('.btn-send');
    const chatBody        = document.getElementById('chatBody');

    let onboardingDone = false;

    // ---- Helpers UI ----

    function addMessage(html, isBot = true, delayMs = 0) {
        return new Promise(resolve => {
            setTimeout(() => {
                const wrapper = document.createElement('div');
                wrapper.className = `message ${isBot ? 'bot-message' : 'user-message'}`;

                const content = document.createElement('div');
                content.className = 'msg-content';

                const formatted = html
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/\n/g, '<br>');

                content.innerHTML = formatted;
                wrapper.appendChild(content);
                chatBody.appendChild(wrapper);
                chatBody.scrollTop = chatBody.scrollHeight;
                resolve(wrapper);
            }, delayMs);
        });
    }

    function showTyping() {
        const wrapper = document.createElement('div');
        wrapper.className = 'message bot-message typing-wrapper';
        wrapper.innerHTML = `<div class="msg-content typing-indicator">
            <span></span><span></span><span></span>
        </div>`;
        chatBody.appendChild(wrapper);
        chatBody.scrollTop = chatBody.scrollHeight;
        return wrapper;
    }

    function removeTyping(el) {
        if (el && el.parentNode === chatBody) chatBody.removeChild(el);
    }

    function addQuickActions(actions) {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'quick-actions';
        actions.forEach(({ label, query }) => {
            const chip = document.createElement('div');
            chip.className = 'chip';
            chip.textContent = label;
            chip.onclick = () => {
                chatInput.value = query;
                sendMessage();
            };
            actionsDiv.appendChild(chip);
        });
        chatBody.appendChild(actionsDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // ---- Onboarding ----

    async function startOnboarding() {
        await addMessage('Bonjour ! Je suis <strong>Puure</strong>, votre assistant EcoVerse. 🌱', true, 0);
        await addMessage('Je peux répondre à vos questions sur <strong>l\'écologie</strong> et nos 4 applications : <strong>EnerGreen</strong>, <strong>EcoQuizz</strong>, <strong>GreenMap</strong> et <strong>CleanSpot</strong>.', true, 600);
        await addMessage('Comment puis-je vous aider aujourd\'hui ?', true, 1300);

        setTimeout(() => {
            addQuickActions([
                { label: '⚡ EnerGreen – énergie',      query: 'Que fait concrètement EnerGreen ?' },
                { label: '🧠 EcoQuizz – apprendre',     query: 'Comment fonctionne EcoQuizz ?' },
                { label: '🗺️ GreenMap – carte',          query: 'À quoi sert GreenMap ?' },
                { label: '♻️ CleanSpot – déchets',       query: 'Comment CleanSpot aide à trier les déchets ?' },
                { label: '🌿 Réduire mon empreinte CO₂', query: 'Comment réduire mon empreinte carbone au quotidien ?' },
            ]);
        }, 1800);
    }

    // ---- Envoi de message ----

    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        chatInput.value = '';
        await addMessage(text, false);

        const typing = showTyping();
        const reply = await askAI(text);
        removeTyping(typing);
        await addMessage(reply, true);
    }

    // ---- Ouverture / fermeture ----

    function openChat() {
        puureChat.classList.add('open');
        if (notificationDot) notificationDot.style.display = 'none';
        if (!onboardingDone) {
            onboardingDone = true;
            startOnboarding();
        }
    }

    function closeChat() {
        puureChat.classList.remove('open');
    }

    // ---- Listeners ----

    if (toggleChatBtn) toggleChatBtn.addEventListener('click', openChat);
    if (closeChatBtn)  closeChatBtn.addEventListener('click', closeChat);
    if (btnSend)       btnSend.addEventListener('click', sendMessage);
    if (chatInput) {
        chatInput.addEventListener('keypress', e => {
            if (e.key === 'Enter') sendMessage();
        });
    }
});
