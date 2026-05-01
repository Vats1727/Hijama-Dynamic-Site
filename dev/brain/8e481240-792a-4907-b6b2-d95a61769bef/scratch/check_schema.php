<?php
require 'server/config/database.php';
try {
    $db = Database::connect();
    $res = $db->query("PRAGMA table_info('contact_info')")->fetchAll(PDO::FETCH_ASSOC);
    print_r($res);
} catch (Exception $e) {
    echo $e->getMessage();
}
