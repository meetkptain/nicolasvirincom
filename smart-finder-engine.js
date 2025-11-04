/**
 * ⚓ SMART FINDER ENGINE
 * Chatbot conversationnel intelligent pour qualifier les leads
 */

class SmartFinder {
    constructor(configUrl) {
        this.configUrl = configUrl;
        this.config = null;
        this.state = {
            email: null,
            answers: {},
            currentStep: 'email',
            recommendations: []
        };
        
        this.modal = null;
        this.content = null;
        this.isSubmitting = false;  // ✅ Flag de protection contre double soumission
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Début init Smart Finder...');
        try {
            // Utiliser config inliné si disponible (optimisation performance)
            if (window.smartFinderConfig) {
                console.log('✅ Config inlinée trouvée (chargement instantané)');
                this.config = window.smartFinderConfig;
            } else {
                // Fallback : charger config depuis URL
                console.log('📦 Chargement config depuis URL:', this.configUrl);
            const response = await fetch(this.configUrl);
            
            // Debug: voir le contenu reçu
            const contentType = response.headers.get('content-type');
            console.log('📄 Content-Type:', contentType);
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
            }
            
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('❌ Contenu reçu (pas JSON):', text.substring(0, 200));
                throw new Error('Le serveur n\'a pas renvoyé du JSON. URL: ' + this.configUrl);
            }
            
            this.config = await response.json();
                console.log('✅ Config chargée depuis URL:', this.config);
            }
            
            // Créer modal
            console.log('🏗️ Création modal...');
            this.createModal();
            
            // Préparer événements
            console.log('🔌 Attache événements...');
            this.attachEvents();
            
