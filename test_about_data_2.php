<?php
require_once 'dev/config.php';
try {
    $db = new PDO("sqlite:" . PROJECT_DB_PATH);
    $rows = $db->query("SELECT * FROM about_section")->fetchAll(PDO::FETCH_ASSOC);
    print_r($rows);
} catch (Exception $e) {
    echo $e->getMessage();
}
