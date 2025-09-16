let tagsDataTable = null;

function createTagsPlaceholderData() {
    const placeholders = [];
    for (let i = 1; i <= 10; i++) {
        placeholders.push({
            index: i,
            tagUrl: 'undefined',
            tagName: 'undefined',
            inputTypes: 'undefined',
            contextWindow: 'undefined',
            contextWindowNum: 0,
            size: 'undefined',
            sizeNum: 0,
            updated: 'undefined',
            updatedStr: 'undefined',
            updateDate: 'undefined',
            uniqueId: 'undefined'
        });
    }
    return placeholders;
}



function initializeTagsTableWithPlaceholders() {
    try {
        const placeholderData = createTagsPlaceholderData();
        if (tagsDataTable) {
            tagsDataTable.destroy();
        }
    
    tagsDataTable = $('#tags-table').DataTable({
        data: placeholderData,
        columns: [
            {data: 'index', title: 'i'},
            {
                data: 'tagUrl',
                title: 'URL',
                orderable: false,
                render: function(data, type, row) {
                    if (type === 'display') {
                        if (data && data !== 'undefined') {
                            return '<a href="' + data + '" target="_blank" class="tags-url-link" data-url="' + data + '"><img src="' + window.tableUtils.getUrlIcon() + '" alt="Open Link" style="width:20px;height:20px;cursor:pointer;"></a>';
                        }
                        return 'undefined';
                    }
                    return '';
                }
            },
            {
                data: 'tagName',
                title: 'Tag Name',
                render: function(data, type, row) {
                    if (type === 'display') {
                        if (data && data !== 'undefined') {
                            return '<span class="tag-name-copy" data-tag="' + data + '" style="cursor: pointer;">' + data + '</span>';
                        }
                        return 'undefined';
                    }
                    return data;
                }
            },
            {
                data: 'inputTypes',
                title: 'Input Types',
                render: function(data, type, row) {
                    if (type === 'display') {
                        if (data && data !== 'undefined') {
                            return data;
                        }
                        return 'undefined';
                    }
                    return data;
                }
            },
            {
                data: 'contextWindow',
                title: 'Context Window',
                type: 'num',
                render: function(data, type, row) {
                    if (type === 'display') {
                        if (data && data !== 'undefined') {
                            return data;
                        }
                        return 'undefined';
                    }
                    return row.contextWindowNum || 0; // Use numeric value for sorting
                }
            },
            {
                data: 'size',
                title: 'Size',
                type: 'num',
                render: function(data, type, row) {
                    if (type === 'display') {
                        if (data && data !== 'undefined') {
                            return data;
                        }
                        return 'undefined';
                    }
                    return row.sizeNum || 0; // Use numeric value for sorting
                }
            },
                             {
                     data: 'updated',
                     title: 'Updated',
                     type: 'string',
                     render: function(data, type, row) {
                         if (type === 'display') {
                             if (data && data !== 'undefined') {
                                 return data;
                             }
                             return 'undefined';
                         }
                         return row.updateDate || data; // Use date for sorting
                     }
                 },
                 {
                     data: 'uniqueId',
                     title: 'Unique ID',
                     orderable: false,
                     render: function(data, type, row) {
                         if (type === 'display') {
                             if (data && data !== 'undefined') {
                                 return data;
                             }
                             return 'undefined';
                         }
                         return data;
                     }
                 }
        ],
        ...window.tableUtils.getCommonDataTableConfig(),
        language: {
            search: "Search tags:",
            lengthMenu: "Show _MENU_ tags per page",
            info: "Showing _START_ to _END_ of _TOTAL_ tags",
            infoEmpty: "Showing 0 to 0 of 0 tags",
            infoFiltered: "(filtered from _MAX_ total tags)",
            paginate: {
                first: "First",
                last: "Last",
                next: "Next",
                previous: "Previous"
            }
        }
    });
    
    window.tagsDataTable = tagsDataTable;
    } catch (error) {
        console.error('Error initializing tags table:', error);
    }
}

