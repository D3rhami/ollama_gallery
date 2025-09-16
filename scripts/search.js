document.addEventListener('DOMContentLoaded',()=>{
    const searchInput=document.querySelector('.search-input');
    const searchButton=document.querySelector('.search-button');
    $.fn.dataTable.ext.search.push(function(settings,data,dataIndex){
        const input=document.querySelector('.search-input');
        if(!input)return true;
        const term=input.value.trim().toLowerCase();
        if(term==='')return true;
        if(!settings.nTable)return true;
        const tableId=settings.nTable.id;
        if(tableId==='models-table'){
            if(!window.dataTable)return true;
            const rowData=window.dataTable.row(dataIndex).data();
            if(!rowData)return true;
            const fields=['modelName','modelCapabilities','modelParameters','updateString','updateDate','modelDescription'];
            return fields.some(f=>{const v=rowData[f];return v&&v.toString().toLowerCase().includes(term)});
        }else if(tableId==='tags-table'){
            if(!window.tagsDataTable)return true;
            const rowData=window.tagsDataTable.row(dataIndex).data();
            if(!rowData)return true;
            const fields=['tagName','inputTypes','contextWindow','size','updated','updatedStr','updateDate'];
            return fields.some(f=>{const v=rowData[f];return v&&v.toString().toLowerCase().includes(term)});
        }
        return true;
    });
    
    if(searchInput){
        const getHint=()=>{
            const activeView=document.querySelector('.nav-link.active');
            const view=activeView?activeView.getAttribute('data-view'):'models';
            return view==='tags'
                ? 'Search: name, type, context, size, updated'
                : 'Search: name, capability, parameter, updated, description';
        };
        const setHint=()=>{ searchInput.placeholder = getHint(); };
        setHint();
        window.addEventListener('updateSearchHint', (e)=>{
            const v = (e && e.detail && e.detail.view) ? e.detail.view : null;
            if (!searchInput.value.trim()) {
                searchInput.placeholder = v==='tags'
                    ? 'Search: name, type, context, size, updated'
                    : 'Search: name, capability, parameter, updated, description';
            }
        });
        searchInput.addEventListener('input',()=>{
            clearValidation();
            performSearch(searchInput.value);
        });
        searchInput.addEventListener('focus',()=>{clearValidation()});
        searchInput.addEventListener('blur',()=>{ if(!searchInput.value.trim()) setHint(); });
    }
    if(searchButton){
        searchButton.addEventListener('click',()=>{performSearch(searchInput.value)});
    }
    
    function performSearch(query){
        const trimmedQuery=query.trim();
        const activeView = document.querySelector('.nav-link.active');
        let currentDataTable = null;
        if(activeView&&activeView.getAttribute('data-view')==='models'){currentDataTable=window.dataTable}
        else if(activeView&&activeView.getAttribute('data-view')==='tags'){currentDataTable=window.tagsDataTable}
        if(currentDataTable){
            try {
                if (currentDataTable.table) {
                    const markInstance = new Mark(currentDataTable.table().body());
                    markInstance.unmark();
                    $('.search-highlight-cell').removeClass('search-highlight-cell');
                }
                
                if (!trimmedQuery) {
                    if(window.dataTable) window.dataTable.draw();
                    if(window.tagsDataTable) window.tagsDataTable.draw();
                    return;
                }
                if(window.dataTable) window.dataTable.draw();
                if(window.tagsDataTable) window.tagsDataTable.draw();
                
                if (currentDataTable.table) {
                    const newMarkInstance = new Mark(currentDataTable.table().body());
                    newMarkInstance.mark(trimmedQuery, {
                        element: 'mark',
                        className: 'highlight',
                        separateWordSearch: false,
                        acrossElements: true,
                        exclude: ['script', 'style', 'title', 'head', '.url-link', '.tags-url-link'],
                        filter: function(node, term, totalCounter, counter) {
                            const cell = $(node).closest('td');
                            const columnIndex = cell.index();
                            if (activeView.getAttribute('data-view') === 'models') {
                                const searchableColumns = [2, 3, 4, 7, 8];
                                return searchableColumns.includes(columnIndex);
                            } else {
                                const searchableColumns = [2, 3, 4, 5, 6];
                                return searchableColumns.includes(columnIndex);
                            }
                        },
                        each: function(node) {
                            const cell = $(node).closest('td');
                            const cellText = cell.text().toLowerCase();
                            const searchTerm = trimmedQuery.toLowerCase();
                            
                            if (cellText.includes(searchTerm)) {
                                cell.addClass('search-highlight-cell');
                            }
                        }
                    });
                }
            } catch (error) {
                console.warn('Search error:', error);
            }
        }else{
            console.log('Performing search for:',trimmedQuery);
        }
    }

    // Expose a lightweight highlighter to reapply highlights after table redraws/filters
    window.reapplySearchHighlight = function(){
        const input = document.querySelector('.search-input');
        const trimmedQuery = input ? input.value.trim() : '';
        if (!trimmedQuery) return;
        const activeView = document.querySelector('.nav-link.active');
        let currentDataTable = null;
        if(activeView&&activeView.getAttribute('data-view')==='models'){currentDataTable=window.dataTable}
        else if(activeView&&activeView.getAttribute('data-view')==='tags'){currentDataTable=window.tagsDataTable}
        if (!currentDataTable || !currentDataTable.table) return;
        try{
            const body = currentDataTable.table().body();
            const markInstance = new Mark(body);
            markInstance.unmark({ done: function(){
                const newMarkInstance = new Mark(body);
                newMarkInstance.mark(trimmedQuery, {
                    element: 'mark',
                    className: 'highlight',
                    separateWordSearch: false,
                    acrossElements: true,
                    exclude: ['script', 'style', 'title', 'head', '.url-link', '.tags-url-link'],
                    filter: function(node){
                        const cell = $(node).closest('td');
                        const columnIndex = cell.index();
                        if (activeView.getAttribute('data-view') === 'models') {
                            const searchableColumns = [2, 3, 4, 7, 8];
                            return searchableColumns.includes(columnIndex);
                        } else {
                            const searchableColumns = [2, 3, 4, 5, 6];
                            return searchableColumns.includes(columnIndex);
                        }
                    },
                    each: function(node){
                        const cell = $(node).closest('td');
                        const cellText = cell.text().toLowerCase();
                        const searchTerm = trimmedQuery.toLowerCase();
                        if (cellText.includes(searchTerm)) {
                            cell.addClass('search-highlight-cell');
                        }
                    }
                });
            }});
        }catch(err){
            console.warn('Rehighlight error:', err);
        }
    };
    
    function showValidation(){
        searchInput.classList.add('search-error');
        searchInput.placeholder='Please enter a search term...';
    }
    
    function clearValidation(){
        searchInput.classList.remove('search-error');
        if(!searchInput.value.trim()){
            const activeView=document.querySelector('.nav-link.active');
            const view=activeView?activeView.getAttribute('data-view'):'models';
            searchInput.placeholder = view==='tags'
                ? 'Search: name, type, context, size, updated'
                : 'Search: name, capability, parameter, updated, description';
        }
    }
}); 