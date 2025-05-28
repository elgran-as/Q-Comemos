class Calendar {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.currentView = 'month';
        this.meals = {
            // Mock data - replace with actual data storage
            '2023-12-20': [
                { type: 'breakfast', name: 'Tostadas con aguacate', icon: 'sunrise' },
                { type: 'lunch', name: 'Tarta de zapallitos', icon: 'sun' }
            ]
        };
        this.init();
    }

    init() {
        this.updateHeader();
        this.renderCalendar();
        this.setupEventListeners();
        this.updateMealsList();
    }

    updateHeader() {
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        document.getElementById('currentMonthYear').textContent = 
            `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    }

    renderCalendar() {
        const calendarDays = document.getElementById('calendarDays');
        calendarDays.innerHTML = '';

        if (this.currentView === 'month') {
            this.renderMonthView();
        } else {
            this.renderWeekView();
        }
    }

    renderMonthView() {
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const startingDay = firstDay.getDay();
        
        // Previous month days
        const prevMonthDays = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 0).getDate();
        for (let i = startingDay - 1; i >= 0; i--) {
            this.createDayElement(prevMonthDays - i, 'other-month');
        }

        // Current month days
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
            const dateStr = this.formatDate(date);
            const hasMeals = this.meals[dateStr] ? true : false;
            const classes = [];

            if (this.isToday(date)) classes.push('today');
            if (this.isSelected(date)) classes.push('selected');

            this.createDayElement(day, classes.join(' '), hasMeals);
        }
    }

    renderWeekView() {
        const weekStart = new Date(this.currentDate);
        weekStart.setDate(this.currentDate.getDate() - this.currentDate.getDay());

        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            const dateStr = this.formatDate(date);
            const hasMeals = this.meals[dateStr] ? true : false;
            const classes = [];

            if (this.isToday(date)) classes.push('today');
            if (this.isSelected(date)) classes.push('selected');

            this.createDayElement(date.getDate(), classes.join(' '), hasMeals);
        }
    }

    createDayElement(day, className = '', hasMeals = false) {
        const dayElement = document.createElement('div');
        dayElement.className = `calendar-day ${className}`;
        dayElement.innerHTML = `
            <span class="day-number">${day}</span>
            ${hasMeals ? '<div class="meal-indicator"></div>' : ''}
        `;

        dayElement.addEventListener('click', () => {
            const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
            this.selectDate(date);
        });

        document.getElementById('calendarDays').appendChild(dayElement);
    }

    selectDate(date) {
        this.selectedDate = date;
        this.renderCalendar();
        this.updateMealsList();
    }

    updateMealsList() {
        const dateStr = this.formatDate(this.selectedDate);
        const dayMeals = this.meals[dateStr] || [];
        const mealsList = document.getElementById('dayMealsList');
        
        if (dayMeals.length === 0) {
            mealsList.innerHTML = `
                <div class="list-group-item text-center text-muted py-4">
                    No hay comidas planificadas para este día
                </div>
            `;
            return;
        }

        mealsList.innerHTML = dayMeals.map(meal => `
            <div class="list-group-item d-flex align-items-center">
                <div class="meal-time-icon">
                    <i class="bi bi-${meal.icon}"></i>
                </div>
                <div class="ms-3">
                    <h4 class="h6 mb-1">${this.getMealTypeName(meal.type)}</h4>
                    <p class="mb-0 text-muted">${meal.name}</p>
                </div>
                <div class="ms-auto">
                    <button class="btn btn-link" onclick="calendar.editMeal('${dateStr}', '${meal.type}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-link text-danger" onclick="calendar.deleteMeal('${dateStr}', '${meal.type}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    getMealTypeName(type) {
        const types = {
            breakfast: 'Desayuno',
            lunch: 'Almuerzo',
            snack: 'Merienda',
            dinner: 'Cena'
        };
        return types[type] || type;
    }

    setupEventListeners() {
        // View toggle
        document.querySelectorAll('[data-view]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentView = e.target.dataset.view;
                document.querySelectorAll('[data-view]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.renderCalendar();
            });
        });

        // Month navigation
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.updateHeader();
            this.renderCalendar();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.updateHeader();
            this.renderCalendar();
        });

        // Add meal form
        const addMealModal = document.getElementById('addMealModal');
        if (addMealModal) {
            addMealModal.addEventListener('show.bs.modal', () => {
                const dateInput = addMealModal.querySelector('input[type="date"]');
                dateInput.value = this.formatDate(this.selectedDate);
            });
        }
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }

    isSelected(date) {
        return date.getDate() === this.selectedDate.getDate() &&
               date.getMonth() === this.selectedDate.getMonth() &&
               date.getFullYear() === this.selectedDate.getFullYear();
    }

    addMeal(meal) {
        const dateStr = this.formatDate(this.selectedDate);
        if (!this.meals[dateStr]) {
            this.meals[dateStr] = [];
        }
        this.meals[dateStr].push(meal);
        this.renderCalendar();
        this.updateMealsList();
    }

    editMeal(dateStr, mealType) {
        // Implement edit meal functionality
    }

    deleteMeal(dateStr, mealType) {
        this.meals[dateStr] = this.meals[dateStr].filter(meal => meal.type !== mealType);
        if (this.meals[dateStr].length === 0) {
            delete this.meals[dateStr];
        }
        this.renderCalendar();
        this.updateMealsList();
    }
}

// Initialize calendar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.calendar = new Calendar();
});