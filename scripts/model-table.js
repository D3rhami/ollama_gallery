let dataTable = null;

function createPlaceholderData() {
    const placeholders = [];
    for (let i = 1; i <= 10; i++) {
        placeholders.push({
            index: i,
            modelUrl: 'undefined',
            modelName: 'undefined',
            modelCapabilities: 'undefined',
            modelParameters: 'undefined',
            tagCount: 'undefined',
            pullCount: 'undefined',
            pullSort: 'undefined',
            updateString: 'undefined',
            updateDate: 'undefined',
            modelDescription: 'undefined'
        });
    }
    return placeholders;
}



function initializeTableWithPlaceholders() {
    try {
        const placeholderData = createPlaceholderData();
        if (dataTable) {
            dataTable.destroy();
        }
    
    dataTable = $('#models-table').DataTable({
        data: placeholderData,
        columns: [
            {data: 'index', title: 'i'},
            {
                data: 'modelUrl',
                title: 'URL',
                orderable: false,
                render: function(data, type, row) {
                    if (type === 'display') {
                        if (data && data !== 'undefined') {
                            return '<a href="' + data + '" target="_blank" class="url-link" data-url="' + data + '"><img src="' + window.tableUtils.getUrlIcon() + '" alt="Open Link" style="width:20px;height:20px;cursor:pointer;"></a>';
                        }
                        return 'undefined';
                    }
                    return '';
                }
            },
            {
                data: 'modelName',
                title: 'Model',
                render: function(data, type, row) {
                    if (type === 'display') {
                        if (data && data !== 'undefined') {
                            return '<span class="model-name-copy" data-model="' + data + '" style="cursor: pointer;">' + data + '</span>';
                        }
                        return 'undefined';
                    }
                    return data;
                }
            },
            {data: 'modelCapabilities', title: 'Capabilities'},
            {data: 'modelParameters', title: 'Parameters'},
            {
                data: 'tagCount',
                title: 'Tags',
                render: function(data, type, row) {
                    if (type === 'display') {
                        if (data && data !== 'undefined') {
                            return '<span class="tags-count-clickable" data-model="' + row.modelName + '" style="cursor: pointer;">' + data + '</span>';
                        }
                        return 'undefined';
                    }
                    return data;
                }
            },
            {
                data: 'pullCount',
                title: 'Pulls',
                type: 'num',
                render: function(data, type, row) {
                    if (type === 'display') {
                        return row.pullCount;  // Shows the human-readable string
                    }
                    return row.pullSort;  // Used for sorting
                }
            },
            {
                data: 'updateString',
                title: 'Updated',
                type: 'string',
                render: function(data, type, row) {
                    if (type === 'display') {
                        if (row.updateDate && row.updateDate !== 'undefined') {
                            return '<span class="update-date-copy" data-update-string="' + row.updateString + '" data-update-date="' + row.updateDate + '" style="cursor: pointer;">' + row.updateString + '</span>';
                        }
                        return row.updateString;
                    }
                    return row.updateDate;
                }
            },
            {data: 'modelDescription', title: 'Description', orderable: false}
        ],
        ...window.tableUtils.getCommonDataTableConfig(),
        createdRow: function(row, data, dataIndex) {
            $(row).find('td:eq(2)').attr('data-column', 'model');
            $(row).find('td:eq(8)').attr('data-column', 'description');
        },
        initComplete: function() {
            $('#models-table thead th:eq(2)').attr('data-column', 'model');
            $('#models-table thead th:eq(8)').attr('data-column', 'description');
        }
    });
    } catch (error) {
        console.error('Error initializing models table:', error);
    }
}

