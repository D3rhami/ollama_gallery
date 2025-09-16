class CapabilitiesCard {
    constructor(filtersPanel) {
        this.filtersPanel = filtersPanel;
    }

    create() {
        if (!this.filtersPanel.modal) return;
        
        const capabilitiesCard = this.filtersPanel.modal.querySelector('.capabilities-card');
        if (!capabilitiesCard) return;
        
        capabilitiesCard.innerHTML = '';
        
        const title = document.createElement('div');
        title.className = 'section-title';
        title.textContent = 'Capabilities';
        
        const checkboxesContainer = document.createElement('div');
        checkboxesContainer.className = 'filter-options-container capabilities';
        
        if (this.filtersPanel.capabilities.size === 0) {
            const noCapabilitiesMsg = document.createElement('div');
            noCapabilitiesMsg.className = 'no-options-message';
            noCapabilitiesMsg.textContent = 'No capabilities found in the current table data.';
            checkboxesContainer.appendChild(noCapabilitiesMsg);
        } else {
            Array.from(this.filtersPanel.capabilities).sort().forEach(capability => {
                const checkboxWrapper = document.createElement('label');
                checkboxWrapper.className = 'filter-option-wrapper';
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = capability;
                checkbox.className = 'filter-option-checkbox capability-checkbox';
                
                const span = document.createElement('span');
                span.className = 'filter-option-label';
                span.textContent = capability;
                
                checkboxWrapper.appendChild(checkbox);
                checkboxWrapper.appendChild(span);
                checkboxesContainer.appendChild(checkboxWrapper);
            });
        }
        
        capabilitiesCard.appendChild(title);
        capabilitiesCard.appendChild(checkboxesContainer);
        
        this.setupEvents();
        this.filtersPanel.applyCardStyling();
    }

    setupEvents() {
        const checkboxes = this.filtersPanel.modal.querySelectorAll('.capability-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.stageFromUI();
            });
        });
    }

    updateFilters() {
        const staged = (this.filtersPanel.staged && this.filtersPanel.staged.capabilities) || [];
        const oldCapabilityKeys = [...this.filtersPanel.activeFilters.keys()].filter(key => key.startsWith('capability_'));
        oldCapabilityKeys.forEach(key => {
            this.filtersPanel.activeFilters.delete(key);
            if (window.ribbonManager) {
                window.ribbonManager.removeFilter(key, this.filtersPanel.currentTable);
            }
        });
        staged.forEach(capability => {
            const filterKey = `capability_${capability}`;
            this.filtersPanel.activeFilters.set(filterKey, {
                key: filterKey,
                label: `Capabilities: ${capability}`,
                value: capability,
                icon: 'fas fa-trash',
                color: 'red',
                action: 'remove',
                active: true
            });
        });
        this.filtersPanel.selectedCapabilities = staged;
        this.filtersPanel.updateRibbon();
        this.filtersPanel.applyTableFiltering();
    }

    stageFromUI() {
        const selected = Array.from(this.filtersPanel.modal.querySelectorAll('.capability-checkbox:checked')).map(cb => cb.value);
        this.filtersPanel.staged = this.filtersPanel.staged || {};
        this.filtersPanel.staged.capabilities = selected;
    }

    clearCheckboxes() {
        this.filtersPanel.modal.querySelectorAll('.capability-checkbox').forEach(checkbox => checkbox.checked = false);
    }

    async loadCapabilities() {
        this.filtersPanel.capabilities.clear();
        
        const loadFromDataTable = async () => {
            const dataTable = await LoadingWrapper.waitForDataTable(this.filtersPanel.currentTable);
            const tableData = dataTable.data().toArray();
            
            tableData.forEach((model, index) => {
                if (model.modelCapabilities) {
                    const capabilities = model.modelCapabilities.split(',').map(cap => cap.trim()).filter(cap => cap);
                    capabilities.forEach(capability => {
                        this.filtersPanel.capabilities.add(capability);
                    });
                }
            });
            
            return true;
        };
        
        const loadFromRawData = () => {
            if (window.modelsData && this.filtersPanel.currentTable === 'models') {
                window.modelsData.forEach((model, index) => {
                    if (model.modelCapabilities) {
                        const capabilities = model.modelCapabilities.split(',').map(cap => cap.trim()).filter(cap => cap);
                        capabilities.forEach(capability => {
                            this.filtersPanel.capabilities.add(capability);
                        });
                    }
                });
                return true;
            }
            return false;
        };
        
        try {
            await LoadingWrapper.retry(loadFromDataTable);
        } catch (error) {
            console.warn('Failed to load from DataTable, trying raw data:', error.message);
            if (!loadFromRawData()) {
                console.error('Failed to load capabilities from both DataTable and raw data');
            }
        }
        
        this.create();
    }

    loadCapabilitiesFromRawData() {
        if (window.modelsData && this.filtersPanel.currentTable === 'models') {
            window.modelsData.forEach((model, index) => {
                if (model.modelCapabilities) {
                    const capabilities = model.modelCapabilities.split(',').map(cap => cap.trim()).filter(cap => cap);
                    capabilities.forEach(capability => {
                        this.filtersPanel.capabilities.add(capability);
                    });
                }
            });
        }
    }
}
