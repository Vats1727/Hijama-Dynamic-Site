<?php
require_once 'dev/config.php';
require_once 'dev/src/Generator.php';

try {
    $gen = new CrudGenerator();
    
    // Use a direct PDO connection to project DB to avoid class conflict
    $dbPath = PROJECT_ROOT . '/server/database/project.sqlite';
    $projectDb = new PDO('sqlite:' . $dbPath);
    $projectDb->exec("DROP TABLE IF EXISTS hero_banner");
    $projectDb->exec("DROP TABLE IF EXISTS our_services");
    
    // Trigger React file update
    $gen->updateReactFiles();
    
    echo "Sync Complete: Orphaned tables dropped and React files updated.";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
