<?php
require 'server/config/database.php';
try {
    $db = Database::connect();
    $db->exec('CREATE TABLE IF NOT EXISTS contact_info (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        sort_order INTEGER DEFAULT 0, 
        status TEXT DEFAULT "Active", 
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
        phone TEXT, 
        email TEXT, 
        address TEXT
    )');
    echo "Table contact_info created successful";
} catch (Exception $e) {
    echo $e->getMessage();
}
