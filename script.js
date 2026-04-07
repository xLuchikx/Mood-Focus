// Массив для хранения данных
let journalData =[];
let currentMood = 3; // По умолчанию "Нормально"
let currentEnergy = 3;
let currentActivity = 'dash';
const emojis = { 1: '😭', 2: '😕', 3: '😐', 4: '🙂', 5: '🤩' };
const energyEmojis = { 1: '🪫', 2: '😴', 3: '😌', 4: '⚡', 5: '🚀' };
const activityLabels = { 'work': '💼 Работа', 'rest': '☕ Отдых', 'proc': '⚠️ Прокрастинация', 'dash': '—' };

// Инициализация
window.onload = () => {
    loadData();
    loadSettings();
    renderHistory();
    report.setPeriod('year'); // Инициализация стейта отчета
};

// Вспомогательная функция для эмодзи
function getEmojiForMood(val) {
    return emojis[Math.round(val)] || '➖';
}
function getEmojiForEnergy(val) {
    return energyEmojis[Math.round(val)] || '➖';
}

// Выбор настроения
function selectMood(val) {
    currentMood = val;
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.getAttribute('data-val')) === val) {
            btn.classList.add('active');
        }
    });
}

function selectEnergy(val) {
    currentEnergy = val;
    document.querySelectorAll('.energy-btn').forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.getAttribute('data-val')) === val) {
            btn.classList.add('active');
        }
    });
}

function selectActivity(val) {
    currentActivity = val;
    document.querySelectorAll('.act-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-val') === val) {
            btn.classList.add('active');
        }
    });
}

// Сохранение записи
function saveEntry() {
    const note = document.getElementById('noteInput').value.trim();
    
    const entry = {
        id: Date.now(),
        timestamp: Date.now(),
        dateStr: getLocalISODate(new Date()), // Используем локальную дату вместо UTC
        mood: currentMood,
        energy: currentEnergy,
        activity: currentActivity,
        note: note
    };

    journalData.push(entry);
    localStorage.setItem('mood_journal_data', JSON.stringify(journalData));
    
    // Очистка формы
    document.getElementById('noteInput').value = '';
    selectMood(3);
    selectEnergy(3);
    selectActivity('dash');

    // Обновление UI
    renderHistory();
    if (document.getElementById('reportModal').style.display === 'flex') {
        report.render();
    }
    showToast('✓ Запись успешно добавлена!');
}

// Загрузка данных
function loadData() {
    const saved = localStorage.getItem('mood_journal_data');
    if (saved) {
        try {
            journalData = JSON.parse(saved);
        } catch (e) {
            console.error("Ошибка чтения данных", e);
            journalData =[];
        }
    }
}

// Отрисовка Истории
let editingId = null;

