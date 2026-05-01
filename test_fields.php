<?php
require_once 'dev/config.php';
try {
    $db = new PDO("sqlite:" . DEV_DB_PATH);
    $rows = $db->query("SELECT * FROM fields WHERE section_id IN (SELECT id FROM sections WHERE slug='service_list')")->fetchAll(PDO::FETCH_ASSOC);
    print_r($rows);
} catch (Exception $e) {
    echo $e->getMessage();
}
