<?php
require 'server/config/database.php';
try {
    $db = Database::connect();
    $res = $db->query('SELECT * FROM users')->fetchAll(PDO::FETCH_ASSOC);
    print_r($res);
} catch (Exception $e) {
    echo $e->getMessage();
}
