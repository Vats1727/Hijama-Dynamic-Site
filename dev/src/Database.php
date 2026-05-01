<?php

class Database
{
    private $devConn;
    private $projectConn;

    public function getDevConnection()
    {
        if ($this->devConn === null) {
            try {
                $dir = dirname(DEV_DB_PATH);
                if (!file_exists($dir)) {
                    mkdir($dir, 0777, true);
                }

                $this->devConn = new PDO("sqlite:" . DEV_DB_PATH);
                $this->devConn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                $this->initializeDevSchema();
            } catch (PDOException $e) {
                die("Dev DB Connection Error: " . $e->getMessage());
            }
        }
        return $this->devConn;
    }

    public function getProjectConnection()
    {
        if ($this->projectConn === null) {
            try {
                $this->projectConn = new PDO("sqlite:" . PROJECT_DB_PATH);
                $this->projectConn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            } catch (PDOException $e) {
                die("Project DB Connection Error: " . $e->getMessage());
            }
        }
        return $this->projectConn;
    }

    public function initializeDevSchema()
    {
        $queries = [
            "CREATE TABLE IF NOT EXISTS sections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                slug TEXT NOT NULL UNIQUE,
                icon TEXT DEFAULT 'Sparkles',
                status TEXT DEFAULT 'Active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )",
            "CREATE TABLE IF NOT EXISTS fields (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                section_id INTEGER NOT NULL,
                field_name TEXT NOT NULL,
                field_label TEXT NOT NULL,
                field_type TEXT NOT NULL,
                is_required INTEGER DEFAULT 0,
                show_in_list INTEGER DEFAULT 1,
                sort_order INTEGER DEFAULT 0,
                FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
            )",
            "CREATE TABLE IF NOT EXISTS field_options (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                field_id INTEGER NOT NULL,
                option_label TEXT,
                option_value TEXT NOT NULL,
                FOREIGN KEY (field_id) REFERENCES fields(id) ON DELETE CASCADE
            )",
            "CREATE TABLE IF NOT EXISTS field_types (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                label TEXT NOT NULL,
                value TEXT NOT NULL UNIQUE,
                icon TEXT
            )"
        ];

        foreach ($queries as $query) {
            $this->devConn->exec($query);
        }

        // Migration: Ensure 'icon' column exists in field_types (Robustness)
        try {
            $this->devConn->query("SELECT icon FROM field_types LIMIT 1");
        } catch (Exception $e) {
            $this->devConn->exec("ALTER TABLE field_types ADD COLUMN icon TEXT DEFAULT 'Type'");
        }

        // Robust Upsert: Ensure ALL types are present
        $types = [
            ['Short Text', 'text', 'Type'],
            ['Long Text (Textarea)', 'textarea', 'AlignLeft'],
            ['Image (Single)', 'image', 'Image'],
            ['Multiple Images', 'images', 'Layers'],
            ['File Upload', 'file', 'Upload'],
            ['Multiple Files', 'files', 'Files'],
            ['Video', 'video', 'Video'],
            ['Audio', 'audio', 'Music'],
            ['Document (PDF, DOC)', 'document', 'FileText'],
            ['Rich Text Editor', 'richtext', 'FileEdit'],
            ['Password', 'password', 'Lock'],
            ['Email', 'email', 'Mail'],
            ['Phone', 'phone', 'Phone'],
            ['URL / Website', 'url', 'Link'],
            ['Numeric (Number)', 'number', 'Hash'],
            ['Currency', 'currency', 'DollarSign'],
            ['Percentage', 'percentage', 'Percent'],
            ['Dropdown (Select)', 'select', 'ChevronDown'],
            ['Checkbox List', 'checkbox', 'CheckSquare'],
            ['Radio Buttons', 'radio', 'CircleDot'],
            ['Date Picker', 'date', 'Calendar'],
            ['Time Picker', 'time', 'Clock'],
            ['Date & Time', 'datetime', 'CalendarClock'],
            ['Date Range', 'daterange', 'CalendarDays'],
            ['Color Picker', 'color', 'Palette'],
            ['Switch (Toggle)', 'switch', 'ToggleRight'],
            ['Rating (Stars)', 'rating', 'Star'],
            ['Range Slider', 'range', 'Sliders'],
            ['Location (Map)', 'location', 'MapPin'],
            ['Country Select', 'country', 'Globe']
        ];

        foreach ($types as $type) {
            $check = $this->devConn->prepare("SELECT COUNT(*) FROM field_types WHERE value = ?");
            $check->execute([$type[1]]);
            if ($check->fetchColumn() == 0) {
                $stmt = $this->devConn->prepare("INSERT INTO field_types (label, value, icon) VALUES (?, ?, ?)");
                $stmt->execute($type);
            }
        }
        
        // Cleanup: Remove legacy icon field type (Robustness)
        $this->devConn->exec("DELETE FROM field_types WHERE value = 'icon'");
    }
}
