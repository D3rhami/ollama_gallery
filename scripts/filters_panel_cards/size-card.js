class SizeCard {
    constructor(filtersPanel) {
        this.filtersPanel = filtersPanel;
        this.buckets = ['<1GB','1GB','5GB','10GB','25GB','50GB','100GB','500GB','>500GB'];
        this.bucketToNum = {
            '<1GB': 1000000000,
            '1GB': 1000000000,
            '5GB': 5000000000,
            '10GB': 10000000000,
            '25GB': 25000000000,
            '50GB': 50000000000,
            '100GB': 100000000000,
            '500GB': 500000000000,
            '>500GB': 500000000001
        };
    }

    create() {
        if (!this.filtersPanel.modal) return;
        const content = this.filtersPanel.modal.querySelector('.filters-content');
        let card = content.querySelector('.size-card');
        if (!card) {
            card = document.createElement('div');
            card.className = 'filter-section size-card';
            content.appendChild(card);
        }
        card.innerHTML = '';

        const title = document.createElement('div');
        title.className = 'section-title';
        title.textContent = 'Tag Size';
        card.appendChild(title);

        const stack = document.createElement('div');
        stack.className = 'ts-stack';
        const track = document.createElement('div');
        track.className = 'ts-track';
        const fill = document.createElement('div');
        fill.className = 'ts-fill';
        track.appendChild(fill);

        const sliderMin = document.createElement('input');
        sliderMin.type = 'range';
        sliderMin.min = 0;
        sliderMin.max = this.buckets.length - 1;
        sliderMin.value = 0;
        sliderMin.step = 1;
        sliderMin.className = 'ts-range size-min';

        const sliderMax = document.createElement('input');
        sliderMax.type = 'range';
        sliderMax.min = 0;
        sliderMax.max = this.buckets.length - 1;
        sliderMax.value = this.buckets.length - 1;
        sliderMax.step = 1;
        sliderMax.className = 'ts-range size-max';

        stack.appendChild(track);
        stack.appendChild(sliderMin);
        stack.appendChild(sliderMax);

        const labels = document.createElement('div');
        labels.className = 'ts-labels';
        const maxIdx = this.buckets.length - 1;
        this.buckets.forEach((b, i) => {
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

    update() {}

    stage() {
        const minIdx = parseInt(this.filtersPanel.modal.querySelector('.size-min').value);
        const maxIdx = parseInt(this.filtersPanel.modal.querySelector('.size-max').value);
        const minLabel = this.buckets[Math.min(minIdx, maxIdx)];
        const maxLabel = this.buckets[Math.max(minIdx, maxIdx)];
        const payload = { minNum: this.bucketToNum[minLabel], maxNum: this.bucketToNum[maxLabel], minLabel, maxLabel };
        this.filtersPanel.staged = this.filtersPanel.staged || {};
        this.filtersPanel.staged.sizeRange = payload;
    }

    clear() {
        const min = this.filtersPanel.modal.querySelector('.size-min');
        const max = this.filtersPanel.modal.querySelector('.size-max');
        if (min) min.value = 0;
        if (max) max.value = this.buckets.length - 1;
        this.updateHighlight();
    }

    updateFill(fillEl, minEl, maxEl) {
        if (!fillEl || !minEl || !maxEl) return;
        let a = parseInt(minEl.value);
        let b = parseInt(maxEl.value);
        if (a > b) [a,b] = [b,a];
        const total = this.buckets.length - 1;
        const left = (a / total) * 100;
        const right = 100 - ((b / total) * 100);
        fillEl.style.left = left + '%';
        fillEl.style.right = right + '%';
    }

    updateLabelsActive() {
        const labels = this.filtersPanel.modal.querySelectorAll('.size-card .ts-labels span');
        if (!labels.length) return;
        labels.forEach(s => s.classList.remove('active'));
        const min = this.filtersPanel.modal.querySelector('.size-min');
        const max = this.filtersPanel.modal.querySelector('.size-max');
        if (!min || !max) return;
        let a = parseInt(min.value);
        let b = parseInt(max.value);
        if (a > b) [a,b] = [b,a];
        const aEl = labels[a];
        const bEl = labels[b];
        if (aEl) aEl.classList.add('active');
        if (bEl) bEl.classList.add('active');
    }

    positionLabels() {
        const stack = this.filtersPanel.modal.querySelector('.size-card .ts-stack');
        const labels = this.filtersPanel.modal.querySelectorAll('.size-card .ts-labels span');
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
        const stack = this.filtersPanel.modal.querySelector('.size-card .ts-stack');
        if (!stack || typeof ResizeObserver === 'undefined') return;
        if (this._tsRO) {
            try { this._tsRO.disconnect(); } catch (_) {}
        }
        this._tsRO = new ResizeObserver(() => this.positionLabels());
        this._tsRO.observe(stack);
    }
}


