function openQuickInputPiP() {
    if (!('documentPictureInPicture' in window)) {
        alert('Ваш браузер не поддерживает современный виджет Document PiP. Пожалуйста, обновите Edge/Chrome.');
        return;
    }

    // Параметры окна виджета (шире для 5 кнопок в ряд)
    const width = 560;
    const height = 480;

    window.documentPictureInPicture.requestWindow({
        width: width,
        height: height,
    }).then(pipWindow => {
        pipWindow.document.title = "Mood Tracker";
        setupPiPWidget(pipWindow);
    }).catch(err => {
        console.error('Ошибка при открытии PiP:', err);
        // Fallback: если не вышло, просто показываем алертом или приложением
    });
}

function setupPiPWidget(pip) {
    const doc = pip.document;
    
    // Копируем шрифты из основного окна
    Array.from(document.styleSheets).forEach((styleSheet) => {
        try {
            const newStyle = doc.createElement('style');
            const rules = Array.from(styleSheet.cssRules).map((rule) => rule.cssText).join('');
            newStyle.textContent = rules;
            doc.head.appendChild(newStyle);
        } catch (e) {
            const link = doc.createElement('link');
            link.rel = 'stylesheet';
            link.href = styleSheet.href;
            doc.head.appendChild(link);
        }
    });

    doc.body.innerHTML = `
        <div class="pip-container">
            <h3 class="section-title">Как твое настроение?</h3>
            <div class="selection-grid" id="mood-grid">
                <button class="tile mood-tile" data-val="1">
                    <span class="emoji">😭</span>
                    <span class="label">Ужасно</span>
                </button>
                <button class="tile mood-tile" data-val="2">
                    <span class="emoji">😕</span>
                    <span class="label">Плохо</span>
                </button>
                <button class="tile mood-tile active" data-val="3">
                    <span class="emoji">😐</span>
                    <span class="label">Норм</span>
                </button>
                <button class="tile mood-tile" data-val="4">
                    <span class="emoji">🙂</span>
                    <span class="label">Хорошо</span>
                </button>
                <button class="tile mood-tile" data-val="5">
                    <span class="emoji">🤩</span>
                    <span class="label">Отлично</span>
                </button>
            </div>

            <h3 class="section-title">Твоя энергия / Фокус</h3>
            <div class="selection-grid" id="energy-grid">
                <button class="tile energy-tile" data-val="1">
                    <span class="emoji">🥀</span>
                    <span class="label">Истощён</span>
                </button>
                <button class="tile energy-tile" data-val="2">
                    <span class="emoji">😴</span>
                    <span class="label">Устал</span>
                </button>
                <button class="tile energy-tile active" data-val="3">
                    <span class="emoji">😌</span>
                    <span class="label">Спокоен</span>
                </button>
                <button class="tile energy-tile" data-val="4">
                    <span class="emoji">💪</span>
                    <span class="label">Активен</span>
                </button>
                <button class="tile energy-tile" data-val="5">
                    <span class="emoji">🚀</span>
                    <span class="label">В потоке</span>
                </button>
            </div>

            <h3 class="section-title">Контекст активности</h3>
            <div class="activity-grid">
                <button class="pip-act" data-val="work">💼 Работа</button>
                <button class="pip-act" data-val="rest">☕ Отдых</button>
                <button class="pip-act" data-val="proc">⚠️ Прокрастинация</button>
                <button class="pip-act active" data-val="dash">— Всё ок</button>
            </div>

            <button id="pip-save">СОХРАНИТЬ</button>
        </div>
    `;

    // Доп. стили для контейнера внутри PiP
    const style = doc.createElement('style');
    style.textContent = `
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #fff; margin: 0; padding: 15px; overflow: hidden; color: #333; }
        .pip-container { display: flex; flex-direction: column; gap: 15px; }
        .section-title { font-size: 14px; font-weight: bold; margin: 0; padding: 0; color: #1a1a1a; }
        
        .selection-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
        .tile { background: #f8f9fa; border: 1px solid #eee; border-radius: 12px; padding: 10px 5px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
        .tile:hover { background: #f0f2f5; transform: translateY(-2px); }
        .tile .emoji { font-size: 32px; margin-bottom: 5px; }
        .tile .label { font-size: 11px; color: #666; font-weight: 500; }
        
        /* Цвета для Настроения (Желтый) */
        .mood-tile.active { border: 2px solid #f1c40f; background: #fffdf2; box-shadow: 0 4px 12px rgba(241, 196, 15, 0.15); }
        .mood-tile.active .label { color: #856404; font-weight: bold; }
        
        /* Цвета для Энергии (Синий) */
        .energy-tile.active { border: 2px solid #5dade2; background: #f4faff; box-shadow: 0 4px 12px rgba(93, 173, 226, 0.15); }
        .energy-tile.active .label { color: #2980b9; font-weight: bold; }

        .activity-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .pip-act { background: #f8f9fa; border: 1px solid #eee; padding: 10px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 500; color: #555; transition: all 0.2s; }
        .pip-act:hover { background: #f0f2f5; }
        .pip-act.active { border: 2px solid #333; background: #edf2f7; color: #000; font-weight: bold; }

        #pip-save { width: 100%; background: #27ae60; color: white; border: none; padding: 14px; border-radius: 10px; font-weight: bold; font-size: 14px; cursor: pointer; margin-top: 10px; transition: background 0.2s; }
        #pip-save:hover { background: #219150; }
    `;
    doc.head.appendChild(style);

    let selectedMood = 3;
    let selectedEnergy = 3;
    let selectedAct = 'dash';

    // Обработка Mood
    doc.querySelectorAll('.mood-tile').forEach(btn => {
        btn.onclick = () => {
            doc.querySelectorAll('.mood-tile').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedMood = parseInt(btn.dataset.val);
        };
    });

    // Обработка Energy
    doc.querySelectorAll('.energy-tile').forEach(btn => {
        btn.onclick = () => {
            doc.querySelectorAll('.energy-tile').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedEnergy = parseInt(btn.dataset.val);
        };
    });

    // Обработка Activity
    doc.querySelectorAll('.pip-act').forEach(btn => {
        btn.onclick = () => {
            doc.querySelectorAll('.pip-act').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedAct = btn.dataset.val;
        };
    });

    doc.getElementById('pip-save').onclick = () => {
        window.saveQuickEntry({
            mood: selectedMood,
            energy: selectedEnergy,
            activity: selectedAct,
            note: ""
        });
        pip.close();
    };
}