async function loadTagsData() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/D3rhami/ollama_gallery/refs/heads/main/data/tags.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const tagsData = await response.json();
        
        const processedData = [];
        let index = 1;
        
        for (const [tagName, tagVariants] of Object.entries(tagsData)) {
            for (const [variantId, variantData] of Object.entries(tagVariants)) {
                                 processedData.push({
                     index: index++,
                     tagUrl: variantData.href || 'undefined',
                     tagName: variantData.name || 'undefined',
                     inputTypes: Array.isArray(variantData.input_types) ? variantData.input_types.join(', ') : 'undefined',
                     contextWindow: variantData.context_window || 'undefined',
                     contextWindowNum: variantData.context_window_num || 0,
                     size: variantData.size_str || 'undefined',
                     sizeNum: variantData.size_num || 0,
                     updated: variantData.updated_str || 'undefined',
                     updatedStr: variantData.updated_str || 'undefined',
                     updateDate: variantData.update_date || 'undefined',
                     uniqueId: variantId || 'undefined'
                 });
            }
        }
        
        if (tagsDataTable) {
            tagsDataTable.destroy();
        }
        
        tagsDataTable = $('#tags-table').DataTable({
            data: processedData,
            columns: [
                {data: 'index', title: 'i'},
                {
                    data: 'tagUrl',
                    title: 'URL',
                    orderable: false,
                    render: function(data, type, row) {
                        if (type === 'display') {
                            if (data && data !== 'undefined') {
                                return '<a href="' + data + '" target="_blank" class="tags-url-link" data-url="' + data + '"><img src="' + window.tableUtils.getUrlIcon() + '" alt="Open Link" style="width:20px;height:20px;cursor:pointer;"></a>';
                            }
                            return 'undefined';
                        }
                        return '';
                    }
                },
                {
                    data: 'tagName',
                    title: 'Tag Name',
                    render: function(data, type, row) {
                        if (type === 'display') {
                            if (data && data !== 'undefined') {
                                return '<span class="tag-name-copy" data-tag="' + data + '" style="cursor: pointer;">' + data + '</span>';
                            }
                            return 'undefined';
                        }
                        return data;
                    }
                },
                {
                    data: 'inputTypes',
                    title: 'Input Types',
                    render: function(data, type, row) {
                        if (type === 'display') {
                            if (data && data !== 'undefined') {
                                return data;
                            }
                            return 'undefined';
                        }
                        return data;
                    }
                },
                {
                    data: 'contextWindow',
                    title: 'Context Window',
                    type: 'num',
                    render: function(data, type, row) {
                        if (type === 'display') {
                            if (data && data !== 'undefined') {
                                return data;
                            }
                            return 'undefined';
                        }
                        return row.contextWindowNum; // Use numeric value for sorting
                    }
                },
                {
                    data: 'size',
                    title: 'Size',
                    type: 'num',
                    render: function(data, type, row) {
                        if (type === 'display') {
                            if (data && data !== 'undefined') {
                                return data;
                            }
                            return 'undefined';
                        }
                        return row.sizeNum; // Use numeric value for sorting
                    }
                },
                                 {
                     data: 'updated',
                     title: 'Updated',
                     type: 'string',
                     render: function(data, type, row) {
                         if (type === 'display') {
                             if (data && data !== 'undefined') {
                                 return '<span class="update-date-copy" data-update-string="' + row.updatedStr + '" data-update-date="' + row.updateDate + '" style="cursor: pointer;">' + data + '</span>';
                             }
                             return 'undefined';
                         }
                         return row.updateDate; // Use date for sorting
                     }
                 },
                 {
                     data: 'uniqueId',
                     title: 'Unique ID',
                     orderable: false,
                     render: function(data, type, row) {
                         if (type === 'display') {
                             if (data && data !== 'undefined') {
                                 return data;
                             }
                             return 'undefined';
                         }
                         return data;
                     }
                 }
            ],
            ...window.tableUtils.getCommonDataTableConfig(),
            language: {
                search: "Search tags:",
                lengthMenu: "Show _MENU_ tags per page",
                info: "Showing _START_ to _END_ of _TOTAL_ tags",
                infoEmpty: "Showing 0 to 0 of 0 tags",
                infoFiltered: "(filtered from _MAX_ total tags)",
                paginate: {
                    first: "First",
                    last: "Last",
                    next: "Next",
                    previous: "Previous"
                }
            }
        });
        
        window.tagsDataTable = tagsDataTable;
        if (window.tableManager) {
            window.tableManager.setTableDataTable('tags', tagsDataTable);
        }
        
        console.log(`📊 Tags loaded: ${processedData.length} tags`);
        
    } catch (error) {
        console.error('Error loading tags data:', error);
        // Keep placeholder data if loading fails
    }
}

// unified search implemented in search.js


// Initialize tags table when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeTagsTableWithPlaceholders();
    
    // Set up copy functionality for tag names
    $(document).on('click', '.tag-name-copy', function() {
        const tagName = $(this).data('tag');
        if (tagName && tagName !== 'undefined') {
            window.tableUtils.copyToClipboard(tagName).then(success => {
                if (success) {
                    window.tableUtils.showNotification(`${tagName} copied to clipboard! 😊`, 'success');
                } else {
                    window.tableUtils.showNotification('Failed to copy to clipboard', 'error');
                }
            });
        }
    });
    
    // Set up URL link functionality
    $(document).on('click', '.tags-url-link', function(e) {
        e.preventDefault();
        const url = $(this).data('url');
        if (url && url !== 'undefined') {
            window.open(url, '_blank');
        }
    });


    // Tooltip for tag name ("Click to copy")
    $(document).on('mouseenter', '.tag-name-copy', function(e) {
        window.tableUtils.createTooltip('Click to copy', this, 'tag-tooltip');
    });
    $(document).on('mouseleave', '.tag-name-copy', function() {
        $('.tag-tooltip').remove();
    });
    // Tooltip for URL (show full URL)
    $(document).on('mouseenter', '.tags-url-link', function(e) {
        const url = $(this).data('url');
        window.tableUtils.createTooltip(url, this, 'url-tooltip');
    });
    $(document).on('mouseleave', '.tags-url-link', function() {
        $('.url-tooltip').remove();
    });
    // Tooltip for updated date (show full date)
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
});

// Update icons when theme changes
document.addEventListener('themeChanged', function() {
    window.tableUtils.updateUrlIcons('.tags-url-link');
}); 