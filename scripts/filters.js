document.addEventListener('DOMContentLoaded',()=>{
    const btn=document.querySelector('.filters-button');
    const modal=document.querySelector('.filters-modal');
    const closeBtn=document.querySelector('.filters-close');
    const clearBtn=document.querySelector('.filters-clear');
    const applyBtn=document.querySelector('.filters-apply');
    const chipsBar=document.querySelector('.filter-chips-ribbon');
    function openModal(){
        const isModels=document.getElementById('models-table-container').style.display!== 'none';
        const isTags=document.getElementById('tags-table-container').style.display!== 'none';
        const title=document.querySelector('.filters-title');
        let count=0;
        try{
            if(isModels&&window.dataTable&&window.dataTable.data){count=window.dataTable.data().length}
            if(isTags&&window.tagsDataTable&&window.tagsDataTable.data){count=window.tagsDataTable.data().length}
        }catch(e){count=0}
        if(isModels) title.textContent=`Models • ${count}`;
        else if(isTags) title.textContent=`Tags • ${count}`;
        else title.textContent='Filters';
        modal.classList.add('open');
        document.body.style.overflow='hidden'
    }
    function closeModal(){modal.classList.remove('open');document.body.style.overflow=''}
    btn&&btn.addEventListener('click',openModal)
    closeBtn&&closeBtn.addEventListener('click',closeModal)
    modal&&modal.addEventListener('click',e=>{if(e.target===modal) closeModal()})
    function renderChips(filters){
        chipsBar.innerHTML='';
        if(!filters.length){chipsBar.style.display='none';return}
        chipsBar.style.display='flex';
        filters.forEach(f=>{
            const c=document.createElement('div');c.className='filter-chip';
            const label=document.createElement('span');label.textContent=`${f.key}: ${f.value}`;
            const x=document.createElement('button');x.className='chip-remove';x.innerHTML='&times;';
            x.addEventListener('click',()=>{state=state.filter(it=>!(it.key===f.key&&it.value===f.value));renderChips(state)});
            c.appendChild(label);c.appendChild(x);chipsBar.appendChild(c);
        })
    }
    let state=[];clearBtn&&clearBtn.addEventListener('click',()=>{state=[];renderChips(state)});
    applyBtn&&applyBtn.addEventListener('click',()=>{closeModal()});
})

