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
            const footerNavLinkAgenda = document.getElementById('footerNavLinkAgenda');
            const sectionAgenda = document.getElementById('agenda');
            if (!data.agenda || data.agenda.length === 0) {
                if (navLinkAgenda) navLinkAgenda.classList.add('d-none');
                if (footerNavLinkAgenda) footerNavLinkAgenda.classList.add('d-none');
                if (sectionAgenda) sectionAgenda.classList.add('d-none');
            } else {
                if (navLinkAgenda) navLinkAgenda.classList.remove('d-none');
                if (footerNavLinkAgenda) footerNavLinkAgenda.classList.remove('d-none');
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

    // Image sources for streaming platforms
    const icons = {
        deezer: `<img src="sources/deezer-logo.svg" alt="Deezer" style="width: 24px; height: 24px;">`,
        spotify: `<img src="sources/spotify-logo.svg" alt="Spotify" style="width: 24px; height: 24px;">`,
        youtube: `<img src="sources/youtube-music-logo.svg" alt="YouTube Music" style="width: 24px; height: 24px;">`
    };

    // Render walks in grid
    function renderPlaylists(playlists) {
        if (!playlistsGrid) return;
        playlistsGrid.innerHTML = '';
        
        // Loop over the playlist keys
        Object.keys(playlists).forEach(key => {
            const walk = playlists[key];
            const card = document.createElement('article');
            card.className = 'walk-card';
            card.id = walk.id;
            
            card.innerHTML = `
                <div>
                    <h3 class="walk-title">${walk.title}</h3>
                    
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
                    
                    <p style="font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 15px;">
                        <strong>Départ :</strong> ${walk.startPoint} <br>
                        <strong>Arrivée :</strong> ${walk.endPoint}
                    </p>
                </div>
                
                <div class="playlist-buttons">
                    <a href="${walk.deezer}" target="_blank" rel="noopener" class="playlist-btn btn-deezer" aria-label="Écouter sur Deezer">
                        <span>Écouter sur Deezer</span>
                        ${icons.deezer}
                    </a>
                    <a href="${walk.spotify}" target="_blank" rel="noopener" class="playlist-btn btn-spotify" aria-label="Écouter sur Spotify">
                        <span>Écouter sur Spotify</span>
                        ${icons.spotify}
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
            item.className = 'agenda-card';
            
            const dateObj = new Date(event.date);
            const formattedDate = isNaN(dateObj.getTime()) ? event.date : dateFormatter.format(dateObj);
            
            item.innerHTML = `
                <div class="agenda-card-header">
                    <span class="agenda-type">${event.type}</span>
                    <span class="agenda-date">${formattedDate}</span>
                </div>
                <div class="agenda-card-body" style="display: flex; flex-direction: column; flex-grow: 1;">
                    <h3 class="agenda-title">${event.title}</h3>
                    <div class="agenda-time-loc" style="font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 12px; display: flex; flex-wrap: wrap; gap: 12px;">
                        <span>🕒 ${event.time}</span>
                        <span>📍 ${event.location}</span>
                    </div>
                    <p class="agenda-description" style="font-size: 0.95rem; color: var(--color-text-muted); line-height: 1.5; margin-bottom: 15px; flex-grow: 1;">${event.description}</p>
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
