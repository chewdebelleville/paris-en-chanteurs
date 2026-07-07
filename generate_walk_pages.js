const fs = require('fs');
const path = require('path');

// Load central data to pre-populate fallbacks
const dataPath = path.join(__dirname, 'data.json');
let siteData;
try {
    const rawData = fs.readFileSync(dataPath, 'utf8');
    siteData = JSON.parse(rawData);
} catch (err) {
    console.error("Erreur lors de la lecture de data.json:", err);
    process.exit(1);
}

const playlists = siteData.playlists;

// Function to generate the HTML content for a specific walk
function generateWalkHtml(key, walk) {
    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Balade ${walk.number} : ${walk.title} — Paris en chanteurs</title>
    <meta name="description" content="Accédez instantanément à la playlist musicale pour la balade ${walk.title} de Paris en chanteurs.">
    
    <!-- Mobile-first high performance inline CSS -->
    <style>
        :root {
            --color-primary: #009f70;
            --color-primary-dark: #005c41;
            --color-primary-light: #e6f6f1;
            --color-secondary: #feecda;
            --color-text-main: #1c1c1c;
            --color-text-muted: #555555;
            --color-white: #ffffff;
            --font-serif: 'Cormorant Garamond', Georgia, serif;
            --font-sans: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
            --radius-md: 16px;
            --radius-sm: 8px;
        }

        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap');

        *, *::before, *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            background-color: var(--color-secondary);
            color: var(--color-text-main);
            font-family: var(--font-sans);
            line-height: 1.5;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            padding: 20px;
            justify-content: space-between;
            align-items: center;
        }

        .card {
            background-color: var(--color-white);
            border: 1px solid #f8dfc5;
            border-radius: var(--radius-md);
            padding: 30px 24px;
            width: 100%;
            max-width: 450px;
            box-shadow: 0 8px 24px rgba(0, 92, 65, 0.08);
            margin: auto 0;
        }

        .header-logo {
            text-align: center;
            margin-bottom: 24px;
        }

        .logo-circle {
            width: 45px;
            height: 45px;
            border-radius: 50%;
            background-color: var(--color-primary);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: var(--color-secondary);
            font-family: var(--font-serif);
            font-weight: bold;
            font-size: 1.6rem;
            margin-bottom: 8px;
        }

        .logo-text {
            display: block;
            font-family: var(--font-serif);
            font-weight: 700;
            font-size: 1.2rem;
            color: var(--color-primary-dark);
        }

        .walk-badge {
            display: inline-block;
            background-color: var(--color-primary-light);
            color: var(--color-primary-dark);
            font-weight: 700;
            font-size: 0.8rem;
            padding: 6px 14px;
            border-radius: 20px;
            margin-bottom: 12px;
        }

        .title {
            font-family: var(--font-serif);
            font-size: 1.8rem;
            color: var(--color-primary-dark);
            line-height: 1.2;
            margin-bottom: 6px;
        }

        .subtitle {
            font-size: 0.95rem;
            font-style: italic;
            color: var(--color-text-muted);
            margin-bottom: 20px;
        }

        .meta {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            background-color: #faf6f0;
            padding: 12px;
            border-radius: var(--radius-sm);
            font-size: 0.85rem;
            color: var(--color-text-muted);
            margin-bottom: 24px;
        }

        .meta-item {
            display: flex;
            align-items: center;
            gap: 6px;
            justify-content: center;
        }

        .playlist-buttons {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .playlist-btn {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 20px;
            border-radius: var(--radius-sm);
            font-weight: 700;
            font-size: 1rem;
            color: var(--color-white);
            text-decoration: none;
            transition: all 0.2s ease;
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }

        .playlist-btn:active {
            transform: scale(0.98);
        }

        .btn-spotify {
            background-color: #1DB954;
        }
        .btn-deezer {
            background-color: #A238FF;
        }
        .btn-youtube {
            background-color: #FF0000;
        }

        .playlist-btn svg {
            width: 24px;
            height: 24px;
            fill: currentColor;
        }

        .footer {
            margin-top: 30px;
            text-align: center;
        }

        .footer-link {
            color: var(--color-primary-dark);
            text-decoration: none;
            font-weight: 600;
            font-size: 0.9rem;
            border-bottom: 1px solid currentColor;
            padding-bottom: 2px;
        }
    </style>
</head>
<body>

    <div class="card">
        <div class="header-logo">
            <div class="logo-circle">P</div>
            <span class="logo-text">Paris en chanteurs</span>
        </div>

        <div style="text-align: center;">
            <span class="walk-badge">Itinéraire N° ${walk.number}</span>
            <h1 class="title" id="walkTitle">${walk.title}</h1>
            <p class="subtitle" id="walkSubtitle">${walk.subtitle}</p>
        </div>

        <div class="meta">
            <div class="meta-item">
                <span>⏱</span>
                <span id="walkDuration">${walk.duration}</span>
            </div>
            <div class="meta-item">
                <span>📍</span>
                <span id="walkDistance">${walk.distance}</span>
            </div>
        </div>

        <div class="playlist-buttons">
            <a href="${walk.spotify}" target="_blank" rel="noopener" class="playlist-btn btn-spotify" id="linkSpotify">
                <span>Écouter sur Spotify</span>
                <svg viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.565.387-.86.207-2.377-1.454-5.37-1.783-8.893-.982-.336.075-.668-.135-.745-.47-.077-.337.135-.668.47-.745 3.856-.88 7.15-.502 9.82.13.297.08.388.463.208.76zm1.223-2.72c-.226.367-.707.487-1.074.26-2.72-1.672-6.87-2.157-10.076-1.182-.413.125-.845-.107-.97-.52-.125-.413.107-.845.52-.97 3.668-1.112 8.237-.577 11.34 1.33.367.227.487.708.26 1.075zm.106-2.842C14.484 8.788 8.755 8.6 5.43 9.61c-.51.155-1.047-.137-1.202-.647-.155-.51.137-1.046.647-1.202 3.82-1.16 10.13-.95 14.28 1.514.46.273.61.87.337 1.33-.273.46-.87.61-1.33.337z"/></svg>
            </a>
            
            <a href="${walk.deezer}" target="_blank" rel="noopener" class="playlist-btn btn-deezer" id="linkDeezer">
                <span>Écouter sur Deezer</span>
                <svg viewBox="0 0 24 24"><path d="M2 17.5h3.6v3H2v-3zm0-5.5h3.6v3H2v-3zm0-5.5h3.6v3H2v-3zM7.4 17.5H11v3H7.4v-3zm0-5.5H11v3H7.4v-3zm0-5.5H11v3H7.4v-3zm0-5.5H11v3H7.4v-3zm5.4 16.5H16.4v3h-3.6v-3zm0-5.5H16.4v3h-3.6v-3zm0-5.5H16.4v3h-3.6v-3zm0-5.5H16.4v3h-3.6v-3zm5.4 11H21.8v3h-3.6v-3zm0-5.5H21.8v3h-3.6v-3zm0-5.5H21.8v3h-3.6v-3zm0-5.5H21.8v3h-3.6v-3z"/></svg>
            </a>
            
            <a href="${walk.youtube}" target="_blank" rel="noopener" class="playlist-btn btn-youtube" id="linkYoutube">
                <span>Écouter sur YouTube Music</span>
                <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
            </a>
        </div>
    </div>

    <div class="footer">
        <a href="../index.html" class="footer-link">Visiter le site complet</a>
    </div>

    <!-- Client-side script to fetch latest updates from data.json -->
    <script>
        const WALK_KEY = "${key}";
        
        // Fetch data.json to keep playlists dynamically synchronized
        fetch('../data.json')
            .then(res => {
                if (!res.ok) throw new Error("JSON fetch failed");
                return res.json();
            })
            .then(data => {
                const walk = data.playlists[WALK_KEY];
                if (walk) {
                    document.getElementById('walkTitle').textContent = walk.title;
                    document.getElementById('walkSubtitle').textContent = walk.subtitle;
                    document.getElementById('walkDuration').textContent = walk.duration;
                    document.getElementById('walkDistance').textContent = walk.distance;
                    
                    document.getElementById('linkSpotify').href = walk.spotify;
                    document.getElementById('linkDeezer').href = walk.deezer;
                    document.getElementById('linkYoutube').href = walk.youtube;
                }
            })
            .catch(err => {
                console.warn("Using offline walk fallbacks: ", err);
            });
    </script>
</body>
</html>`;
}

// Generate the 12 pages
Object.keys(playlists).forEach(key => {
    const walk = playlists[key];
    const folderPath = path.join(__dirname, key);
    
    // Create folder if it doesn't exist
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        console.log(`Dossier créé: ${key}`);
    }
    
    // Write index.html inside the folder
    const fileHtml = generateWalkHtml(key, walk);
    fs.writeFileSync(path.join(folderPath, 'index.html'), fileHtml, 'utf8');
    console.log(`Page générée: ${key}/index.html`);
});

console.log("Génération terminée avec succès !");
