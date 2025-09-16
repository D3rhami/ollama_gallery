document.addEventListener('DOMContentLoaded',()=>{
    const navigation=document.querySelector('.navigation ul');
    const navItems=[
        {text:'Models',href:'#',dataView:'models'},
        {text:'Tags',href:'#',dataView:'tags'},
        {text:'About Me',href:'#',dataView:'about'},
        {text:'APIs',href:'#',dataView:'apis'},
        {text:'Ollama',href:'#',dataView:'ollama'}
    ];
    
    function setupNavigation(){
        navigation.innerHTML='';
        navItems.forEach(item=>{
            const li=document.createElement('li');
            const a=document.createElement('a');
            a.href=item.href;
            a.textContent=item.text;
            a.className='nav-link';
            a.setAttribute('data-view',item.dataView);
            if(item.dataView==='models'){
                a.classList.add('active');
            }
            li.appendChild(a);
            navigation.appendChild(li);
        });
        
        // Add click handlers for navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const view = this.getAttribute('data-view');
                switchView(view);
            });
        });
        
        const aboutMeLink=document.getElementById('about-me-link');
        if(aboutMeLink){
            aboutMeLink.addEventListener('click',function(e){
                e.preventDefault();
                document.body.classList.toggle('debug-mode');
            });
        }
    }
    
    function switchView(view) {
        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to clicked link
        document.querySelector(`[data-view="${view}"]`).classList.add('active');
        
        // Clear search bar and any existing highlights
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.value = '';
            searchInput.classList.remove('search-error');
            searchInput.placeholder = 'Search...';
        }
        
        // Clear any existing highlights
        if (window.dataTable && window.dataTable.table) {
            try {
                const markInstance = new Mark(window.dataTable.table().body());
                markInstance.unmark();
                $('.search-highlight-cell').removeClass('search-highlight-cell');
            } catch (e) {
                console.warn('Error clearing model highlights:', e);
            }
        }
        if (window.tagsDataTable && window.tagsDataTable.table) {
            try {
                const markInstance = new Mark(window.tagsDataTable.table().body());
                markInstance.unmark();
                $('.search-highlight-cell').removeClass('search-highlight-cell');
            } catch (e) {
                console.warn('Error clearing tag highlights:', e);
            }
        }
        
        // Handle search bar and table visibility
        const searchContainer = document.querySelector('.search-bar-container');
        const filterRibbon = document.querySelector('.filter-chips-ribbon');
        const tableContainer = document.getElementById('table-container');
        const contentContainer = document.getElementById('content-container');
        
        if (view === 'models' || view === 'tags') {
            // Show search and table for models/tags
            if (searchContainer) searchContainer.style.display = 'flex';
            if (filterRibbon) filterRibbon.style.display = 'none';
            if (tableContainer) tableContainer.style.display = 'block';
            if (contentContainer) contentContainer.style.display = 'none';
            
            // Use table manager to switch views
            if (window.tableManager) {
                window.tableManager.switchTable(view);
            }
            
            // Show loading animation
            if (window.particleLoadingAnimation) window.particleLoadingAnimation.show();
            setTimeout(() => {
                // Load data for the selected view
                if (view === 'models') {
                    if (typeof loadModelsData === 'function') {
                        setTimeout(() => loadModelsData(), 1);
                    }
                } else if (view === 'tags') {
                    if (typeof loadTagsData === 'function') {
                        setTimeout(() => loadTagsData(), 1);
                    }
                }
                // Hide loading animation
                if (window.particleLoadingAnimation) window.particleLoadingAnimation.hide();
            }, 800);
        } else {
            // Hide search and table for other views
            if (searchContainer) searchContainer.style.display = 'none';
            if (filterRibbon) filterRibbon.style.display = 'none';
            if (tableContainer) tableContainer.style.display = 'none';
            if (contentContainer) {
                contentContainer.style.display = 'block';
                loadContent(view);
            }
        }
        
        // Update URL without page reload
        const url = new URL(window.location);
        if (view === 'models') {
            url.searchParams.delete('view');
        } else {
            url.searchParams.set('view', view);
        }
        window.history.pushState({view}, '', url);
    }
    
    async function loadAboutMeData() {
        const contentContainer = document.getElementById('content-container');
        if (!contentContainer) return;
        
        // Show loading state
        contentContainer.innerHTML = `
            <div class="content-section">
                <div class="profile-card">
                    <div style="text-align: center; padding: 2rem;">
                        <div class="loading-spinner"></div>
                        <p>Loading profile data...</p>
                    </div>
                </div>
            </div>
        `;
        
        try {
            const response = await fetch('https://api.github.com/users/D3rhami');
            const data = await response.json();
            
            // Get social links from GitHub profile
            const socialLinks = [];
            
            if (data.html_url) {
                socialLinks.push({
                    icon: 'fab fa-github',
                    text: 'GitHub',
                    url: data.html_url
                });
            }
            
            if (data.blog) {
                const blogUrl = data.blog.startsWith('http') ? data.blog : `https://${data.blog}`;
                socialLinks.push({
                    icon: 'fas fa-globe',
                    text: 'Website',
                    url: blogUrl
                });
            }
            
            if (data.twitter_username) {
                socialLinks.push({
                    icon: 'fab fa-twitter',
                    text: 'Twitter',
                    url: `https://twitter.com/${data.twitter_username}`
                });
            }
            
            // Add Gmail manually since it's not in GitHub API
            socialLinks.push({
                icon: 'fas fa-envelope',
                text: 'Gmail',
                url: 'mailto:d3rhami@gmail.com'
            });
            
            // Add Telegram manually since it's not in GitHub API
            socialLinks.push({
                icon: 'fab fa-telegram',
                text: 'Telegram',
                url: 'https://t.me/d3rhami'
            });
            
            // Generate social links HTML
            const socialLinksHTML = socialLinks.map(link => 
                `<a href="${link.url}" target="_blank" class="profile-link">
                    <i class="${link.icon}"></i> ${link.text}
                </a>`
            ).join('');
            
            contentContainer.innerHTML = `
                <div class="content-section">
                    <div class="profile-card">
                        <div class="profile-header">
                            <img src="${data.avatar_url}" alt="Profile Picture" class="profile-pic">
                            <div class="profile-info">
                                <h2>${data.name || 'AmirHossein Derhami'}</h2>
                            </div>
                        </div>
                        <div class="profile-links">
                            ${socialLinksHTML}
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error loading profile data:', error);
            // Fallback to static content
            contentContainer.innerHTML = `
                <div class="content-section">
                    <div class="profile-card">
                        <div class="profile-header">
                            <img src="https://github.com/D3rhami.png" alt="Profile Picture" class="profile-pic">
                            <div class="profile-info">
                                <h2>AmirHossein Derhami</h2>
                            </div>
                        </div>
                        <div class="profile-links">
                            <a href="https://github.com/D3rhami" target="_blank" class="profile-link">
                                <i class="fab fa-github"></i> GitHub
                            </a>
                            <a href="mailto:d3rhami@gmail.com" class="profile-link">
                                <i class="fas fa-envelope"></i> Gmail
                            </a>
                            <a href="https://t.me/d3rhami" target="_blank" class="profile-link">
                                <i class="fab fa-telegram"></i> Telegram
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    function loadContent(view) {
        const contentContainer = document.getElementById('content-container');
        if (!contentContainer) return;
        
        switch(view) {
            case 'about':
                loadAboutMeData();
                break;                
            case 'apis':
                contentContainer.innerHTML = `
                    <div class="content-section">
                        <div class="api-docs">
                            <div style="text-align:center;padding:2rem">
                                <div class="loading-spinner"></div>
                                <p>Loading API document...</p>
                            </div>
                        </div>
                    </div>
                `;
                (async()=>{
                    const link='https://github.com/D3rhami/ollama_gallery/blob/main/API_DOC.md';
                    const raw='https://raw.githubusercontent.com/D3rhami/ollama_gallery/main/API_DOC.md';
                    try{
                        const r=await fetch(raw,{cache:'no-store'});
                        if(!r.ok) throw new Error('bad');
                        const t=await r.text();
                        let html='';
                        if(window.marked){
                            html=window.marked.parse(t);
                        }else{
                            html=t.replace(/[&<>]/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[s])).replace(/\n/g,'<br>');
                        }
                        const safe=window.DOMPurify?window.DOMPurify.sanitize(html):html;
                        contentContainer.innerHTML=`
                            <div class="content-section">
                                <div class="api-docs">
                                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
                                        <h2 style="margin:0">API Document</h2>
                                        <a href="${link}" target="_blank" class="ollama-link"><i class="fab fa-github"></i> View on GitHub</a>
                                    </div>
                                    <div class="markdown-preview">${safe}</div>
                                </div>
                            </div>
                        `;
                        if(window.Prism&&window.Prism.highlightAll){
                            try{window.Prism.highlightAll();}catch(_){}
                        }
                        try{
                            const root=document.querySelector('.markdown-preview');
                            if(root){
                                const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{
                                    if(!n.nodeValue||!/\b[0-9a-fA-F]{6,8}\b/.test(n.nodeValue)) return NodeFilter.FILTER_REJECT;
                                    let p=n.parentElement;
                                    while(p){
                                        if(p.tagName==='CODE'||p.tagName==='PRE'||p.tagName==='A') return NodeFilter.FILTER_REJECT;
                                        p=p.parentElement;
                                    }
                                    return NodeFilter.FILTER_ACCEPT;
                                }});
                                const targets=[];
                                while(walker.nextNode()) targets.push(walker.currentNode);
                                targets.forEach(t=>{
                                    const html=(t.nodeValue||'').replace(/\b([0-9a-fA-F]{6,8})\b/g,'<strong>$1</strong>');
                                    const span=document.createElement('span');
                                    span.innerHTML=html;
                                    t.parentNode.replaceChild(span,t);
                                });
                            }
                        }catch(_){}
                    }catch(e){
                        contentContainer.innerHTML=`
                            <div class="content-section">
                                <div class="api-docs">
                                    <h2>API Document</h2>
                                    <p>Can't find the API doc, go to <a href="${link}" target="_blank">${link}</a> to see for yourself.</p>
                                </div>
                            </div>
                        `;
                    }
                })();
                break;
                
            case 'ollama':
                contentContainer.innerHTML = `
                    <div class="content-section">
                        <div class="ollama-info">
                            <div class="ollama-header">
                                <img src="https://github-production-user-asset-6210df.s3.amazonaws.com/3325447/254932576-0d0b44e2-8f4a-4e99-9b52-a5c1c741c8f7.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVCODYLSA53PQK4ZA%2F20250916%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250916T045300Z&X-Amz-Expires=300&X-Amz-Signature=196444cbc2082129718f7e8e8ec158180ba33b7d982730d933d3a4431238cabe&X-Amz-SignedHeaders=host" alt="Ollama Logo" class="ollama-logo">
                                <div class="ollama-title">
                                    <h2>Ollama</h2>
                                    <p>Get up and running with OpenAI gpt-oss, DeepSeek-R1, Gemma 3 and other models.</p>
                                </div>
                            </div>
                            
                            <div class="ollama-stats">
                                <div class="stat">
                                    <span class="stat-number">152k</span>
                                    <span class="stat-label">Stars</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-number">13.1k</span>
                                    <span class="stat-label">Forks</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-number">520</span>
                                    <span class="stat-label">Contributors</span>
                                </div>
                            </div>
                            
                            <div class="ollama-description">
                                <h3>About Ollama</h3>
                                <p>Ollama is a powerful tool that allows you to run large language models locally on your machine. It provides a simple interface to download, run, and manage various AI models without needing cloud services.</p>
                                
                                <h3>Key Features</h3>
                                <ul>
                                    <li>Run models locally on your machine</li>
                                    <li>Support for various model formats (llama, gemma, mistral, etc.)</li>
                                    <li>Simple command-line interface</li>
                                    <li>RESTful API for integration</li>
                                    <li>Cross-platform support</li>
                                </ul>
                                
                                <h3>Supported Models</h3>
                                <div class="model-tags">
                                    <span class="model-tag">Llama</span>
                                    <span class="model-tag">Gemma</span>
                                    <span class="model-tag">Mistral</span>
                                    <span class="model-tag">DeepSeek</span>
                                    <span class="model-tag">Qwen</span>
                                    <span class="model-tag">Phi</span>
                                </div>
                            </div>
                            
                            <div class="ollama-links">
                                <a href="https://ollama.com" target="_blank" class="ollama-link primary">
                                    <i class="fas fa-globe"></i> Official Website
                                </a>
                                <a href="https://github.com/ollama/ollama" target="_blank" class="ollama-link">
                                    <i class="fab fa-github"></i> GitHub Repository
                                </a>
                                <a href="https://ollama.com/download" target="_blank" class="ollama-link">
                                    <i class="fas fa-download"></i> Download
                                </a>
                            </div>
                        </div>
                    </div>
                `;
                break;
        }
    }
    
    setupNavigation();
    
    // Load view from URL on page load
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view');
    if (viewParam && (viewParam === 'models' || viewParam === 'tags' || viewParam === 'about' || viewParam === 'apis' || viewParam === 'ollama')) {
        switchView(viewParam);
    }
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', function(event) {
        if (event.state && event.state.view) {
            switchView(event.state.view);
        }
    });
});

// Clipboard utility function
function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        // Use the modern Clipboard API
        return navigator.clipboard.writeText(text).then(() => {
            return true;
        }).catch(err => {
            console.error('Failed to copy using Clipboard API:', err);
            return fallbackCopyToClipboard(text);
        });
    } else {
        // Fallback for older browsers
        return Promise.resolve(fallbackCopyToClipboard(text));
    }
}

// Fallback copy function for older browsers
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
    } catch (err) {
        console.error('Fallback copy failed:', err);
        document.body.removeChild(textArea);
        return false;
    }
}

// Show notification message
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.copy-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `copy-notification copy-notification-${type}`;
    notification.textContent = message;
    
    // Style the notification to match site colors
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: var(--color-background-secondary);
        color: var(--color-text-primary);
        padding: 12px 24px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: all 0.3s ease;
        opacity: 0;
        transform: translateX(-50%) translateY(20px);
        border: 1px solid var(--color-border-default);
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

