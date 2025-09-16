class ContextWindowCard {
    constructor(filtersPanel) {
        this.filtersPanel = filtersPanel;
        this.labels = ['< 32k','32k','64k','128k','256k','512k','> 512k'];
        this.boundaries = {
            '< 32k': 0,
            '32k': 32000,
            '64k': 64000,
            '128k': 128000,
            '256k': 256000,
            '512k': 512000,
            '> 512k': 512001
        };
    }

    create() {
        if (!this.filtersPanel.modal) return;
        const content = this.filtersPanel.modal.querySelector('.filters-content');
        let card = content.querySelector('.context-window-card');
        if (!card) {
            card = document.createElement('div');
            card.className = 'filter-section context-window-card';
            content.appendChild(card);
        }
        card.innerHTML = '';

        const title = document.createElement('div');
        title.className = 'section-title';
        title.textContent = 'Context Window';
        card.appendChild(title);

        const stack = document.createElement('div');
        stack.className = 'cw-stack';
        const track = document.createElement('div');
        track.className = 'cw-track';
        const fill = document.createElement('div');
        fill.className = 'cw-fill';
        track.appendChild(fill);

        const sliderMin = document.createElement('input');
        sliderMin.type = 'range';
        sliderMin.min = 0;
        sliderMin.max = this.labels.length - 1;
        sliderMin.value = 0;
        sliderMin.step = 1;
        sliderMin.className = 'cw-range cw-min';

        const sliderMax = document.createElement('input');
        sliderMax.type = 'range';
        sliderMax.min = 0;
        sliderMax.max = this.labels.length - 1;
        sliderMax.value = this.labels.length - 1;
        sliderMax.step = 1;
        sliderMax.className = 'cw-range cw-max';

        stack.appendChild(track);
        stack.appendChild(sliderMin);
        stack.appendChild(sliderMax);

        const labels = document.createElement('div');
        labels.className = 'cw-labels';
        const maxIdx = this.labels.length - 1;
        this.labels.forEach((b, i) => {
            const span = document.createElement('span');
            span.textContent = b;
            span.style.setProperty('--pos', (i / maxIdx * 100) + '%');
            labels.appendChild(span);
        });

        card.appendChild(stack);
        card.appendChild(labels);

        const onInput = () => {
            this.updateFill(fill, sliderMin, sliderMax);
            this.stage();
            this.updateLabelsActive();
        };
        sliderMin.addEventListener('input', onInput);
        sliderMax.addEventListener('input', onInput);
        this.updateFill(fill, sliderMin, sliderMax);
        this.positionLabels();
        this.observeStackResize();
        this.filtersPanel.applyCardStyling();
    }

    setup() {}

    update() {}

    stage() {
        const minIdx = parseInt(this.filtersPanel.modal.querySelector('.cw-min').value);
        const maxIdx = parseInt(this.filtersPanel.modal.querySelector('.cw-max').value);
        const a = Math.min(minIdx, maxIdx);
        const b = Math.max(minIdx, maxIdx);
        const minLabel = this.labels[a];
        const maxLabel = this.labels[b];
        const minVal = minLabel.startsWith('<') ? 0 : (this.boundaries[minLabel] ?? null);
        const maxVal = maxLabel.startsWith('>') ? null : (this.boundaries[maxLabel] ?? null);
        this.filtersPanel.staged = this.filtersPanel.staged || {};
        this.filtersPanel.staged.contextWindow = { min: minVal, max: maxVal, minLabel, maxLabel, a, b };
    }

    clear() {
        const min = this.filtersPanel.modal.querySelector('.cw-min');
        const max = this.filtersPanel.modal.querySelector('.cw-max');
        if (min) min.value = 0;
        if (max) max.value = this.labels.length - 1;
        const fill = this.filtersPanel.modal.querySelector('.cw-fill');
        if (fill && min && max) this.updateFill(fill, min, max);
    }

    updateLabelsActive() {
        const labels = this.filtersPanel.modal.querySelectorAll('.context-window-card .cw-labels span');
        if (!labels.length) return;
        labels.forEach(s => s.classList.remove('active'));
        const min = this.filtersPanel.modal.querySelector('.cw-min');
        const max = this.filtersPanel.modal.querySelector('.cw-max');
        if (!min || !max) return;
        let a = parseInt(min.value);
        let b = parseInt(max.value);
        if (a > b) [a,b] = [b,a];
        const aEl = labels[a];
        const bEl = labels[b];
        if (aEl) aEl.classList.add('active');
        if (bEl) bEl.classList.add('active');
    }

    updateFill(fillEl, minEl, maxEl) {
        if (!fillEl || !minEl || !maxEl) return;
        let a = parseInt(minEl.value);
        let b = parseInt(maxEl.value);
        if (a > b) [a,b] = [b,a];
        const total = this.labels.length - 1;
        const left = (a / total) * 100;
        const right = 100 - ((b / total) * 100);
        fillEl.style.left = left + '%';
        fillEl.style.right = right + '%';
    }

    positionLabels() {
        const stack = this.filtersPanel.modal.querySelector('.context-window-card .cw-stack');
        const labels = this.filtersPanel.modal.querySelectorAll('.context-window-card .cw-labels span');
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

    observeStackResize() {
        const stack = this.filtersPanel.modal.querySelector('.context-window-card .cw-stack');
        if (!stack || typeof ResizeObserver === 'undefined') return;
        if (this._cwRO) {
            try { this._cwRO.disconnect(); } catch (_) {}
        }
        this._cwRO = new ResizeObserver(() => this.positionLabels());
        this._cwRO.observe(stack);
    }
}


