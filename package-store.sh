#!/bin/bash

# Скрипт для упаковки расширения для Chrome Web Store

echo "📦 Упаковка расширения для Chrome Web Store..."

# Создаем временную папку
TEMP_DIR="facebook-strikethrough-store"
rm -rf "$TEMP_DIR"
mkdir "$TEMP_DIR"

# Копируем необходимые файлы для Chrome Web Store
cp manifest.json "$TEMP_DIR/"
cp popup.html "$TEMP_DIR/"
cp popup.js "$TEMP_DIR/"
cp content.js "$TEMP_DIR/"
cp background.js "$TEMP_DIR/"
cp styles.css "$TEMP_DIR/"

# Проверяем наличие иконок
if [ -f "icon16.png" ]; then
    cp icon16.png "$TEMP_DIR/"
else
    echo "⚠️  ВНИМАНИЕ: icon16.png не найден! Создайте иконки через generate-icons.html"
fi

if [ -f "icon48.png" ]; then
    cp icon48.png "$TEMP_DIR/"
else
    echo "⚠️  ВНИМАНИЕ: icon48.png не найден! Создайте иконки через generate-icons.html"
fi

if [ -f "icon128.png" ]; then
    cp icon128.png "$TEMP_DIR/"
else
    echo "⚠️  ВНИМАНИЕ: icon128.png не найден! Создайте иконки через generate-icons.html"
fi

# Создаем ZIP архив для Chrome Web Store
ZIP_NAME="facebook-strikethrough-store.zip"
rm -f "$ZIP_NAME"
cd "$TEMP_DIR"
zip -r "../$ZIP_NAME" . -x "*.DS_Store" -x "*.git*"
cd ..

# Удаляем временную папку
rm -rf "$TEMP_DIR"

echo ""
echo "✅ Расширение упаковано для Chrome Web Store: $ZIP_NAME"
echo ""
echo "📋 Следующие шаги:"
echo "1. Зайдите на https://chrome.google.com/webstore/devconsole"
echo "2. Создайте новый элемент (New Item)"
echo "3. Загрузите файл: $ZIP_NAME"
echo "4. Заполните информацию из файла CHROME_STORE.md"
echo "5. Загрузите скриншоты (минимум 1, рекомендуется 3-5)"
echo "6. Укажите URL privacy policy (можно загрузить privacy-policy.html на GitHub Pages или другой хостинг)"
echo "7. Оплатите единоразовый взнос $5 (если еще не платили)"
echo "8. Отправьте на проверку"
echo ""
echo "📄 Дополнительная информация в файлах:"
echo "   - CHROME_STORE.md - описание и информация для магазина"
echo "   - privacy-policy.html - политика конфиденциальности"

