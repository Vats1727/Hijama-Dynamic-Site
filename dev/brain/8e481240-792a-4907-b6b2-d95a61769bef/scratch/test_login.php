<?php
require 'server/config/database.php';
$email = 'admin@gmail.com';
$password = 'Admin123#';

try {
    $db = Database::connect();
    $stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        echo "User found: " . $user['email'] . "\n";
        if (password_verify($password, $user['password'])) {
            echo "Password VERIFIED\n";
        } else {
            echo "Password FAILED\n";
        }
    } else {
        echo "User NOT found\n";
    }
} catch (Exception $e) {
    echo $e->getMessage();
}
