// Слушаем сообщения от popup и background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'insertStrikethrough') {
    // Отвечаем сразу синхронно
    sendResponse({ success: true });
    
    // Вставляем текст асинхронно после ответа
    setTimeout(() => {
      insertStrikethroughText(request.text);
    }, 0);
    
    return false; // Ответ уже отправлен синхронно
  }
  
  if (request.action === 'showPrompt') {
    // Показываем prompt для ввода текста
    const text = prompt('Введите текст для зачеркивания:');
    if (text && text.trim()) {
      setTimeout(() => {
        insertStrikethroughText(text.trim());
      }, 0);
    }
    sendResponse({ success: true });
    return false;
  }
  
  return false;
});

// Слушаем сообщения от window.postMessage (для executeScript)
window.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'INSERT_STRIKETHROUGH') {
    insertStrikethroughText(event.data.text);
  }
});

function insertStrikethroughText(text) {
  // Сначала пытаемся найти поле ввода
  if (findAndInsert(text)) {
    return;
  }

  // Если не нашли, пытаемся открыть форму поста
  // Ищем элемент с текстом "Что у вас" или похожим
  const allElements = document.querySelectorAll('div, span');
  for (const el of allElements) {
    const elText = el.textContent || el.innerText || '';
    if ((elText.includes('Что у вас') || elText.includes("What's on your mind")) && 
        el.offsetParent !== null && 
        el.getBoundingClientRect().width > 0) {
      el.click();
      // Пробуем найти поле несколько раз
      const textToInsert = text;
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          findAndInsert(textToInsert);
        }, 100 * (i + 1));
      }
      return;
    }
  }

  const postTriggers = [
    'div[data-testid="status-attachment-mentions-input"]',
    'div[role="textbox"][data-testid="status-attachment-mentions-input"]',
    'div[contenteditable="true"][data-testid="status-attachment-mentions-input"]',
    'div[aria-label*="Что у вас"]',
    'div[aria-label*="What\'s on your mind"]',
    'div[placeholder*="Что у вас"]',
    'div[placeholder*="What\'s on your mind"]'
  ];

  // Ищем и кликаем на триггер поста
  for (const selector of postTriggers) {
    try {
      const trigger = document.querySelector(selector);
      if (trigger && trigger.offsetParent !== null) {
        trigger.click();
        // Пробуем найти поле несколько раз с небольшими задержками
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            findAndInsert(text);
          }, 100 * (i + 1));
        }
        return;
      }
    } catch (e) {
      // Игнорируем ошибки селекторов
    }
  }
}

