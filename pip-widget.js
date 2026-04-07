function openQuickInputPiP() {
    if (!('documentPictureInPicture' in window)) {
        alert('Ваш браузер не поддерживает современный виджет Document PiP. Пожалуйста, обновите Edge/Chrome.');
        return;
    }

    // Параметры окна виджета
    const width = 340;
    const height = 380;

    window.documentPictureInPicture.requestWindow({
        width: width,
        height: height,
    }).then(pipWindow => {
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
            <h3 style="margin:0 0 10px 0; font-size:16px; color:#2c3e50;">🧠 Быстрый ввод</h3>
            
            <div>
                <label class="pip-label">Настроение</label>
                <select id="pip-mood" class="pip-select">
                    <option value="5">🤩 Отлично</option>
                    <option value="4" selected>🙂 Хорошо</option>
                    <option value="3">😐 Нормально</option>
                    <option value="2">😕 Плохо</option>
                    <option value="1">😭 Ужасно</option>
                </select>
            </div>

            <div>
                <label class="pip-label">Энергия / Фокус</label>
                <select id="pip-energy" class="pip-select">
                    <option value="5">🚀 В потоке</option>
                    <option value="4">💪 Активен</option>
                    <option value="3" selected>😌 Спокоен</option>
                    <option value="2">😴 Устал</option>
                    <option value="1">🪫 Истощен</option>
                </select>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; margin-top:5px;">
                <button class="pip-act" data-val="work">💼 Работа</button>
                <button class="pip-act" data-val="rest">☕ Отдых</button>
                <button class="pip-act" data-val="proc">⚠️ Прокрастинация</button>
                <button class="pip-act active" data-val="dash" id="pip-dash-btn">— Всё ок</button>
            </div>

            <button id="pip-save">СОХРАНИТЬ</button>
        </div>
    `;

    // Доп. стили для контейнера внутри PiP
    const style = doc.createElement('style');
    style.textContent = `
        body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f9f9fb; margin: 0; padding: 12px; overflow: hidden; }
        .pip-container { display: flex; flex-direction: column; gap: 8px; }
        .pip-act { background: white; border: 1px solid #eee; padding: 6px; border-radius: 6px; cursor: pointer; font-size: 11px; transition: all 0.2s; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .pip-act:hover { background: #f0f0f0; }
        .pip-act.active { border-color: #5DADE2; background: rgba(93, 173, 226, 0.1); color: #2980b9; font-weight: bold; }
        #pip-save { width: 100%; background: #27ae60; color: white; border: none; padding: 12px; border-radius: 6px; font-weight: bold; cursor: pointer; margin-top: 5px; }
        #pip-save:hover { background: #219150; }
        .pip-label { display: block; font-size: 12px; color: #7f8c8d; margin-bottom: 2px; }
        .pip-select { width: 100%; padding: 6px; border-radius: 6px; border: 1px solid #ddd; outline: none; }
    `;
    doc.head.appendChild(style);

    let selectedAct = 'dash';

    doc.querySelectorAll('.pip-act').forEach(btn => {
        btn.onclick = () => {
            doc.querySelectorAll('.pip-act').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedAct = btn.dataset.val;
        };
    });

    doc.getElementById('pip-save').onclick = () => {
        const mood = parseInt(doc.getElementById('pip-mood').value);
        const energy = parseInt(doc.getElementById('pip-energy').value);
        
        // Отправляем данные в основное окно
        window.saveQuickEntry({
            mood: mood,
            energy: energy,
            activity: selectedAct,
            note: ""
        });
        
        pip.close();
    };
}
