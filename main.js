/* ==========================================================================
   PARIS EN CHANTEURS - Main Javascript Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // State management
    let siteData = null;

    // UI Elements
    const burgerMenu = document.getElementById('burgerMenu');
    const navLinks = document.getElementById('navLinks');
    const header = document.querySelector('header');
    
    // Dynamic Elements Containers
    const playlistsGrid = document.getElementById('playlistsGrid');
    const agendaTimeline = document.getElementById('agendaTimeline');
    const pressGrid = document.getElementById('pressGrid');
    
    // External links buttons
    const placeDesLibrairesBtn = document.getElementById('placeDesLibrairesBtn');
    const lesLibrairesBtn = document.getElementById('lesLibrairesBtn');
    const gallimardLinkBtn = document.getElementById('gallimardLinkBtn');

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
        const sections = ['concept', 'playlists', 'auteur', 'agenda', 'presse'];
        
        let activeSection = null;
        
        for (const sectionId of sections) {
            const el = document.getElementById(sectionId);
            if (el && el.offsetHeight > 0) {
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
            
            // Dynamic hiding for Agenda
            const navLinkAgenda = document.getElementById('navLinkAgenda');
            const sectionAgenda = document.getElementById('agenda');
            if (!data.agenda || data.agenda.length === 0) {
                if (navLinkAgenda) navLinkAgenda.classList.add('d-none');
                if (sectionAgenda) sectionAgenda.classList.add('d-none');
            } else {
                if (navLinkAgenda) navLinkAgenda.classList.remove('d-none');
                if (sectionAgenda) sectionAgenda.classList.remove('d-none');
                renderAgenda(data.agenda);
            }

            // Dynamic hiding for Presse
            const navLinkPresse = document.getElementById('navLinkPresse');
            const sectionPresse = document.getElementById('presse');
            if (!data.press || data.press.length === 0) {
                if (navLinkPresse) navLinkPresse.classList.add('d-none');
                if (sectionPresse) sectionPresse.classList.add('d-none');
            } else {
                if (navLinkPresse) navLinkPresse.classList.remove('d-none');
                if (sectionPresse) sectionPresse.classList.remove('d-none');
                renderPress(data.press);
            }

            renderPlaylists(data.playlists);
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
        const contactFooterBtn = document.getElementById('contactFooterBtn');
        if (contactFooterBtn && links.contactEmail) {
            contactFooterBtn.href = `mailto:${links.contactEmail}`;
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
    }
});
