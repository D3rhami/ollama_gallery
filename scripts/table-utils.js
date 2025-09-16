window.tableUtils = {
    createTooltip: function(content, element, className) {
        const rect = element.getBoundingClientRect();
        const isDarkMode = document.body.classList.contains('dark-mode');
        
        $(`.${className}`).remove();
        
        const tooltip = $(`<div class="${className}"></div>`)
            .html(content)
            .css({
                position: 'fixed',
                top: rect.top - 40 + 'px',
                left: rect.left + (rect.width / 2) + 'px',
                transform: 'translateX(-50%)',
                background: isDarkMode ? 'rgba(45, 55, 72, 0.95)' : 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                zIndex: 99999,
                pointerEvents: 'none',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                maxWidth: '600px',
                wordWrap: 'break-word',
                lineHeight: '1.4',
                whiteSpace: 'normal'
            });
        
        $('body').append(tooltip);
    },

    getUrlIcon: function() {
        return document.body.classList.contains('dark-mode') ? 
            'assets/images/open_link_light.svg' : 
            'assets/images/open_link.svg';
    },

    updateUrlIcons: function(selector) {
        const iconSrc = this.getUrlIcon();
        $(selector + ' img').attr('src', iconSrc);
    },

    getCommonDataTableConfig: function() {
        return {
            colReorder: false,
            responsive: true,
            autoWidth: true,
            scrollX: true,
            pageLength: 10,
            lengthMenu: false,
            order: [[0, 'asc']],
            searching: true,
            search: {return: true},
            dom: 'rt<"bottom-elements"ip>'
        };
    },

    copyToClipboard: function(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
        } else {
            return this.fallbackCopyToClipboard(text);
        }
    },

    fallbackCopyToClipboard: function(text) {
        return new Promise((resolve) => {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                textArea.remove();
                resolve(true);
            } catch (err) {
                textArea.remove();
                resolve(false);
            }
        });
    },

    showNotification: function(message, type = 'info') {
        const notification = $(`<div class="notification ${type}"></div>`)
            .text(message)
            .css({
                position: 'fixed',
                top: '20px',
                right: '20px',
                padding: '12px 20px',
                borderRadius: '6px',
                color: 'white',
                fontWeight: 'bold',
                zIndex: 10000,
                maxWidth: '300px',
                wordWrap: 'break-word',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                transform: 'translateX(100%)',
                transition: 'transform 0.3s ease-in-out'
            });

        if (type === 'success') {
            notification.css('background', '#10b981');
        } else if (type === 'error') {
            notification.css('background', '#ef4444');
        } else {
            notification.css('background', '#3b82f6');
        }

        $('body').append(notification);
        
        setTimeout(() => {
            notification.css('transform', 'translateX(0)');
        }, 100);

        setTimeout(() => {
            notification.css('transform', 'translateX(100%)');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}; 