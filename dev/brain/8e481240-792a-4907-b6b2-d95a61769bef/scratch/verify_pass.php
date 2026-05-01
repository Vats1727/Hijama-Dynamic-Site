<?php
require_once 'dev/config.php';
try {
    $db = new PDO('sqlite:' . PROJECT_DB_PATH);
    $user = $db->query("SELECT * FROM users WHERE email = 'admin@gmail.com'")->fetch(PDO::FETCH_ASSOC);
    if ($user) {
        echo "User found: " . $user['email'] . "\n";
        $pass = 'Admin123#';
        if (password_verify($pass, $user['password'])) {
            echo "Password verification: SUCCESS\n";
        } else {
            echo "Password verification: FAILED\n";
        }
    } else {
        echo "User admin@gmail.com NOT found\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
