<?php
// Запрещаем прямой доступ к файлу
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('HTTP/1.1 405 Method Not Allowed');
    exit('Метод не разрешен');
}

// Получаем секретные переменные. На хостинге Beget их нужно будет задать в панели управления
// в разделе "Переменные окружения" или определить прямо здесь, если нет такой возможности.
// Важно: не храните токен в открытом виде в системе контроля версий (Git).
$token = getenv('TELEGRAM_API_TOKEN');
$chat_id = getenv('TELEGRAM_CHAT_ID');



// Получаем тело запроса (JSON от клиента)
$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

if (!isset($data['message']) || empty($data['message'])) {
    header('HTTP/1.1 400 Bad Request');
    exit('Ошибка: отсутствует текст сообщения.');
}

$message = $data['message'];

// URL для запроса к Telegram API
$url = "https://api.telegram.org/bot{$token}/sendMessage";

// Данные для отправки
$post_fields = [
    'chat_id' => $chat_id,
    'parse_mode' => 'html',
    'text' => $message
];

// Отправляем запрос через cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($post_fields));
$output = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Отправляем ответ клиенту
header('Content-Type: application/json');
if ($http_code == 200) {
    echo json_encode(['success' => true, 'message' => 'Сообщение успешно отправлено!']);
} else {
    header('HTTP/1.1 ' . $http_code);
    echo json_encode(['success' => false, 'message' => 'Ошибка при отправке.', 'details' => $output]);
}
?>