function renderHistoryHTML(dataList) {
    if (dataList.length === 0) {
        return '<p style="text-align:center; color:#999; padding:20px;">Пока нет записей.</p>';
    }

    let html = '';
    dataList.forEach(item => {
        if (editingId === item.id) {
            const dateObj = new Date(item.timestamp);
            const isoLocal = getLocalISODate(dateObj); 
            const timeStr = dateObj.getHours().toString().padStart(2,'0') + ':' + dateObj.getMinutes().toString().padStart(2,'0');

            html += `
                <div class="history-item editing">
                    <div class="inline-edit-group">
                        <select class="inline-select" id="edit-mood-${item.id}">
                            <option value="1" ${item.mood === 1 ? 'selected' : ''}>😭 Ужасно</option>
                            <option value="2" ${item.mood === 2 ? 'selected' : ''}>😕 Плохо</option>
                            <option value="3" ${item.mood === 3 ? 'selected' : ''}>😐 Нормально</option>
                            <option value="4" ${item.mood === 4 ? 'selected' : ''}>🙂 Хорошо</option>
                            <option value="5" ${item.mood === 5 ? 'selected' : ''}>🤩 Отлично</option>
                        </select>
                        <select class="inline-select" id="edit-energy-${item.id}">
                            <option value="1" ${item.energy === 1 ? 'selected' : ''}>🪫 Истощён</option>
                            <option value="2" ${item.energy === 2 ? 'selected' : ''}>😴 Устал</option>
                            <option value="3" ${item.energy === 3 ? 'selected' : ''}>😌 Спокоен</option>
                            <option value="4" ${item.energy === 4 ? 'selected' : ''}>⚡ Активен</option>
                            <option value="5" ${item.energy === 5 ? 'selected' : ''}>🚀 В потоке</option>
                        </select>
                        <select class="inline-select" id="edit-act-${item.id}">
                            <option value="dash" ${item.activity === 'dash' ? 'selected' : ''}>—</option>
                            <option value="work" ${item.activity === 'work' ? 'selected' : ''}>💼 Работа</option>
                            <option value="rest" ${item.activity === 'rest' ? 'selected' : ''}>☕ Отдых</option>
                            <option value="proc" ${item.activity === 'proc' ? 'selected' : ''}>⚠️ Прокрастинация</option>
                        </select>
                        <input type="date" class="inline-input" id="edit-date-${item.id}" value="${isoLocal}">
                        <input type="time" class="inline-input" id="edit-time-${item.id}" value="${timeStr}">
                        <input type="text" class="inline-input inline-note" id="edit-note-${item.id}" value="${item.note ? escapeHtml(item.note) : ''}" placeholder="Заметка...">
                        <button class="inline-btn" onclick="saveEdit(${item.id})">✔</button>
                        <button class="inline-btn cancel" onclick="cancelEdit()">✖</button>
                    </div>
                </div>
            `;
        } else {
            const dateObj = new Date(item.timestamp);
            const timeStrShow = dateObj.toLocaleDateString('ru-RU') + ', ' + dateObj.toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'});
            
            const actLabel = activityLabels[item.activity] || '';
            const actHtml = item.activity ? `<div class="h-proc-badge act-${item.activity}">${actLabel}</div>` : '';

            html += `
                <div class="history-item">
                    <div class="h-emoji">${getEmojiForMood(item.mood)}${getEmojiForEnergy(item.energy)}</div>
                    <div class="h-content">
                        <div class="h-time">${timeStrShow}</div>
                        ${item.note ? `<p class="h-note">"${escapeHtml(item.note)}"</p>` : ''}
                        ${actHtml}
                    </div>
                    <div class="h-actions">
                        <button class="h-edit-btn" onclick="startEdit(${item.id})" title="Редактировать">✏️</button>
                        <button class="h-del-btn" onclick="deleteEntry(${item.id})" title="Удалить">🗑️</button>
                    </div>
                </div>
            `;
        }
    });
    return html;
}

function renderHistory() {
    const list = document.getElementById('historyList');
    if(list) {
        const recent = [...journalData].sort((a,b) => b.timestamp - a.timestamp).slice(0, 20);
        list.innerHTML = renderHistoryHTML(recent);
    }
}

function startEdit(id) {
    editingId = id;
    renderHistory();
    if (document.getElementById('reportModal').style.display === 'flex') {
        report.render();
    }
}

function cancelEdit() {
    editingId = null;
    renderHistory();
    if (document.getElementById('reportModal').style.display === 'flex') {
        report.render();
    }
}

function saveEdit(id) {
    const moodEl = document.getElementById(`edit-mood-${id}`);
    const energyEl = document.getElementById(`edit-energy-${id}`);
    const actEl = document.getElementById(`edit-act-${id}`);
    const dateEl = document.getElementById(`edit-date-${id}`);
    const timeEl = document.getElementById(`edit-time-${id}`);
    const noteEl = document.getElementById(`edit-note-${id}`);

    if(!moodEl || !energyEl || !actEl || !dateEl || !timeEl || !noteEl) return;

    const moodVal = parseInt(moodEl.value);
    const energyVal = parseInt(energyEl.value);
    const actVal = actEl.value;
    const noteVal = noteEl.value.trim();
    
    // Создаем дату из input[type=date] и input[type=time]
    const dParts = dateEl.value.split('-');
    const tParts = timeEl.value.split(':');
    
    if (dParts.length === 3 && tParts.length >= 2) {
        const d = new Date(parseInt(dParts[0]), parseInt(dParts[1]) - 1, parseInt(dParts[2]), parseInt(tParts[0]), parseInt(tParts[1]), 0);
        
        const idx = journalData.findIndex(x => x.id === id);
        if(idx !== -1) {
            journalData[idx].timestamp = d.getTime();
            journalData[idx].dateStr = getLocalISODate(d);
            journalData[idx].mood = moodVal;
            journalData[idx].energy = energyVal;
            journalData[idx].activity = actVal;
            journalData[idx].note = noteVal;
        }

        journalData.sort((a, b) => a.timestamp - b.timestamp);
        localStorage.setItem('mood_journal_data', JSON.stringify(journalData));
        showToast('✓ Запись обновлена');
    }

    editingId = null;
    renderHistory();
    if (document.getElementById('reportModal').style.display === 'flex') {
        report.render();
    }
}

