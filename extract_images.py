import re
import base64
import os
from bs4 import BeautifulSoup

# --- Конфигурация ---
HTML_FILE = 'index.html'
IMG_DIR = 'img'

# --- Логика скрипта ---

# Убедимся, что папка для изображений существует
if not os.path.exists(IMG_DIR):
    os.makedirs(IMG_DIR)

# Читаем HTML файл
try:
    with open(HTML_FILE, 'r', encoding='utf-8') as f:
        html_content = f.read()
except FileNotFoundError:
    print(f"Ошибка: Файл {HTML_FILE} не найден.")
    exit()

soup = BeautifulSoup(html_content, 'html.parser')

# Находим все теги img с data:image
images = soup.find_all('img', src=re.compile(r'data:image/'))

if not images:
    print("Встроенные Base64 изображения не найдены. Завершение работы.")
    exit()

print(f'Найдено {len(images)} встроенных изображений для обработки.')

changes_made = False
for i, img in enumerate(images):
    src_content = img.get('src', '')
    if not src_content.startswith('data:image/'):
        continue

    # Разбираем строку data:image
    try:
        header, encoded_data = src_content.split(',', 1)
        # Определяем расширение файла
        match = re.search(r'data:image/(?P<ext>[a-zA-Z0-9+.-]+);', header)
        if not match:
            print(f"Не удалось определить расширение для изображения #{i+1}. Пропускаем.")
            continue
        
        file_extension = match.group('ext')
        # Генерируем имя файла на основе alt-тега или индекса для уникальности
        alt_text = img.get('alt', '').strip().lower().replace(' ', '_')
        filename = f'{alt_text}_{i+1}.{file_extension}' if alt_text else f'image_{i+1}.{file_extension}'
        filepath = os.path.join(IMG_DIR, filename)
        
        # Декодируем и сохраняем изображение
        decoded_data = base64.b64decode(encoded_data)
        with open(filepath, 'wb') as f:
            f.write(decoded_data)
            
        print(f'Сохранено: {filepath}')
        
        # Заменяем src атрибут
        web_path = filepath.replace('\\', '/')
        img['src'] = web_path
        changes_made = True
        
    except (ValueError, AttributeError, TypeError, base64.B64DecodeError) as e:
        print(f'Не удалось обработать изображение #{i+1}: {e}')

# Если были сделаны изменения, сохраняем обновленный HTML
if changes_made:
    try:
        with open(HTML_FILE, 'w', encoding='utf-8') as f:
            # Используем prettify для сохранения форматирования
            f.write(str(soup.prettify()))
        print(f'\nФайл {HTML_FILE} успешно обновлен.')
    except Exception as e:
        print(f"\nОшибка при сохранении файла {HTML_FILE}: {e}")
else:
    print("\nИзменений не было. Файл HTML не перезаписан.")

print("\nСкрипт завершил работу.")
