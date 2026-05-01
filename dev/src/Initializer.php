<?php

class Initializer
{
    private static $isRunning = false;

    public static function run($force = false)
    {
        if (self::$isRunning) return;
        self::$isRunning = true;

        // 1-hour cooldown, but bypass if critical files are missing
        $lockFile = DEV_ROOT . '/.init_lock';
        
        $isMissingCritical = !file_exists(CLIENT_PATH . '/src/components/Admin/AdminLayout.jsx') || 
                            !file_exists(CLIENT_PATH . '/src/App.jsx');
        $appContent = file_exists(CLIENT_PATH . '/src/App.jsx') ? file_get_contents(CLIENT_PATH . '/src/App.jsx') : '';
        $isMissingRoutes = strpos($appContent, '/forgot-password') === false || strpos($appContent, '/recover-password') === false;

        if (!$force && !$isMissingCritical && !$isMissingRoutes && file_exists($lockFile) && (time() - filemtime($lockFile) < 3600)) {
            self::$isRunning = false;
            return;
        }

        // Proactive Cleanup of Managed Files (Prevents Version Conflicts)
        self::cleanupManagedFiles();

        self::ensureServerStructure();
        self::ensureAdminStructure($force);
        self::ensureClientHelpers($force);
        self::ensureDependencies();
        self::ensureViteConfig();
        self::ensureMailHelper($force);
        self::ensureDevAssets();
        self::ensureAuthStructure($force);

        // Final Sync: Automatically restore all generated sections from DB (Self-Healing)
        try {
            if (file_exists(DEV_DB_PATH)) {
                $db = new PDO('sqlite:' . DEV_DB_PATH);
                require_once DEV_ROOT . '/src/Generator.php';
                $generator = new CrudGenerator($db);
                $generator->updateReactFiles();
            }
        } catch (Exception $e) {}

        touch($lockFile);
        self::$isRunning = false;
    }

    private static function cleanupManagedFiles()
    {
        // ROBUSTNESS: Never delete files. The 'ensure' logic will handle updates.
        // This prevents the "empty file" bug caused by failed writes after a deletion.
    }

    private static function ensureClientHelpers($force = false)
    {
        // 1. Ensure api.js exists
        $servicesDir = CLIENT_PATH . '/src/services';
        if (!file_exists($servicesDir)) {
            mkdir($servicesDir, 0777, true);
        }
        $apiFile = $servicesDir . '/api.js';
        if (!file_exists($apiFile)) {
            $content = file_get_contents(TEMPLATES_PATH . '/api_js.tpl');
            file_put_contents($apiFile, $content);
        }

        // 2. Ensure ToastContext.jsx exists
        $toastDir = CLIENT_PATH . '/src/components/Admin';
        if (!file_exists($toastDir)) {
            mkdir($toastDir, 0777, true);
        }
        $toastFile = $toastDir . '/ToastContext.jsx';
        if ($force || !file_exists($toastFile) || @filesize($toastFile) === 0) {
            $content = file_get_contents(TEMPLATES_PATH . '/toast_context.tpl');
            file_put_contents($toastFile, $content);
        }

        // 3. Ensure crud.js exists
        $crudFile = $servicesDir . '/crud.js';
        if ($force || !file_exists($crudFile) || @filesize($crudFile) === 0) {
            $content = file_get_contents(TEMPLATES_PATH . '/crud_js.tpl');
            file_put_contents($crudFile, $content);
        }
    }

