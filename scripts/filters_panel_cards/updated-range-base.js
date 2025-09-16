class UpdatedRangeCardBase {
    constructor(filtersPanel) {
        this.filtersPanel = filtersPanel;
    }

    create() {
        const updatedRangeCard = this.filtersPanel.modal.querySelector('.updated-range-card');
        if (!updatedRangeCard) return;
        updatedRangeCard.innerHTML = '';

        const title = document.createElement('div');
        title.className = 'section-title';
        title.textContent = 'Updated Range';
        updatedRangeCard.appendChild(title);

        const presetsContainer = document.createElement('div');
        presetsContainer.className = 'time-presets';

        const presets = [
            { value: 'all', text: 'All Time', icon: 'fa-globe' },
            { value: 'today', text: 'This Today', icon: 'fa-sun' },
            { value: 'week', text: 'This Week', icon: 'fa-calendar-week' },
            { value: '2weeks', text: 'Last 2 Weeks', icon: 'fa-calendar-week' },
            { value: 'month', text: 'This Month', icon: 'fa-calendar' },
            { value: '3months', text: 'Last 3 Months', icon: 'fa-calendar' },
            { value: 'year', text: 'This Year', icon: 'fa-calendar-check' },
            { value: 'custom', text: 'Custom', icon: 'fa-calendar-alt' }
        ];

        presets.forEach(preset => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'preset-button';
            button.dataset.value = preset.value;

            const icon = document.createElement('i');
            icon.className = `fas ${preset.icon}`;

            const text = document.createElement('span');
            text.textContent = preset.text;

            button.appendChild(icon);
            button.appendChild(text);

            if (preset.value === 'all') button.classList.add('active');

            button.addEventListener('click', () => {
                this.selectPreset(preset.value, button);
            });

            presetsContainer.appendChild(button);
        });

        const customContainer = document.createElement('div');
        customContainer.className = 'custom-range-container';
        customContainer.style.display = 'none';

        const fromGroup = document.createElement('div');
        fromGroup.className = 'date-group';

        const fromLabel = document.createElement('label');
        fromLabel.textContent = 'From:';
        fromLabel.className = 'date-label';

        const fromInput = document.createElement('input');
        fromInput.type = 'date';
        fromInput.className = 'date-input';
        fromInput.id = 'custom-from';

        fromGroup.appendChild(fromLabel);
        fromGroup.appendChild(fromInput);

        const toGroup = document.createElement('div');
        toGroup.className = 'date-group';

        const toLabel = document.createElement('label');
        toLabel.textContent = 'To:';
        toLabel.className = 'date-label';

        const toInput = document.createElement('input');
        toInput.type = 'date';
        toInput.className = 'date-input';
        toInput.id = 'custom-to';

        toGroup.appendChild(toLabel);
        toGroup.appendChild(toInput);

        customContainer.appendChild(fromGroup);
        customContainer.appendChild(toGroup);

        fromInput.addEventListener('change', () => {
            this.stageCustomFromTo(fromInput.value, toInput.value);
        });

        toInput.addEventListener('change', () => {
            this.stageCustomFromTo(fromInput.value, toInput.value);
        });

        updatedRangeCard.appendChild(presetsContainer);
        updatedRangeCard.appendChild(customContainer);
        this.filtersPanel.applyCardStyling();
    }

    selectPreset(value, button) {
        this.filtersPanel.modal.querySelectorAll('.preset-button').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');

        this.filtersPanel.selectedUpdatedRange.type = value;

        if (value === 'all') {
            this.filtersPanel.selectedUpdatedRange.from = '';
            this.filtersPanel.selectedUpdatedRange.to = '';
        } else if (value === 'custom') {
            this.filtersPanel.selectedUpdatedRange.from = '';
            this.filtersPanel.selectedUpdatedRange.to = '';
        } else {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            switch (value) {
                case 'today':
                    this.filtersPanel.selectedUpdatedRange.from = this.formatDate(today);
                    this.filtersPanel.selectedUpdatedRange.to = this.formatDate(today);
                    break;
                case 'week':
                    const weekStart = new Date(today);
                    weekStart.setDate(today.getDate() - 7);
                    this.filtersPanel.selectedUpdatedRange.from = this.formatDate(weekStart);
                    this.filtersPanel.selectedUpdatedRange.to = this.formatDate(today);
                    break;
                case '2weeks':
                    const twoWeeksStart = new Date(today);
                    twoWeeksStart.setDate(today.getDate() - 14);
                    this.filtersPanel.selectedUpdatedRange.from = this.formatDate(twoWeeksStart);
                    this.filtersPanel.selectedUpdatedRange.to = this.formatDate(today);
                    break;
                case 'month':
                    const monthStart = new Date(today);
                    monthStart.setDate(today.getDate() - 30);
                    this.filtersPanel.selectedUpdatedRange.from = this.formatDate(monthStart);
                    this.filtersPanel.selectedUpdatedRange.to = this.formatDate(today);
                    break;
                case '3months':
                    const threeMonthsStart = new Date(today);
                    threeMonthsStart.setMonth(today.getMonth() - 3);
                    this.filtersPanel.selectedUpdatedRange.from = this.formatDate(threeMonthsStart);
                    this.filtersPanel.selectedUpdatedRange.to = this.formatDate(today);
                    break;
                case 'year':
                    const yearStart = new Date(today.getFullYear(), 0, 1);
                    this.filtersPanel.selectedUpdatedRange.from = this.formatDate(yearStart);
                    this.filtersPanel.selectedUpdatedRange.to = this.formatDate(today);
                    break;
            }
        }

        const customContainer = this.filtersPanel.modal.querySelector('.custom-range-container');
        if (customContainer) {
            customContainer.style.display = value === 'custom' ? 'block' : 'none';
        }

        this.stagePreset(value);
    }

    clearSelection() {
        this.filtersPanel.modal.querySelectorAll('.preset-button').forEach(btn => {
            btn.classList.remove('active');
        });
        const allButton = this.filtersPanel.modal.querySelector('.preset-button[data-value="all"]');
        if (allButton) {
            allButton.classList.add('active');
        }

        this.filtersPanel.selectedUpdatedRange.type = 'all';
        this.filtersPanel.selectedUpdatedRange.from = '';
        this.filtersPanel.selectedUpdatedRange.to = '';

        const customContainer = this.filtersPanel.modal.querySelector('.custom-range-container');
        if (customContainer) {
            customContainer.style.display = 'none';
        }
    }

    stagePreset(value) {
        if (!this.filtersPanel.staged) this.filtersPanel.staged = {};
        if (value === 'all') {
            this.filtersPanel.staged.updatedRange = { type: 'all', from: '', to: '' };
            return;
        }
        if (value === 'custom') {
            this.filtersPanel.staged.updatedRange = { type: 'custom', from: '', to: '' };
            return;
        }
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        let from = '';
        let to = '';
        switch (value) {
            case 'today':
                from = this.formatDate(today);
                to = this.formatDate(today);
                break;
            case 'week': {
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - 7);
                from = this.formatDate(weekStart);
                to = this.formatDate(today);
                break; }
            case '2weeks': {
                const twoWeeksStart = new Date(today);
                twoWeeksStart.setDate(today.getDate() - 14);
                from = this.formatDate(twoWeeksStart);
                to = this.formatDate(today);
                break; }
            case 'month': {
                const monthStart = new Date(today);
                monthStart.setDate(today.getDate() - 30);
                from = this.formatDate(monthStart);
                to = this.formatDate(today);
                break; }
            case '3months': {
                const threeMonthsStart = new Date(today);
                threeMonthsStart.setMonth(today.getMonth() - 3);
                from = this.formatDate(threeMonthsStart);
                to = this.formatDate(today);
                break; }
            case 'year': {
                const yearStart = new Date(today.getFullYear(), 0, 1);
                from = this.formatDate(yearStart);
                to = this.formatDate(today);
                break; }
        }
        this.filtersPanel.staged.updatedRange = { type: value, from, to };
    }

    stageCustomFromTo(from, to) {
        if (!this.filtersPanel.staged) this.filtersPanel.staged = {};
        this.filtersPanel.staged.updatedRange = { type: 'custom', from: from || '', to: to || '' };
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    extractRowUpdateDate(rowData) {
        return null;
    }

    matchesUpdatedRange(updateDate, updatedRange) {
        if (!updateDate || updateDate === 'undefined') return true;

        const updatedDate = new Date(updateDate);
        if (isNaN(updatedDate.getTime())) return true;

        if (updatedRange.type === 'custom') {
            const from = updatedRange.from ? new Date(updatedRange.from) : null;
            const to = updatedRange.to ? new Date(updatedRange.to) : null;

            if (from && updatedDate < from) return false;
            if (to && updatedDate > to) return false;
            return true;
        }

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        switch (updatedRange.type) {
            case 'today':
                return this.isSameDay(updatedDate, today);
            case 'week':
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - 7);
                return updatedDate >= weekStart && updatedDate <= today;
            case '2weeks':
                const twoWeeksStart = new Date(today);
                twoWeeksStart.setDate(today.getDate() - 14);
                return updatedDate >= twoWeeksStart && updatedDate <= today;
            case 'month':
                const monthStart = new Date(today);
                monthStart.setDate(today.getDate() - 30);
                return updatedDate >= monthStart && updatedDate <= today;
            case '3months':
                const threeMonthsStart = new Date(today);
                threeMonthsStart.setMonth(today.getMonth() - 3);
                return updatedDate >= threeMonthsStart && updatedDate <= today;
            case 'year':
                const yearStart = new Date(today.getFullYear(), 0, 1);
                return updatedDate >= yearStart && updatedDate <= today;
            default:
                return true;
        }
    }

    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }
}


