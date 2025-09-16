class EntriesPerPageCard {
    constructor(filtersPanel) {
        this.filtersPanel = filtersPanel;
    }

    create() {
        const entriesCard = this.filtersPanel.modal.querySelector('.entries-per-page-card');
        if (!entriesCard) return;
        
        entriesCard.innerHTML = '';
        
        const title = document.createElement('div');
        title.className = 'section-title';
        title.textContent = 'Entries Per Page';
        const stack = document.createElement('div');
        stack.className = 'epp-stack';

        const track = document.createElement('div');
        track.className = 'epp-track';
        const fill = document.createElement('div');
        fill.className = 'epp-fill';
        track.appendChild(fill);

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.id = 'entries-slider';
        slider.className = 'entries-range';
        slider.min = '0';
        slider.max = (this.filtersPanel.entriesValues.length - 1).toString();
        slider.step = '1';
        {
            const current = this.filtersPanel.entriesPerPage;
            const idx = this.filtersPanel.entriesValues.indexOf(current);
            slider.value = String(idx >= 0 ? idx : 1);
        }

        stack.appendChild(track);
        stack.appendChild(slider);

        const labelsContainer = document.createElement('div');
        labelsContainer.className = 'epp-labels';
        const maxIdx = this.filtersPanel.entriesValues.length - 1;
        this.filtersPanel.entriesValues.forEach((value, index) => {
            const span = document.createElement('span');
            span.textContent = value === -1 ? 'All' : value.toString();
            span.style.setProperty('--pos', (index / maxIdx * 100) + '%');
            if (index === 1) span.classList.add('active');
            labelsContainer.appendChild(span);
        });

        entriesCard.appendChild(title);
        entriesCard.appendChild(stack);
        entriesCard.appendChild(labelsContainer);

        this.updateFill(slider, fill);
        this.positionLabels();
        this.deferPositionLabels();
        this.observeStackResize();
        this.setupEvents();
        this.filtersPanel.applyCardStyling();
    }

    setupEvents() {
        const slider = this.filtersPanel.modal.querySelector('#entries-slider');
        const fill = this.filtersPanel.modal.querySelector('.epp-fill');
        if (!slider) return;
        slider.addEventListener('input', (e) => {
            this.updateEntriesLabel(e);
            if (fill) this.updateFill(slider, fill);
            this.updateFilter();
        });
        const onResize = () => this.positionLabels();
        window.addEventListener('resize', onResize, { passive: true });
    }

    updateEntriesLabel(e) {
        const value = parseInt(e.target.value);
        const labels = this.filtersPanel.modal.querySelectorAll('.epp-labels span');
        labels.forEach((label, index) => {
            label.classList.toggle('active', index === value);
        });
    }

    positionLabels() {
        const stack = this.filtersPanel.modal.querySelector('.epp-stack');
        const labels = this.filtersPanel.modal.querySelectorAll('.epp-labels span');
        if (!stack || !labels.length) return;
        const rect = stack.getBoundingClientRect();
        const width = rect.width;
        const thumbRadius = 9;
        const usable = Math.max(0, width - thumbRadius * 2);
        const maxIdx = Math.max(1, labels.length - 1);
        labels.forEach((label, idx) => {
            const x = thumbRadius + usable * (idx / maxIdx);
            label.style.left = x + 'px';
        });
    }

    deferPositionLabels() {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => this.positionLabels());
        });
        setTimeout(() => this.positionLabels(), 60);
    }

    observeStackResize() {
        const stack = this.filtersPanel.modal.querySelector('.epp-stack');
        if (!stack || typeof ResizeObserver === 'undefined') return;
        if (this._eppRO) {
            try { this._eppRO.disconnect(); } catch (_) {}
        }
        this._eppRO = new ResizeObserver(() => this.positionLabels());
        this._eppRO.observe(stack);
    }

    updateFill(slider, fillEl) {
        const maxIdx = parseInt(slider.max);
        const idx = parseInt(slider.value);
        const right = 100 - (idx / maxIdx) * 100;
        fillEl.style.left = '0%';
        fillEl.style.right = right + '%';
    }

    updateFilter() {
        const slider = this.filtersPanel.modal.querySelector('#entries-slider');
        if (!slider) return;
        const value = parseInt(slider.value);
        const actualValue = this.filtersPanel.entriesValues[value];
        this.filtersPanel.staged = this.filtersPanel.staged || {};
        this.filtersPanel.staged.entriesPerPage = actualValue;
    }

    clearSelection() {
        const slider = this.filtersPanel.modal.querySelector('#entries-slider');
        if (slider) {
            slider.value = '1';
            this.updateEntriesLabel({ target: slider });
            const fill = this.filtersPanel.modal.querySelector('.epp-fill');
            if (fill) this.updateFill(slider, fill);
        }
    }
}
