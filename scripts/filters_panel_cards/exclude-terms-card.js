class ExcludeTermsCard {
    constructor(filtersPanel) {
        this.filtersPanel = filtersPanel;
        this.key = 'exclude_terms';
    }

    create() {
        const root = this.filtersPanel.modal.querySelector('.exclude-terms-card');
        if (!root) return;
        root.innerHTML = '';
        const title = document.createElement('div');
        title.className = 'section-title';
        title.textContent = 'Exclude terms';
        const row = document.createElement('div');
        row.className = 'terms-row';
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'terms-input exclude-input';
        input.placeholder = 'Add term and press Add';
        const btn = document.createElement('button');
        btn.className = 'terms-btn exclude-btn';
        btn.textContent = 'Add';
        const list = document.createElement('div');
        list.className = 'terms-list exclude-list';
        row.appendChild(input);
        row.appendChild(btn);
        root.appendChild(title);
        root.appendChild(row);
        root.appendChild(list);
        this.setupEvents(input, btn, list);
        this.renderChips(list);
        this.filtersPanel.applyCardStyling();
    }

    setupEvents(input, btn, list) {
        const add = () => {
            const v = (input.value || '').trim();
            if (!v) return;
            this.filtersPanel.staged = this.filtersPanel.staged || {};
            const arr = this.filtersPanel.staged.excludeTerms || [];
            if (!arr.includes(v)) arr.push(v);
            this.filtersPanel.staged.excludeTerms = arr;
            input.value = '';
            this.renderChips(list);
        };
        btn.addEventListener('click', add);
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') add(); });
    }

    renderChips(list) {
        list.innerHTML = '';
        const staged = (this.filtersPanel.staged && Array.isArray(this.filtersPanel.staged.excludeTerms)) ? this.filtersPanel.staged.excludeTerms : [];
        const active = [...(this.filtersPanel.activeFilters?.values() || [])].filter(f => f.type === 'exclude_terms').map(f => f.value) || [];
        const removals = (this.filtersPanel.staged && Array.isArray(this.filtersPanel.staged.removeExcludeTerms)) ? this.filtersPanel.staged.removeExcludeTerms.map(v=>v.toLowerCase()) : [];
        const union = Array.from(new Set([...active, ...staged])).filter(v => !removals.includes(v.toLowerCase()));
        const chips = union.map(v => ({ key: `exclude_terms_${v.toLowerCase()}`, value: v }));
        chips.forEach(ch => {
            const span = document.createElement('span');
            span.className = 'term-chip';
            span.textContent = ch.value;
            span.title = 'Stop excluding';
            span.addEventListener('click', () => {
                this.filtersPanel.staged = this.filtersPanel.staged || {};
                if (Array.isArray(this.filtersPanel.staged.excludeTerms) && this.filtersPanel.staged.excludeTerms.some(t => t.toLowerCase() === ch.value.toLowerCase())) {
                    this.filtersPanel.staged.excludeTerms = this.filtersPanel.staged.excludeTerms.filter(t => t.toLowerCase() !== ch.value.toLowerCase());
                } else {
                    const arr = this.filtersPanel.staged.removeExcludeTerms || [];
                    if (!arr.map(v=>v.toLowerCase()).includes(ch.value.toLowerCase())) arr.push(ch.value);
                    this.filtersPanel.staged.removeExcludeTerms = arr;
                }
                this.renderChips(list);
            });
            list.appendChild(span);
        });
    }
}


