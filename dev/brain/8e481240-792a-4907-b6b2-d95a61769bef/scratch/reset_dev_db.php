<?php

try {
    $db = new PDO('sqlite:dev/database/dev_tool.sqlite');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Drop all existing tables to ensure a clean slate
    $tables = $db->query("SELECT name FROM sqlite_master WHERE type='table'")->fetchAll(PDO::FETCH_COLUMN);
    foreach ($tables as $table) {
        if ($table !== 'sqlite_sequence') {
            $db->exec("DROP TABLE IF EXISTS \"$table\"");
        }
    }

    // Re-create the schema
    $db->exec("CREATE TABLE sections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        icon TEXT,
        sort_order INTEGER DEFAULT 0,
        status TEXT DEFAULT 'Active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    $db->exec("CREATE TABLE fields (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        section_id INTEGER NOT NULL,
        field_name TEXT NOT NULL,
        field_label TEXT NOT NULL,
        field_type TEXT NOT NULL,
        is_required INTEGER DEFAULT 0,
        show_in_list INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
    )");

    $db->exec("CREATE TABLE field_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        label TEXT NOT NULL,
        value TEXT NOT NULL UNIQUE
    )");

    $db->exec("INSERT INTO field_types (label, value) VALUES 
        ('Short Text', 'text'),
        ('Long Text', 'textarea'),
        ('Image Upload', 'image'),
        ('Icon Selector', 'lucide-icon'),
        ('Rating', 'rating'),
        ('Status Toggle', 'status-toggle')");

    echo "Dev Studio Reset Complete: All tables purged and re-initialized.";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