    private static function ensureDependencies()
    {
        $packageJsonPath = CLIENT_PATH . DIRECTORY_SEPARATOR . 'package.json';
        if (!file_exists($packageJsonPath)) {
            // Create a default package.json if it's missing (e.g. folder was deleted/recreated)
            $pkg = [
                "name" => "react-client",
                "private" => true,
                "version" => "0.0.0",
                "type" => "module",
                "scripts" => [
                    "dev" => "vite",
                    "build" => "vite build",
                    "lint" => "eslint .",
                    "preview" => "vite preview"
                ],
                "dependencies" => [
                    "axios" => "^1.7.0",
                    "lucide-react" => "^0.400.0",
                    "react" => "^18.3.1",
                    "react-dom" => "^18.3.1",
                    "react-router-dom" => "^6.23.1"
                ],
                "devDependencies" => [
                    "@types/react" => "^18.3.3",
                    "@types/react-dom" => "^18.3.0",
                    "@vitejs/plugin-react" => "^4.3.1",
                    "eslint" => "^8.57.0",
                    "eslint-plugin-react" => "^7.34.2",
                    "eslint-plugin-react-hooks" => "^4.6.2",
                    "eslint-plugin-react-refresh" => "^0.4.7",
                    "vite" => "^5.3.1"
                ]
            ];
            file_put_contents($packageJsonPath, json_encode($pkg, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        }

        $packageJson = json_decode(file_get_contents($packageJsonPath), true);
        $deps = $packageJson['dependencies'] ?? [];
        
        // Ensure essential packages are installed
        $essential = ['react-router-dom', 'axios', 'lucide-react'];
        $missing = [];
        foreach ($essential as $pkg) {
            if (!file_exists(CLIENT_PATH . DIRECTORY_SEPARATOR . 'node_modules' . DIRECTORY_SEPARATOR . $pkg)) {
                $missing[] = $pkg;
            }
        }

        if (!empty($missing)) {
            $cmd = "cd " . escapeshellarg(CLIENT_PATH) . " && start /B npm install " . implode(' ', $missing) . " > nul 2>&1";
            exec($cmd);
        }
    }

    private static function ensureAdminStructure($force = false)
    {
        // 1. Ensure AdminLayout.jsx exists
        $layoutDir = CLIENT_PATH . '/src/components/Admin';
        if (!file_exists($layoutDir)) {
            mkdir($layoutDir, 0777, true);
        }

        // Create Admin.css
        $cssFile = $layoutDir . '/Admin.css';
        if ($force || !file_exists($cssFile)) {
            $content = file_get_contents(TEMPLATES_PATH . '/admin_css.tpl');
            file_put_contents($cssFile, $content);
        }

        $layoutFile = $layoutDir . '/AdminLayout.jsx';
        $preservedNav = self::extractPreservedContent($layoutFile, '// [START_GENERATED_NAV_ITEMS]', '// [END_GENERATED_NAV_ITEMS]');
        if (empty($preservedNav)) $preservedNav = self::extractPreservedContent($layoutFile, '// [GENERATED_NAV_ITEMS]', '// [GENERATED_NAV_ITEMS]'); // Legacy fallback
        if ($force || !file_exists($layoutFile) || filesize($layoutFile) === 0) {
            $content = file_get_contents(TEMPLATES_PATH . '/admin_layout.tpl');
            if ($preservedNav) {
                $content = str_replace("// [START_GENERATED_NAV_ITEMS]\n// [END_GENERATED_NAV_ITEMS]", "// [START_GENERATED_NAV_ITEMS]\n" . trim($preservedNav) . "\n// [END_GENERATED_NAV_ITEMS]", $content);
            }
            file_put_contents($layoutFile, $content);
        }

        $routesDir = CLIENT_PATH . '/src/routes';
        if (!file_exists($routesDir)) mkdir($routesDir, 0777, true);
        $routesFile = $routesDir . '/AdminRoutes.jsx';
        $preservedRoutes = self::extractPreservedContent($routesFile, '{/* [START_GENERATED_ROUTES] */}', '{/* [END_GENERATED_ROUTES] */}');
        if (empty($preservedRoutes)) $preservedRoutes = self::extractPreservedContent($routesFile, '{/* [GENERATED_ROUTES] */}', '{/* [GENERATED_ROUTES] */}'); // Legacy fallback
        
        $preservedImports = self::extractPreservedContent($routesFile, '// [START_GENERATED_IMPORTS]', '// [END_GENERATED_IMPORTS]');
        if (empty($preservedImports)) $preservedImports = self::extractPreservedContent($routesFile, '// [GENERATED_IMPORTS]', '// [GENERATED_IMPORTS]'); // Legacy fallback
        
        if ($force || !file_exists($routesFile) || filesize($routesFile) === 0) {
            $content = file_get_contents(TEMPLATES_PATH . '/admin_routes.tpl');
            if ($preservedRoutes) {
                $content = str_replace("{/* [START_GENERATED_ROUTES] */}\n        {/* [END_GENERATED_ROUTES] */}", "{/* [START_GENERATED_ROUTES] */}\n        " . trim($preservedRoutes) . "\n        {/* [END_GENERATED_ROUTES] */}", $content);
            }
            if ($preservedImports) {
                $content = str_replace("// [START_GENERATED_IMPORTS]\n// [END_GENERATED_IMPORTS]", "// [START_GENERATED_IMPORTS]\n" . trim($preservedImports) . "\n// [END_GENERATED_IMPORTS]", $content);
            }
            file_put_contents($routesFile, $content);
        }

        // 3. Ensure App.jsx has routing and anchors
        $appFile = CLIENT_PATH . '/src/App.jsx';
        if (!file_exists($appFile)) {
            // Ensure src directory exists
            if (!file_exists(CLIENT_PATH . '/src')) mkdir(CLIENT_PATH . '/src', 0777, true);
            
            // Ensure index.html exists in client root
            if (!file_exists(CLIENT_PATH . '/index.html')) {
                $html = "<!doctype html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>React App</title>\n  </head>\n  <body>\n    <div id=\"root\"></div>\n    <script type=\"module\" src=\"/src/main.jsx\"></script>\n  </body>\n</html>";
                file_put_contents(CLIENT_PATH . '/index.html', $html);
            }
            
            // Ensure main.jsx exists
            if (!file_exists(CLIENT_PATH . '/src/main.jsx')) {
                $main = "import React from 'react'\nimport ReactDOM from 'react-dom/client'\nimport App from './App.jsx'\n\nReactDOM.createRoot(document.getElementById('root')).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n)";
                file_put_contents(CLIENT_PATH . '/src/main.jsx', $main);
            }

            $content = file_get_contents(TEMPLATES_PATH . '/app.tpl');
            file_put_contents($appFile, $content);
        } else {
            self::ensureAnchors($appFile);
        }

        // 4. Ensure pages/Admin/Sections exists
        $sectionsDir = CLIENT_PATH . '/src/pages/Admin/Sections';
        if (!file_exists($sectionsDir)) {
            mkdir($sectionsDir, 0777, true);
        }

        // 5. Ensure Login.jsx exists
        $pagesDir = CLIENT_PATH . '/src/pages';
        if (!file_exists($pagesDir)) mkdir($pagesDir, 0777, true);
        $loginFile = $pagesDir . '/Login.jsx';
        if ($force || !file_exists($loginFile) || @filesize($loginFile) === 0) {
            $content = file_get_contents(TEMPLATES_PATH . '/login.tpl');
            file_put_contents($loginFile, $content);
        }

        // 5.1 Ensure ForgotPassword.jsx exists
        $forgotFile = $pagesDir . '/ForgotPassword.jsx';
        if ($force || !file_exists($forgotFile) || @filesize($forgotFile) === 0) {
            $content = file_get_contents(TEMPLATES_PATH . '/forgot_password.tpl');
            file_put_contents($forgotFile, $content);
        }

        // 5.2 Ensure RecoverPassword.jsx exists
        $recoverFile = $pagesDir . '/RecoverPassword.jsx';
        if ($force || !file_exists($recoverFile) || @filesize($recoverFile) === 0) {
            $content = file_get_contents(TEMPLATES_PATH . '/recover_password.tpl');
            file_put_contents($recoverFile, $content);
        }

        // 6. Ensure ProtectedRoute.jsx exists
        $protFile = $layoutDir . '/ProtectedRoute.jsx';
        if ($force || !file_exists($protFile) || @filesize($protFile) === 0) {
            $content = file_get_contents(TEMPLATES_PATH . '/protected_route.tpl');
            file_put_contents($protFile, $content);
        }

        // 7. Ensure Server Public Upload directory exists
        $uploadDir = SERVER_PATH . '/public/upload';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
    }

    private static function ensureAnchors($path)
    {
        $content = file_get_contents($path);
        $originalContent = $content;
        $modified = false;

        // 1. Ensure essential imports exist
        $requiredImports = [
            'AdminRoutes' => "import AdminRoutes from './routes/AdminRoutes';",
            'AdminLayout' => "import AdminLayout from './components/Admin/AdminLayout';",
            'ToastProvider' => "import { ToastProvider } from './components/Admin/ToastContext';",
            'Login' => "import Login from './pages/Login';",
            'ForgotPassword' => "import ForgotPassword from './pages/ForgotPassword';",
            'RecoverPassword' => "import RecoverPassword from './pages/RecoverPassword';",
            'ProtectedRoute' => "import ProtectedRoute from './components/Admin/ProtectedRoute';",
            'Router' => "import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';"
        ];

        foreach ($requiredImports as $key => $importLine) {
            $pattern = "/import\s+.*?\b" . preg_quote($key, '/') . "\b.*?from/m";
            if (!preg_match($pattern, $content)) {
                $content = $importLine . "\n" . $content;
                $modified = true;
            }
        }

        // 2. Deduplicate imports
        $lines = explode("\n", $content);
        $seenImports = [];
        $newLines = [];
        foreach ($lines as $line) {
            if (preg_match('/import\s+(\w+|\{.*?\}|.*?\s+as\s+.*?)\s+from\s+[\'"].*?[\'"]/', $line)) {
                $sig = trim($line);
                if (in_array($sig, $seenImports)) {
                    $modified = true;
                    continue;
                }
                $seenImports[] = $sig;
            }
            $newLines[] = $line;
        }
        $content = implode("\n", $newLines);
        $content = preg_replace("/(\r?\n){3,}/", "\n\n", $content);
        $content = str_replace('*/}}', '*/}', $content);

        // 3. Routing Block
        if (strpos($content, '<Routes>') !== false) {
            $startMarker = '{/* [START_PUBLIC_AUTH_ROUTES] */}';
            $endMarker = '{/* [END_PUBLIC_AUTH_ROUTES] */}';
            $authRoutes = "\n          <Route path=\"/login\" element={<Login />} />\n          <Route path=\"/forgot-password\" element={<ForgotPassword />} />\n          <Route path=\"/recover-password\" element={<RecoverPassword />} />";

            // Robust Replacement: Find first start and last end
            $firstStart = strpos($content, $startMarker);
            $lastEnd = strrpos($content, $endMarker);
            
            // Legacy fallbacks
            if ($firstStart === false) {
                $startMarkerLegacy = '{/* PUBLIC_AUTH_ROUTES */}';
                $firstStart = strpos($content, $startMarkerLegacy);
                $lastEnd = strrpos($content, $startMarkerLegacy);
                $startMarker = $startMarkerLegacy; // Use legacy marker for replacement if found
                $endMarker = $startMarkerLegacy;
            }

            if ($firstStart !== false && $lastEnd !== false && $lastEnd >= $firstStart) {
                $before = substr($content, 0, $firstStart);
                $after = substr($content, $lastEnd + strlen($endMarker));
                // Use modern markers for the replacement
                $startMarker = '{/* [START_PUBLIC_AUTH_ROUTES] */}';
                $endMarker = '{/* [END_PUBLIC_AUTH_ROUTES] */}';
                $content = $before . $startMarker . $authRoutes . "\n          " . $endMarker . $after;
                $modified = true;
            } else {
                // If markers missing, inject them after <Routes>
                if (strpos($content, '/forgot-password') === false) {
                    $startMarker = '{/* [START_PUBLIC_AUTH_ROUTES] */}';
                    $endMarker = '{/* [END_PUBLIC_AUTH_ROUTES] */}';
                    $content = str_replace('<Routes>', "<Routes>\n          " . $startMarker . $authRoutes . "\n          " . $endMarker, $content);
                    $modified = true;
                }
            }

            if (strpos($content, '/admin') === false) {
                $adminBlock = "\n          <Route element={<ProtectedRoute />}>\n            <Route path=\"/admin\" element={<AdminLayout />}>\n              <Route index element={<div style={{ padding: '20px' }}><h1>Welcome to Admin Dashboard</h1><p>Select a section from the sidebar to manage content.</p></div>} />\n              <Route path=\"*\" element={<AdminRoutes />} />\n            </Route>\n          </Route>";
                $content = str_replace('</Routes>', $adminBlock . "\n        </Routes>", $content);
                $modified = true;
            }
        } else {
            $lastRet = strrpos($content, 'return');
            if ($lastRet !== false) {
                $tail = substr($content, $lastRet);
                if (preg_match('/return\s*\(?\s*(.*?)\s*\)?\s*;/s', $tail, $matches)) {
                    $jsx = trim($matches[1]);
                    if (strpos($jsx, '=>') === false || strpos($jsx, '<') !== false) {
                        $wrapped = "return (\n    <ToastProvider>\n      <Router>\n        <Routes>\n          <Route path=\"/\" element={". $jsx . "} />\n          <Route path=\"/login\" element={<Login />} />\n          <Route element={<ProtectedRoute />}>\n            <Route path=\"/admin\" element={<AdminLayout />}>\n              <Route index element={<div style={{ padding: '20px' }}><h1>Welcome to Admin Dashboard</h1><p>Select a section from the sidebar to manage content.</p></div>} />\n              <Route path=\"*\" element={<AdminRoutes />} />\n            </Route>\n          </Route>\n        </Routes>\n      </Router>\n    </ToastProvider>\n  );";
                        $content = str_replace($matches[0], $wrapped, $content);
                        $modified = true;
                    }
                }
            }
        }

        if ($modified || $content !== $originalContent) {
            file_put_contents($path, $content);
        }
    }

    private static function ensureServerStructure()
    {
        $dirs = [
            SERVER_PATH,
            SERVER_PATH . '/models',
            SERVER_PATH . '/controllers',
            SERVER_PATH . '/routes',
            SERVER_PATH . '/database',
            SERVER_PATH . '/helpers',
            SERVER_PATH . '/config',
            SERVER_PATH . '/public',
            SERVER_PATH . '/public/upload',
        ];

        foreach ($dirs as $dir) {
            if (!file_exists($dir)) {
                @mkdir($dir, 0777, true);
            }
        }

        // Create FileHelper.php if not exists
        $helperPath = SERVER_PATH . '/helpers/FileHelper.php';
        if (!file_exists($helperPath)) {
            $content = file_get_contents(TEMPLATES_PATH . '/file_helper.tpl');
            file_put_contents($helperPath, $content);
        }

        // Create response.php helper
        $responseHelper = SERVER_PATH . '/helpers/response.php';
        if (!file_exists($responseHelper)) {
            $content = "<?php\n\nfunction jsonResponse(\$data, \$status = 200) {\n    http_response_code(\$status);\n    header('Content-Type: application/json');\n    echo json_encode(\$data);\n    exit;\n}";
            @file_put_contents($responseHelper, $content);
        }

        // Create database.php config
        $dbConfig = SERVER_PATH . '/config/database.php';
        if (!file_exists($dbConfig)) {
            $content = "<?php\n\nclass Database {\n    public static function connect() {\n        try {\n            \$dbPath = __DIR__ . '/../database/project.sqlite';\n            \$pdo = new PDO('sqlite:' . \$dbPath);\n            \$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);\n            return \$pdo;\n        } catch (PDOException \$e) {\n            die('Connection failed: ' . \$e->getMessage());\n        }\n    }\n}";
            @file_put_contents($dbConfig, $content);
        }

        // Create api.php if not exists
        $apiPath = SERVER_PATH . '/routes/api.php';
        if (!file_exists($apiPath) || strpos(file_get_contents($apiPath), 'glob') === false) {
            $content = "<?php\n\nheader('Access-Control-Allow-Origin: *');\nheader('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');\nheader('Access-Control-Allow-Headers: Content-Type, Authorization');\n\nif (\$_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;\n\nrequire_once __DIR__ . '/../helpers/FileHelper.php';\nrequire_once __DIR__ . '/../helpers/response.php';\nrequire_once __DIR__ . '/../config/database.php';\n\nclass Router {\n    private \$routes = [];\n    public function add(\$method, \$path, \$callback) {\n        \$this->routes[] = ['method' => \$method, 'path' => \$path, 'callback' => \$callback];\n    }\n    public function get(\$path, \$callback) { \$this->add('GET', \$path, \$callback); }\n    public function post(\$path, \$callback) { \$this->add('POST', \$path, \$callback); }\n    public function put(\$path, \$callback) { \$this->add('PUT', \$path, \$callback); }\n    public function delete(\$path, \$callback) { \$this->add('DELETE', \$path, \$callback); }\n\n    public function resolve() {\n        \$uri = parse_url(\$_SERVER['REQUEST_URI'], PHP_URL_PATH);\n        \n        // ROBUST SUBDIR DETECTION\n        \$baseMarkers = ['/server/public', '/public'];\n        foreach (\$baseMarkers as \$marker) {\n            \$pos = strpos(\$uri, \$marker);\n            if (\$pos !== false) {\n                \$uri = substr(\$uri, \$pos + strlen(\$marker));\n                break;\n            }\n        }\n        \n        \$uri = str_replace('/index.php', '', \$uri);\n        if (empty(\$uri)) \$uri = '/';\n        if (\$uri !== '/' && substr(\$uri, -1) === '/') \$uri = rtrim(\$uri, '/');\n        \$method = \$_SERVER['REQUEST_METHOD'];\n        \n        // FormData PUT override support\n        if (\$method === 'POST' && isset(\$_POST['_method'])) {\n            \$method = strtoupper(\$_POST['_method']);\n        }\n        \n        foreach (\$this->routes as \$route) {\n            \$pattern = \"#^\" . preg_replace('/\{([a-zA-Z0-9_]+)\}/', '(?P<\$1>[^/]+)', \$route['path']) . \"$#\";\n            if (\$method === \$route['method'] && preg_match(\$pattern, \$uri, \$matches)) {\n                \$params = array_filter(\$matches, 'is_string', ARRAY_FILTER_USE_KEY);\n                return call_user_func_array(\$route['callback'], array_values(\$params));\n            }\n        }\n        http_response_code(404);\n        echo json_encode(['error' => 'Not Found', 'uri' => \$uri]);\n    }\n}\n\n\$router = new Router();\n\nrequire_once __DIR__ . '/../controllers/AuthController.php';\n\$authCtrl = new AuthController();\n\$router->post('/auth/login', [\$authCtrl, 'login']);\n\$router->get('/auth/check', [\$authCtrl, 'check']);\n\n// AUTO-LOAD GENERATED ROUTES\nforeach (glob(__DIR__ . '/*Routes.php') as \$filename) {\n    require_once \$filename;\n}\n\n\$router->resolve();";
            file_put_contents($apiPath, $content);
        }

        // Create index.php in server/public if not exists
        $indexPath = SERVER_PATH . '/public/index.php';
        // Ensure .htaccess for Pretty URLs
        $htaccessPath = SERVER_PATH . '/public/.htaccess';
        if (!file_exists($htaccessPath)) {
            $htaccessContent = "RewriteEngine On\nRewriteCond %{REQUEST_FILENAME} !-f\nRewriteCond %{REQUEST_FILENAME} !-d\nRewriteRule ^ index.php [QSA,L]";
            file_put_contents($htaccessPath, $htaccessContent);
        }
        if (!file_exists($indexPath)) {
            $content = "<?php\nrequire_once __DIR__ . '/../routes/api.php';";
            file_put_contents($indexPath, $content);
        }
    }

    private static function ensureAuthStructure($force = false)
    {
        // 1. Ensure AuthController.php exists
        $ctrlPath = SERVER_PATH . '/controllers/AuthController.php';
        if (!file_exists($ctrlPath)) {
            $content = file_get_contents(TEMPLATES_PATH . '/auth_controller.tpl');
            file_put_contents($ctrlPath, $content);
        }

        // 2. Ensure Auth routes in api.php
        $apiPath = SERVER_PATH . '/routes/api.php';
        if (file_exists($apiPath)) {
            $content = file_get_contents($apiPath);
            if (strpos($content, '/auth/forgot-password') === false) {
                $authSetup = "// --- AUTO-GENERATED AUTH (DO NOT REMOVE) ---\nrequire_once __DIR__ . '/../controllers/AuthController.php';\n\$authCtrl = new AuthController();\n\$router->post('/auth/login', [\$authCtrl, 'login']);\n\$router->post('/auth/forgot-password', [\$authCtrl, 'forgotPassword']);\n\$router->post('/auth/verify-otp', [\$authCtrl, 'verifyOtp']);\n\$router->get('/auth/check', [\$authCtrl, 'check']);\n// --- AUTO-GENERATED AUTH ---";
                
                if (strpos($content, '// --- AUTO-GENERATED AUTH (DO NOT REMOVE) ---') !== false) {
                    // Update existing block
                    $content = preg_replace('/\/\/ --- AUTO-GENERATED AUTH \(DO NOT REMOVE\) ---(.*)\/\/ --- AUTO-GENERATED AUTH ---/s', $authSetup, $content);
                } else {
                    // Insert before auto-load
                    $content = str_replace('// AUTO-LOAD GENERATED ROUTES', $authSetup . "\n\n// AUTO-LOAD GENERATED ROUTES", $content);
                }
                file_put_contents($apiPath, $content);
            }
        }

        // 3. Proactively seed the DB (in case AuthController isn't called yet)
        try {
            $dbPath = SERVER_PATH . '/database/project.sqlite';
            $db = new PDO('sqlite:' . $dbPath);
            $db->exec("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT UNIQUE, password TEXT, role TEXT DEFAULT 'admin', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
            $count = $db->query("SELECT COUNT(*) FROM users")->fetchColumn();
            if ($count == 0) {
                $hashed = password_hash('Admin123#', PASSWORD_DEFAULT);
                $stmt = $db->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
                $stmt->execute(['Administrator', 'admin@gmail.com', $hashed]);
            }
        } catch (Exception $e) {}
    }

    private static function ensureMailHelper($force = false)
    {
        $helperPath = SERVER_PATH . '/helpers/MailHelper.php';
        if ($force || !file_exists($helperPath) || @filesize($helperPath) === 0) {
            $content = "<?php\n\nclass MailHelper {\n    private static \$smtp_host = 'smtp.gmail.com';\n    private static \$smtp_port = 587;\n    private static \$smtp_user = 'allygithub@gmail.com';\n    private static \$smtp_pass = 'nzil wikd xxbs amkt';\n    private static \$from_name = 'Allysoft Solution';\n\n    public static function sendOtp(\$to, \$otp) {\n        \$subject = \"Your Verification Code: \$otp\";\n        \$message = \"\n            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;'>\n                <h2 style='color: #6366f1;'>Password Recovery</h2>\n                <p>Hello,</p>\n                <p>You requested a password reset. Use the following 4-digit code to verify your identity:</p>\n                <div style='background: #f8fafc; padding: 20px; text-align: center; font-size: 32px; font-weight: 800; letter-spacing: 10px; color: #1e293b; border-radius: 8px; margin: 20px 0;'>\n                    \$otp\n                </div>\n                <p style='color: #64748b; font-size: 14px;'>This code will expire in 15 minutes. If you did not request this, please ignore this email.</p>\n                <hr style='border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;'>\n                <p style='color: #94a3b8; font-size: 12px; text-align: center;'>&copy; \" . date('Y') . \" Allysoft Solution. All rights reserved.</p>\n            </div>\n        \";\n\n        return self::sendSmtp(\$to, \$subject, \$message);\n    }\n\n    private static function sendSmtp(\$to, \$subject, \$message) {\n        \$timeout = 10;\n        \$socket = fsockopen(self::\$smtp_host, self::\$smtp_port, \$errno, \$errstr, \$timeout);\n        if (!\$socket) throw new Exception(\"Could not connect to SMTP: \$errstr (\$errno)\");\n\n        self::getResponse(\$socket); // 220\n        fwrite(\$socket, \"EHLO localhost\\r\\n\");\n        self::getResponse(\$socket); // 250\n        \n        fwrite(\$socket, \"STARTTLS\\r\\n\");\n        self::getResponse(\$socket); // 220\n        \n        if (!stream_socket_enable_crypto(\$socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {\n            throw new Exception(\"TLS encryption failed\");\n        }\n        \n        fwrite(\$socket, \"EHLO localhost\\r\\n\");\n        self::getResponse(\$socket); // 250\n        \n        fwrite(\$socket, \"AUTH LOGIN\\r\\n\");\n        self::getResponse(\$socket); // 334\n        \n        fwrite(\$socket, base64_encode(self::\$smtp_user) . \"\\r\\n\");\n        self::getResponse(\$socket); // 334\n        \n        fwrite(\$socket, base64_encode(self::\$smtp_pass) . \"\\r\\n\");\n        self::getResponse(\$socket); // 235\n        \n        fwrite(\$socket, \"MAIL FROM: <\" . self::\$smtp_user . \">\\r\\n\");\n        self::getResponse(\$socket); // 250\n        \n        fwrite(\$socket, \"RCPT TO: <\$to>\\r\\n\");\n        self::getResponse(\$socket); // 250\n        \n        fwrite(\$socket, \"DATA\\r\\n\");\n        self::getResponse(\$socket); // 354\n        \n        \$headers = \"MIME-Version: 1.0\\r\\n\";\n        \$headers .= \"Content-type: text/html; charset=UTF-8\\r\\n\";\n        \$headers .= \"From: \" . self::\$from_name . \" <\" . self::\$smtp_user . \">\\r\\n\";\n        \$headers .= \"To: <\$to>\\r\\n\";\n        \$headers .= \"Subject: \$subject\\r\\n\";\n        \$headers .= \"Date: \" . date('r') . \"\\r\\n\";\n        \n        fwrite(\$socket, \$headers . \"\\r\\n\" . \$message . \"\\r\\n.\\r\\n\");\n        self::getResponse(\$socket); // 250\n        \n        fwrite(\$socket, \"QUIT\\r\\n\");\n        fclose(\$socket);\n        return true;\n    }\n\n    private static function getResponse(\$socket) {\n        \$response = \"\";\n        while (\$line = fgets(\$socket, 515)) {\n            \$response .= \$line;\n            if (substr(\$line, 3, 1) == \" \") break;\n        }\n        \$code = (int)substr(\$response, 0, 3);\n        if (\$code >= 400) throw new Exception(\"SMTP Error: \$response\");\n        return \$response;\n    }\n}\n";
            file_put_contents($helperPath, $content);
        }
    }

    private static function ensureViteConfig()
    {
        $vitePath = CLIENT_PATH . DIRECTORY_SEPARATOR . 'vite.config.js';
        if (!file_exists($vitePath)) return;

        $content = file_get_contents($vitePath);
        
        // 1. IMPROVED PORT DETECTION (Cross-Environment)
        $port = $_SERVER['SERVER_PORT'] ?? '';
        
        if (empty($port) || $port == '80') {
            // Check common config files if we're in a local env
            $configFiles = [
                'C:/xampp/apache/conf/httpd.conf',
                'C:/wamp64/bin/apache/apache*/conf/httpd.conf',
                '/etc/apache2/ports.conf',
                '/usr/local/etc/httpd/httpd.conf'
            ];
            
            foreach ($configFiles as $pattern) {
                foreach (glob($pattern) as $file) {
                    $conf = file_get_contents($file);
                    if (preg_match('/^\s*Listen\s+(\d+)/m', $conf, $matches)) {
                        $port = $matches[1];
                        break 2;
                    }
                }
            }
        }
        
        // Final fallback to 80
        if (empty($port)) $port = '80';

        $host = '127.0.0.1'; // ROBUSTNESS: Always use IP to avoid IPv6/DNS issues
        $protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? 'https' : 'http';
        $portStr = ($port == '80' || $port == '443') ? '' : ":$port";
        
        // Ensure PROJECT_SUBDIR is properly formatted
        $subdir = trim(PROJECT_SUBDIR, '/');
        $targetBase = "{$protocol}://{$host}{$portStr}/" . ($subdir ? $subdir . '/' : '');
        
        $serverBlock = "  server: {\n" .
                       "    proxy: {\n" .
                       "      '/server': {\n" .
                       "        target: '{$targetBase}server/public',\n" .
                       "        changeOrigin: true,\n" .
                       "        rewrite: (path) => path.replace(/^\/server/, ''),\n" .
                       "      },\n" .
                       "      '/dev': {\n" .
                       "        target: '{$targetBase}dev/public',\n" .
                       "        changeOrigin: true,\n" .
                       "        rewrite: (path) => path.replace(/^\/dev/, ''),\n" .
                       "      },\n" .
                       "    },\n" .
                       "  },";

        $modified = false;

        // Ensure define('CLIENT_PATH', ...) exists in vite.config.js? No, Vite doesn't need that.
        
        if (strpos($content, 'server:') === false) {
            // Inject server block
            if (strpos($content, 'plugins: [') !== false) {
                $content = str_replace('plugins: [react()],', "plugins: [react()],\n" . $serverBlock, $content);
            } else {
                $content = preg_replace('/export default defineConfig\(\{/', "export default defineConfig({\n" . $serverBlock, $content);
            }
            $modified = true;
        } else {
            // PROACTIVE UPDATE: If server block exists, force sync targets to match current environment
            $newContent = $content;
            
            // Normalize current targets to check if they match
            $serverPattern = "/target:\s*['\"]http.*?\/server\/public['\"]/";
            $devPattern = "/target:\s*['\"]http.*?\/dev\/public['\"]/";
            
            if (!preg_match($serverPattern, $content) || !strpos($content, $targetBase . 'server/public')) {
                $newContent = preg_replace($serverPattern, "target: '{$targetBase}server/public'", $newContent);
                $modified = true;
            }
            
            if (!preg_match($devPattern, $content) || !strpos($content, $targetBase . 'dev/public')) {
                $newContent = preg_replace($devPattern, "target: '{$targetBase}dev/public'", $newContent);
                $modified = true;
            }
            
            // Robustness: Cleanup old '/api' keys if they exist
            if (strpos($newContent, "'/api'") !== false) {
                $newContent = str_replace("'/api'", "'/server'", $newContent);
                $modified = true;
            }

            $content = $newContent;
        }

        if ($modified) {
            file_put_contents($vitePath, $content);
        }
    }

    private static function ensureDevAssets()
    {
        $assetsDir = dirname(__DIR__) . '/public/assets';
        if (!file_exists($assetsDir)) mkdir($assetsDir, 0777, true);

        // Copy logo from root if exists (Portability)
        $rootLogo = dirname(__DIR__, 2) . '/ally_logo_2.png';
        $targetLogo = $assetsDir . '/ally_logo.png';
        
        if (file_exists($rootLogo) && (!file_exists($targetLogo) || filesize($rootLogo) !== filesize($targetLogo))) {
            copy($rootLogo, $targetLogo);
        }
    }

    private static function extractPreservedContent($path, $startMarker, $endMarker = null)
    {
        if (!file_exists($path)) return '';
        $content = file_get_contents($path);
        if (!$endMarker) $endMarker = $startMarker;
        
        $first = strpos($content, $startMarker);
        $last = strrpos($content, $endMarker);
        
        if ($first !== false && $last !== false && $last > $first) {
            $startPos = $first + strlen($startMarker);
            return trim(substr($content, $startPos, $last - $startPos));
        }
        return '';
    }
}
