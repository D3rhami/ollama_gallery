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
        searchInput.addEventListener('input',()=>{
            clearValidation();
            performSearch(searchInput.value);
        });
        searchInput.addEventListener('focus',()=>{clearValidation()});
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
    
    function showValidation(){
        searchInput.classList.add('search-error');
        searchInput.placeholder='Please enter a search term...';
    }
    
    function clearValidation(){
        searchInput.classList.remove('search-error');
        searchInput.placeholder='Search...';
    }
}); 