// Удаление записи
function deleteEntry(id) {
    if(!confirm('Удалить эту запись?')) return;
    journalData = journalData.filter(item => item.id !== id);
    localStorage.setItem('mood_journal_data', JSON.stringify(journalData));
    renderHistory();
    if (document.getElementById('reportModal').style.display === 'flex') {
        report.render();
    }
    showToast('Запись удалена');
}

// ОБЪЕКТ ОТЧЕТОВ / СТАТИСТИКИ
const report = {
    state: {
        view: 'year',
        unit: 'month',
        startDate: null,
        endDate: null,
        displayMode: 'mood', // 'mood' | 'count'
        period: 'year'
    },

    setPeriod: function(period) {
        this.state.period = period;
        const now = new Date();
        now.setHours(23, 59, 59, 999);
        let start = new Date(now);
        start.setHours(0,0,0,0);

        switch(period) {
            case 'today':
                this.state.view = 'day';
                this.state.unit = 'hour';
                break;
            case 'yesterday':
                start.setDate(start.getDate() - 1);
                now.setDate(now.getDate() - 1);
                now.setHours(23, 59, 59, 999);
                this.state.view = 'day';
                this.state.unit = 'hour';
                break;
            case 'week':
                const d = start.getDay();
                const diff = d === 0 ? 6 : d - 1;
                start.setDate(start.getDate() - diff);
                this.state.view = 'month';
                this.state.unit = 'day';
                break;
            case 'last_week':
                const dLW = start.getDay();
                const diffLW = dLW === 0 ? 6 : dLW - 1;
                start.setDate(start.getDate() - diffLW - 7);
                now = new Date(start);
                now.setDate(start.getDate() + 6);
                now.setHours(23,59,59,999);
                this.state.view = 'month';
                this.state.unit = 'day';
                break;
            case 'month':
                start.setDate(1);
                this.state.view = 'month';
                this.state.unit = 'day';
                break;
            case 'last_month':
                start.setDate(1);
                start.setMonth(start.getMonth() - 1);
                now.setDate(0); // Последний день прошлого месяца
                now.setHours(23,59,59,999);
                this.state.view = 'month';
                this.state.unit = 'day';
                break;
            case 'year':
                start.setMonth(0, 1);
                this.state.view = 'year';
                this.state.unit = 'month';
                break;
            default: // 365
                start.setDate(start.getDate() - 364);
                this.state.view = 'year';
                this.state.unit = 'month';
        }

        this.state.startDate = start;
        this.state.endDate = now;
        this.render();
    },

    setDisplayMode: function(mode) {
        this.state.displayMode = mode;
        document.getElementById('mode-mood').classList.toggle('active', mode === 'mood');
        const modeEnergyBtn = document.getElementById('mode-energy');
        if(modeEnergyBtn) modeEnergyBtn.classList.toggle('active', mode === 'energy');
        document.getElementById('mode-count').classList.toggle('active', mode === 'count');
        this.render();
    },

    drillDown: function(dateStr) {
        const date = new Date(dateStr);
        if (this.state.view === 'year') {
            this.state.view = 'month';
            this.state.unit = 'day';
            this.state.startDate = new Date(date.getFullYear(), date.getMonth(), 1);
            this.state.endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
        } else if (this.state.view === 'month') {
            this.state.view = 'day';
            this.state.unit = 'hour';
            this.state.startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
            this.state.endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
        }
        this.render();
    },

    goUp: function() {
        if (this.state.view === 'day') {
            const d = this.state.startDate;
            this.state.view = 'month';
            this.state.unit = 'day';
            this.state.startDate = new Date(d.getFullYear(), d.getMonth(), 1);
            this.state.endDate = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
        } else if (this.state.view === 'month') {
            this.state.view = 'year';
            this.state.unit = 'month';
            this.state.startDate = new Date(this.state.startDate.getFullYear(), 0, 1);
            this.state.endDate = new Date(this.state.startDate.getFullYear(), 11, 31, 23, 59, 59);
        }
        this.render();
    },

    getFilteredData: function() {
        if (!this.state.startDate || !this.state.endDate) {
            const now = new Date();
            this.state.startDate = new Date(now.getFullYear(), 0, 1);
            this.state.endDate = now;
        }
        return journalData.filter(s => {
            return s.timestamp >= this.state.startDate.getTime() && s.timestamp <= this.state.endDate.getTime();
        });
    },

    getGroupedData: function(filteredData) {
        const dataMap = {};
        
        let current = new Date(this.state.startDate);
        const end = new Date(this.state.endDate);

        while (current <= end) {
            let key;
            if (this.state.unit === 'month') {
                key = current.getFullYear() + '-' + (current.getMonth() + 1).toString().padStart(2, '0');
            } else if (this.state.unit === 'day') {
                key = current.getFullYear() + '-' + (current.getMonth() + 1).toString().padStart(2, '0') + '-' + current.getDate().toString().padStart(2, '0');
            } else { // hour
                key = current.getHours().toString().padStart(2, '0') + ':00';
            }
            
            dataMap[key] = { label: key, sumMood: 0, sumEnergy: 0, count: 0, date: new Date(current) };
            
            if (this.state.unit === 'month') current.setMonth(current.getMonth() + 1);
            else if (this.state.unit === 'day') current.setDate(current.getDate() + 1);
            else current.setHours(current.getHours() + 1);
        }

        filteredData.forEach(s => {
            const d = new Date(s.timestamp);
            let key;
            if (this.state.unit === 'month') {
                key = d.getFullYear() + '-' + (d.getMonth() + 1).toString().padStart(2, '0');
            } else if (this.state.unit === 'day') {
                key = d.getFullYear() + '-' + (d.getMonth() + 1).toString().padStart(2, '0') + '-' + d.getDate().toString().padStart(2, '0');
            } else {
                key = d.getHours().toString().padStart(2, '0') + ':00';
            }

            if (dataMap[key]) {
                dataMap[key].sumMood += s.mood;
                dataMap[key].sumEnergy += (s.energy || 3);
                dataMap[key].count += 1;
            }
        });

        const result = Object.values(dataMap).map(d => {
            let val = 0;
            if (this.state.displayMode === 'mood') {
                val = d.count > 0 ? (d.sumMood / d.count).toFixed(1) : 0;
            } else if (this.state.displayMode === 'energy') {
                val = d.count > 0 ? (d.sumEnergy / d.count).toFixed(1) : 0;
            } else {
                val = d.count;
            }
            return {
                label: d.label,
                date: d.date,
                value: val
            };
        });
        
        return result;
    },

    renderBarChart: function(data) {
        if (data.length === 0) return '<p style="text-align:center; padding:40px; color:#666;">Нет данных</p>';

        const maxVal = (this.state.displayMode === 'mood' || this.state.displayMode === 'energy') ? 5 : Math.max(...data.map(d => parseFloat(d.value)), 1);
        
        const values = data.map(d => parseFloat(d.value)).filter(v => v > 0).sort((a,b) => a-b);
        let median = 0;
        if (values.length > 0) {
            const mid = Math.floor(values.length / 2);
            median = values.length % 2 !== 0 ? values[mid] : (values[mid-1] + values[mid]) / 2;
        }

        const medianPos = (median / maxVal) * 100;

        let barsHtml = data.map(d => {
            const val = parseFloat(d.value);
            const height = (val / maxVal) * 100;
            const dateStr = d.date.toISOString();
            const label = this.state.unit === 'month' ? d.date.toLocaleString('ru-RU', {month:'short'}) : 
                          this.state.unit === 'day' ? d.date.getDate() : d.label;
            
            const isEmpty = val === 0;
            const clickAttr = isEmpty ? '' : `onclick="report.drillDown('${dateStr}')"`;
            const wrapperClass = isEmpty ? "bar-wrapper empty-bar" : "bar-wrapper";

            let barColor = '';
            if (this.state.displayMode === 'mood' && !isEmpty) {
                const rounded = Math.round(val);
                if(rounded === 1) barColor = 'background: var(--m1);';
                else if(rounded === 2) barColor = 'background: var(--m2);';
                else if(rounded === 3) barColor = 'background: var(--m3);';
                else if(rounded === 4) barColor = 'background: var(--m4);';
                else if(rounded === 5) barColor = 'background: var(--m5);';
            } else if (this.state.displayMode === 'energy' && !isEmpty) {
                barColor = 'background: var(--primary);';
            }

            return `
                <div class="${wrapperClass}" ${clickAttr} title="${d.label}: ${val}">
                    <div class="bar-value">${!isEmpty ? val : ''}</div>
                    <div class="bar" style="height: ${height}%; ${barColor}"></div>
                    <div class="bar-label">${label}</div>
                </div>
            `;
        }).join('');

        return `
            <div class="bar-chart">
                ${median > 0 ? `
                    <div class="median-line" style="bottom: ${medianPos}%">
                        <div class="median-label">мед: ${median.toFixed(this.state.displayMode === 'count' ? 0 : 1)}</div>
                    </div>
                ` : ''}
                ${barsHtml}
            </div>
        `;
    },

    renderHeatmap: function() {
        const daysMap = {};
        journalData.forEach(item => {
            if (!daysMap[item.dateStr]) {
                daysMap[item.dateStr] = { moodSum: 0, count: 0, hasProc: false };
            }
            daysMap[item.dateStr].moodSum += item.mood;
            daysMap[item.dateStr].count += 1;
            if (item.activity === 'proc') daysMap[item.dateStr].hasProc = true;
        });

        const today = new Date();
        today.setHours(0,0,0,0);
        const dayOfWeek = today.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - daysToMonday - (51 * 7));

        const totalDays = Math.round((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
        let heatmapCells = '';
        
        for (let i = 0; i < totalDays; i++) {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            const iso = getLocalISODate(d);
            
            const cellData = daysMap[iso];
            let classes = "heatmap-cell";
            let title = d.toLocaleDateString('ru-RU') + ': Нет данных';
            let clickAttr = '';
            
            if (cellData) {
                const avgMood = Math.round(cellData.moodSum / cellData.count);
                classes += ` level-${avgMood}`;
                if (cellData.hasProc) classes += ' proc-marker';
                
                const procText = cellData.hasProc ? ' (Была прокрастинация)' : '';
                title = `${d.toLocaleDateString('ru-RU')}: Настроение ${avgMood}${procText}`;
                clickAttr = `onclick="report.drillDown('${d.toISOString()}')"`;
            }
            
            heatmapCells += `<div class="${classes}" title="${title}" ${clickAttr}></div>`;
        }

        return `
            <div class="heatmap-wrapper">
                <div class="heatmap-grid">
                    ${heatmapCells}
                </div>
            </div>
            <div class="heatmap-legend">
                <div class="legend-colors">
                    <span>Хуже</span>
                    <div class="heatmap-cell level-1"></div>
                    <div class="heatmap-cell level-2"></div>
                    <div class="heatmap-cell level-3"></div>
                    <div class="heatmap-cell level-4"></div>
                    <div class="heatmap-cell level-5"></div>
                    <span>Лучше</span>
                </div>
                <div class="legend-proc">
                    <div class="heatmap-cell level-3 proc-marker" style="cursor:default; transform:none;"></div>
                    <span>— Была прокрастинация</span>
                </div>
            </div>
        `;
    },

    renderBreadcrumbs: function() {
        const el = document.getElementById('report-breadcrumb');
        if (!el) return;

        let html = '<span onclick="report.setPeriod(\'year\')">Обзор</span>';
        
        if (this.state.view === 'month') {
            html += ` / <span onclick="report.goUp()">Год</span> / <span>${this.state.startDate.toLocaleString('ru-RU', {month:'long'})}</span>`;
        } else if (this.state.view === 'day') {
             html += ` / <span onclick="report.goUp()">${this.state.startDate.toLocaleString('ru-RU', {month:'long'})}</span>`;
             html += ` / <span>${this.state.startDate.getDate()} число</span>`;
        }
        
        el.innerHTML = html;
    },

    render: function() {
        const container = document.getElementById('reportContent');
        if (!container) return;

        const filtered = this.getFilteredData();
        const groupedData = this.getGroupedData(filtered);

        let totalEntries = filtered.length;
        let avgMood = 0;
        let avgEnergy = 0;
        let workCount = 0;

        if (totalEntries > 0) {
            let sumM = filtered.reduce((acc, curr) => acc + curr.mood, 0);
            let sumE = filtered.reduce((acc, curr) => acc + (curr.energy || 3), 0);
            avgMood = (sumM / totalEntries).toFixed(1);
            avgEnergy = (sumE / totalEntries).toFixed(1);
            workCount = filtered.filter(x => x.activity === 'work').length;
        }

        this.renderBreadcrumbs();

        const sortedFiltered = [...filtered].sort((a,b) => b.timestamp - a.timestamp);

        let html = `
            <div class="report-bstats-bar">
                <div class="bstats-card bstats-blue">
                    <div class="bstats-icon">${getEmojiForEnergy(avgEnergy)}</div>
                    <div class="bstats-value">${Number(avgEnergy) ? avgEnergy : '-'}</div>
                    <div class="bstats-label">Ср. Энергия</div>
                </div>
                <div class="bstats-card bstats-green">
                    <div class="bstats-icon">${getEmojiForMood(avgMood)}</div>
                    <div class="bstats-value">${Number(avgMood) ? avgMood : '-'}</div>
                    <div class="bstats-label">Ср. Настроение</div>
                </div>
                <div class="bstats-card bstats-yellow">
                    <div class="bstats-icon">💼</div>
                    <div class="bstats-value">${workCount}</div>
                    <div class="bstats-label">Рабочих записей</div>
                </div>
            </div>

            <div class="chart-container">
                <div class="chart-header">
                    <h3>${this.state.view === 'year' ? 'Динамика по месяцам' : 
                          this.state.view === 'month' ? 'Динамика по дням' : 'Динамика по часам'}</h3>
                </div>
                ${this.renderBarChart(groupedData)}
            </div>

            ${this.state.view === 'year' ? `
            <div class="chart-container">
                <div class="chart-header">
                    <h3>Температурная карта (Последний год)</h3>
                </div>
                ${this.renderHeatmap()}
            </div>
            ` : ''}

            <div class="chart-container">
                <div class="chart-header">
                    <h3>История за выбранный период</h3>
                </div>
                <div class="history-list" style="max-height: 400px; overflow-y: auto;">
                    ${renderHistoryHTML(sortedFiltered)}
                </div>
            </div>
        `;

        container.innerHTML = html;
        
        const wrapper = document.querySelector('.heatmap-wrapper');
        if (wrapper) wrapper.scrollLeft = wrapper.scrollWidth;
    },

    exportCSV: function() {
        if (journalData.length === 0) {
            showToast('Нет данных для экспорта!');
            return;
        }

        try {
            let csv = 'Дата,Время,Настроение,Прокрастинация,Заметка\n';
            
            journalData.forEach(s => {
                const date = new Date(s.timestamp);
                const dateStr = date.toLocaleDateString('ru-RU');
                const timeStr = date.toLocaleTimeString('ru-RU');
                const procStr = s.procrastinating ? 'Да' : 'Нет';
                const note = s.note ? `"${s.note.replace(/"/g, '""')}"` : '';
                
                csv += `${dateStr},${timeStr},${s.mood},${procStr},${note}\n`;
            });

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `mood_journal_${Date.now()}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            showToast('✓ CSV успешно скачан!');
        } catch (e) {
            console.error(e);
            showToast('Ошибка экспорта.');
        }
    },

    importCSV: function(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const lines = text.trim().split('\n');
            if(lines.length <= 1) { showToast('Файл пуст'); return; }

            let importedCount = 0;
            const headers = lines[0].split(',');
            
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if(!line) continue;

                let cols = [];
                let current = '';
                let inQuotes = false;
                for (let j = 0; j < line.length; j++) {
                    if (line[j] === '"') inQuotes = !inQuotes;
                    else if (line[j] === ',' && !inQuotes) { cols.push(current); current = ''; }
                    else current += line[j];
                }
                cols.push(current);
                cols = cols.map(c => c.replace(/^"|"$/g, ''));

                if(cols.length < 4) continue;
                
                const dateParts = cols[0].split('.');
                const timeParts = cols[1].split(':');
                if (dateParts.length !== 3) continue;
                
                const d = new Date(dateParts[2], dateParts[1] - 1, dateParts[0], timeParts[0], timeParts[1], timeParts[2] || 0);
                const mood = parseInt(cols[2]);
                const proc = cols[3] === 'Да';
                const note = cols[4] || '';

                if (isNaN(d.getTime()) || isNaN(mood)) continue;

                const entry = {
                    id: d.getTime() + Math.floor(Math.random() * 1000),
                    timestamp: d.getTime(),
                    dateStr: getLocalISODate(d),
                    mood: mood,
                    procrastinating: proc,
                    note: note
                };

                const isDup = journalData.some(x => x.timestamp === entry.timestamp);
                if (!isDup) {
                    journalData.push(entry);
                    importedCount++;
                }
            }

            if (importedCount > 0) {
                journalData.sort((a, b) => a.timestamp - b.timestamp);
                localStorage.setItem('mood_journal_data', JSON.stringify(journalData));
                renderHistory();
                report.render();
                showToast(`✓ Импортировано записей: ${importedCount}`);
            } else {
                showToast('Нет новых записей для импорта.');
            }
            event.target.value = '';
        };
        reader.readAsText(file);
    }
};

// Модальное окно статистики
function openReportModal() {
    report.render();
    document.getElementById('reportModal').style.display = 'flex';
}

function closeReportModal() {
    document.getElementById('reportModal').style.display = 'none';
}

// Закрытие модального окна по клику вне контента
window.addEventListener('click', function(event) {
    const reportModal = document.getElementById('reportModal');
    if (event.target === reportModal) {
        closeReportModal();
    }
    const settingsModal = document.getElementById('settingsModal');
    if (event.target === settingsModal) {
        closeSettingsModal();
    }
});

// Получение локальной даты YYYY-MM-DD без смещения часового пояса
function getLocalISODate(d = new Date()) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Вспомогательная функция для безопасности
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Всплывающие уведомления (Toast)
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// НАСТРОЙКИ УВЕДОМЛЕНИЙ И ТАЙМЕР
let notifSettings = { enabled: false, intervalMin: 60 };
let notifIntervalId = null;

function loadSettings() {
    const saved = localStorage.getItem('mood_notif_settings');
    if (saved) {
        try {
            notifSettings = JSON.parse(saved);
        } catch(e) {}
    }
    applyNotificationTimer();
}

function openSettingsModal() {
    document.getElementById('notifToggle').checked = notifSettings.enabled;
    document.getElementById('notifInterval').value = notifSettings.intervalMin;
    toggleNotifSettings();
    document.getElementById('settingsModal').style.display = 'flex';
}

function closeSettingsModal() {
    document.getElementById('settingsModal').style.display = 'none';
}

function toggleNotifSettings() {
    const isChecked = document.getElementById('notifToggle').checked;
    const settingsDiv = document.getElementById('notifSettings');
    if (isChecked) {
        settingsDiv.style.opacity = '1';
        settingsDiv.style.pointerEvents = 'auto';
        if (!("Notification" in window)) {
            alert("Ваш браузер не поддерживает системные уведомления.");
            document.getElementById('notifToggle').checked = false;
            return;
        }
        if (Notification.permission !== "granted" && Notification.permission !== "denied") {
            Notification.requestPermission();
        }
    } else {
        settingsDiv.style.opacity = '0.5';
        settingsDiv.style.pointerEvents = 'none';
    }
}

function saveSettings() {
    const isEnabled = document.getElementById('notifToggle').checked;
    const intervalMin = parseInt(document.getElementById('notifInterval').value);
    
    if (isEnabled && Notification.permission !== "granted") {
        Notification.requestPermission().then(perm => {
            if (perm === "granted") {
                finishSaveSettings(true, intervalMin);
            } else {
                alert("Разрешение на уведомления не получено.");
                finishSaveSettings(false, intervalMin);
            }
        });
    } else {
        finishSaveSettings(isEnabled, intervalMin);
    }
}

function finishSaveSettings(enabled, intervalMin) {
    notifSettings.enabled = enabled;
    notifSettings.intervalMin = intervalMin;
    localStorage.setItem('mood_notif_settings', JSON.stringify(notifSettings));
    
    applyNotificationTimer();
    closeSettingsModal();
    showToast('Настройки сохранены');
}

function applyNotificationTimer() {
    if (notifIntervalId) clearInterval(notifIntervalId);
    
    if (notifSettings.enabled) {
        const ms = notifSettings.intervalMin * 60 * 1000;
        showToast(`Таймер запущен: каждые ${notifSettings.intervalMin} мин.`);
        notifIntervalId = setInterval(() => {
            if (Notification.permission === "granted") {
                // Если есть SW — отправляем через него (поддерживает actions/кнопки)
                if (navigator.serviceWorker && navigator.serviceWorker.controller) {
                    navigator.serviceWorker.controller.postMessage({ type: 'SHOW_NOTIFICATION' });
                } else {
                    // Fallback: обычное уведомление
                    const n = new Notification("Минутка рефлексии 🧠", {
                        body: "Как твоё настроение прямо сейчас?",
                        icon: "icon.svg",
                        requireInteraction: true
                    });
                    n.onclick = () => { window.focus(); n.close(); };
                }
            }
        }, ms);
    }
}

function testNotification() {
    if (Notification.permission !== "granted") {
        Notification.requestPermission().then(perm => {
            if (perm === "granted") triggerSWNotif();
            else alert("Пожалуйста, разрешите уведомления в браузере.");
        });
    } else {
        triggerSWNotif();
    }
}

async function triggerSWNotif() {
    if (!navigator.serviceWorker) {
        showToast("Браузер не поддерживает Service Worker.");
        return;
    }

    const reg = await navigator.serviceWorker.ready;
    
    if (navigator.serviceWorker.controller) {
        // Если контроллер активен, шлем сообщение (для интерактивной цепочки)
        navigator.serviceWorker.controller.postMessage({ type: 'SHOW_NOTIFICATION' });
    } else {
        // Если контроллер еще не "захватил" страницу, вызываем уведомление через регистрацию напрямую
        reg.showNotification('Минутка рефлексии 🧠', {
            body: 'Как твоё настроение прямо сейчас?',
            icon: 'icon.svg',
            requireInteraction: true,
            tag: 'mood-check'
        });
        showToast("Уведомление вызвано напрямую. Обновите (F5) для работы виджета.");
    }
}

// Глобальная функция для сохранения данных из PiP-виджета
window.saveQuickEntry = function(data) {
    const entry = {
        id: Date.now(),
        timestamp: Date.now(),
        dateStr: getLocalISODate(new Date()),
        mood: parseInt(data.mood),
        energy: parseInt(data.energy),
        activity: data.activity,
        note: data.note || ""
    };
    
    journalData.push(entry);
    localStorage.setItem('mood_journal_data', JSON.stringify(journalData));
    renderHistory();
    showToast(`Записано через виджет: ${emojis[entry.mood]} ✨`);
    
    // Сбрасываем таймер после успешного ввода
    applyNotificationTimer();
};

// Обработчик команд от Service Worker (например, при клике на уведомление)
if (navigator.serviceWorker) {
    navigator.serviceWorker.addEventListener('message', e => {
        if (e.data && e.data.type === 'OPEN_PIP') {
            if (typeof openQuickInputPiP === 'function') {
                openQuickInputPiP();
            }
        }
        if (e.data && e.data.type === 'QUICK_MOOD') {
            const moodVal = e.data.mood;
            if (!moodVal) return;
            const entry = {
                id: Date.now(),
                timestamp: Date.now(),
                dateStr: getLocalISODate(new Date()),
                mood: moodVal,
                energy: 3,
                activity: 'dash',
                note: ''
            };
            journalData.push(entry);
            localStorage.setItem('mood_journal_data', JSON.stringify(journalData));
            renderHistory();
            showToast(`Записано: ${emojis[moodVal]} (из уведомления)`);
        }
    });
}

// Авто-открытие PiP при загрузке, если перешли по ссылке из уведомления
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('openpip') === 'true') {
        setTimeout(() => {
            if (typeof openQuickInputPiP === 'function') openQuickInputPiP();
        }, 800);
    }
});
