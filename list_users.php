<?php
require_once __DIR__ . "/server/config/database.php";
$pdo = Database::connect();

// Let's get table names
$stmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table'");
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "Table: " . $row['name'] . "\n";
}

// Check if 'users' or 'admin' table exists
$tables = ['users', 'admins', 'admin_users', 'hero_section'];
foreach ($tables as $table) {
    try {
        $stmt2 = $pdo->query("SELECT * FROM \"$table\"");
        echo "\nData from table '$table':\n";
        while ($r = $stmt2->fetch(PDO::FETCH_ASSOC)) {
            print_r($r);
        }
    } catch (Exception $e) {
        // Table doesn't exist, ignore
    }
}
