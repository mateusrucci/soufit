<?php
declare(strict_types=1);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

const META_PIXEL_ID = '1172482898007013';
const META_ACCESS_TOKEN = 'EAAUEtmc7DS8BRaEo5B9RI3RIFhbstds8wuZBAHzKZAE3rae0eE971uxpV8uO4C9GE8AOIVT96TqZC3xJu5DZAVQNQZCoMT1DZC4quTc93AnqZCLC1nnVmeknFOagpZAZBTbENFqOFjsDAcHR8VagMICd6wHva8FKkZBsKWdBsCJo8ZBCEjRIZCIwXpy2ACwkfCWscqEEdgZDZD';
const META_API_VERSION = 'v23.0';

function respond(int $statusCode, array $payload): void
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    respond(200, [
        'status' => 'ok',
        'service' => 'soufit-meta-capi',
        'pixel_id' => META_PIXEL_ID,
    ]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['status' => 'error', 'message' => 'Metodo nao permitido.']);
}

$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput ?: '', true);

if (!is_array($input)) {
    respond(400, ['status' => 'error', 'message' => 'JSON invalido ou vazio.']);
}

function clean_string(?string $value): ?string
{
    $value = trim((string) $value);
    return $value !== '' ? $value : null;
}

function hash_meta(?string $value): ?string
{
    $value = clean_string($value);
    return $value ? hash('sha256', strtolower($value)) : null;
}

function hash_digits(?string $value): ?string
{
    $digits = preg_replace('/\D+/', '', (string) $value);
    return $digits !== '' ? hash('sha256', $digits) : null;
}

function client_ip(): ?string
{
    $candidates = [
        $_SERVER['HTTP_CF_CONNECTING_IP'] ?? null,
        $_SERVER['HTTP_X_REAL_IP'] ?? null,
        $_SERVER['HTTP_X_FORWARDED_FOR'] ?? null,
        $_SERVER['REMOTE_ADDR'] ?? null,
    ];

    foreach ($candidates as $candidate) {
        if (!$candidate) {
            continue;
        }

        $ip = trim(explode(',', $candidate)[0]);
        if (filter_var($ip, FILTER_VALIDATE_IP)) {
            return $ip;
        }
    }

    return null;
}

function add_if_present(array &$target, string $key, $value): void
{
    if ($value !== null && $value !== '') {
        $target[$key] = $value;
    }
}

$eventName = clean_string($input['eventName'] ?? 'PageView') ?: 'PageView';

if (!preg_match('/^[A-Za-z0-9_]{1,80}$/', $eventName)) {
    respond(400, ['status' => 'error', 'message' => 'Nome de evento invalido.']);
}

$eventId = clean_string($input['eventId'] ?? null) ?: uniqid('evt_', true);
$eventUrl = clean_string($input['eventUrl'] ?? null);
$userAgent = clean_string($_SERVER['HTTP_USER_AGENT'] ?? null);

$userData = [];
add_if_present($userData, 'client_ip_address', client_ip());
add_if_present($userData, 'client_user_agent', $userAgent);
add_if_present($userData, 'fbp', clean_string($input['fbp'] ?? ($_COOKIE['_fbp'] ?? null)));
add_if_present($userData, 'fbc', clean_string($input['fbc'] ?? ($_COOKIE['_fbc'] ?? null)));
add_if_present($userData, 'em', hash_meta($input['email'] ?? null));
add_if_present($userData, 'ph', hash_digits($input['phone'] ?? null));
add_if_present($userData, 'fn', hash_meta($input['fn'] ?? null));
add_if_present($userData, 'ln', hash_meta($input['ln'] ?? null));
add_if_present($userData, 'external_id', hash_meta($input['external_id'] ?? null));

$event = [
    'event_name' => $eventName,
    'event_time' => time(),
    'action_source' => 'website',
    'event_id' => $eventId,
    'user_data' => $userData,
];

if ($eventUrl) {
    $event['event_source_url'] = $eventUrl;
}

if (isset($input['custom_data']) && is_array($input['custom_data'])) {
    $event['custom_data'] = $input['custom_data'];
}

$payload = json_encode(['data' => [$event]], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
$url = sprintf(
    'https://graph.facebook.com/%s/%s/events?access_token=%s',
    META_API_VERSION,
    META_PIXEL_ID,
    rawurlencode(META_ACCESS_TOKEN)
);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json',
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 8);

$response = curl_exec($ch);
$httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

$decodedResponse = json_decode((string) $response, true);
$success = $httpCode >= 200 && $httpCode < 300 && !$curlError;

respond($success ? 200 : 502, [
    'status' => $success ? 'success' : 'error',
    'http_code' => $httpCode,
    'event_id' => $eventId,
    'meta_response' => $decodedResponse,
    'curl_error' => $curlError ?: null,
]);
