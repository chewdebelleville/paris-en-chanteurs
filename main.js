/* ==========================================================================
   PARIS EN CHANTEURS - Main Javascript Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // State management
    let siteData = null;
    let currentExcerptPage = 0;
    
    // Mock Book Excerpt Pages (styled like Gallimard layouts)
    const excerptPages = [
        {
            headerLeft: "Paris en chanteurs",
            headerRight: "Introduction",
            content: `
                <h3 style="font-family: var(--font-serif); font-size: 1.8rem; text-align: center; margin-bottom: 20px; color: var(--color-primary-dark);">Prologue : Battre le pavé en musique</h3>
                <p>Paris ne s'est pas seulement construite avec des pierres, elle s'est écrite en chansons. De la butte Montmartre au canal Saint-Martin, chaque carrefour, chaque ruelle, chaque bistrot possède sa propre mélodie historique.</p>
                <p>Ce guide propose un voyage inédit. Douze itinéraires tracés sur la carte de la ville pour retrouver les esprits d'Édith Piaf, Jacques Brel, Charles Aznavour, Serge Gainsbourg ou Barbara. Équipez-vous de vos écouteurs, chaussez vos souliers, scannez le QR code de votre parcours, et laissez la nostalgie chanter à vos oreilles.</p>
            `,
            footer: "Page I"
        },
        {
            headerLeft: "Balade 1",
            headerRight: "Montmartre de Piaf",
            content: `
                <h3 style="font-family: var(--font-serif); font-size: 1.8rem; text-align: center; margin-bottom: 15px; color: var(--color-primary-dark);">L'escalier de la rue Chappe</h3>
                <p>C'est ici, sur ces marches abruptes, que la jeune Édith Gassion chantait à pleins poumons pour quelques pièces lancées des fenêtres par les habitants du quartier. La voix était déjà là, brute, immense, déchirant le brouillard parisien.</p>
                <p><em>« Quand elle chantait sur les boulevards, elle avait l'air d'une petite bête traquée »</em>, disait son premier pygmalion. En remontant vers la place du Tertre, écoutez l'écho de sa voix sur les pavés et laissez-vous emporter par l'esprit de bohème.</p>
                <div class="book-page-illustration" style="background-color: var(--color-secondary); padding: 15px; text-align: center; border: 1px dashed var(--color-primary-light);">
                    <span style="font-family: var(--font-serif); font-style: italic; font-size: 1.1rem; color: var(--color-primary-dark);">Plan de l'Itinéraire 1 : Métro Abbesses ➔ Rue Lepic ➔ Rue Saint-Vincent ➔ Basilique du Sacré-Cœur</span>
                </div>
            `,
            footer: "Page 15"
        },
        {
            headerLeft: "Balade 2",
            headerRight: "Saint-Germain",
            content: `
                <h3 style="font-family: var(--font-serif); font-size: 1.8rem; text-align: center; margin-bottom: 20px; color: var(--color-primary-dark);">Le Tabou &amp; l'Existentialisme</h3>
                <p>Sous les voûtes de pierre de la rue Dauphine résonnaient le jazz de Boris Vian et la poésie de Prévert. Juliette Gréco, silhouette noire et cheveux longs, y devint la muse absolue d'une jeunesse qui voulait vivre intensément après les années sombres.</p>
                <p>En traversant le boulevard Saint-Germain, vous passerez devant le Café de Flore et Les Deux Magots. Prenez le temps de vous asseoir sur un banc du square Laurent-Prache, là où Gréco aimait refaire le monde avec Sartre et Beauvoir au son des trompettes de la nuit.</p>
            `,
            footer: "Page 34"
        },
        {
            headerLeft: "Paris en chanteurs",
            headerRight: "Conseils pratiques",
            content: `
                <h3 style="font-family: var(--font-serif); font-size: 1.8rem; text-align: center; margin-bottom: 20px; color: var(--color-primary-dark);">Comment profiter de l'expérience ?</h3>
                <p><strong>1. Le bon matériel :</strong> Un casque audio ou des écouteurs de bonne qualité pour vous isoler du bruit de la circulation et ressentir chaque nuance musicale.</p>
                <p><strong>2. Le tempo :</strong> Marchez sans vous presser. Les balades sont conçues pour durer entre 1h30 et 2h. N'hésitez pas à faire pause sur votre playlist lors des explications historiques détaillées dans le guide.</p>
                <p><strong>3. La sécurité :</strong> Restez attentifs aux passages piétons et à l'environnement. La musique accompagne vos pas, mais Paris reste une ville en mouvement perpétuel ! Bon voyage.</p>
            `,
            footer: "Page 180"
        }
    ];

    // UI Elements
    const burgerMenu = document.getElementById('burgerMenu');
    const navLinks = document.getElementById('navLinks');
    const header = document.querySelector('header');
    
    // Dynamic Elements Containers
    const playlistsGrid = document.getElementById('playlistsGrid');
    const agendaTimeline = document.getElementById('agendaTimeline');
    const pressGrid = document.getElementById('pressGrid');
    
    // Book Excerpt Elements
    const bookPageContent = document.getElementById('bookPageContent');
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');
    const pageIndicator = document.getElementById('pageIndicator');
    
    // External links buttons
    const placeDesLibrairesBtn = document.getElementById('placeDesLibrairesBtn');
    const lesLibrairesBtn = document.getElementById('lesLibrairesBtn');
    const gallimardLinkBtn = document.getElementById('gallimardLinkBtn');
    const contactBtn = document.getElementById('contactBtn');

    // 1. Mobile navigation menu toggle
    burgerMenu.addEventListener('click', () => {
        const expanded = burgerMenu.getAttribute('aria-expanded') === 'true';
        burgerMenu.setAttribute('aria-expanded', !expanded);
        burgerMenu.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close mobile menu on link click
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            burgerMenu.setAttribute('aria-expanded', 'false');
            burgerMenu.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // 2. Sticky Header style on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Active link tracking
        highlightActiveNavLink();
    });

    function highlightActiveNavLink() {
        const scrollPosition = window.scrollY + 100;
        const sections = ['playlists', 'extrait', 'agenda', 'presse'];
        
        let activeSection = null;
        
        for (const sectionId of sections) {
            const el = document.getElementById(sectionId);
            if (el) {
                const top = el.offsetTop;
                const height = el.offsetHeight;
                if (scrollPosition >= top && scrollPosition < top + height) {
                    activeSection = sectionId;
                    break;
                }
            }
        }
        
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
            if (activeSection && link.getAttribute('href') === `#${activeSection}`) {
                link.classList.add('active');
            } else if (!activeSection && link.getAttribute('href') === '#') {
                link.classList.add('active');
            }
        });
    }

    // Teaser Player Tab Switching
    const teaserTabs = document.querySelectorAll('.teaser-tab-btn');
    const teaserIframe = document.getElementById('teaserIframe');
    
    teaserTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!siteData || !siteData.links) return;
            
            teaserTabs.forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            
            const platform = btn.getAttribute('data-platform');
            if (platform === 'spotify') {
                teaserIframe.src = siteData.links.teaserSpotify;
            } else if (platform === 'deezer') {
                teaserIframe.src = siteData.links.teaserDeezer;
            } else if (platform === 'youtube') {
                teaserIframe.src = siteData.links.teaserYoutube;
            }
        });
    });

    // 3. Excerpt Book Reader Carousel Logic
    function updateBookReader() {
        const page = excerptPages[currentExcerptPage];
        bookPageContent.innerHTML = `
            <div class="book-page-header">
                <span>${page.headerLeft}</span>
                <span>${page.headerRight}</span>
            </div>
            <div class="book-page-body">
                ${page.content}
            </div>
            <div class="book-page-footer">
                <span>${page.footer}</span>
            </div>
        `;
        
        pageIndicator.textContent = `Page ${currentExcerptPage + 1} / ${excerptPages.length}`;
        prevPageBtn.disabled = currentExcerptPage === 0;
        nextPageBtn.disabled = currentExcerptPage === excerptPages.length - 1;
    }

    prevPageBtn.addEventListener('click', () => {
        if (currentExcerptPage > 0) {
            bookPageContent.style.opacity = 0;
            setTimeout(() => {
                currentExcerptPage--;
                updateBookReader();
                bookPageContent.style.opacity = 1;
            }, 150);
        }
    });

    nextPageBtn.addEventListener('click', () => {
        if (currentExcerptPage < excerptPages.length - 1) {
            bookPageContent.style.opacity = 0;
            setTimeout(() => {
                currentExcerptPage++;
                updateBookReader();
                bookPageContent.style.opacity = 1;
            }, 150);
        }
    });

    // Initialize reader
    updateBookReader();

    // 4. Fetch dynamic data from data.json
    fetch('data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des données JSON');
            }
            return response.json();
        })
        .then(data => {
            siteData = data;
            renderPlaylists(data.playlists);
            renderAgenda(data.agenda);
            renderPress(data.press);
            updateLinks(data.links);
        })
        .catch(err => {
            console.error('Erreur:', err);
            playlistsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--color-accent-dark); font-weight: bold;">
                    Une erreur est survenue lors du chargement des playlists. Veuillez recharger la page.
                </div>
            `;
        });

    // SVG icons for streaming platforms
    const icons = {
        spotify: `<svg viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.565.387-.86.207-2.377-1.454-5.37-1.783-8.893-.982-.336.075-.668-.135-.745-.47-.077-.337.135-.668.47-.745 3.856-.88 7.15-.502 9.82.13.297.08.388.463.208.76zm1.223-2.72c-.226.367-.707.487-1.074.26-2.72-1.672-6.87-2.157-10.076-1.182-.413.125-.845-.107-.97-.52-.125-.413.107-.845.52-.97 3.668-1.112 8.237-.577 11.34 1.33.367.227.487.708.26 1.075zm.106-2.842C14.484 8.788 8.755 8.6 5.43 9.61c-.51.155-1.047-.137-1.202-.647-.155-.51.137-1.046.647-1.202 3.82-1.16 10.13-.95 14.28 1.514.46.273.61.87.337 1.33-.273.46-.87.61-1.33.337z"/></svg>`,
        deezer: `<svg viewBox="0 0 24 24"><path d="M2 17.5h3.6v3H2v-3zm0-5.5h3.6v3H2v-3zm0-5.5h3.6v3H2v-3zM7.4 17.5H11v3H7.4v-3zm0-5.5H11v3H7.4v-3zm0-5.5H11v3H7.4v-3zm0-5.5H11v3H7.4v-3zm5.4 16.5H16.4v3h-3.6v-3zm0-5.5H16.4v3h-3.6v-3zm0-5.5H16.4v3h-3.6v-3zm0-5.5H16.4v3h-3.6v-3zm5.4 11H21.8v3h-3.6v-3zm0-5.5H21.8v3h-3.6v-3zm0-5.5H21.8v3h-3.6v-3zm0-5.5H21.8v3h-3.6v-3z"/></svg>`,
        youtube: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>`
    };

    // Render walks in grid
    function renderPlaylists(playlists) {
        if (!playlistsGrid) return;
        playlistsGrid.innerHTML = '';
        
        // Loop over the keys (balade1, balade2, etc.)
        Object.keys(playlists).forEach(key => {
            const walk = playlists[key];
            const card = document.createElement('article');
            card.className = 'walk-card';
            card.id = walk.id;
            
            card.innerHTML = `
                <div>
                    <span class="walk-card-badge">N° ${walk.number}</span>
                    <span class="walk-number">Balade ${walk.number}</span>
                    <h3 class="walk-title">${walk.title}</h3>
                    <p class="walk-subtitle">${walk.subtitle}</p>
                    
                    <div class="walk-meta">
                        <div class="walk-meta-item">
                            <span>⏱</span>
                            <span>${walk.duration}</span>
                        </div>
                        <div class="walk-meta-item">
                            <span>📍</span>
                            <span>${walk.distance}</span>
                        </div>
                    </div>
                    
                    <p class="walk-description">${walk.description}</p>
                    <p style="font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 15px;">
                        <strong>Départ :</strong> ${walk.startPoint} <br>
                        <strong>Arrivée :</strong> ${walk.endPoint}
                    </p>
                </div>
                
                <div class="playlist-buttons">
                    <a href="${walk.spotify}" target="_blank" rel="noopener" class="playlist-btn btn-spotify" aria-label="Écouter sur Spotify">
                        <span>Écouter sur Spotify</span>
                        ${icons.spotify}
                    </a>
                    <a href="${walk.deezer}" target="_blank" rel="noopener" class="playlist-btn btn-deezer" aria-label="Écouter sur Deezer">
                        <span>Écouter sur Deezer</span>
                        ${icons.deezer}
                    </a>
                    <a href="${walk.youtube}" target="_blank" rel="noopener" class="playlist-btn btn-youtube" aria-label="Écouter sur YouTube Music">
                        <span>Écouter sur YouTube Music</span>
                        ${icons.youtube}
                    </a>
                </div>
            `;
            
            playlistsGrid.appendChild(card);
        });
    }

    // Render Author Agenda
    function renderAgenda(events) {
        agendaTimeline.innerHTML = '';
        
        if (!events || events.length === 0) {
            agendaTimeline.innerHTML = '<p style="text-align: center; color: var(--color-text-muted);">Aucun événement à venir pour le moment.</p>';
            return;
        }

        // Format dates beautifully
        const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        // Sort events chronologically by date
        const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));

        sortedEvents.forEach(event => {
            const item = document.createElement('div');
            item.className = 'agenda-item';
            
            const dateObj = new Date(event.date);
            const formattedDate = isNaN(dateObj.getTime()) ? event.date : dateFormatter.format(dateObj);
            
            item.innerHTML = `
                <div class="agenda-date-box">
                    <span class="agenda-date">${formattedDate} — ${event.time}</span>
                    <span class="agenda-type">${event.type}</span>
                </div>
                <div class="agenda-content">
                    <h3 class="agenda-title">${event.title}</h3>
                    <div class="agenda-location">
                        <span>📍</span> ${event.location}
                    </div>
                    <p class="agenda-description">${event.description}</p>
                    ${event.link ? `<a href="${event.link}" target="_blank" rel="noopener" class="agenda-link">En savoir plus ➔</a>` : ''}
                </div>
            `;
            
            agendaTimeline.appendChild(item);
        });
    }

    // Render Press reviews
    function renderPress(articles) {
        pressGrid.innerHTML = '';
        
        if (!articles || articles.length === 0) {
            pressGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--color-text-muted);">Aucun article de presse répertorié pour le moment.</p>';
            return;
        }

        articles.forEach(article => {
            const card = document.createElement('blockquote');
            card.className = 'press-card';
            
            card.innerHTML = `
                <div class="press-quote">
                    <p>${article.quote}</p>
                </div>
                <div class="press-meta">
                    <cite class="press-source">${article.source}</cite>
                    <span class="press-date">${article.date}</span>
                </div>
                ${article.link ? `<a href="${article.link}" target="_blank" rel="noopener" style="position: absolute; top:0; left:0; width:100%; height:100%; text-indent:-9999px;" aria-label="Lire l'article original sur ${article.source}">Lire l'article</a>` : ''}
            `;
            
            pressGrid.appendChild(card);
        });
    }

    // Update static links in buttons
    function updateLinks(links) {
        if (!links) return;
        
        if (placeDesLibrairesBtn && links.placeDesLibraires) {
            placeDesLibrairesBtn.href = links.placeDesLibraires;
        }
        if (lesLibrairesBtn && links.lesLibraires) {
            lesLibrairesBtn.href = links.lesLibraires;
        }
        if (gallimardLinkBtn && links.gallimardLink) {
            gallimardLinkBtn.href = links.gallimardLink;
        }
        if (contactBtn && links.contactEmail) {
            contactBtn.href = `mailto:${links.contactEmail}`;
            contactBtn.textContent = links.contactEmail;
        }

        // Teaser Player Embeds and profiles
        const teaserIframe = document.getElementById('teaserIframe');
        const profileSpotifyBtn = document.getElementById('profileSpotifyBtn');
        const profileDeezerBtn = document.getElementById('profileDeezerBtn');
        const profileYoutubeBtn = document.getElementById('profileYoutubeBtn');
        
        if (teaserIframe && links.teaserSpotify) {
            teaserIframe.src = links.teaserSpotify;
        }
        if (profileSpotifyBtn && links.profileSpotify) {
            profileSpotifyBtn.href = links.profileSpotify;
        }
        if (profileDeezerBtn && links.profileDeezer) {
            profileDeezerBtn.href = links.profileDeezer;
        }
        if (profileYoutubeBtn && links.profileYoutube) {
            profileYoutubeBtn.href = links.profileYoutube;
        }

        // Redesigned contact buttons with specific mail subjects
        const contactDedicaceLink = document.getElementById('contactDedicaceLink');
        const contactExtraitLink = document.getElementById('contactExtraitLink');
        const contactWalkLink = document.getElementById('contactWalkLink');

        if (contactDedicaceLink && links.contactEmail) {
            contactDedicaceLink.href = `mailto:${links.contactEmail}?subject=Paris%20en%20chanteurs%20-%20Proposition%20de%20d%C3%A9dicace`;
        }
        if (contactExtraitLink && links.contactEmail) {
            contactExtraitLink.href = `mailto:${links.contactEmail}?subject=Paris%20en%20chanteurs%20-%20Demande%20d'extrait%20de%20balade`;
        }
        if (contactWalkLink && links.contactEmail) {
            contactWalkLink.href = `mailto:${links.contactEmail}?subject=Paris%20en%20chanteurs%20-%20Balade%20physique%20avec%20Olivier`;
        }
    }
});
