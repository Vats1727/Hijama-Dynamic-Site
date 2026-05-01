<?php
require_once 'dev/config.php';
require_once 'dev/src/Database.php';
require_once 'dev/src/Generator.php';
require_once 'dev/src/HtmlParser.php';
require_once 'dev/src/Initializer.php';

$database = new Database();
$db = $database->getDevConnection();
$g = new CrudGenerator($db);

$sections = $db->query("SELECT id FROM sections")->fetchAll(PDO::FETCH_ASSOC);
foreach ($sections as $s) {
    $g->generate($s['id']);
}
echo "Successfully regenerated all generated section files!\n";
