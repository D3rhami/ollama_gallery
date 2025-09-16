const toggle=document.getElementById('theme-toggle');
const body=document.body;
const thumb=document.querySelector('.theme-toggle-thumb');
const suncloud=document.querySelector('.theme-toggle-suncloud');
const moonstars=document.querySelector('.theme-toggle-moonstars');
let isDark=body.classList.contains('dark-mode');
function setTheme(dark){
    if(dark){
        body.classList.add('dark-mode');
        document.querySelector('.banner img').src='assets/images/banner.png';
    }else{
        body.classList.remove('dark-mode');
        document.querySelector('.banner img').src='assets/images/banner_light.png';
    }
}
toggle.addEventListener('click',()=>{
    isDark=!isDark;
    setTheme(isDark);
}); 