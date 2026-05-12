<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once __DIR__ . '/../helpers/FileHelper.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../config/database.php';

class Router {
    private $routes = [];
    public function add($method, $path, $callback) {
        $this->routes[] = ['method' => $method, 'path' => $path, 'callback' => $callback];
    }
    public function get($path, $callback) { $this->add('GET', $path, $callback); }
    public function post($path, $callback) { $this->add('POST', $path, $callback); }
    public function put($path, $callback) { $this->add('PUT', $path, $callback); }
    public function delete($path, $callback) { $this->add('DELETE', $path, $callback); }

    public function resolve() {
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        
        // ROBUST SUBDIR DETECTION
        $baseMarkers = ['/server/public', '/public'];
        foreach ($baseMarkers as $marker) {
            $pos = strpos($uri, $marker);
            if ($pos !== false) {
                $uri = substr($uri, $pos + strlen($marker));
                break;
            }
        }
        
        $uri = str_replace('/index.php', '', $uri);
        if (empty($uri)) $uri = '/';
        if ($uri !== '/' && substr($uri, -1) === '/') $uri = rtrim($uri, '/');
        $method = $_SERVER['REQUEST_METHOD'];
        
        // FormData PUT override support
        if ($method === 'POST' && isset($_POST['_method'])) {
            $method = strtoupper($_POST['_method']);
        }
        
        foreach ($this->routes as $route) {
            $pattern = "#^" . preg_replace('/\{([a-zA-Z0-9_]+)\}/', '(?P<$1>[^/]+)', $route['path']) . "$#";
            if ($method === $route['method'] && preg_match($pattern, $uri, $matches)) {
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
                return call_user_func_array($route['callback'], array_values($params));
            }
        }
        http_response_code(404);
        echo json_encode(['error' => 'Not Found', 'uri' => $uri]);
    }
}

$router = new Router();

require_once __DIR__ . '/../controllers/AuthController.php';
$authCtrl = new AuthController();
$router->post('/auth/login', [$authCtrl, 'login']);
$router->get('/auth/check', [$authCtrl, 'check']);

// --- AUTO-GENERATED AUTH (DO NOT REMOVE) ---
require_once __DIR__ . '/../controllers/AuthController.php';
$authCtrl = new AuthController();
$router->post('/auth/login', [$authCtrl, 'login']);
$router->post('/auth/forgot-password', [$authCtrl, 'forgotPassword']);
$router->post('/auth/verify-otp', [$authCtrl, 'verifyOtp']);
$router->get('/auth/check', [$authCtrl, 'check']);
// --- AUTO-GENERATED AUTH ---

// AUTO-LOAD GENERATED ROUTES
foreach (glob(__DIR__ . '/*Routes.php') as $filename) {
    require_once $filename;
}

$router->resolve();