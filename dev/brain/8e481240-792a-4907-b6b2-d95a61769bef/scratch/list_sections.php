<?php
require 'dev/config.php';
require 'dev/src/Database.php';
$db = (new Database())->getDevConnection();
$res = $db->query("SELECT * FROM sections")->fetchAll(PDO::FETCH_ASSOC);
print_r($res);
