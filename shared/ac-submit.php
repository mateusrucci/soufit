<?php
/**
 * ac-submit.php — Proxy server-side para ActiveCampaign
 * Recebe dados do formulário + UTMs e cria/atualiza contato no AC.
 * API key fica aqui (nunca no frontend).
 */

define('AC_URL',     'https://soufit.api-us1.com');
define('AC_KEY',     '037f32d7d6671a1e927537e8f0bd62cb4783a5b294f7abbbc9c0daf502977a4962ff5a1a');
define('AC_LIST_ID', 2);
define('AC_ALLOWED_TAGS', [
    'Ebook - Magra em Casa',
]);

// Campos UTM criados no AC (IDs)
define('AC_FIELDS', [
    'utm_source'   => 11,
    'utm_medium'   => 12,
    'utm_campaign' => 13,
    'utm_content'  => 14,
    'utm_term'     => 15,
]);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://lp.soufit.com');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST')    { http_response_code(405); echo json_encode(['status'=>'error','message'=>'Method not allowed']); exit; }

$input = json_decode(file_get_contents('php://input'), true) ?: [];

$email = filter_var(trim($input['email'] ?? ''), FILTER_SANITIZE_EMAIL);
if (!$email) { http_response_code(400); echo json_encode(['status'=>'error','message'=>'Email obrigatorio']); exit; }

$name  = htmlspecialchars(strip_tags(trim($input['name']  ?? '')));
$phone = htmlspecialchars(strip_tags(trim($input['phone'] ?? '')));
$tag   = htmlspecialchars(strip_tags(trim($input['tag'] ?? '')));
if (!in_array($tag, AC_ALLOWED_TAGS, true)) {
    $tag = '';
}

$parts     = explode(' ', $name, 2);
$firstName = $parts[0] ?? '';
$lastName  = $parts[1] ?? '';

// Montar fieldValues com UTMs
$fieldValues = [];
foreach (AC_FIELDS as $key => $fieldId) {
    $val = strip_tags(trim($input[$key] ?? ''));
    if ($val !== '') {
        $fieldValues[] = ['field' => $fieldId, 'value' => $val];
    }
}

function ac_request(string $method, string $endpoint, ?array $data = null): array {
    $ch = curl_init(AC_URL . '/api/3/' . $endpoint);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST  => $method,
        CURLOPT_HTTPHEADER     => ['Api-Token: ' . AC_KEY, 'Content-Type: application/json'],
        CURLOPT_TIMEOUT        => 10,
    ]);
    if ($data !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    $body = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['code' => $code, 'body' => json_decode($body, true)];
}

function ac_get_or_create_tag(string $tagName): ?int {
    $res = ac_request('GET', 'tags?search=' . rawurlencode($tagName));
    if (($res['code'] ?? 500) < 400 && !empty($res['body']['tags'])) {
        foreach ($res['body']['tags'] as $item) {
            if (($item['tag'] ?? '') === $tagName && isset($item['id'])) {
                return (int)$item['id'];
            }
        }
    }

    $created = ac_request('POST', 'tags', [
        'tag' => [
            'tag' => $tagName,
            'tagType' => 'contact',
            'description' => 'Lead capturado em lp.soufit.com',
        ],
    ]);

    if (($created['code'] ?? 500) >= 400) {
        error_log('[ac-submit] tag create failed: ' . json_encode($created['body']));
        return null;
    }

    return isset($created['body']['tag']['id']) ? (int)$created['body']['tag']['id'] : null;
}

// 1. Sync contato (cria ou atualiza pelo e-mail)
$res = ac_request('POST', 'contact/sync', [
    'contact' => [
        'email'       => $email,
        'firstName'   => $firstName,
        'lastName'    => $lastName,
        'phone'       => $phone,
        'fieldValues' => $fieldValues,
    ]
]);

if ($res['code'] >= 400) {
    error_log('[ac-submit] sync failed: ' . json_encode($res['body']));
    http_response_code(500);
    echo json_encode(['status'=>'error','message'=>'Falha ao salvar contato']);
    exit;
}

$contactId = $res['body']['contact']['id'] ?? null;

// 2. Adicionar à lista principal
if ($contactId) {
    ac_request('POST', 'contactLists', [
        'contactList' => [
            'list'    => AC_LIST_ID,
            'contact' => (int)$contactId,
            'status'  => 1,
        ]
    ]);

    if ($tag !== '') {
        $tagId = ac_get_or_create_tag($tag);
        if ($tagId) {
            ac_request('POST', 'contactTags', [
                'contactTag' => [
                    'contact' => (int)$contactId,
                    'tag' => $tagId,
                ],
            ]);
        }
    }
}

echo json_encode(['status' => 'ok', 'contact_id' => $contactId]);
