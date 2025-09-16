class SimpleLoadingAnimation {
    constructor() {
        this.overlay = null;
        this.progressBar = null;
        this.percentageText = null;
        this.isActive = false;
        this.progress = 0;
        this.init();
    }

    init() {
        this.createOverlay();
        this.setupEventListeners();
    }

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'loading-overlay';
        this.overlay.innerHTML = `
            <div class="loading-center">
                <p class="loading-text">Loading Models</p>
                <div class="loading-progress">
                    <div class="loading-progress-bar"></div>
                </div>
                <p class="loading-percentage">0%</p>
            </div>
        `;

        document.body.appendChild(this.overlay);

        this.progressBar = this.overlay.querySelector('.loading-progress-bar');
        this.percentageText = this.overlay.querySelector('.loading-percentage');
    }

    setupEventListeners() {
        window.addEventListener('beforeunload', () => {
            this.hide();
        });
    }

    show() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.overlay.classList.add('active');
        this.progress = 0;
        this.updateProgress(0);
        
        this.overlay.setAttribute('aria-live', 'polite');
        this.overlay.setAttribute('aria-label', 'Loading models data');
    }

    hide() {
        if (!this.isActive) return;
        
        this.isActive = false;
        this.overlay.classList.remove('active');
        this.progress = 0;
        
        setTimeout(() => {
            this.overlay.removeAttribute('aria-live');
            this.overlay.removeAttribute('aria-label');
        }, 300);
    }

    updateProgress(progress) {
        this.progress = Math.min(Math.max(progress, 0), 100);
        
        if (this.progressBar) {
            this.progressBar.style.width = this.progress + '%';
        }
        
        if (this.percentageText) {
            this.percentageText.textContent = Math.round(this.progress) + '%';
        }
        
        this.overlay.setAttribute('aria-label', `Loading models data: ${Math.round(this.progress)}% complete`);
    }

    simulateProgress() {
        return new Promise((resolve) => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 10 + 3;
                this.updateProgress(progress);
                
                if (progress >= 100) {
                    clearInterval(interval);
                    setTimeout(resolve, 800);
                }
            }, 150);
        });
    }

    setError(message = 'Failed to load data') {
        const loadingText = this.overlay.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = message;
            loadingText.style.color = '#ff6b6b';
        }
        
        if (this.progressBar) {
            this.progressBar.style.background = '#ff6b6b';
        }
        
        this.overlay.setAttribute('aria-label', `Error: ${message}`);
    }

    reset() {
        const loadingText = this.overlay.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = 'Loading Models';
            loadingText.style.color = '';
        }
        
        if (this.progressBar) {
            this.progressBar.style.background = '';
        }
    }
}

window.particleLoadingAnimation = new SimpleLoadingAnimation(); 