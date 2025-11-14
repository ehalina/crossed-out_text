// Обработчик горячих клавиш
chrome.commands.onCommand.addListener((command) => {
  if (command === 'insert-strikethrough') {
    // Получаем активную вкладку
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) return;
      
      const tab = tabs[0];
      
      // Проверяем что это Facebook
      if (!tab.url || !tab.url.includes('facebook.com')) {
        return;
      }
      
      // Отправляем сообщение в content script для показа prompt
      chrome.tabs.sendMessage(tab.id, {
        action: 'showPrompt'
      }).catch(() => {
        // Если content script не загружен, пробуем через executeScript
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            const text = prompt('Введите текст для зачеркивания:');
            if (text && text.trim()) {
              // Вызываем функцию напрямую
              if (typeof insertStrikethroughText === 'function') {
                insertStrikethroughText(text.trim());
              } else {
                // Если функция не доступна, отправляем сообщение
                window.postMessage({
                  type: 'INSERT_STRIKETHROUGH',
                  text: text.trim()
                }, '*');
              }
            }
          }
        });
      });
    });
  }
});

