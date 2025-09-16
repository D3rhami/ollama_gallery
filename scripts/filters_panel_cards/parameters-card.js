class ParametersCard {
    constructor(filtersPanel) {
        this.filtersPanel = filtersPanel;
    }

    create() {
        const parametersCard = this.filtersPanel.modal.querySelector('.parameters-card');
        if (!parametersCard) return;
        
        parametersCard.innerHTML = '';
        
        const title = document.createElement('div');
        title.className = 'section-title';
        title.textContent = 'Parameters';
        
        const checkboxesContainer = document.createElement('div');
        checkboxesContainer.className = 'filter-options-container parameters';
        
        if (this.filtersPanel.parameters.size === 0) {
            const noParametersMsg = document.createElement('div');
            noParametersMsg.className = 'no-options-message';
            noParametersMsg.textContent = 'No parameters found in the current table data.';
            checkboxesContainer.appendChild(noParametersMsg);
        } else {
            const parsedParams = Array.from(this.filtersPanel.parameters).map(p => ParameterUtils.parseParameterSize(p));
            const sortedParams = ParameterUtils.sortParametersByValue(parsedParams);
            
            sortedParams.forEach(param => {
                const checkboxWrapper = document.createElement('label');
                checkboxWrapper.className = 'filter-option-wrapper';
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = param.original;
                checkbox.className = 'filter-option-checkbox parameter-checkbox';
                
                const span = document.createElement('span');
                span.className = 'filter-option-label';
                span.textContent = param.display;
                
                checkboxWrapper.appendChild(checkbox);
                checkboxWrapper.appendChild(span);
                checkboxesContainer.appendChild(checkboxWrapper);
            });
        }
        
        parametersCard.appendChild(title);
        parametersCard.appendChild(checkboxesContainer);
        
        this.setupEvents();
        this.filtersPanel.applyCardStyling();
    }

    setupEvents() {
        this.filtersPanel.modal.querySelectorAll('.parameter-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.stageFromUI();
            });
        });
    }

    updateFilters() {
        const staged = (this.filtersPanel.staged && this.filtersPanel.staged.parameters) || [];
        const oldParameterKeys = [...this.filtersPanel.activeFilters.keys()].filter(key => key.startsWith('parameter_'));
        
        oldParameterKeys.forEach(key => {
            this.filtersPanel.activeFilters.delete(key);
            if (window.ribbonManager) {
                window.ribbonManager.removeFilter(key, this.filtersPanel.currentTable);
            }
        });
        
        staged.forEach(parameter => {
            const filterKey = `parameter_${parameter}`;
            this.filtersPanel.activeFilters.set(filterKey, {
                key: filterKey,
                label: `Parameters: ${parameter}`,
                value: parameter,
                icon: 'fas fa-trash',
                color: 'red',
                action: 'remove',
                active: true
            });
        });
        this.filtersPanel.selectedParameters = staged;
        this.filtersPanel.updateRibbon();
        this.filtersPanel.applyTableFiltering();
    }

    stageFromUI() {
        const selected = Array.from(this.filtersPanel.modal.querySelectorAll('.parameter-checkbox:checked')).map(cb => cb.value);
        this.filtersPanel.staged = this.filtersPanel.staged || {};
        this.filtersPanel.staged.parameters = selected;
    }

    clearCheckboxes() {
        this.filtersPanel.modal.querySelectorAll('.parameter-checkbox').forEach(checkbox => checkbox.checked = false);
    }

    showError() {
        const content = this.filtersPanel.modal.querySelector('.filters-content');
        if (!content) return;
        
        const existingCard = content.querySelector('.parameters-card');
        if (existingCard) existingCard.remove();
        
        const parametersCard = document.createElement('div');
        parametersCard.className = 'filter-section parameters-card';
        
        const title = document.createElement('div');
        title.className = 'section-title';
        title.textContent = 'Parameters';
        
        const errorMsg = document.createElement('div');
        errorMsg.className = 'no-options-message error-message';
        errorMsg.textContent = 'Failed to load parameters after multiple attempts. Please refresh the page.';
        
        parametersCard.appendChild(title);
        parametersCard.appendChild(errorMsg);
        content.appendChild(parametersCard);
        
        this.filtersPanel.applyCardStyling();
    }

    async loadParametersWithRetry() {
        try {
            await this.loadParameters();
        } catch (error) {
            console.error('Failed to load parameters:', error.message);
            this.showError();
        }
    }

    async loadParameters() {
        this.filtersPanel.parameters.clear();
        
        const loadFromDataTable = async () => {
            const dataTable = await LoadingWrapper.waitForDataTable(this.filtersPanel.currentTable);
            const tableData = dataTable.data().toArray();
            
            if (tableData.length === 0) {
                throw new Error('DataTable has no data');
            }
            
            tableData.forEach((model, index) => {
                if (model.modelParameters) {
                    const parameters = ParameterUtils.extractParametersFromString(model.modelParameters);
                    parameters.forEach(param => {
                        this.filtersPanel.parameters.add(param.original);
                    });
                }
            });
            
            return true;
        };
        
        const loadFromRawData = () => {
            if (window.modelsData && this.filtersPanel.currentTable === 'models') {
                window.modelsData.forEach((model, index) => {
                    if (model.modelParameters) {
                        const parameters = ParameterUtils.extractParametersFromString(model.modelParameters);
                        parameters.forEach(param => {
                            this.filtersPanel.parameters.add(param.original);
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
                throw new Error('Failed to load parameters from both DataTable and raw data');
            }
        }
        
        this.create();
    }

    loadParametersFromRawData() {
        if (window.modelsData && this.filtersPanel.currentTable === 'models') {
            window.modelsData.forEach((model, index) => {
                if (model.modelParameters) {
                    const parameters = ParameterUtils.extractParametersFromString(model.modelParameters);
                    parameters.forEach(param => {
                        this.filtersPanel.parameters.add(param.original);
                    });
                }
            });
        }
    }
}
