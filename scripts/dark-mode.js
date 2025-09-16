(()=>{
    const darkModeKey='ollama-gallery-dark-mode';
    const body=document.body;
    const themeToggle=document.getElementById('theme-toggle');
    const bannerImage=document.querySelector('.banner img');
    const darkModeStyles={
        light:{
            bannerSrc:'assets/images/banner_light.svg',
            bodyClass:'',
            tableClass:''
        },
        dark:{
            bannerSrc:'assets/images/banner.svg',
            bodyClass:'dark-mode',
            tableClass:'dark-table'
        }
    };
    const applyDarkMode=(isDark)=>{
        const mode=isDark?'dark':'light';
        const styles=darkModeStyles[mode];
        body.classList.toggle('dark-mode',isDark);
        if(bannerImage){bannerImage.src=styles.bannerSrc}
        const tables=document.querySelectorAll('table');
        tables.forEach(table=>{table.classList.toggle('dark-table',isDark)});
        localStorage.setItem(darkModeKey,mode);
    };
    const initDarkMode=()=>{
        const savedMode=localStorage.getItem(darkModeKey)||'light';
        applyDarkMode(savedMode==='dark');
    };
    const toggleDarkMode=()=>{
        const currentMode=body.classList.contains('dark-mode')?'dark':'light';
        const newMode=currentMode==='light'?'dark':'light';
        applyDarkMode(newMode==='dark');
    };
    document.addEventListener('DOMContentLoaded',initDarkMode);
    if(themeToggle){themeToggle.addEventListener('click',toggleDarkMode)}
    window.darkMode={toggle:toggleDarkMode,init:initDarkMode};
})(); 