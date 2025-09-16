class InputTypesCard {
    constructor(filtersPanel) {
        this.filtersPanel = filtersPanel;
    }

    create() {
        if (!this.filtersPanel.modal) return;
        const content = this.filtersPanel.modal.querySelector('.filters-content');
        let card = content.querySelector('.input-types-card');
        if (!card) {
            card = document.createElement('div');
            card.className = 'filter-section input-types-card';
            content.appendChild(card);
        }
        card.innerHTML = '';

        const title = document.createElement('div');
        title.className = 'section-title';
        title.textContent = 'Input Types';
        card.appendChild(title);

        const box = document.createElement('div');
        box.className = 'filter-options-container parameters';
        card.appendChild(box);

        this.buildOptionsWithRetry(box, 0);
        card.appendChild(box);
        this.setup();
        this.filtersPanel.applyCardStyling();
    }

    buildOptionsWithRetry(container, attempt) {
        const maxAttempts = 25;
        const delayMs = 200;
        const present = !!window.tagsDataTable;
        const rows = present ? window.tagsDataTable.rows().data().toArray() : [];
        

        const set = new Set();
        if (rows.length) {
            rows.forEach(r => {
                if (r.inputTypes && r.inputTypes !== 'undefined') {
                    r.inputTypes.split(',').map(s => s.trim()).filter(Boolean).forEach(v => set.add(v));
                }
            });
        }

        container.innerHTML = '';
        if (set.size === 0) {
            const msg = document.createElement('div');
            msg.className = 'no-options-message';
            msg.textContent = 'No input types found.';
            container.appendChild(msg);
            if (attempt < maxAttempts) {
                setTimeout(() => this.buildOptionsWithRetry(container, attempt + 1), delayMs);
            }
            return;
        }

        Array.from(set).sort().forEach(val => {
            const label = document.createElement('label');
            label.className = 'filter-option-wrapper';
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.value = val;
            cb.className = 'filter-option-checkbox inputtype-checkbox';
            const span = document.createElement('span');
            span.className = 'filter-option-label';
            span.textContent = val;
            label.appendChild(cb);
            label.appendChild(span);
            container.appendChild(label);
        });

        this.setup();
        
    }

    setup() {
        this.filtersPanel.modal.querySelectorAll('.inputtype-checkbox').forEach(cb => {
            cb.addEventListener('change', () => this.stageFromUI());
        });
    }

    update() {}

    updateFilters() {
        const staged = (this.filtersPanel.staged && this.filtersPanel.staged.inputTypes) || [];
        [...this.filtersPanel.activeFilters.keys()].filter(k => k.startsWith('inputtype_')).forEach(k => {
            this.filtersPanel.activeFilters.delete(k);
            window.ribbonManager && window.ribbonManager.removeFilter(k, this.filtersPanel.currentTable);
        });
        staged.forEach(val => {
            const key = `inputtype_${val}`;
            this.filtersPanel.activeFilters.set(key, {
                key,
                label: `Input: ${val}`,
                value: val,
                icon: 'fas fa-trash',
                color: this.filtersPanel.currentTable === 'tags' ? 'red' : undefined,
                action: 'remove',
                active: true
            });
        });
        this.filtersPanel.updateRibbon();
        this.filtersPanel.applyTableFiltering();
    }

    stageFromUI() {
        const selected = Array.from(this.filtersPanel.modal.querySelectorAll('.inputtype-checkbox:checked')).map(cb => cb.value);
        this.filtersPanel.staged = this.filtersPanel.staged || {};
        this.filtersPanel.staged.inputTypes = selected;
    }

    clear() {
        this.filtersPanel.modal.querySelectorAll('.inputtype-checkbox').forEach(cb => cb.checked = false);
    }
}






