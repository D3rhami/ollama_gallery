class FiltersPanel {
    constructor() {
        this.modal = null;
        this.currentTable = 'models';
        this.entriesPerPage = 10;
        this.entriesValues = [5, 10, 25, 50, 75, 100, -1];
        this.activeFilters = new Map();
        this.capabilities = new Set();
        this.parameters = new Set();
        this.selectedCapabilities = [];
        this.selectedParameters = [];
        this.selectedUpdatedRange = { type: 'all', from: '', to: '' };
        this.searchFunction = null;
        this.init();
        this.setupCustomSearch();
    }

    init() {
        this.loadPanelHTML();
        this.setupEventListeners();
        this.updateTableName();
        this.initializeDefaultFilter();
        
        this.includeTermsCard = new IncludeTermsCard(this);
        this.excludeTermsCard = new ExcludeTermsCard(this);
        this.capabilitiesCard = new CapabilitiesCard(this);
        this.parametersCard = new ParametersCard(this);
        this.entriesPerPageCard = new EntriesPerPageCard(this);
        this.updatedRangeCard = this.currentTable === 'models' ? new UpdatedRangeCardModels(this) : new UpdatedRangeCardTags(this);
        this.inputTypesCard = new InputTypesCard(this);
        this.contextWindowCard = new ContextWindowCard(this);
        this.sizeCard = new SizeCard(this);
        
        this.updateCardVisibility();
        
        setTimeout(() => {
            this.capabilitiesCard.loadCapabilities();
        }, 1000);
        
        setTimeout(() => {
            this.parametersCard.loadParametersWithRetry();
        }, 1500);
        this.includeTermsCard.create();
        this.excludeTermsCard.create();
        if (this.currentTable === 'tags') {
            this.inputTypesCard.create();
            this.contextWindowCard.create();
            this.sizeCard.create();
            this.entriesPerPageCard.create();
            this.updatedRangeCard.create();
        } else {
            this.entriesPerPageCard.create();
            this.entriesPerPageCard.create();
            this.updatedRangeCard.create();
        }
        
        setTimeout(() => {
            this.entriesPerPageCard.updateFilter();
        }, 100);
    }

    loadPanelHTML() {
        this.modal = document.querySelector('.filters-modal');
        this.setupPanelEvents();
    }

    setupEventListeners() {
        const btn = document.querySelector('.filters-button');
        if (btn) {
            btn.addEventListener('click', () => this.openModal());
        }
    }

    setupPanelEvents() {
        if (!this.modal) return;

        const closeBtn = this.modal.querySelector('.filters-close');
        const expandBtn = this.modal.querySelector('.filters-expand');
        const clearBtn = this.modal.querySelector('.filters-clear');
        const applyBtn = this.modal.querySelector('.filters-apply');
        if (closeBtn) closeBtn.addEventListener('click', () => this.closeModal());
        if (expandBtn) expandBtn.addEventListener('click', () => this.toggleExpand());
        if (clearBtn) clearBtn.textContent = 'Reset';
        if (clearBtn) clearBtn.addEventListener('click', () => this.clearFilters());
        if (applyBtn) applyBtn.addEventListener('click', () => this.applyFilters());

        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });
    }

    toggleExpand() {
        if (!this.modal) return;
        const inner = this.modal.querySelector('.filters-modal-inner');
        const btn = this.modal.querySelector('.filters-expand i');
        if (!inner) return;
        const expanded = inner.classList.toggle('expanded');
        if (btn) {
            if (expanded) {
                btn.classList.remove('fa-up-right-and-down-left-from-center');
                btn.classList.add('fa-down-left-and-up-right-to-center');
            } else {
                btn.classList.remove('fa-down-left-and-up-right-to-center');
                btn.classList.add('fa-up-right-and-down-left-from-center');
            }
        }
    }

    updateTableName() {
        const previousTable = this.currentTable;
        
        if (window.tableManager) {
            this.currentTable = window.tableManager.getCurrentTableType();
        } else {
            this.currentTable = 'models';
        }

        const tableNameSpan = document.getElementById('table-name');
        if (tableNameSpan) {
            tableNameSpan.textContent = this.currentTable.charAt(0).toUpperCase() + this.currentTable.slice(1);
        }
        
        // Clear filters when switching between different table types
        if (previousTable && previousTable !== this.currentTable) {
            this.clearAllFiltersOnTableSwitch(previousTable);
        }
        
        // Log current table and data counts
        this.logDataCounts();
        
        this.updateCardVisibility();
    }

    logDataCounts() {
        if (this.currentTable === 'models') {
            const modelCount = window.modelsData ? window.modelsData.length : 'Not loaded';
            console.log(`📊 Current view: Models | Count: ${modelCount} models`);
        } else if (this.currentTable === 'tags') {
            const tagCount = window.tagsDataTable ? window.tagsDataTable.data().count() : 'Not loaded';
            const modelCount = window.modelsData ? window.modelsData.length : 'Not loaded';
            console.log(`🏷️ Current view: Tags | Tags: ${tagCount} | Models available: ${modelCount}`);
        }
    }

    updateCardVisibility() {
        if (!this.modal) return;
        
        const capabilitiesCard = this.modal.querySelector('.capabilities-card');
        const parametersCard = this.modal.querySelector('.parameters-card');
        const entriesCard = this.modal.querySelector('.entries-per-page-card');
        const updatedRangeCard = this.modal.querySelector('.updated-range-card');
        
        if (this.currentTable === 'models') {
            if (capabilitiesCard) capabilitiesCard.style.display = 'block';
            if (parametersCard) parametersCard.style.display = 'block';
            const includeEl = this.modal.querySelector('.include-terms-card');
            const excludeEl = this.modal.querySelector('.exclude-terms-card');
            if (includeEl) includeEl.style.display = 'block';
            if (excludeEl) excludeEl.style.display = 'block';
            if (entriesCard) entriesCard.style.display = 'block';
            if (updatedRangeCard) updatedRangeCard.style.display = 'block';
            const inputTypes = this.modal.querySelector('.input-types-card');
            const contextWindow = this.modal.querySelector('.context-window-card');
            const sizeCard = this.modal.querySelector('.size-card');
            if (inputTypes) inputTypes.style.display = 'none';
            if (contextWindow) contextWindow.style.display = 'none';
            if (sizeCard) sizeCard.style.display = 'none';
            if (!(this.updatedRangeCard instanceof UpdatedRangeCardModels)) {
                this.updatedRangeCard = new UpdatedRangeCardModels(this);
                this.updatedRangeCard.create();
            }
            
            this.ensureModelsDataLoaded();
        } else if (this.currentTable === 'tags') {
            if (capabilitiesCard) capabilitiesCard.style.display = 'none';
            if (parametersCard) parametersCard.style.display = 'none';
            const includeEl = this.modal.querySelector('.include-terms-card');
            const excludeEl = this.modal.querySelector('.exclude-terms-card');
            if (includeEl) includeEl.style.display = 'block';
            if (excludeEl) excludeEl.style.display = 'block';
            if (entriesCard) entriesCard.style.display = 'block';
            if (updatedRangeCard) updatedRangeCard.style.display = 'block';
            let inputTypes = this.modal.querySelector('.input-types-card');
            let contextWindow = this.modal.querySelector('.context-window-card');
            let sizeCard = this.modal.querySelector('.size-card');
            if (!inputTypes) this.inputTypesCard.create(); else inputTypes.style.display = 'block';
            if (!contextWindow) this.contextWindowCard.create(); else contextWindow.style.display = 'block';
            if (!sizeCard) this.sizeCard.create(); else sizeCard.style.display = 'block';
            if (!(this.updatedRangeCard instanceof UpdatedRangeCardTags)) {
                this.updatedRangeCard = new UpdatedRangeCardTags(this);
                this.updatedRangeCard.create();
            }
            const sizeCardEl = this.modal.querySelector('.size-card');
            if (entriesCard && sizeCardEl && sizeCardEl.parentNode) {
                sizeCardEl.parentNode.insertBefore(entriesCard, sizeCardEl.nextSibling);
                entriesCard.style.display = 'block';
            }
            const entriesEl = this.modal.querySelector('.entries-per-page-card');
            const urEl = this.modal.querySelector('.updated-range-card');
            if (entriesEl && urEl && entriesEl.parentNode) {
                entriesEl.parentNode.insertBefore(urEl, entriesEl.nextSibling);
                urEl.style.display = 'block';
            }
        }
        
        this.ensureEntriesPerPageFilter();
    }

    ensureEntriesPerPageFilter() {
        const entriesFilter = this.activeFilters.get('entries_per_page');
        if (!entriesFilter || !entriesFilter.active) {
            const filterKey = 'entries_per_page';
            const label = this.entriesPerPage === -1 ? 'All' : this.entriesPerPage.toString();
            
            this.activeFilters.set(filterKey, {
                key: filterKey,
                label: `Entries Per Page: ${label}`,
                value: this.entriesPerPage,
                action: 'open',
                active: true
            });
            
            this.updateRibbon();
        }
    }

    ensureModelsDataLoaded() {
        setTimeout(() => {
            if (this.capabilities.size === 0 && this.capabilitiesCard) {
                this.capabilitiesCard.loadCapabilities();
            }
            if (this.parameters.size === 0 && this.parametersCard) {
                this.parametersCard.loadParametersWithRetry();
            }
        }, 100);
    }


    openModal(filterId = null) {
        this.updateTableName();
        if (this.modal) {
            this.modal.classList.add('open');
            this.modal.removeAttribute('inert');
            this.modal.removeAttribute('aria-hidden');
            document.body.style.overflow = 'hidden';
            
            this.updateCardVisibility();
            
            if (filterId) {
                setTimeout(() => {
                    this.scrollToAndHighlightCard(filterId);
                }, 300);
            }
        }
    }

    closeModal() {
        if (this.modal) {
            this.modal.classList.remove('open');
            this.modal.setAttribute('inert', '');
            document.body.style.overflow = '';
        }
    }

    scrollToAndHighlightCard(filterId) {
        let targetCard = null;
        
        if (filterId === 'entries_per_page') {
            targetCard = this.modal.querySelector('.entries-per-page-card') || this.modal.querySelector('.filter-section:first-child');
        } else if (filterId.startsWith('capability_')) {
            targetCard = this.modal.querySelector('.capabilities-card');
        } else if (filterId.startsWith('parameter_')) {
            targetCard = this.modal.querySelector('.parameters-card');
        } else if (filterId === 'contextwin_range' || filterId.startsWith('contextwin_')) {
            targetCard = this.modal.querySelector('.context-window-card');
        } else if (filterId === 'size_range') {
            targetCard = this.modal.querySelector('.size-card');
        } else if (filterId.startsWith('updated_range_')) {
            targetCard = this.modal.querySelector('.updated-range-card');
        }
        
        if (targetCard) {
            targetCard.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            
            targetCard.classList.add('highlight-card');
            setTimeout(() => {
                targetCard.classList.remove('highlight-card');
            }, 1000);
        }
    }

    clearFilters() {
        if (!this.modal) return; 
        this.entriesPerPage = 10; 
        this.activeFilters.clear(); 
        this.selectedCapabilities = [];
        this.selectedParameters = [];
        this.selectedUpdatedRange = { type: 'all', from: '', to: '' };
        if (this.staged) {
            delete this.staged.includeTerms;
            delete this.staged.removeIncludeTerms;
            delete this.staged.excludeTerms;
            delete this.staged.removeExcludeTerms;
        }
        
        // Clear checkboxes for visible cards
        if (this.currentTable === 'models') {
            this.clearCapabilitiesCheckboxes();
            this.clearParametersCheckboxes();
        }
        this.clearUpdatedRangeSelection();
        const includeList = this.modal.querySelector('.include-terms-card .terms-list');
        if (includeList && this.includeTermsCard) this.includeTermsCard.renderChips(includeList);
        const excludeList = this.modal.querySelector('.exclude-terms-card .terms-list');
        if (excludeList && this.excludeTermsCard) this.excludeTermsCard.renderChips(excludeList);

        // Reset tags-specific filters: input types, context window, size
        // Input types: uncheck all checkboxes and remove filters
        this.modal.querySelectorAll('.inputtype-checkbox:checked').forEach(cb => cb.checked = false);
        if (this.staged && Array.isArray(this.staged.inputTypes)) {
            delete this.staged.inputTypes;
        }
        [...this.activeFilters.keys()].filter(k => k.startsWith('inputtype_')).forEach(k => {
            this.activeFilters.delete(k);
            if (window.ribbonManager) window.ribbonManager.removeFilter(k, this.currentTable);
        });
        if (window.ribbonManager) window.ribbonManager.render(this.currentTable);

        // Context window: reset sliders and remove filter
        const cwMin = this.modal.querySelector('.cw-min');
        const cwMax = this.modal.querySelector('.cw-max');
        const cwFill = this.modal.querySelector('.cw-fill');
        if (cwMin && cwMax) {
            cwMin.value = 0;
            cwMax.value = (this.contextWindowCard?.labels?.length || 1) - 1;
            if (cwFill && this.contextWindowCard) {
                this.contextWindowCard.updateFill(cwFill, cwMin, cwMax);
                this.contextWindowCard.updateLabelsActive();
            }
        }
        if (this.activeFilters.has('contextwin_range')) {
            this.activeFilters.delete('contextwin_range');
            if (window.ribbonManager) window.ribbonManager.removeFilter('contextwin_range', this.currentTable);
        }

        // Size: reset sliders and remove filter
        const sizeMin = this.modal.querySelector('.size-min');
        const sizeMax = this.modal.querySelector('.size-max');
        const sizeFill = this.modal.querySelector('.ts-fill');
        if (sizeMin && sizeMax) {
            sizeMin.value = 0;
            sizeMax.value = (this.sizeCard?.buckets?.length || 1) - 1;
            if (sizeFill && this.sizeCard) {
                this.sizeCard.updateFill(sizeFill, sizeMin, sizeMax);
                this.sizeCard.updateLabelsActive();
            }
        }
        if (this.activeFilters.has('size_range')) {
            this.activeFilters.delete('size_range');
            if (window.ribbonManager) window.ribbonManager.removeFilter('size_range', this.currentTable);
        }
        
        // Reset entries per page slider to default
        const slider = this.modal.querySelector('#entries-slider');
        if (slider) {
            slider.value = '1'; // Default to 10 entries (index 1)
            this.entriesPerPageCard?.updateEntriesLabel({ target: slider });
            const eppFill = this.modal.querySelector('.epp-fill');
            if (eppFill && this.entriesPerPageCard) {
                this.entriesPerPageCard.updateFill(slider, eppFill);
                this.entriesPerPageCard.positionLabels();
            }
        }
        
        // Clear ribbon
        if (window.ribbonManager) {
            window.ribbonManager.clearAllFilters(this.currentTable);
        }
        
        // Recreate entries per page filter
        this.ensureEntriesPerPageFilter();
        
        this.renderActiveFiltersFromPanel();
        this.updateRibbon();
        this.applyTableFiltering();
        
        console.log(`✅ All filters cleared and reset to defaults`);
    }

    clearCapabilitiesData() {
        this.capabilities.clear();
        this.selectedCapabilities = [];
    }

    clearParametersData() {
        this.parameters.clear();
        this.selectedParameters = [];
    }

    clearAllFiltersOnTableSwitch(previousTable) {
        console.log(`🔄 Switching from ${previousTable} to ${this.currentTable} - clearing all filters`);
        this.activeFilters.clear();
    
        this.entriesPerPage = 10; 
        this.selectedCapabilities = [];
        this.selectedParameters = [];
        this.selectedUpdatedRange = { type: 'all', from: '', to: '' };
        if (this.staged) {
            delete this.staged.includeTerms;
            delete this.staged.removeIncludeTerms;
            delete this.staged.excludeTerms;
            delete this.staged.removeExcludeTerms;
        }
        
        if (window.ribbonManager) {
            if (previousTable) window.ribbonManager.clearAllFilters(previousTable);
            window.ribbonManager.clearAllFilters(this.currentTable);
        }
        
        const slider = this.modal?.querySelector('#entries-slider');
        const fill = this.modal?.querySelector('.epp-fill');
        if (slider) {
            const idx = this.entriesValues.indexOf(this.entriesPerPage);
            slider.value = String(idx >= 0 ? idx : 1);
            this.entriesPerPageCard?.updateEntriesLabel({ target: slider });
            if (fill) this.entriesPerPageCard?.updateFill(slider, fill);
            this.entriesPerPageCard?.positionLabels();
        }
        
        
        this.updatedRangeCard?.clearSelection();
        const includeList = this.modal?.querySelector('.include-terms-card .terms-list');
        if (includeList && this.includeTermsCard) this.includeTermsCard.renderChips(includeList);
        const excludeList = this.modal?.querySelector('.exclude-terms-card .terms-list');
        if (excludeList && this.excludeTermsCard) this.excludeTermsCard.renderChips(excludeList);
        if (this.currentTable === 'models') {
            this.clearCapabilitiesCheckboxes();
            this.clearParametersCheckboxes();
        } 
        this.ensureEntriesPerPageFilter();
        
        console.log(`✅ All filters cleared for ${this.currentTable} table`);
    }

    applyFilters() {
        if (this.staged && typeof this.staged.entriesPerPage !== 'undefined') {
            this.entriesPerPage = this.staged.entriesPerPage;
            const filterKey = 'entries_per_page';
            const label = this.entriesPerPage === -1 ? 'All' : this.entriesPerPage.toString();
            this.activeFilters.set(filterKey, {
                key: filterKey,
                label: `Entries Per Page: ${label}`,
                value: this.entriesPerPage,
                action: 'open',
                active: true
            });
            this.updateTablePagination();
            delete this.staged.entriesPerPage;
        }

        if (this.staged && (Array.isArray(this.staged.includeTerms) || Array.isArray(this.staged.removeIncludeTerms))) {
            const existing = [...this.activeFilters.values()].filter(f => f.type === 'include_terms').map(f => f.value);
            const additions = Array.isArray(this.staged.includeTerms) ? this.staged.includeTerms : [];
            const removals = Array.isArray(this.staged.removeIncludeTerms) ? this.staged.removeIncludeTerms.map(v=>v.toLowerCase()) : [];
            const merged = Array.from(new Set([...(existing || []), ...additions])).filter(v => !removals.includes(v.toLowerCase()));
            // clear existing include_terms
            [...this.activeFilters.keys()].filter(k => k.startsWith('include_terms_')).forEach(k => {
                this.activeFilters.delete(k);
                if (window.ribbonManager) window.ribbonManager.removeFilter(k, this.currentTable);
            });
            merged.forEach(v => {
                const k = `include_terms_${v.toLowerCase()}`;
                this.activeFilters.set(k, { key: k, type: 'include_terms', value: v, label: `Must include: ${v}`, action: 'remove', icon: 'fas fa-trash', color: 'red', active: true });
            });
            delete this.staged.includeTerms;
            delete this.staged.removeIncludeTerms;
            this.applyTableFiltering();
        }

        if (this.staged && (Array.isArray(this.staged.excludeTerms) || Array.isArray(this.staged.removeExcludeTerms))) {
            const existing = [...this.activeFilters.values()].filter(f => f.type === 'exclude_terms').map(f => f.value);
            const additions = Array.isArray(this.staged.excludeTerms) ? this.staged.excludeTerms : [];
            const removals = Array.isArray(this.staged.removeExcludeTerms) ? this.staged.removeExcludeTerms.map(v=>v.toLowerCase()) : [];
            const merged = Array.from(new Set([...(existing || []), ...additions])).filter(v => !removals.includes(v.toLowerCase()));
            // clear existing exclude_terms
            [...this.activeFilters.keys()].filter(k => k.startsWith('exclude_terms_')).forEach(k => {
                this.activeFilters.delete(k);
                if (window.ribbonManager) window.ribbonManager.removeFilter(k, this.currentTable);
            });
            merged.forEach(v => {
                const k = `exclude_terms_${v.toLowerCase()}`;
                this.activeFilters.set(k, { key: k, type: 'exclude_terms', value: v, label: `Exclude: ${v}`, action: 'remove', icon: 'fas fa-trash', color: 'red', active: true });
            });
            delete this.staged.excludeTerms;
            delete this.staged.removeExcludeTerms;
            this.applyTableFiltering();
        }

        if (this.staged && Array.isArray(this.staged.capabilities)) {
            this.capabilitiesCard.updateFilters();
            delete this.staged.capabilities;
        }
        if (this.staged && Array.isArray(this.staged.parameters)) {
            this.parametersCard.updateFilters();
            delete this.staged.parameters;
        }
        if (this.staged && Array.isArray(this.staged.inputTypes)) {
            this.inputTypesCard.updateFilters();
            delete this.staged.inputTypes;
        }
        if (this.staged && this.staged.contextWindow) {
            const k = 'contextwin_range';
            const {min, max, minLabel, maxLabel} = this.staged.contextWindow;
            this.activeFilters.delete(k);
            if (window.ribbonManager) window.ribbonManager.removeFilter(k, this.currentTable);
            this.activeFilters.set(k, {
                key: k,
                label: `Context Window: ${minLabel} - ${maxLabel}`,
                value: {min, max},
                icon: 'fas fa-trash',
                color: this.currentTable === 'tags' ? 'red' : undefined,
                action: 'remove',
                active: true
            });
            delete this.staged.contextWindow;
            this.applyTableFiltering();
        }
        if (this.staged && this.staged.sizeRange) {
            const k = 'size_range';
            const {minNum, maxNum, minLabel, maxLabel} = this.staged.sizeRange;
            this.activeFilters.delete(k);
            if (window.ribbonManager) window.ribbonManager.removeFilter(k, this.currentTable);
            this.activeFilters.set(k, {
                key: k,
                label: `Size: ${minLabel} - ${maxLabel}`,
                value: {minNum, maxNum},
                icon: 'fas fa-trash',
                color: this.currentTable === 'tags' ? 'red' : undefined,
                action: 'remove',
                active: true
            });
            delete this.staged.sizeRange;
            this.applyTableFiltering();
        }
        if (this.staged && this.staged.updatedRange) {
            const s = this.staged.updatedRange;
            this.selectedUpdatedRange = { type: s.type || 'all', from: s.from || '', to: s.to || '' };
            this.updateUpdatedRangeFilter();
            delete this.staged.updatedRange;
        }
        this.updateRibbon();
        this.closeModal();
    }

    updateTablePagination() {
        try {
            if (window.tableManager) {
                const dataTable = window.tableManager.getTableDataTable(this.currentTable);
                if (dataTable) {
                    if (this.entriesPerPage === -1) {
                        dataTable.page.len(-1).draw();
                    } else {
                        dataTable.page.len(this.entriesPerPage).draw();
                    }
                }
            }
        } catch (e) {
            console.warn('Error updating table pagination:', e);
        }
    }



    applyCardStyling() {
        const filterSections = this.modal.querySelectorAll('.filter-section');
        filterSections.forEach(section => {
            section.style.background = 'var(--color-background-secondary)';
            section.style.borderRadius = '8px';
            section.style.padding = '12px';
            section.style.marginBottom = '12px';
            section.style.borderBottom = 'none';
        });
    }


    updateRibbon() {
        if (window.ribbonManager) {
            this.activeFilters.forEach((filter, key) => {
                if (filter.active) {
                    let filterType = 'entries';
                    if (key.startsWith('capability_')) filterType = 'capabilities';
                    else if (key.startsWith('parameter_')) filterType = 'parameters';
                    else if (filter.type === 'include_terms') filterType = 'include terms';
                    else if (filter.type === 'exclude_terms') filterType = 'exclude terms';
                    window.ribbonManager.addFilter(key, filterType, filter.label, this.currentTable, filter.icon, filter.action, filter.color);
                } else {
                    window.ribbonManager.removeFilter(key, this.currentTable);
                }
            });
        }
    }

    removeFilterFromRibbon(filterKey) {
        this.activeFilters.delete(filterKey);
        if (!this.modal) return;

        if (filterKey.startsWith('capability_')) {
            const capability = filterKey.replace('capability_', '');
            const checkbox = this.modal.querySelector(`.capability-checkbox[value="${capability}"]`);
            if (checkbox) checkbox.checked = false;
            this.selectedCapabilities = this.selectedCapabilities.filter(c => c !== capability);
            if (this.staged && Array.isArray(this.staged.capabilities)) {
                this.staged.capabilities = this.staged.capabilities.filter(c => c !== capability);
            }
        } else if (filterKey.startsWith('parameter_')) {
            const parameter = filterKey.replace('parameter_', '');
            const checkbox = this.modal.querySelector(`.parameter-checkbox[value="${parameter}"]`);
            if (checkbox) checkbox.checked = false;
            this.selectedParameters = this.selectedParameters.filter(p => p !== parameter);
            if (this.staged && Array.isArray(this.staged.parameters)) {
                this.staged.parameters = this.staged.parameters.filter(p => p !== parameter);
            }
        } else if (filterKey.startsWith('inputtype_')) {
            const val = filterKey.replace('inputtype_', '');
            const cb = this.modal.querySelector(`.inputtype-checkbox[value="${val}"]`);
            if (cb) cb.checked = false;
            if (this.staged && Array.isArray(this.staged.inputTypes)) {
                this.staged.inputTypes = this.staged.inputTypes.filter(v => v !== val);
            }
        } else if (filterKey === 'contextwin_range') {
            const min = this.modal.querySelector('.cw-min');
            const max = this.modal.querySelector('.cw-max');
            if (min) min.value = 0;
            if (max) max.value = (this.contextWindowCard?.labels?.length || 1) - 1;
            if (this.staged && this.staged.contextWindow) delete this.staged.contextWindow;
            const fill = this.modal.querySelector('.cw-fill');
            if (fill && min && max && this.contextWindowCard) {
                this.contextWindowCard.updateFill(fill, min, max);
                this.contextWindowCard.updateLabelsActive();
            }
        } else if (filterKey === 'size_range') {
            const min = this.modal.querySelector('.size-min');
            const max = this.modal.querySelector('.size-max');
            if (min) min.value = 0;
            if (max) max.value = (this.sizeCard?.buckets?.length || 1) - 1;
            if (this.staged && this.staged.sizeRange) delete this.staged.sizeRange;
            const fill = this.modal.querySelector('.ts-fill');
            if (fill && min && max && this.sizeCard) {
                this.sizeCard.updateFill(fill, min, max);
                this.sizeCard.updateLabelsActive();
            }
        } else if (filterKey.startsWith('updated_range_')) {
            this.selectedUpdatedRange.type = 'all';
            this.selectedUpdatedRange.from = '';
            this.selectedUpdatedRange.to = '';
            this.modal.querySelectorAll('.preset-button').forEach(btn => btn.classList.remove('active'));
            const allBtn = this.modal.querySelector('.preset-button[data-value="all"]');
            if (allBtn) allBtn.classList.add('active');
            const customContainer = this.modal.querySelector('.custom-range-container');
            if (customContainer) customContainer.style.display = 'none';
            if (this.staged && this.staged.updatedRange) delete this.staged.updatedRange;
        } else if (filterKey.startsWith('include_terms_')) {
            const term = filterKey.replace('include_terms_', '');
            if (this.staged && Array.isArray(this.staged.includeTerms)) {
                this.staged.includeTerms = this.staged.includeTerms.filter(t => t.toLowerCase() !== term);
            }
            if (this.includeTermsCard) {
                const list = this.modal?.querySelector('.include-terms-card .terms-list');
                if (list) this.includeTermsCard.renderChips(list);
            }
        } else if (filterKey.startsWith('exclude_terms_')) {
            const term = filterKey.replace('exclude_terms_', '');
            if (this.staged && Array.isArray(this.staged.excludeTerms)) {
                this.staged.excludeTerms = this.staged.excludeTerms.filter(t => t.toLowerCase() !== term);
            }
            if (this.excludeTermsCard) {
                const list = this.modal?.querySelector('.exclude-terms-card .terms-list');
                if (list) this.excludeTermsCard.renderChips(list);
            }
        } else if (filterKey === 'entries_per_page') {
            const slider = this.modal.querySelector('#entries-slider');
            if (slider) slider.value = '1';
            this.entriesPerPage = 10;
            if (this.staged && typeof this.staged.entriesPerPage !== 'undefined') delete this.staged.entriesPerPage;
            this.updateTablePagination();
            const fill = this.modal.querySelector('.epp-fill');
            if (fill && slider && this.entriesPerPageCard) {
                this.entriesPerPageCard.updateFill(slider, fill);
                this.entriesPerPageCard.positionLabels();
            }
        }

        this.updateRibbon();
        this.applyTableFiltering();
    }

    initializeDefaultFilter() {
        this.renderActiveFiltersFromPanel();
    }

    renderActiveFiltersFromPanel() {
        if (!this.modal) return;
        
        
        this.updateRibbon();
    }




    updateCapabilitiesFilters() {
        this.capabilitiesCard.updateFilters();
    }

    clearCapabilitiesCheckboxes() {
        this.capabilitiesCard.clearCheckboxes();
    }




    updateParametersFilters() {
        this.parametersCard.updateFilters();
    }

    clearParametersCheckboxes() {
        this.parametersCard.clearCheckboxes();
    }

    clearUpdatedRangeSelection() {
        this.updatedRangeCard.clearSelection();
    }

    clearEntriesSelection() {
        this.entriesPerPageCard.clearSelection();
    }

    applyTableFiltering() {
        const dataTable = this.currentTable === 'models' ? window.dataTable : window.tagsDataTable;
        if (!dataTable) return;
        
        const selectedCapabilities = Array.from(this.modal.querySelectorAll('.capability-checkbox:checked')).map(cb => cb.value);
        const selectedParameters = Array.from(this.modal.querySelectorAll('.parameter-checkbox:checked')).map(cb => cb.value);
        
        this.selectedCapabilities = selectedCapabilities;
        this.selectedParameters = selectedParameters;
        
        dataTable.draw();
        
        const entriesFilter = this.activeFilters.get('entries_per_page');
        if (entriesFilter && entriesFilter.active) {
            dataTable.page.len(entriesFilter.value).draw();
        }
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }




    updateUpdatedRangeFilter() {
        const oldUpdatedRangeKeys = [...this.activeFilters.keys()].filter(key => key.startsWith('updated_range_'));
        oldUpdatedRangeKeys.forEach(key => {
            this.activeFilters.delete(key);
            if (window.ribbonManager) {
                window.ribbonManager.removeFilter(key, this.currentTable);
            }
        });
        
        if (this.selectedUpdatedRange.type !== 'all') {
            const filterKey = `updated_range_${this.selectedUpdatedRange.type}`;
            let label = 'Updated: ';
            
            if (this.selectedUpdatedRange.type === 'custom') {
                if (this.selectedUpdatedRange.from && this.selectedUpdatedRange.to) {
                    label += `${this.selectedUpdatedRange.from} to ${this.selectedUpdatedRange.to}`;
                } else if (this.selectedUpdatedRange.from) {
                    label += `From ${this.selectedUpdatedRange.from}`;
                } else if (this.selectedUpdatedRange.to) {
                    label += `Until ${this.selectedUpdatedRange.to}`;
                } else {
                    return;
                }
            } else {
                const labels = {
                    'today': 'Today',
                    'week': 'This Week',
                    '2weeks': 'Last 2 Weeks',
                    'month': 'This Month',
                    '3months': 'Last 3 Months',
                    'year': 'This Year'
                };
                label += labels[this.selectedUpdatedRange.type];
            }
            
            this.activeFilters.set(filterKey, {
                key: filterKey,
                label: label,
                active: true,
                value: this.selectedUpdatedRange,
                type: 'updated_range',
                icon: 'fas fa-trash',
                color: 'red',
                action: 'remove'
            });
        }
        
        this.updateRibbon();
        this.applyTableFiltering();
    }




    setupCustomSearch() {
        const self = this;
        
        if (this.searchFunction) {
            $.fn.dataTable.ext.search.pop();
        }
        
        this.searchFunction = function(settings, data, dataIndex) {
            const tableId = settings.nTable.id;
            if (tableId !== 'models-table' && tableId !== 'tags-table') return true;

            if (tableId === 'models-table') {
                if (!window.dataTable) return true;
                const rowData = window.dataTable.row(dataIndex).data();
                if (!rowData) return true;

                const capabilities = rowData.modelCapabilities || '';
                const parameters = rowData.modelParameters || '';
                const updateDate = rowData.updateDate || '';
                const modelName = rowData.modelName || '';

                let capabilityMatch = true;
                let parameterMatch = true;
                let timeRangeMatch = true;
                let includeTermsMatch = true;
                let excludeTermsMatch = true;

                if (self.selectedCapabilities.length > 0) {
                    capabilityMatch = self.selectedCapabilities.some(cap => 
                        capabilities.toLowerCase().includes(cap.toLowerCase())
                    );
                }

                if (self.selectedParameters.length > 0) {
                    parameterMatch = self.selectedParameters.some(param => 
                        parameters.includes(param)
                    );
                }

                if (self.selectedUpdatedRange.type !== 'all') {
                    timeRangeMatch = self.updatedRangeCard.matchesUpdatedRange(updateDate, self.selectedUpdatedRange);
                }

                const includeTerms = [...self.activeFilters.values()].filter(f => f.type === 'include_terms').map(f => f.value.toLowerCase());
                if (includeTerms.length) {
                    includeTermsMatch = includeTerms.every(t => modelName.toLowerCase().includes(t));
                }
                const excludeTerms = [...self.activeFilters.values()].filter(f => f.type === 'exclude_terms').map(f => f.value.toLowerCase());
                if (excludeTerms.length) {
                    excludeTermsMatch = !excludeTerms.some(t => modelName.toLowerCase().includes(t));
                }
                return capabilityMatch && parameterMatch && timeRangeMatch && includeTermsMatch && excludeTermsMatch;
            }

            if (tableId === 'tags-table') {
                if (!window.tagsDataTable) return true;
                const rowData = window.tagsDataTable.row(dataIndex).data();
                if (!rowData) return true;

                const updateDate = rowData.updateDate || rowData.updatedStr || '';
                const tagName = rowData.tagName || '';
                let timeRangeMatch = true;
                let inputTypeMatch = true;
                let contextWinMatch = true;
                let sizeMatch = true;
                let includeTermsMatch = true;
                let excludeTermsMatch = true;

                if (self.selectedUpdatedRange.type !== 'all') {
                    timeRangeMatch = self.updatedRangeCard.matchesUpdatedRange(updateDate, self.selectedUpdatedRange);
                }

                const selectedInputTypes = [...self.activeFilters.entries()].filter(([k,v]) => k.startsWith('inputtype_')).map(([k,v]) => v.value);
                if (selectedInputTypes.length) {
                    const rowInputs = (rowData.inputTypes || '').split(',').map(s=>s.trim());
                    inputTypeMatch = selectedInputTypes.some(x => rowInputs.includes(x));
                }

                const ctxFilters = [...self.activeFilters.values()].filter(f => f.key.startsWith('contextwin_')).map(f => f.value);
                if (ctxFilters.length) {
                    const val = rowData.contextWindowNum || 0;
                    contextWinMatch = ctxFilters.some(r => {
                        const minOk = r.min ? val >= parseInt(r.min) : true;
                        const maxOk = r.max ? val <= parseInt(r.max) : true;
                        return minOk && maxOk;
                    });
                }

                const sizeFilter = self.activeFilters.get('size_range');
                if (sizeFilter && sizeFilter.value) {
                    const v = rowData.sizeNum || 0;
                    const minOk = sizeFilter.value.minNum ? v >= sizeFilter.value.minNum : true;
                    const maxOk = sizeFilter.value.maxNum ? v <= sizeFilter.value.maxNum : true;
                    sizeMatch = minOk && maxOk;
                }

                const includeTerms = [...self.activeFilters.values()].filter(f => f.type === 'include_terms').map(f => f.value.toLowerCase());
                if (includeTerms.length) {
                    includeTermsMatch = includeTerms.every(t => tagName.toLowerCase().includes(t));
                }
                const excludeTerms = [...self.activeFilters.values()].filter(f => f.type === 'exclude_terms').map(f => f.value.toLowerCase());
                if (excludeTerms.length) {
                    excludeTermsMatch = !excludeTerms.some(t => tagName.toLowerCase().includes(t));
                }

                return timeRangeMatch && inputTypeMatch && contextWinMatch && sizeMatch && includeTermsMatch && excludeTermsMatch;
            }
        };
        
        $.fn.dataTable.ext.search.push(this.searchFunction);
    }

}

document.addEventListener('DOMContentLoaded', () => {
    window.filtersPanel = new FiltersPanel();
});