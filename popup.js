document.getElementById('insertBtn').addEventListener('click', async () => {
  const text = document.getElementById('textInput').value.trim();
  
  if (!text) {
    alert('Введите текст');
    return;
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  try {
    chrome.tabs.sendMessage(tab.id, {
      action: 'insertStrikethrough',
      text: text
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        return;
      }
      if (response && response.success) {
        document.getElementById('textInput').value = '';
        // Небольшая задержка перед закрытием, чтобы дать время на вставку
        setTimeout(() => {
          window.close();
        }, 100);
      }
    });
  } catch (e) {
    console.error('Ошибка отправки сообщения:', e);
  }
});

// Enter для отправки
document.getElementById('textInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('insertBtn').click();
  }
});

