<?php
require 'server/config/database.php';
try {
    $db = Database::connect();
    $db->exec("CREATE TABLE IF NOT EXISTS contact_info (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sort_order INTEGER DEFAULT 0,
        status TEXT DEFAULT 'Active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    
    // Add columns if they don't exist
    $columns = ['phone', 'email', 'address', 'opening_hours', 'facebook_url', 'instagram_url', 'linkedin_url', 'twitter_url'];
    foreach ($columns as $col) {
        try {
            $db->exec("ALTER TABLE contact_info ADD COLUMN $col TEXT");
        } catch (Exception $e) {
            // Column likely exists
        }
    }
    echo "Schema updated for contact_info";
} catch (Exception $e) {
    echo $e->getMessage();
}
