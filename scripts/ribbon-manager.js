class RibbonManager {
    constructor() {
        this.ribbons = new Map();
        this.filters = new Map();
        this.init();
    }

    init() {
        this.setupRibbons();
        this.setupEventListeners();
    }

    setupRibbons() {
        const ribbonElements = document.querySelectorAll('.ribbon1');
        ribbonElements.forEach((ribbon, index) => {
            const tableType = ribbon.closest('[id$="-table-container"]')?.id.replace('-table-container', '') || 'default';
            this.ribbons.set(tableType, ribbon);
            this.render(tableType);
        });
    }

    setupEventListeners() {
        this.ribbons.forEach((ribbon, tableType) => {
            ribbon.addEventListener('click', (e) => {
                const chip = e.target.closest('.filter-chip');
                if (!chip) return;
                
                const filterId = chip.dataset.filterId;
                
                if (e.target.classList.contains('filter-action-btn') || e.target.closest('.filter-action-btn')) {
                    const action = e.target.closest('.filter-action-btn').dataset.action;
                    this.handleFilterAction(action, filterId, tableType);
                } else if (e.target.closest('.filter-chip-button')) {
                    const action = chip.dataset.action;
                    this.handleFilterAction(action, filterId, tableType);
                }
            });
        });
    }

    handleFilterAction(action, filterId, tableType) {
        switch (action) {
            case 'remove':
                this.removeFilter(filterId, tableType);
                if (window.filtersPanel) {
                    window.filtersPanel.removeFilterFromRibbon(filterId);
                }
                break;
            case 'open':
                this.openFilterHub(filterId);
                break;
            case 'save':
                this.saveFilter(filterId, tableType);
                break;
            default:
                console.log(`Action ${action} for filter ${filterId}`);
        }
    }

    getTooltip(action) {
        const tooltips = {
            'remove': 'Remove filter',
            'open': 'Open Filter Hub',
            'save': 'Save filter'
        };
        return tooltips[action] || 'Filter action';
    }

    openFilterHub(filterId = null) {
        if (window.filtersPanel) {
            window.filtersPanel.openModal(filterId);
        }
    }

    saveFilter(filterId, tableType) {
        console.log(`Saving filter: ${filterId} for table: ${tableType}`);
    }

    addFilter(id, type, label, tableType = 'models', icon = null, action = 'remove', color = null) {
        if (!this.filters.has(tableType)) {
            this.filters.set(tableType, new Map());
        }
        this.filters.get(tableType).set(id, { type, label, icon, action, color });
        this.render(tableType);
    }

    removeFilter(id, tableType = 'models') {
        if (this.filters.has(tableType)) {
            this.filters.get(tableType).delete(id);
            this.render(tableType);
        }
    }

    clearAll(tableType = null) {
        if (tableType) {
            if (this.filters.has(tableType)) {
                this.filters.get(tableType).clear();
                this.render(tableType);
            }
        } else {
            this.filters.clear();
            this.ribbons.forEach((ribbon, type) => this.render(type));
        }
    }

    clearAllFilters(tableType = null) {
        this.clearAll(tableType);
    }

    render(tableType = 'models') {
        const ribbon = this.ribbons.get(tableType);
        if (!ribbon) return;
        
        const tableFilters = this.filters.get(tableType) || new Map();
        
        if (tableFilters.size === 0) {
            ribbon.innerHTML = '<span class="filter-placeholder">No filters applied</span>';
            return;
        }

        let html = '';
        tableFilters.forEach((filter, id) => {
            const action = filter.action || 'remove';
            const tooltip = this.getTooltip(action);
            const hasIcon = filter.icon && filter.icon !== null;
            
            if (hasIcon) {
                const colorStyle = filter.color ? `style="color: ${filter.color};"` : '';
                html += `
                    <div class="filter-chip" data-filter-id="${id}">
                        <span>${filter.label}</span>
                        <button class="filter-action-btn" data-action="${action}" title="${tooltip}"><i class="${filter.icon}" ${colorStyle}></i></button>
                    </div>
                `;
            } else {
                html += `
                    <div class="filter-chip filter-chip-button" data-filter-id="${id}" data-action="${action}" title="${tooltip}">
                        <span>${filter.label}</span>
                    </div>
                `;
            }
        });
        
        ribbon.innerHTML = html;
    }

    reinitialize() {
        this.ribbons.clear();
        this.setupRibbons();
        this.setupEventListeners();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.ribbonManager = new RibbonManager();
});