function findAndInsert(text) {
  // Расширенный список селекторов для поля ввода
  const selectors = [
    'div[contenteditable="true"][role="textbox"][data-testid="status-attachment-mentions-input"]',
    'div[contenteditable="true"][data-testid="status-attachment-mentions-input"]',
    'div[contenteditable="true"][role="textbox"]',
    'div[contenteditable="true"][aria-label*="Что у вас"]',
    'div[contenteditable="true"][aria-label*="What\'s on your mind"]',
    'div[contenteditable="true"]'
  ];

  let editor = null;

  // Сначала ищем внутри активного диалога/модального окна (приоритет)
  const activeDialog = document.querySelector('[role="dialog"]:not([aria-hidden="true"])');
  if (activeDialog) {
    for (const selector of selectors) {
      const elements = activeDialog.querySelectorAll(selector);
      for (const el of elements) {
        if (el.isContentEditable) {
          const rect = el.getBoundingClientRect();
          // Проверяем что элемент видим, в viewport и достаточно большой
          if (rect.width > 50 && rect.height > 10 && el.offsetParent !== null &&
              rect.top >= 0 && rect.left >= 0 && 
              rect.bottom <= window.innerHeight && rect.right <= window.innerWidth) {
            const testId = el.getAttribute('data-testid') || '';
            if (testId.includes('status') || testId.includes('mentions-input')) {
              editor = el;
              break;
            }
          }
        }
      }
      if (editor) break;
    }
  }

  // Если не нашли в диалоге, ищем в основном контенте
  if (!editor) {
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      for (const el of elements) {
        if (el.isContentEditable) {
          const rect = el.getBoundingClientRect();
          // Проверяем что элемент видим, в viewport и достаточно большой
          if (rect.width > 50 && rect.height > 10 && el.offsetParent !== null &&
              rect.top >= 0 && rect.left >= 0 && 
              rect.bottom <= window.innerHeight && rect.right <= window.innerWidth) {
            // Проверяем что это поле ввода поста (не комментарий)
            const testId = el.getAttribute('data-testid') || '';
            const ariaLabel = el.getAttribute('aria-label') || '';
            const parent = el.closest('[role="dialog"], [data-testid*="post"], form');
            
            // Если есть data-testid со status или это в диалоге, или достаточно широкое
            if (testId.includes('status') || parent || rect.width > 200) {
              editor = el;
              break;
            }
          }
        }
      }
      if (editor) break;
    }
  }

  // Если не нашли, берем самое большое видимое contenteditable в viewport
  if (!editor) {
    const allEditable = document.querySelectorAll('div[contenteditable="true"]');
    let maxWidth = 0;
    for (const el of allEditable) {
      const rect = el.getBoundingClientRect();
      // Проверяем что элемент в viewport
      if (rect.width > maxWidth && rect.height > 10 && el.offsetParent !== null &&
          rect.top >= 0 && rect.left >= 0 && 
          rect.bottom <= window.innerHeight && rect.right <= window.innerWidth) {
        maxWidth = rect.width;
        editor = el;
      }
    }
  }

  if (!editor) {
    return false;
  }

  // Сохраняем текущую позицию прокрутки
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;

  // Фокусируемся на поле без прокрутки
  editor.focus({ preventScroll: true });
  
  // Восстанавливаем позицию прокрутки
  window.scrollTo(scrollX, scrollY);
  
  // Кликаем без прокрутки
  const clickEvent = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window
  });
  editor.dispatchEvent(clickEvent);
  
  // Небольшая задержка для фокуса
  setTimeout(() => {
    // Восстанавливаем позицию прокрутки еще раз
    window.scrollTo(scrollX, scrollY);
    
    // Устанавливаем курсор в конец
    const selection = window.getSelection();
    const range = document.createRange();
    
    if (editor.childNodes.length > 0) {
      range.selectNodeContents(editor);
      range.collapse(false);
    } else {
      range.setStart(editor, 0);
      range.setEnd(editor, 0);
    }
    
    selection.removeAllRanges();
    selection.addRange(range);

    // Используем Unicode символы зачеркивания (U+0336)
    const strikethroughText = addStrikethroughUnicode(text);
    
    // Метод 1: Пробуем execCommand insertText с Unicode символами
    if (document.execCommand('insertText', false, strikethroughText)) {
      editor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
      // Восстанавливаем позицию прокрутки после вставки
      window.scrollTo(scrollX, scrollY);
      return;
    }

    // Метод 2: Fallback - вставляем через события клавиатуры
    insertTextViaKeyboard(editor, text, scrollX, scrollY);
  }, 50);

  return true;
}

function addStrikethroughUnicode(text) {
  // Добавляем символ зачеркивания U+0336 после каждого символа
  return text.split('').map(char => char + '\u0336').join('');
}

function getTextNodesIn(node) {
  const textNodes = [];
  if (node.nodeType === 3) {
    textNodes.push(node);
  } else {
    const children = node.childNodes;
    for (let i = 0; i < children.length; i++) {
      textNodes.push(...getTextNodesIn(children[i]));
    }
  }
  return textNodes;
}

function insertTextViaKeyboard(editor, text, scrollX, scrollY) {
  // Добавляем Unicode символы зачеркивания
  const strikethroughText = addStrikethroughUnicode(text);
  
  // Вставляем текст посимвольно через события
  for (let i = 0; i < strikethroughText.length; i++) {
    setTimeout(() => {
      // Восстанавливаем позицию прокрутки перед каждым символом
      if (scrollX !== undefined && scrollY !== undefined) {
        window.scrollTo(scrollX, scrollY);
      }
      
      const char = strikethroughText[i];
      const keyEvent = new KeyboardEvent('keydown', {
        key: char,
        code: char === ' ' ? 'Space' : char === '\u0336' ? 'Minus' : `Key${char.toUpperCase()}`,
        bubbles: true,
        cancelable: true
      });
      editor.dispatchEvent(keyEvent);
      
      const inputEvent = new InputEvent('beforeinput', {
        data: char,
        inputType: 'insertText',
        bubbles: true,
        cancelable: true
      });
      editor.dispatchEvent(inputEvent);
      
      // Вставляем символ
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const textNode = document.createTextNode(char);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      
      editor.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Восстанавливаем позицию прокрутки после вставки символа
      if (scrollX !== undefined && scrollY !== undefined) {
        window.scrollTo(scrollX, scrollY);
      }
    }, i * 5);
  }
}

