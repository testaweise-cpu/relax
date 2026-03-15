<?php
/**
 * PHP Proxy for Noble Atlas API
 * Replaces the Node.js / Express server for compatibility with standard FTP web hosting.
 */

// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Configuration (Replace with your actual token if not set in server environment)
$apiToken = getenv('NOBLE_SYNC_TOKEN') ? getenv('NOBLE_SYNC_TOKEN') : 'YOUR_NOBLE_ATLAS_TOKEN_HERE';
$baseUrl = 'https://noble-atlas.de/wp-json/noble-bordell-sync/v1';
$bordellId = '5607';

// Because we don't have .env by default in standard shared hosting, you MUST HARDCODE the token here 
// if your hosting provider doesn't support environment variables.
$hardcodedToken = 'f2baXU3K2U1wA3z4Y44u7u7H93t72yN'; // Placeholder - replace with your real token!

if ($hardcodedToken !== 'YOUR_REAL_TOKEN_HERE') {
    $apiToken = $hardcodedToken;
}

$action = isset($_GET['action']) ? $_GET['action'] : 'list';

/**
 * Helper function to make cURL requests
 */
function fetchFromNobleAtlas($url, $token) {
    $ch = curl_init();
    
    // Set headers identical to the Node.js version
    $headers = [
        "Authorization: Bearer " . $token,
        "Accept: application/json",
        "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Origin: " . (isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : 'https://relaxloungebeikaisers.de')
    ];
    
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true); // Set to false ONLY if you get SSL errors on cheap hostings
    
    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    
    curl_close($ch);
    
    return [
        'code' => $httpCode,
        'body' => $result,
        'error' => $error
    ];
}

// Route: Get all models
if ($action === 'list') {
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $perPage = isset($_GET['per_page']) ? (int)$_GET['per_page'] : 15;
    $search = isset($_GET['search']) ? urlencode($_GET['search']) : '';
    
    $url = $baseUrl . "/bordells/" . $bordellId . "/sedcards";
    
    $queryParams = [];
    if ($page > 1) $queryParams[] = "page=" . $page;
    if ($perPage != 15) $queryParams[] = "per_page=" . $perPage;
    if ($search !== '') $queryParams[] = "search=" . $search;
    
    if (count($queryParams) > 0) {
        $url .= "?" . implode("&", $queryParams);
    }
    
    $response = fetchFromNobleAtlas($url, $apiToken);
    
    if ($response['code'] === 200) {
        $data = json_decode($response['body'], true);
        
        if (isset($data['success']) && $data['success'] && isset($data['data'])) {
            echo json_encode([
                'items' => isset($data['data']['items']) ? $data['data']['items'] : [],
                'pagination' => isset($data['data']['pagination']) ? $data['data']['pagination'] : new stdClass(),
                'bordell' => isset($data['data']['bordell']) ? $data['data']['bordell'] : new stdClass()
            ]);
        } else {
            echo json_encode(['items' => [], 'pagination' => new stdClass(), 'bordell' => new stdClass()]);
        }
    } else {
        http_response_code($response['code'] ?: 500);
        echo json_encode(['error' => 'Failed to fetch models from external API. HTTP Code: ' . $response['code']]);
    }
    exit;
}

// Route: Get single model
if ($action === 'detail') {
    $identifier = isset($_GET['identifier']) ? urlencode($_GET['identifier']) : '';
    
    if (empty($identifier)) {
        http_response_code(400);
        echo json_encode(['error' => 'Identifier is required']);
        exit;
    }
    
    $url = $baseUrl . "/sedcards/" . $identifier . "/detail?bordell_id=" . $bordellId;
    
    $response = fetchFromNobleAtlas($url, $apiToken);
    
    if ($response['code'] === 200) {
        $data = json_decode($response['body'], true);
        
        if (isset($data['success']) && $data['success'] && isset($data['data'])) {
            echo json_encode($data['data']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Model not found.']);
        }
    } else {
        http_response_code($response['code'] ?: 500);
        echo json_encode(['error' => 'Failed to fetch model details.']);
    }
    exit;
}

http_response_code(400);
echo json_encode(['error' => 'Invalid action specified.']);
exit;
