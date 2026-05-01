<?php
require 'server/config/database.php';
try {
    $db = Database::connect();
    $hashed = password_hash('admin123', PASSWORD_DEFAULT);
    $db->prepare('UPDATE users SET password = ? WHERE email = ?')->execute([$hashed, 'admin@gmail.com']);
    echo "Password reset to admin123 successful";
} catch (Exception $e) {
    echo $e->getMessage();
}
