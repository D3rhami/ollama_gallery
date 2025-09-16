class TableManager {
    constructor() {
        this.tables = new Map();
        this.currentTable = 'models';
        this.init();
    }

    init() {
        this.createTable('models', {
            columns: ['i', 'URL', 'Model', 'Capabilities', 'Parameters', 'Tags', 'Pulls', 'Updated', 'Description'],
            dataSource: 'models',
            containerId: 'table-container',
            tableType: 'models'
        });
        
        this.createTable('tags', {
            columns: ['i', 'URL', 'Tag Name', 'Input Types', 'Context Window', 'Size', 'Updated'],
            dataSource: 'tags',
            containerId: 'table-container',
            tableType: 'tags'
        });

        this.setupEventListeners();
    }

    createTable(type, config) {
        const tableId = `${type}-table`;
        const containerId = `${type}-table-container`;
        
        const container = this.createContainer(containerId, config);
        const table = this.createTableElement(tableId, config.columns);
        
        container.appendChild(table);
        
        // Append to the main table container
        const mainContainer = document.getElementById('table-container');
        if (mainContainer) {
            mainContainer.appendChild(container);
        }
        
        this.tables.set(type, {
            container,
            table,
            dataTable: null,
            config,
            isVisible: type === 'models'
        });

        this.updateTableVisibility();
        
        if (window.ribbonManager) {
            window.ribbonManager.reinitialize();
        }
    }

    createContainer(containerId, config) {
        const container = document.createElement('div');
        container.id = containerId;
        container.className = 'table-scroll-container';
        
        const ribbon = document.createElement('div');
        ribbon.className = 'ribbon1';
        container.appendChild(ribbon);
        
        if (config.tableType === 'models') {
            container.style.display = 'block';
        } else {
            container.style.display = 'none';
        }
        
        return container;
    }

    createTableElement(tableId, columns) {
        const table = document.createElement('table');
        table.id = tableId;
        table.className = 'table table-striped table-bordered';
        table.style.width = '100%';
        
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        columns.forEach(column => {
            const th = document.createElement('th');
            th.textContent = column;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        return table;
    }

    setupEventListeners() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = link.getAttribute('data-view');
                this.switchTable(view);
            });
        });
    }

    switchTable(tableType) {
        if (tableType === 'models' || tableType === 'tags') {
            this.currentTable = tableType;
            this.updateTableVisibility();
            this.updateActiveNavLink(tableType);
            
            if (window.filtersPanel) {
                window.filtersPanel.updateTableName();
            }
        }
    }

    updateTableVisibility() {
        this.tables.forEach((tableData, type) => {
            if (type === this.currentTable) {
                tableData.container.style.display = 'block';
                tableData.isVisible = true;
            } else {
                tableData.container.style.display = 'none';
                tableData.isVisible = false;
            }
        });
    }

    updateActiveNavLink(activeType) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-view') === activeType) {
                link.classList.add('active');
            }
        });
    }

    getCurrentTable() {
        return this.tables.get(this.currentTable);
    }

    getTableDataTable(type) {
        const tableData = this.tables.get(type);
        return tableData ? tableData.dataTable : null;
    }

    setTableDataTable(type, dataTable) {
        const tableData = this.tables.get(type);
        if (tableData) {
            tableData.dataTable = dataTable;
        }
    }

    getAllTables() {
        return this.tables;
    }

    getCurrentTableType() {
        return this.currentTable;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.tableManager = new TableManager();
});
