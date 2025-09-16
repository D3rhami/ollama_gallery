class IncludeTermsCard {
    constructor(filtersPanel) {
        this.filtersPanel = filtersPanel;
        this.key = 'include_terms';
    }

    create() {
        const root = this.filtersPanel.modal.querySelector('.include-terms-card');
        if (!root) return;
        root.innerHTML = '';
        const title = document.createElement('div');
        title.className = 'section-title';
        title.textContent = 'Must include terms';
        const row = document.createElement('div');
        row.className = 'terms-row';
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'terms-input include-input';
        input.placeholder = 'Add term and press Add';
        const btn = document.createElement('button');
        btn.className = 'terms-btn include-btn';
        btn.textContent = 'Add';
        const list = document.createElement('div');
        list.className = 'terms-list include-list';
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
            const arr = this.filtersPanel.staged.includeTerms || [];
            if (!arr.includes(v)) arr.push(v);
            this.filtersPanel.staged.includeTerms = arr;
            input.value = '';
            this.renderChips(list);
        };
        btn.addEventListener('click', add);
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') add(); });
    }

    renderChips(list) {
        list.innerHTML = '';
        const staged = (this.filtersPanel.staged && Array.isArray(this.filtersPanel.staged.includeTerms)) ? this.filtersPanel.staged.includeTerms : [];
        const active = [...(this.filtersPanel.activeFilters?.values() || [])].filter(f => f.type === 'include_terms').map(f => f.value) || [];
        const removals = (this.filtersPanel.staged && Array.isArray(this.filtersPanel.staged.removeIncludeTerms)) ? this.filtersPanel.staged.removeIncludeTerms.map(v=>v.toLowerCase()) : [];
        const union = Array.from(new Set([...active, ...staged])).filter(v => !removals.includes(v.toLowerCase()));
        const chips = union.map(v => ({ key: `include_terms_${v.toLowerCase()}`, value: v }));
        chips.forEach(ch => {
            const span = document.createElement('span');
            span.className = 'term-chip';
            span.textContent = ch.value;
            span.title = 'Stop requiring';
            span.addEventListener('click', () => {
                this.filtersPanel.staged = this.filtersPanel.staged || {};
                if (Array.isArray(this.filtersPanel.staged.includeTerms) && this.filtersPanel.staged.includeTerms.some(t => t.toLowerCase() === ch.value.toLowerCase())) {
                    this.filtersPanel.staged.includeTerms = this.filtersPanel.staged.includeTerms.filter(t => t.toLowerCase() !== ch.value.toLowerCase());
                } else {
                    const arr = this.filtersPanel.staged.removeIncludeTerms || [];
                    if (!arr.map(v=>v.toLowerCase()).includes(ch.value.toLowerCase())) arr.push(ch.value);
                    this.filtersPanel.staged.removeIncludeTerms = arr;
                }
                this.renderChips(list);
            });
            list.appendChild(span);
        });
    }
}


