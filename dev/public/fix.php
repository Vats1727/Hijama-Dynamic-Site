<?php
require_once '../config.php';
require_once '../src/Database.php';
require_once '../src/Generator.php';

$db = (new Database())->getDevConnection();
$db->exec("DELETE FROM fields WHERE name IS NULL OR trim(name) = ''");
echo "Cleaned up empty fields.\n";

$generator = new CrudGenerator($db);
$generator->updateReactFiles();
echo "Regenerated all files.\n";
