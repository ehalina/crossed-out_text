# Инструкция по публикации в Chrome Web Store

## Шаг 1: Подготовка файлов

1. **Упакуйте расширение:**
   ```bash
   ./package-store.sh
   ```
   Или вручную создайте ZIP архив со всеми файлами (см. DISTRIBUTION.md)

2. **Проверьте наличие всех файлов:**
   - ✅ manifest.json
   - ✅ popup.html, popup.js
   - ✅ content.js, background.js
   - ✅ styles.css
   - ✅ icon16.png, icon48.png, icon128.png

## Шаг 2: Загрузка в Chrome Web Store

1. Перейдите на https://chrome.google.com/webstore/devconsole
2. Войдите в аккаунт Google (если нужно, оплатите единоразовый взнос $5)
3. Нажмите "New Item" (Новый элемент)
4. Загрузите ZIP файл `facebook-strikethrough-store.zip`

## Шаг 3: Заполнение информации

### Основная информация
- **Название:** Facebook Зачеркнутый Текст
- **Краткое описание:** Вставляйте зачеркнутый текст в посты Facebook одним нажатием клавиш. Безопасная вставка через Unicode символ U+0336 без скриптов. Простое и удобное расширение для форматирования текста.
- **Полное описание:** См. CHROME_STORE.md (раздел "Описание (полное)")
- **Категория:** Productivity (Продуктивность)
- **Язык:** Русский (Russian)

### Скриншоты
Загрузите минимум 1 скриншот (рекомендуется 3-5):
- Popup окна расширения
- Использования на Facebook
- Результата (пост с зачеркнутым текстом)

**Требования:**
- Размер: 1280x800 - 3840x2160 пикселей
- Формат: PNG или JPEG

### Privacy Policy
1. Загрузите `privacy-policy.html` на публичный хостинг (GitHub Pages, Netlify, etc.)
2. Укажите URL в поле "Privacy Policy URL"

Или используйте GitHub Pages:
- Создайте репозиторий на GitHub
- Загрузите privacy-policy.html
- Включите GitHub Pages в настройках репозитория
- URL будет: `https://ваш-username.github.io/репозиторий/privacy-policy.html`

### Иконки
Иконки уже включены в ZIP файл, но можно загрузить отдельно:
- Маленькая: 16x16 (icon16.png)
- Средняя: 48x48 (icon48.png)
- Большая: 128x128 (icon128.png)

## Шаг 4: Дополнительные настройки

- **Версия:** 1.0.1
- **Минимальная версия Chrome:** 88
- **Разрешения:** Укажите, что расширение работает только на facebook.com

## Шаг 5: Отправка на проверку

1. Проверьте всю информацию
2. Нажмите "Submit for Review" (Отправить на проверку)
3. Ожидайте проверки (обычно 1-3 рабочих дня)

## Полезные ссылки

- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [Документация Chrome Extensions](https://developer.chrome.com/docs/extensions/)
- [Политика Chrome Web Store](https://developer.chrome.com/docs/webstore/program-policies/)

## После публикации

После одобрения расширение будет доступно в Chrome Web Store. Вы сможете:
- Отслеживать статистику установок
- Получать отзывы пользователей
- Обновлять расширение через тот же процесс

## Обновление расширения

Для обновления:
1. Обновите версию в manifest.json
2. Упакуйте новую версию через package-store.sh
3. Загрузите новый ZIP в Chrome Web Store Developer Console
4. Укажите изменения в описании обновления
5. Отправьте на проверку