async function loadModelsData() {
    try {
        initializeTableWithPlaceholders();
        const startTime = Date.now();
        const minAnimationDuration = 3000;
        
        if (window.particleLoadingAnimation) {
            window.particleLoadingAnimation.show();
        }
        
        const dataPromise = fetch('https://raw.githubusercontent.com/D3rhami/ollama_gallery/refs/heads/main/data/models.json').then(response => response.json());
        const animationPromise = window.particleLoadingAnimation ? window.particleLoadingAnimation.simulateProgress() : Promise.resolve();
        
        const [models] = await Promise.all([dataPromise, animationPromise]);
        
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minAnimationDuration - elapsedTime);
        
        if (remainingTime > 0) {
            await new Promise(resolve => setTimeout(resolve, remainingTime));
        }
        
        if (dataTable) {
            dataTable.destroy();
        }
        
        // Filter out the metadata entry (index -1) and process the actual models
        const processedData = Object.entries(models)
            .filter(([key, model]) => key !== '-1' && model && typeof model === 'object')
            .map(([key, model], index) => ({
                index: index + 1,
                modelUrl: model.link || 'undefined',
                modelName: key,
                modelCapabilities: Array.isArray(model.capabilities) ? model.capabilities.join(', ') : 'undefined',
                modelParameters: Array.isArray(model.parameters) ? model.parameters.join(', ') : 'undefined',
                tagCount: model.tag_count || 'undefined',
                pullCount: model.pull_str || 'undefined',
                pullSort: model.pull || 'undefined',
                updateString: model.updated || 'undefined',
                updateDate: model.update_date || 'undefined',
                modelDescription: model.description || 'undefined'
            }));
        
        // Store models data globally and log count
        window.modelsData = processedData;
        console.log(`📊 Models loaded: ${processedData.length} models`);
        
        dataTable = $('#models-table').DataTable({
            data: processedData,
            columns: [
                {data: 'index', title: 'i'},
                {
                    data: 'modelUrl',
                    title: 'URL',
                    orderable: false,
                    render: function(data, type, row) {
                        if (type === 'display') {
                            if (data && data !== 'undefined') {
                                return '<a href="' + data + '" target="_blank" class="url-link" data-url="' + data + '"><img src="' + window.tableUtils.getUrlIcon() + '" alt="Open Link" style="width:20px;height:20px;cursor:pointer;"></a>';
                            }
                            return 'undefined';
                        }
                        return '';
                    }
                },
                {
                    data: 'modelName',
                    title: 'Model',
                    render: function(data, type, row) {
                        if (type === 'display') {
                                                    if (data && data !== 'undefined') {
                            return '<span class="model-name-copy" data-model="' + data + '" style="cursor: pointer;">' + data + '</span>';
                        }
                            return 'undefined';
                        }
                        return data;
                    }
                },
                {data: 'modelCapabilities', title: 'Capabilities'},
                {data: 'modelParameters', title: 'Parameters'},
                {
                    data: 'tagCount',
                    title: 'Tags',
                    render: function(data, type, row) {
                        if (type === 'display') {
                            if (data && data !== 'undefined') {
                                return '<span class="tags-count-clickable" data-model="' + row.modelName + '" style="cursor: pointer;">' + data + '</span>';
                            }
                            return 'undefined';
                        }
                        return data;
                    }
                },
                {
                    data: 'pullCount',
                    title: 'Pulls',
                    type: 'num',
                    render: function(data, type, row) {
                        if (type === 'display') {
                            return row.pullCount;  // Shows the human-readable string
                        }
                        return row.pullSort;  // Used for sorting
                    }
                },
                {
                    data: 'updateString',
                    title: 'Updated',
                    type: 'string',
                    render: function(data, type, row) {
                        if (type === 'display') {
                            if (row.updateDate && row.updateDate !== 'undefined') {
                                return '<span class="update-date-copy" data-update-string="' + row.updateString + '" data-update-date="' + row.updateDate + '" style="cursor: pointer;">' + row.updateString + '</span>';
                            }
                            return row.updateString;
                        }
                        return row.updateDate;
                    }
                },
                {data: 'modelDescription', title: 'Description', orderable: false}
            ],
            ...window.tableUtils.getCommonDataTableConfig(),
            createdRow: function(row, data, dataIndex) {
                $(row).find('td:eq(2)').attr('data-column', 'model');
                $(row).find('td:eq(8)').attr('data-column', 'description');
            },
            initComplete: function() {
                $('#models-table thead th:eq(2)').attr('data-column', 'model');
                $('#models-table thead th:eq(8)').attr('data-column', 'description');
            }
        });
        
        // Add single-click event listener for model names
        $(document).on('click', '.model-name-copy', function() {
            const modelName = $(this).data('model');
            window.tableUtils.copyToClipboard(modelName).then(success => {
                if (success) {
                    window.tableUtils.showNotification(`${modelName} copied to clipboard! 😊`, 'success');
                } else {
                    window.tableUtils.showNotification('Failed to copy to clipboard', 'error');
                }
            });
        });

        // Add tooltip positioning for URL links
        $(document).on('mouseenter', '.url-link', function(e) {
            const $this = $(this);
            const url = $this.data('url');
            window.tableUtils.createTooltip(url, this, 'url-tooltip');
        });

        $(document).on('mouseleave', '.url-link', function() {
            $('.url-tooltip').remove();
        });

        // Add tooltip positioning for model names
        $(document).on('mouseenter', '.model-name-copy', function(e) {
            const $this = $(this);
            window.tableUtils.createTooltip('Click to copy', this, 'model-tooltip');
        });

        $(document).on('mouseleave', '.model-name-copy', function() {
            $('.model-tooltip').remove();
        });

        // Add tooltip positioning for update dates
        $(document).on('mouseenter', '.update-date-copy', function(e) {
            const $this = $(this);
            const updateString = $this.data('update-string');
            const updateDate = $this.data('update-date');
            const content = updateDate && updateDate !== 'undefined' ? updateDate : updateString;
            window.tableUtils.createTooltip(content, this, 'update-tooltip');
        });

        $(document).on('mouseleave', '.update-date-copy', function() {
            $('.update-tooltip').remove();
        });

        // Add click event listener for tags count
        $(document).on('click', '.tags-count-clickable', async function() {
            const modelName = $(this).data('model');
            if (window.tableManager) {
                window.tableManager.switchTable('tags');
            }
            
            // Wait for tags data to be loaded
            const waitForTagsData = () => {
                return new Promise((resolve) => {
                    const checkData = () => {
                        if (window.tagsDataTable && window.tagsDataTable.data && window.tagsDataTable.data().count() > 0) {
                            resolve();
                        } else {
                            setTimeout(checkData, 100);
                        }
                    };
                    checkData();
                });
            };
            
            try {
                if (typeof loadTagsData === 'function') {
                    await loadTagsData();
                }
                await waitForTagsData();
            } catch (e) {
                console.warn('Error loading tags data:', e);
            }
            
            if (window.filtersPanel) {
                window.filtersPanel.staged = window.filtersPanel.staged || {};
                window.filtersPanel.staged.includeTerms = [modelName + ':'];
                window.filtersPanel.applyFilters();
            }
        });

        // Add hover event listener for tags count
        $(document).on('mouseenter', '.tags-count-clickable', function(e) {
            const $this = $(this);
            const modelName = $this.data('model');
            window.tableUtils.createTooltip('Switch to Tags and filter by ' + modelName, this, 'tags-tooltip');
        });

        $(document).on('mouseleave', '.tags-count-clickable', function() {
            $('.tags-tooltip').remove();
        });
        

        
        window.dataTable = dataTable;
        if (window.tableManager) {
            window.tableManager.setTableDataTable('models', dataTable);
        }
        
        if (window.particleLoadingAnimation) {
            window.particleLoadingAnimation.hide();
        }
    } catch (error) {
        console.error('Error loading models data:', error);
        if (window.particleLoadingAnimation) {
            window.particleLoadingAnimation.setError('Failed to load models data');
            setTimeout(() => {
                window.particleLoadingAnimation.hide();
            }, 3000);
        }
    }
}

// unified search implemented in search.js

document.addEventListener('DOMContentLoaded', function() {
    loadModelsData();
    
    var pathParts = window.location.pathname.split('/').filter(Boolean);
    var folder = pathParts.length > 1 ? pathParts[pathParts.length - 2] : pathParts[0];
    document.title = folder;
    
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            setTimeout(() => window.tableUtils.updateUrlIcons('.url-link'), 100);
            // Remove any existing tooltips when theme changes
            $('.url-tooltip, .model-tooltip, .update-tooltip').remove();
        });
    }
}); 