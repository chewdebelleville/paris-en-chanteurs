/* ==========================================================================
   PARIS EN CHANTEURS - Admin Controller
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Configuration Supabase
    const SUPABASE_URL = window.localStorage.getItem('supabase_url') || 'https://your-project.supabase.co';
    const SUPABASE_ANON_KEY = window.localStorage.getItem('supabase_anon_key') || 'your-anon-key';

    let supabase = null;
    try {
        if (typeof window.supabase !== 'undefined') {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } else if (typeof supabasejs !== 'undefined') {
            supabase = supabasejs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
    } catch (err) {
        console.error("Erreur d'initialisation de Supabase client:", err);
    }

    let siteData = null;
    let editingItemId = null; // Track if we are editing an event or press item

    // UI Screens
    const loginScreen = document.getElementById('loginScreen');
    const adminDashboard = document.getElementById('adminDashboard');
    const loginForm = document.getElementById('loginForm');
    const adminEmail = document.getElementById('adminEmail');
    const adminPassword = document.getElementById('adminPassword');
    const loginError = document.getElementById('loginError');
    const logoutBtn = document.getElementById('logoutBtn');

    // Supabase Auth listener or session fallback
    if (supabase && SUPABASE_URL !== 'https://your-project.supabase.co') {
        supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
                showDashboard();
            } else {
                showLogin();
            }
        });
    } else {
        if (sessionStorage.getItem('admin_auth') === 'true') {
            showDashboard();
        } else {
            showLogin();
        }
    }

    // Login Form Submit
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginError.style.display = 'none';

        const email = adminEmail.value;
        const password = adminPassword.value;

        if (supabase && SUPABASE_URL !== 'https://your-project.supabase.co') {
            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password
                });
                if (error) throw error;
            } catch (err) {
                console.error("Supabase Auth Error:", err);
                loginError.textContent = "Erreur de connexion : " + (err.message || "Identifiants incorrects.");
                loginError.style.display = 'block';
                adminPassword.value = '';
                adminPassword.focus();
            }
        } else {
            // Local offline/demo fallback
            if ((email === 'admin@paris-en-chanteurs.fr' || email === 'admin@admin.com') && password === 'paris2026') {
                sessionStorage.setItem('admin_auth', 'true');
                showDashboard();
            } else if (email === 'config' && password.includes('::')) {
                const [url, key] = password.split('::');
                window.localStorage.setItem('supabase_url', url.trim());
                window.localStorage.setItem('supabase_anon_key', key.trim());
                alert("Configuration Supabase enregistrée ! Rechargement...");
                window.location.reload();
            } else {
                loginError.innerHTML = `Identifiants incorrects.<br><span style="font-size:0.8rem; font-weight:normal; opacity:0.8;">Astuce hors-ligne : Utilisez 'admin@admin.com' et 'paris2026' ou tapez 'config' en email et 'URL::ANON_KEY' en mot de passe pour enregistrer vos credentials Supabase.</span>`;
                loginError.style.display = 'block';
                adminPassword.value = '';
                adminPassword.focus();
            }
        }
    });

    // Logout click
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (supabase && SUPABASE_URL !== 'https://your-project.supabase.co') {
                await supabase.auth.signOut();
            } else {
                sessionStorage.removeItem('admin_auth');
                showLogin();
            }
        });
    }

    function showDashboard() {
        loginScreen.style.display = 'none';
        adminDashboard.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        loadSiteData();
    }

    function showLogin() {
        loginScreen.style.display = 'block';
        adminDashboard.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }

    // Tab Navigation Logic
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active-content'));

            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active-content');
        });
    });

    // Load Central JSON Data
    function loadSiteData() {
        fetch('data.json')
            .then(res => {
                if (!res.ok) throw new Error('Impossible de charger les données');
                return res.json();
            })
            .then(data => {
                siteData = data;
                initPlaylistsTab();
                initAgendaTab();
                initPressTab();
                initLinksTab();
            })
            .catch(err => {
                console.error(err);
                alert("Erreur lors du chargement de data.json. Assurez-vous que le fichier existe à la racine du projet.");
            });
    }

    // Playlists Tab
    const playlistsList = document.getElementById('adminPlaylistsList');

    function initPlaylistsTab() {
        playlistsList.innerHTML = '';
        
        Object.keys(siteData.playlists).forEach(key => {
            const walk = siteData.playlists[key];
            const card = document.createElement('div');
            card.className = 'admin-playlist-card';
            
            card.innerHTML = `
                <h3>Balade ${walk.number} : ${walk.title}</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label>Lien Spotify</label>
                        <input type="url" data-walk="${key}" data-platform="spotify" value="${walk.spotify}" placeholder="Lien de la playlist Spotify...">
                    </div>
                    <div class="form-group">
                        <label>Lien Deezer</label>
                        <input type="url" data-walk="${key}" data-platform="deezer" value="${walk.deezer}" placeholder="Lien de la playlist Deezer...">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Lien YouTube Music</label>
                        <input type="url" data-walk="${key}" data-platform="youtube" value="${walk.youtube}" placeholder="Lien de la playlist YouTube Music...">
                    </div>
                    <div class="form-group" style="display: flex; align-items: flex-end; justify-content: flex-end;">
                        <span class="save-status" id="status-${key}" style="color: var(--color-primary-dark); font-weight: bold; display: none; margin-bottom: 12px;">Enregistré en mémoire</span>
                    </div>
                </div>
            `;
            
            playlistsList.appendChild(card);
        });

        // Add change event listeners to inputs
        playlistsList.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', (e) => {
                const walkKey = e.target.getAttribute('data-walk');
                const platform = e.target.getAttribute('data-platform');
                const val = e.target.value;
                
                // Update local memory model
                siteData.playlists[walkKey][platform] = val;
                
                // Display feedback
                const statusEl = document.getElementById(`status-${walkKey}`);
                statusEl.style.display = 'inline';
                setTimeout(() => {
                    statusEl.style.opacity = 0;
                    setTimeout(() => {
                        statusEl.style.display = 'none';
                        statusEl.style.opacity = 1;
                    }, 500);
                }, 2000);
            });
        });
    }

    // Agenda Tab
    const agendaTableBody = document.getElementById('adminAgendaTableBody');
    const addEventBtn = document.getElementById('addEventBtn');
    const eventModal = document.getElementById('eventModal');
    const eventForm = document.getElementById('eventForm');
    const modalEventTitle = document.getElementById('modalEventTitle');
    
    // Modal input elements
    const eventIdInput = document.getElementById('eventId');
    const eventDateInput = document.getElementById('eventDate');
    const eventTimeInput = document.getElementById('eventTime');
    const eventTypeInput = document.getElementById('eventType');
    const eventLocationInput = document.getElementById('eventLocation');
    const eventTitleInput = document.getElementById('eventTitle');
    const eventDescriptionInput = document.getElementById('eventDescription');
    const eventLinkInput = document.getElementById('eventLink');

    function initAgendaTab() {
        renderAgendaTable();
    }

    function renderAgendaTable() {
        agendaTableBody.innerHTML = '';
        
        if (!siteData.agenda || siteData.agenda.length === 0) {
            agendaTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--color-text-muted);">Aucun événement enregistré.</td></tr>';
            return;
        }

        // Sort events by date
        siteData.agenda.sort((a, b) => new Date(a.date) - new Date(b.date));

        siteData.agenda.forEach(event => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${event.date}</strong> à ${event.time}</td>
                <td><span class="agenda-type" style="display:inline-block;">${event.type}</span></td>
                <td>${event.title}</td>
                <td>${event.location}</td>
                <td>${event.link ? `<a href="${event.link}" target="_blank" style="font-size:0.85rem;">Consulter ➔</a>` : '-'}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-outline btn-small edit-event-btn" data-id="${event.id}">Éditer</button>
                        <button class="btn btn-delete btn-small delete-event-btn" data-id="${event.id}">Suppr.</button>
                    </div>
                </td>
            `;
            
            agendaTableBody.appendChild(tr);
        });

        // Add event listeners for edit and delete buttons
        document.querySelectorAll('.edit-event-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                openEventModal(id);
            });
        });

        document.querySelectorAll('.delete-event-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                if (confirm('Voulez-vous vraiment supprimer cet événement ?')) {
                    deleteEvent(id);
                }
            });
        });
    }

    addEventBtn.addEventListener('click', () => {
        openEventModal();
    });

    function openEventModal(id = null) {
        eventForm.reset();
        editingItemId = id;
        
        if (id) {
            modalEventTitle.textContent = "Modifier l'événement";
            const event = siteData.agenda.find(e => e.id === id);
            if (event) {
                eventIdInput.value = event.id;
                eventDateInput.value = event.date;
                eventTimeInput.value = event.time;
                eventTypeInput.value = event.type;
                eventLocationInput.value = event.location;
                eventTitleInput.value = event.title;
                eventDescriptionInput.value = event.description;
                eventLinkInput.value = event.link || '';
            }
        } else {
            modalEventTitle.textContent = "Ajouter un nouvel événement";
            eventIdInput.value = '';
        }
        
        eventModal.classList.add('active');
    }

    eventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const eventData = {
            id: eventIdInput.value || 'event-' + Date.now(),
            date: eventDateInput.value,
            time: eventTimeInput.value,
            type: eventTypeInput.value,
            location: eventLocationInput.value,
            title: eventTitleInput.value,
            description: eventDescriptionInput.value,
            link: eventLinkInput.value
        };

        if (editingItemId) {
            // Update existing
            const idx = siteData.agenda.findIndex(item => item.id === editingItemId);
            if (idx !== -1) {
                siteData.agenda[idx] = eventData;
            }
        } else {
            // Create new
            if (!siteData.agenda) siteData.agenda = [];
            siteData.agenda.push(eventData);
        }

        eventModal.classList.remove('active');
        renderAgendaTable();
    });

    function deleteEvent(id) {
        siteData.agenda = siteData.agenda.filter(e => e.id !== id);
        renderAgendaTable();
    }

    // Press Tab
    const pressTableBody = document.getElementById('adminPressTableBody');
    const addPressBtn = document.getElementById('addPressBtn');
    const pressModal = document.getElementById('pressModal');
    const pressForm = document.getElementById('pressForm');
    const modalPressTitle = document.getElementById('modalPressTitle');
    
    // Modal input elements
    const pressIdInput = document.getElementById('pressId');
    const pressSourceInput = document.getElementById('pressSource');
    const pressDateInput = document.getElementById('pressDate');
    const pressQuoteInput = document.getElementById('pressQuote');
    const pressLinkInput = document.getElementById('pressLink');

    function initPressTab() {
        renderPressTable();
    }

    function renderPressTable() {
        pressTableBody.innerHTML = '';
        
        if (!siteData.press || siteData.press.length === 0) {
            pressTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--color-text-muted);">Aucun article répertorié.</td></tr>';
            return;
        }

        siteData.press.forEach(article => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${article.source}</strong></td>
                <td>${article.date}</td>
                <td style="max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">"${article.quote}"</td>
                <td>${article.link ? `<a href="${article.link}" target="_blank" style="font-size:0.85rem;">Consulter ➔</a>` : '-'}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-outline btn-small edit-press-btn" data-id="${article.id}">Éditer</button>
                        <button class="btn btn-delete btn-small delete-press-btn" data-id="${article.id}">Suppr.</button>
                    </div>
                </td>
            `;
            
            pressTableBody.appendChild(tr);
        });

        // Event listeners
        document.querySelectorAll('.edit-press-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                openPressModal(id);
            });
        });

        document.querySelectorAll('.delete-press-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                if (confirm('Voulez-vous vraiment supprimer cette citation presse ?')) {
                    deletePress(id);
                }
            });
        });
    }

    addPressBtn.addEventListener('click', () => {
        openPressModal();
    });

    function openPressModal(id = null) {
        pressForm.reset();
        editingItemId = id;

        if (id) {
            modalPressTitle.textContent = "Modifier l'article de presse";
            const press = siteData.press.find(p => p.id === id);
            if (press) {
                pressIdInput.value = press.id;
                pressSourceInput.value = press.source;
                pressDateInput.value = press.date;
                pressQuoteInput.value = press.quote;
                pressLinkInput.value = press.link || '';
            }
        } else {
            modalPressTitle.textContent = "Ajouter un nouvel article de presse";
            pressIdInput.value = '';
        }

        pressModal.classList.add('active');
    }

    pressForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const pressData = {
            id: pressIdInput.value || 'press-' + Date.now(),
            source: pressSourceInput.value,
            date: pressDateInput.value,
            quote: pressQuoteInput.value,
            link: pressLinkInput.value
        };

        if (editingItemId) {
            const idx = siteData.press.findIndex(item => item.id === editingItemId);
            if (idx !== -1) {
                siteData.press[idx] = pressData;
            }
        } else {
            if (!siteData.press) siteData.press = [];
            siteData.press.push(pressData);
        }

        pressModal.classList.remove('active');
        renderPressTable();
    });

    function deletePress(id) {
        siteData.press = siteData.press.filter(p => p.id !== id);
        renderPressTable();
    }

    // Links Tab
    const adminLinksForm = document.getElementById('adminLinksForm');
    const linkPlaceDesLibraires = document.getElementById('linkPlaceDesLibraires');
    const linkLesLibraires = document.getElementById('linkLesLibraires');
    const linkGallimard = document.getElementById('linkGallimard');
    const linkContactEmail = document.getElementById('linkContactEmail');
    const linkExcerptPdf = document.getElementById('linkExcerptPdf');
    const linkTeaserSpotify = document.getElementById('linkTeaserSpotify');
    const linkProfileSpotify = document.getElementById('linkProfileSpotify');
    const linkTeaserDeezer = document.getElementById('linkTeaserDeezer');
    const linkProfileDeezer = document.getElementById('linkProfileDeezer');
    const linkTeaserYoutube = document.getElementById('linkTeaserYoutube');
    const linkProfileYoutube = document.getElementById('linkProfileYoutube');
    const linksSaveStatus = document.getElementById('linksSaveStatus');

    function initLinksTab() {
        if (siteData.links) {
            linkPlaceDesLibraires.value = siteData.links.placeDesLibraires || '';
            linkLesLibraires.value = siteData.links.lesLibraires || '';
            linkGallimard.value = siteData.links.gallimardLink || '';
            linkContactEmail.value = siteData.links.contactEmail || '';
            linkExcerptPdf.value = siteData.links.excerptPdf || '';
            linkTeaserSpotify.value = siteData.links.teaserSpotify || '';
            linkProfileSpotify.value = siteData.links.profileSpotify || '';
            linkTeaserDeezer.value = siteData.links.teaserDeezer || '';
            linkProfileDeezer.value = siteData.links.profileDeezer || '';
            linkTeaserYoutube.value = siteData.links.teaserYoutube || '';
            linkProfileYoutube.value = siteData.links.profileYoutube || '';
        }
    }

    adminLinksForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!siteData.links) siteData.links = {};
        
        siteData.links.placeDesLibraires = linkPlaceDesLibraires.value;
        siteData.links.lesLibraires = linkLesLibraires.value;
        siteData.links.gallimardLink = linkGallimard.value;
        siteData.links.contactEmail = linkContactEmail.value;
        siteData.links.excerptPdf = linkExcerptPdf.value;
        siteData.links.teaserSpotify = linkTeaserSpotify.value;
        siteData.links.profileSpotify = linkProfileSpotify.value;
        siteData.links.teaserDeezer = linkTeaserDeezer.value;
        siteData.links.profileDeezer = linkProfileDeezer.value;
        siteData.links.teaserYoutube = linkTeaserYoutube.value;
        siteData.links.profileYoutube = linkProfileYoutube.value;

        // Show save success message
        linksSaveStatus.style.display = 'inline';
        setTimeout(() => {
            linksSaveStatus.style.display = 'none';
        }, 2000);
    });

    // Close Modals
    document.querySelectorAll('.closeModalBtn').forEach(btn => {
        btn.addEventListener('click', () => {
            eventModal.classList.remove('active');
            pressModal.classList.remove('active');
        });
    });

    // Export JSON to client
    const exportJsonBtn = document.getElementById('exportJsonBtn');
    
    exportJsonBtn.addEventListener('click', () => {
        if (!siteData) {
            alert("Aucune donnée à exporter.");
            return;
        }

        // Generate data.json download link
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(siteData, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "data.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    });
});
