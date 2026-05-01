<?php
require_once 'dev/config.php';
try {
    $db = new PDO("sqlite:" . PROJECT_DB_PATH);
    $tables = $db->query("SELECT name FROM sqlite_master WHERE type='table'")->fetchAll(PDO::FETCH_ASSOC);
    print_r($tables);
    echo "\nTABLE SCHEMAS (appointment):\n";
    $schemas = $db->query("SELECT name, sql FROM sqlite_master WHERE type='table' AND name LIKE '%appointment%'")->fetchAll(PDO::FETCH_ASSOC);
    print_r($schemas);

    foreach ($tables as $t) {
        if (strpos($t['name'], 'appointment') !== false) {
            echo "\nDATA FROM " . $t['name'] . ":\n";
            $rows = $db->query("SELECT * FROM " . $t['name'])->fetchAll(PDO::FETCH_ASSOC);
            print_r($rows);
        }
    }
} catch (Exception $e) {
    echo $e->getMessage();
}
