<?php
require_once 'dev/config.php';
require_once 'dev/src/Generator.php';

try {
    $gen = new CrudGenerator();
    $devDb = new PDO('sqlite:dev/database/dev_tool.sqlite');
    $projectDb = new PDO('sqlite:server/database/project.sqlite');

    // 1. Clean Dev DB
    echo "Cleaning Dev DB...\n";
    $devDb->exec("DELETE FROM fields");
    $devDb->exec("DELETE FROM sections");
    $devDb->exec("DELETE FROM sqlite_sequence WHERE name IN ('fields', 'sections')");

    // 2. Clean Project DB (Drop all tables except core)
    echo "Cleaning Project DB...\n";
    $tables = $projectDb->query("SELECT name FROM sqlite_master WHERE type='table'")->fetchAll(PDO::FETCH_COLUMN);
    $keep = ['users', 'sqlite_sequence'];
    foreach ($tables as $table) {
        if (!in_array($table, $keep)) {
            $projectDb->exec("DROP TABLE IF EXISTS \"$table\"");
            echo "Dropped table: $table\n";
        }
    }

    // 3. Delete generated files
    echo "Cleaning generated files...\n";
    
    $directories = [
        SERVER_PATH . "/models",
        SERVER_PATH . "/controllers",
        SERVER_PATH . "/routes",
        CLIENT_PATH . "/src/pages/Admin/Sections"
    ];

    foreach ($directories as $dir) {
        if (!file_exists($dir)) continue;
        $files = glob($dir . '/*');
        foreach ($files as $file) {
            $filename = basename($file);
            // Keep core files
            if ($filename === 'AuthController.php') continue;
            
            if (is_file($file)) {
                unlink($file);
                echo "Deleted file: $filename\n";
            }
        }
    }

    // 4. Reset React Files
    echo "Resetting React Files...\n";
    $gen->updateReactFiles();

    echo "CLEAN SLATE COMPLETE: Databases and Files are now fresh.";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
