self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('mood-journal-v1').then(cache => {
      return cache.addAll([
        './',
        './index.html',
        './styles.css',
        './script.js',
        './icon.svg',
        './manifest.json'
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});

// Показать уведомление с кнопками выбора настроения
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SHOW_NOTIFICATION') {
    e.waitUntil(
      self.registration.showNotification('Минутка рефлексии 🧠', {
        body: 'Как твоё настроение прямо сейчас?',
        icon: './icon.svg',
        requireInteraction: true,
        tag: 'mood-check',
        actions: [
          { action: 'mood_1', title: '😭 Ужасно' },
          { action: 'mood_2', title: '😕 Плохо' },
          { action: 'mood_3', title: '😐 Норм' },
          { action: 'mood_4', title: '🙂 Хорошо' },
          { action: 'mood_5', title: '🤩 Отлично' }
        ]
      })
    );
  }
});

// Обработка нажатия на кнопку в уведомлении
self.addEventListener('notificationclick', e => {
  e.notification.close();

  const action = e.action; // 'mood_1' ... 'mood_5' или '' (клик по самому телу)
  const moodVal = action && action.startsWith('mood_') ? parseInt(action.split('_')[1]) : null;

  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      const focusedClient = clientList.find(c => c.focused) || clientList[0];
      if (focusedClient) {
        if (moodVal) {
          focusedClient.postMessage({ type: 'QUICK_MOOD', mood: moodVal });
        }
        return focusedClient.focus();
      } else {
        return clients.openWindow('./' + (moodVal ? '?quickmood=' + moodVal : ''));
      }
    })
  );
});
