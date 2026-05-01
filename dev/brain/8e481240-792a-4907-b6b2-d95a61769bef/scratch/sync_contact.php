<?php
require 'server/config/database.php';
try {
    $db = Database::connect();
    // Fields from Manager: address, email, phone_number
    $cols = ['address', 'email', 'phone_number'];
    foreach ($cols as $col) {
        try {
            $db->exec("ALTER TABLE contact_info ADD COLUMN $col TEXT");
        } catch (Exception $e) {}
    }
    echo "Sync successful";
} catch (Exception $e) {
    echo $e->getMessage();
}