            console.log('✅ Smart Finder initialisé');
        } catch (error) {
            console.error('❌ Erreur initialisation Smart Finder:', error);
            alert('Erreur chargement Smart Finder: ' + error.message);
        }
    }
    
    createModal() {
        // Créer container modal
        const modalHTML = `
            <div id="captain-smart-finder-modal" class="smart-finder-modal" style="display: none;">
                <div class="smart-finder-wrapper">
                    <div class="smart-finder-header">
                        <span class="smart-finder-title">🎯 Smart Finder (NicolasVirin.com)</span>
                        <button class="smart-finder-close" onclick="window.smartFinder.close()">×</button>
                    </div>
                    <div class="smart-finder-content" id="smartFinderContent"></div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('captain-smart-finder-modal');
        this.content = document.getElementById('smartFinderContent');
        
        // Créer popup email
        this.createEmailPopup();
    }
    
    createEmailPopup() {
        console.log('📧 Création popup email...');
        const popupHTML = `
            <div id="captain-email-popup" class="captain-email-popup" style="display: none;">
                <div class="popup-overlay" onclick="window.smartFinder.closeEmailPopup()"></div>
                <div class="popup-content">
                    <h2>🎯 Trouve ton app en 2 min</h2>
                    <p class="popup-subtitle">100% gratuit • Essai 14j inclus</p>
                    <form id="captainEmailForm">
                        <input 
                            type="email" 
                            id="captainEmailInput"
                            placeholder="ton@email.com" 
                            required 
                            autocomplete="email"
                        >
                        <button type="submit" class="btn-captain-primary">Commencer →</button>
                    </form>
                    <p class="popup-note">✅ Pas de CB • ✅ Actif en 24-48h • ✅ Support inclus</p>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', popupHTML);
        console.log('✅ Popup email créée dans le DOM');
    }
    
    attachEvents() {
        // Email popup submit
        const emailForm = document.getElementById('captainEmailForm');
        if (emailForm) {
            emailForm.addEventListener('submit', (e) => this.handleEmailSubmit(e));
        }
        
        // Close button
        const closeBtn = document.querySelector('.smart-finder-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }
    }
    
    async handleEmailSubmit(e) {
        e.preventDefault();
        
        // ✅ Protéger contre double soumission
        if (this.isSubmitting) {
            console.log('⚠️ Submit déjà en cours');
            return;
        }
        
        this.isSubmitting = true;
        
        const emailInput = document.getElementById('captainEmailInput');
        const email = emailInput.value.trim();
        
        if (!email) {
            this.isSubmitting = false;
            return;
        }
        
        this.state.email = email;
        
        // ✅ Sauvegarder email et timestamp dans localStorage
        localStorage.setItem('captain_last_email', email);
        localStorage.setItem('captain_email_timestamp', Date.now().toString());
        console.log('💾 Email sauvegardé dans localStorage');
        
        // Désactiver bouton
        const submitBtn = document.querySelector('#captainEmailForm button');
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ Enregistrement...';
        
        try {
            // Appeler API immédiatement
            const apiUrl = this.config.api.endpoint;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Fermer popup email
                this.closeEmailPopup();
                
                // Ouvrir Smart Finder
                setTimeout(() => {
                    this.showSmartFinder();
                    this.startConversation();
                }, 500);
            } else {
                alert('Erreur : ' + (data.message || 'Impossible de créer votre compte'));
                submitBtn.disabled = false;
                submitBtn.textContent = 'Commencer →';
            }
            
            this.isSubmitting = false;  // ✅ Reset flag après succès/erreur
        } catch (error) {
            console.error('❌ Erreur API:', error);
            alert('Erreur API : ' + error.message);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Commencer →';
            
            this.isSubmitting = false;  // ✅ Reset flag après erreur
        }
    }
    
    showEmailPopup() {
        console.log('📧 Affichage popup email...');
        const popup = document.getElementById('captain-email-popup');
        
        // ✅ Vérifier si déjà ouverte
        if (popup && popup.style.display === 'flex') {
            console.log('⚠️ Popup déjà affichée');
            return;
        }
        
        if (popup) {
            popup.style.display = 'flex';
            console.log('✅ Popup email affichée');
            
            // ✅ RÉINITIALISER le bouton et le flag à chaque ouverture
            const submitBtn = document.querySelector('#captainEmailForm button');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Commencer →';
            }
            this.isSubmitting = false;
            
            // Focus sur input
            setTimeout(() => {
                const input = document.getElementById('captainEmailInput');
                if (input) {
                    // ✅ PRÉREMPLIR avec email sauvegardé si < 30 min
                    const savedEmail = localStorage.getItem('captain_last_email');
                    const emailTimestamp = localStorage.getItem('captain_email_timestamp');
                    
                    if (savedEmail && emailTimestamp) {
                        const elapsed = Date.now() - parseInt(emailTimestamp);
                        const thirtyMinutes = 30 * 60 * 1000;  // 30 minutes
                        
                        if (elapsed < thirtyMinutes) {
                            input.value = savedEmail;
                            console.log('✅ Email prérempli depuis localStorage');
                        } else {
                            // Expiré → effacer
                            localStorage.removeItem('captain_last_email');
                            localStorage.removeItem('captain_email_timestamp');
                            console.log('⏰ Email expiré (> 30 min)');
                        }
                    }
                    
                    input.focus();
                }
            }, 100);
        } else {
            console.error('❌ Popup email non trouvée dans le DOM');
            alert('Erreur: Popup email non initialisée. Rechargez la page.');
        }
    }
    
    closeEmailPopup() {
        const popup = document.getElementById('captain-email-popup');
        if (popup) {
            popup.style.display = 'none';
        }
        
        // ✅ Reset seulement le champ input
        const emailInput = document.getElementById('captainEmailInput');
        if (emailInput) {
            emailInput.value = '';
        }
        // ❌ NE PAS réinitialiser this.state.email - il doit rester pour submitForm()
        this.isSubmitting = false;
    }
    
    showSmartFinder() {
        if (this.modal) {
            this.modal.style.display = 'block';
            this.content.innerHTML = '<div class="smart-finder-loading">⏳ Chargement...</div>';
        }
    }
    
    close() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
        
        // ✅ Reset intelligent : Garder email si < 30 min, reset le reste
        this.reset();
        this.isSubmitting = false;
    }
    
    reset() {
        // ✅ Vérifier localStorage avant reset (garder email si récent < 30 min)
        const savedEmail = localStorage.getItem('captain_last_email');
        const savedTimestamp = localStorage.getItem('captain_email_timestamp');
        
        if (savedEmail && savedTimestamp) {
            const isRecent = (Date.now() - parseInt(savedTimestamp)) < 30 * 60 * 1000;
            
            if (isRecent) {
                console.log('✅ Email récent conservé (< 30 min)');
                // Ne PAS effacer email si récent
                this.state.email = savedEmail;
            } else {
                console.log('⏰ Email expiré (> 30 min), reset complet');
                // Reset complet car expiré
                this.state = {
                    email: null,
                    answers: {},
                    currentStep: 'email',
                    recommendations: []
                };
            }
        } else {
            // Reset complet si pas de données sauvegardées
            this.state = {
                email: null,
                answers: {},
                currentStep: 'email',
                recommendations: []
            };
        }
        
        // Reset answers et recommendations (permettre nouveau Smart Finder)
        this.state.answers = {};
        this.state.recommendations = [];
        
        // Clear modal content
        if (this.content) {
            this.content.innerHTML = '';
        }
        
        // Reset email input
        const emailInput = document.getElementById('captainEmailInput');
        if (emailInput) {
            emailInput.value = '';
        }
        
        // Reset prefilled
        this.prefilledApp = null;
        this.prefilledBundle = null;
        
        console.log('✅ Smart Finder reset (garde email si < 30 min)');
    }
    
    async startConversation() {
        // ✅ Vérifier config avant utilisation
        if (!this.config || !this.config.questions) {
            console.error('❌ Config non chargée');
            await this.showMessage('❌ Erreur: Configuration non chargée. Rechargez la page.');
            this.close();
            return;
        }
        
        const question = this.config.questions[0]; // Question unique pour v1
        
        await this.delay(this.config.settings.typing_delay);
        
        // Afficher intro avec typewriter
        await this.showMessage(this.config.settings.intro_message, 'typing');
        
        await this.delay(this.config.settings.typing_delay);
        
        // Afficher question (fade normal)
        await this.showMessage(question.text);
        
        await this.delay(this.config.settings.button_delay);
        
        // Afficher options
        this.showOptions(question);
    }
    
    async showMessage(text, type = 'normal') {
        // ✅ Animation typewriter pour messages importants
        if (type === 'typing' && this.config?.settings?.typing_effect !== false) {
            await this.showMessageTyping(text);
            return;
        }
        
        // ✅ Animation fade pour messages normaux
        const messageHTML = `
            <div class="smart-message bot animate-fade-in">
                ${text}
            </div>
        `;
        
        this.content.insertAdjacentHTML('beforeend', messageHTML);
        
        // Trigger animation
        const messageEl = this.content.querySelector('.smart-message:last-child');
        requestAnimationFrame(() => {
            messageEl.classList.add('visible');
        });
        
        this.scrollToBottom();
        
        // Pause pour lecture
        await this.delay(500);
    }
    
    /**
     * Affichage avec effet typewriter (lettre par lettre)
     */
    async showMessageTyping(text) {
        const messageHTML = `
            <div class="smart-message bot typing-message">
                <span class="typing-text"></span>
                <span class="typing-cursor">|</span>
            </div>
        `;
        
        this.content.insertAdjacentHTML('beforeend', messageHTML);
        this.scrollToBottom();
        
        const textEl = this.content.querySelector('.smart-message:last-child .typing-text');
        const cursorEl = this.content.querySelector('.smart-message:last-child .typing-cursor');
        
        // Typewriter effect
        for (let i = 0; i < text.length; i++) {
            textEl.textContent += text[i];
            await this.delay(20); // Speed
            this.scrollToBottom();
        }
        
        // Hide cursor
        cursorEl.style.display = 'none';
        
        // Pause pour lecture
        await this.delay(300);
    }
    
    showOptions(question) {
        let optionsHTML = '<div class="smart-options">';
        
        question.options.forEach((option, index) => {
            optionsHTML += `
                <button 
                    class="smart-option-btn" 
                    data-value="${option.value}" 
                    data-weight="${option.weight}"
                    style="animation-delay: ${index * 0.1}s"
                    onclick="window.smartFinder.handleOptionClick('${option.value}', ${option.weight})"
                >
                    ${option.icon} ${option.label}
                </button>
            `;
        });
        
        optionsHTML += '</div>';
        this.content.insertAdjacentHTML('beforeend', optionsHTML);
        this.scrollToBottom();
    }
    
    handleOptionClick(value, weight) {
        // Enregistrer réponse
        this.state.answers.sector = value;
        
        // Afficher message "selectionné"
        this.showMessage(`Super choix 🔍 Je scanne nos apps pour toi...`);
        
        // Calculer recommandations
        setTimeout(() => {
            this.calculateAndShowResults();
        }, 1500);
    }
    
    calculateRecommendations() {
        const appScores = {};
        
        // Pour chaque app
        Object.keys(this.config.apps).forEach(appId => {
            const app = this.config.apps[appId];
            let score = 0;
            
            // Score selon secteur
            if (this.state.answers.sector === app.category) {
                score += app.min_score;
            } else if (this.state.answers.sector === 'general') {
                score += app.min_score * 0.5; // Moitié pour "Autre secteur"
            }
            
            // ✅ BONUS : Apps Featured (top priority)
            if (app.featured) {
                score += 15;
            }
            
            // ✅ BONUS : Social proof (signe de confiance)
            if (app.social_proof) {
                score += 5;
            }
            
            // ✅ BONUS : Lifetime pricing (engagement élevé)
            if (app.has_lifetime) {
                score += 5;
            }
            
            // App minimum si score >= seuil
            if (score >= app.min_score) {
                appScores[appId] = {
                    app: app,
                    score: score
                };
            }
        });
        
        // ✅ Trier : Featured apps en premier, puis par score
        const recommendations = Object.values(appScores)
            .sort((a, b) => {
                // Featured apps en premier
                if (a.app.featured && !b.app.featured) return -1;
                if (!a.app.featured && b.app.featured) return 1;
                
                // Puis par score décroissant
                return b.score - a.score;
            })
            .slice(0, this.config.settings.max_recommendations);
        
        // Fallback si pas assez
        if (recommendations.length < this.config.settings.min_recommendations && this.config.fallback.enabled) {
            return this.getFallbackApps();
        }
        
        return recommendations;
    }
    
    getFallbackApps() {
        return this.config.fallback.apps.map(appId => ({
            app: this.config.apps[appId],
            score: 25 // Score fallback
        }));
    }
    
    async calculateAndShowResults() {
        const recommendations = this.calculateRecommendations();
        this.state.recommendations = recommendations;
        
        // Afficher résultats
        await this.showMessage(this.config.messages.results);
        
        await this.delay(300);
        
        // Afficher les apps
        recommendations.forEach((rec, index) => {
            this.showAppCard(rec.app, rec.score, index);
        });
    }
    
    showAppCard(app, score, index) {
        // Gérer ancien format (pricing: number) et nouveau (pricing: {monthly, lifetime})
        let priceHTML;
        if (typeof app.pricing === 'object' && app.pricing.monthly) {
            // Nouveau format
            const monthlyPrice = app.pricing.monthly;
            if (app.has_lifetime && app.pricing.lifetime) {
                priceHTML = `
                    <div class="app-pricing-flex">
                        <span class="monthly">${monthlyPrice}€/mois</span>
                        <span class="divider">OU</span>
                        <span class="lifetime">${app.pricing.lifetime}€ lifetime</span>
                    </div>
                    <p style="font-size:0.85rem; color:#10b981; margin-top:0.5rem;">💰 Économie après ${Math.ceil((app.pricing.lifetime / monthlyPrice))} mois</p>
                `;
            } else {
                priceHTML = `<div class="app-price">${monthlyPrice}€<span>/mois</span></div>`;
            }
        } else {
            // Ancien format (backward compatibility)
            priceHTML = `<div class="app-price">${app.pricing}€<span>/mois</span></div>`;
        }
        
        const socialProof = app.social_proof ? `<div class="app-social-proof">${app.social_proof}</div>` : '';
        const isFeatured = app.featured || false;
        
        // Badge Featured
        let badgesToShow = [...(app.badges || [])];
        if (isFeatured) {
            badgesToShow.unshift('⭐ Featured');
        }
        
        // Afficher modules si présents
        let modulesHTML = '';
        if (app.modules && typeof app.modules === 'object') {
            modulesHTML = `
                <div class="app-modules">
                    <div class="modules-title">📦 Contenu inclus :</div>
                    <div class="modules-list">
                        ${Object.entries(app.modules).map(([key, value]) => 
                            `<div class="module-item"><strong>${key}</strong>: ${value}</div>`
                        ).join('')}
                    </div>
                </div>
            `;
        }
        
        const cardHTML = `
            <div class="smart-app-card ${isFeatured ? 'featured' : ''}" style="animation-delay: ${index * 0.15}s">
                ${badgesToShow.length > 0 ? `<div class="app-badges-header">${badgesToShow.map(b => `<span class="app-badge ${b.includes('Featured') ? 'featured-badge' : ''}">${b}</span>`).join('')}</div>` : ''}
                <div class="app-header">
                    <span class="app-icon">${app.icon}</span>
                    <div class="app-info">
                        <h4>${app.name}</h4>
                        <p class="app-description">${app.description}</p>
                    </div>
                </div>
                ${socialProof}
                ${modulesHTML}
                <div class="app-match">
                    <span class="match-badge">${score}% match</span>
                </div>
                <div class="app-details">
                    ${priceHTML}
                    <div class="app-setup">⚡ ${app.setup_time}</div>
                </div>
                <button 
                    class="btn-app-select" 
                    onclick="window.smartFinder.selectApp('${app.id}')"
                >
                    Essayer gratuitement →
                </button>
            </div>
        `;
        
        this.content.insertAdjacentHTML('beforeend', cardHTML);
        this.scrollToBottom();
    }
    
    async selectApp(appId) {
        // ✅ Protéger contre double soumission
        if (this.isSubmitting) {
            console.log('⚠️ Selection déjà en cours');
            return;
        }
        
        this.isSubmitting = true;
        
        try {
            const app = this.config.apps[appId];
            
            // 🚀 ÉTAPE 1 : Envoyer email immédiatement (lead sauvegardé)
            await this.submitLeadImmediate(app);
            
            // Afficher confirmation email
            await this.showMessage(this.config.messages.email_sent);
            await this.delay(2000);  // 2 sec pour lire
            
            // 🎯 ÉTAPE 2 : Formulaire contextuel (si app nécessite)
            await this.showMessage(this.config.messages.form_intro);
            
            if (app.form_questions && app.form_questions.length > 0) {
                this.showContextualForm(app);
            } else {
                // Pas de formulaire → direct enrichment
                await this.showEnrichmentForm(app);
            }
        } catch (error) {
            console.error('❌ Erreur sélection app:', error);
            this.isSubmitting = false;
        }
    }
    
    /**
     * Soumettre le lead IMMÉDIATEMENT (juste email + app)
     * Objectif : Sauvegarder le lead même si abandon après
     * ✅ PERMET plusieurs Smart Finder pour le même email (app différente)
     */
    async submitLeadImmediate(app) {
        // ✅ Vérifier si déjà envoyé POUR CETTE APP (24h protection)
        const leadKey = 'captain_lead_sent_' + this.state.email + '_' + app.id;
        const emailSent = localStorage.getItem(leadKey);
        
        if (emailSent) {
            const sentTimestamp = parseInt(emailSent);
            const isRecent = (Date.now() - sentTimestamp) < 24 * 60 * 60 * 1000; // 24h
            
            if (isRecent) {
                const minutesAgo = Math.floor((Date.now() - sentTimestamp) / 1000 / 60);
                console.log(`⏭️ Lead pour ${app.id} envoyé il y a ${minutesAgo} min, skip (protection 24h)`);
                return;
            } else {
                console.log('⏰ Lead ancien (> 24h), permettre nouveau lead pour cette app');
                // Nettoyer ancien
                localStorage.removeItem(leadKey);
            }
        }
        
        const leadData = {
            email: this.state.email,
            app_interest: app.id,
            category: app.category
        };
        
        try {
            const response = await fetch(this.config.api.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(leadData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                // ✅ Marquer comme envoyé POUR CETTE APP (avec app ID)
                localStorage.setItem(leadKey, Date.now().toString());
                console.log('✅ Lead immédiat soumis pour ' + app.id);
            }
        } catch (error) {
            console.error('❌ Erreur soumission immédiate:', error);
        }
    }
    
    /**
     * Afficher le formulaire d'enrichissement (nom, téléphone)
     * Optionnel avec localStorage intelligent
     */
    async showEnrichmentForm(app) {
        // Vérifier localStorage pour préremplissage
        const savedFirstName = localStorage.getItem('captain_last_firstName');
        const savedLastName = localStorage.getItem('captain_last_lastName');
        const savedPhone = localStorage.getItem('captain_last_phone');
        const savedTimestamp = localStorage.getItem('captain_enrichment_timestamp');
        
        const isRecent = savedTimestamp && (Date.now() - parseInt(savedTimestamp)) < 30 * 60 * 1000; // 30 min
        
        // ✅ Auto-submit si données récentes ET complètes
        if (isRecent && savedFirstName && savedPhone) {
            console.log('✅ Données récentes trouvées dans localStorage - Auto-submit');
            await this.submitEnrichment(app, {
                firstName: savedFirstName,
                lastName: savedLastName || '',
                phone: savedPhone
            });
            return;
        }
        
        // ✅ Check si lead déjà complété
        const emailCompleted = localStorage.getItem('captain_lead_completed_' + this.state.email);
        if (emailCompleted) {
            console.log('✅ Lead déjà complété, fermeture directe');
            await this.showMessage(this.config.messages.success);
            setTimeout(() => { this.close(); }, 3000);
            return;
        }
        
        // Afficher formulaire d'enrichissement
        const enrichmentHTML = `
            <form id="enrichmentForm" class="smart-form">
                <p style="color: #6b7280; margin-bottom: 1rem;">Ces infos me permettent de te contacter directement</p>
                
                <label>Prénom (optionnel)</label>
                <input 
                    type="text" 
                    name="firstName" 
                    placeholder="Jean"
                    value="${savedFirstName || ''}"
                >
                
                <label>Nom de famille (optionnel)</label>
                <input 
                    type="text" 
                    name="lastName" 
                    placeholder="Dupont"
                    value="${savedLastName || ''}"
                >
                
                <label>Téléphone (optionnel)</label>
                <input 
                    type="tel" 
                    name="phone" 
                    placeholder="+33 6 12 34 56 78"
                    value="${savedPhone || ''}"
                >
                
                <div style="display: flex; gap: 10px; margin-top: 1rem;">
                    <button type="submit" class="btn-captain-primary" style="flex: 1;">
                        Envoyer →
                    </button>
                    <button type="button" class="btn-captain-secondary" onclick="window.smartFinder.skipEnrichment()">
                        Passer →
                    </button>
                </div>
            </form>
        `;
        
        this.content.insertAdjacentHTML('beforeend', enrichmentHTML);
        this.scrollToBottom();
        
        // Attacher événements
        document.getElementById('enrichmentForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = {};
            formData.forEach((value, key) => { data[key] = value; });
            
            await this.submitEnrichment(app, data);
        });
    }
    
    /**
     * Soumettre les données d'enrichissement
     */
    async submitEnrichment(app, enrichmentData) {
        // Sauvegarder dans localStorage (30 min)
        if (enrichmentData.firstName) {
            localStorage.setItem('captain_last_firstName', enrichmentData.firstName);
        }
        if (enrichmentData.lastName) {
            localStorage.setItem('captain_last_lastName', enrichmentData.lastName);
        }
        if (enrichmentData.phone) {
            localStorage.setItem('captain_last_phone', enrichmentData.phone);
        }
        localStorage.setItem('captain_enrichment_timestamp', Date.now().toString());
        
        // ✅ Récupérer données contextuelles du localStorage
        const restaurantName = localStorage.getItem('captain_last_restaurant_name') || '';
        const restaurantTables = localStorage.getItem('captain_last_restaurant_tables') || '';
        const productsCount = localStorage.getItem('captain_last_products_count') || '';
        
        // ✅ Extraire modules si présents (ex: SmartSchool)
        const modules = app.modules ? JSON.stringify(app.modules) : '';
        
        // Soumettre données enrichies + contextuelles
        const leadData = {
            email: this.state.email,
            firstName: enrichmentData.firstName || '',
            lastName: enrichmentData.lastName || '',  // ✅ Nom de famille
            phone: enrichmentData.phone || '',
            app_interest: app.id,
            category: app.category,
            restaurant_name: restaurantName,  // ✅ Contexte RestaurantOS
            restaurant_tables: restaurantTables,  // ✅ Contexte RestaurantOS
            products_count: productsCount,  // ✅ Contexte ShopReady
            modules: modules  // ✅ Modules SmartSchool
        };
        
        try {
            const response = await fetch(this.config.api.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(leadData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                // ✅ Marquer comme complété dans localStorage
                if (this.state.email) {
                    localStorage.setItem('captain_lead_completed_' + this.state.email, Date.now().toString());
                }
                
                await this.showMessage(this.config.messages.enrichment_success);
            } else {
                await this.showMessage(this.config.messages.success);
            }
            
            this.isSubmitting = false;
            
            // Fermer après 3s
            setTimeout(() => {
                this.close();
            }, 3000);
            
        } catch (error) {
            console.error('Erreur enrichissement:', error);
            this.isSubmitting = false;
            await this.showMessage(this.config.messages.success);
            setTimeout(() => { this.close(); }, 3000);
        }
    }
    
    /**
     * Skip l'enrichissement
     */
    async skipEnrichment() {
        // ✅ Marquer comme terminé dans localStorage
        if (this.state.email) {
            localStorage.setItem('captain_lead_completed_' + this.state.email, Date.now().toString());
        }
        
        await this.showMessage(this.config.messages.success);
        setTimeout(() => {
            this.close();
        }, 3000);
    }
    
    showContextualForm(app) {
        let formHTML = '<form id="contextualForm" class="smart-form">';
        
        app.form_questions.forEach(q => {
            if (q.type === 'text') {
                formHTML += `
                    <label>${q.label}</label>
                    <input 
                        type="text" 
                        name="${q.id}" 
                        placeholder="${q.placeholder || ''}"
                        ${q.required ? 'required' : ''}
                    >
                `;
            } else if (q.type === 'select') {
                formHTML += `
                    <label>${q.label}</label>
                    <select name="${q.id}" ${q.required ? 'required' : ''}>
                        ${q.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                    </select>
                `;
            }
        });
        
        const savedFirstName = localStorage.getItem('captain_last_firstName');
        const savedPhone = localStorage.getItem('captain_last_phone');
        
        // ✅ Préremplir les données contextuelles
        const savedRestaurantName = localStorage.getItem('captain_last_restaurant_name');
        const savedRestaurantTables = localStorage.getItem('captain_last_restaurant_tables');
        const savedProductsCount = localStorage.getItem('captain_last_products_count');
        
        // Ajouter bouton Skip si contexte optionnel
        formHTML += `
            <div style="display: flex; gap: 10px; margin-top: 1rem;">
                <button type="submit" class="btn-captain-primary" style="flex: 1;">Continuer →</button>
                <button type="button" class="btn-captain-secondary" onclick="window.smartFinder.skipEnrichment()">
                    Passer →
                </button>
            </div>
        </form>
        `;
        
        this.content.insertAdjacentHTML('beforeend', formHTML);
        
        // ✅ Préremplir toutes les données récentes
        const allInputs = document.querySelectorAll('#contextualForm input, #contextualForm select');
        allInputs.forEach(input => {
            const fieldName = input.name;
            
            // Préremplir selon le champ
            if (fieldName === 'firstName' && savedFirstName) {
                input.value = savedFirstName;
            } else if (fieldName === 'phone' && savedPhone) {
                input.value = savedPhone;
            } else if (fieldName === 'restaurant_name' && savedRestaurantName) {
                input.value = savedRestaurantName;
            } else if (fieldName === 'tables' && savedRestaurantTables) {
                input.value = savedRestaurantTables;
            } else if (fieldName === 'products_count' && savedProductsCount) {
                input.value = savedProductsCount;
            }
        });
        
        this.scrollToBottom();
        
        // Attacher événement
        const form = document.getElementById('contextualForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit(app);
        });
    }
    
    async handleFormSubmit(selectedApp) {
        const form = document.getElementById('contextualForm');
        const formData = new FormData(form);
        const data = {};
        
        formData.forEach((value, key) => {
            data[key] = value;
        });
        
        // ✅ Sauvegarder les données contextuelles dans localStorage (30 min)
        if (data.restaurant_name) {
            localStorage.setItem('captain_last_restaurant_name', data.restaurant_name);
        }
        if (data.tables) {
            localStorage.setItem('captain_last_restaurant_tables', data.tables);
        }
        if (data.products_count) {
            localStorage.setItem('captain_last_products_count', data.products_count);
        }
        
        // Après soumission du formulaire contextuel, passer à l'enrichissement
        await this.showEnrichmentForm(selectedApp);
    }
    
    async submitForm(app, formData) {
        // ✅ Protéger contre double soumission
        if (this.isSubmitting) {
            console.log('⚠️ Submit déjà en cours');
            return;
        }
        
        this.isSubmitting = true;
        
        // Désactiver form
        const form = document.getElementById('contextualForm');
        if (form) form.querySelector('button').disabled = true;
        
        try {
            // Extraire les réponses contextuelles
            const contextualData = {
                restaurant_name: formData.restaurant_name || '',
                tables: formData.tables || '',
                products_count: formData.products_count || ''
            };
            
            // ✅ Extraire modules si présents (ex: SmartSchool)
            const modules = app.modules ? JSON.stringify(app.modules) : '';
            
            // Préparer données complètes
            const leadData = {
                email: this.state.email,
                firstName: '',
                lastName: '',
                company: '',
                phone: '',
                app_interest: app.id,
                category: app.category,  // Ajouter catégorie
                restaurant_name: contextualData.restaurant_name,
                restaurant_tables: contextualData.tables,
                products_count: contextualData.products_count,
                modules: modules,  // ✅ Ajouter modules pour SmartSchool
                message: JSON.stringify(formData)  // Backup
            };
            
            // Debug : afficher les données envoyées
            console.log('📤 SMART FINDER → PLUGIN (submitEnrichment)');
            console.log('📦 Données complètes envoyées:', leadData);
            console.log('🔗 Endpoint:', this.config.api.endpoint);
            
            // Appeler API
            const response = await fetch(this.config.api.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(leadData)
            });
            
            const data = await response.json();
            
            // Debug : afficher la réponse
            console.log('📥 PLUGIN → SMART FINDER');
            console.log('✅ Réponse reçue:', data);
            
            if (data.success) {
                // ✅ Success → Effacer email sauvegardé
                localStorage.removeItem('captain_last_email');
                localStorage.removeItem('captain_email_timestamp');
                console.log('🗑️ Email effacé de localStorage (soumission réussie)');
                
                // Afficher success
                await this.showMessage(this.config.messages.success);
                
                // Fermer après 3s
                setTimeout(() => {
                    this.close();
                }, 3000);
                
                this.isSubmitting = false;  // ✅ Reset flag après succès
            } else {
                await this.showMessage('❌ Erreur : ' + (data.message || 'Impossible de finaliser'));
                this.isSubmitting = false;  // ✅ Reset flag après erreur
            }
        } catch (error) {
            console.error('❌ Erreur soumission:', error);
            await this.showMessage('❌ Erreur réseau. Réessayez plus tard.');
            
            this.isSubmitting = false;  // ✅ Reset flag après erreur
        }
    }
    
    scrollToBottom() {
        if (this.content) {
            this.content.scrollTop = this.content.scrollHeight;
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialiser globalement
let smartFinder = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 Initialisation Smart Finder...');
    
    // Créer instance globale
    try {
        window.smartFinder = new SmartFinder('smart-finder-config.json');
        
        // Attacher événements CTA avec délai pour laisser le temps à l'init
        setTimeout(() => {
            const ctas = document.querySelectorAll('[data-smart-finder]');
            console.log('📌 CTAs trouvés:', ctas.length);
            
            ctas.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('👆 Clic sur CTA Smart Finder');
                    
                    // Lire data-app ou data-bundle pour prefill
                    const appId = btn.getAttribute('data-app');
                    const bundleId = btn.getAttribute('data-bundle');
                    const action = btn.getAttribute('data-action');
                    
                    if (window.smartFinder) {
                        // Si action=demo, ouvrir démo
                        if (action === 'demo' && appId) {
                            console.log('🎯 Mode démo pour app:', appId);
                            // TODO: Implémenter ouverture démo
                        }
                        
                        // Stocker app/bundle pré-sélectionné
                        window.smartFinder.prefilledApp = appId;
                        window.smartFinder.prefilledBundle = bundleId;
                        
                        window.smartFinder.showEmailPopup();
                    } else {
                        console.error('❌ SmartFinder not initialized');
                        alert('Smart Finder non initialisé. Vérifiez la console pour les erreurs.');
                    }
                });
            });
        }, 1000);
        
    } catch (error) {
        console.error('❌ Erreur initialisation Smart Finder:', error);
    }
});

// Export
window.SmartFinder = SmartFinder;

