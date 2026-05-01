<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// ROBUST BOOTSTRAP: Ensure config.php exists
if (!file_exists('../config.php')) {
    $defaultConfig = "<?php\n\ndefine('DEV_ROOT', dirname(__FILE__));\ndefine('PROJECT_ROOT', dirname(DEV_ROOT));\n\n// Basic Detection\ndefine('CLIENT_PATH', PROJECT_ROOT . DIRECTORY_SEPARATOR . 'client');\ndefine('SERVER_PATH', PROJECT_ROOT . DIRECTORY_SEPARATOR . 'server');\n\n// Subdir Detection\n\$projectRoot = str_replace('\\\\', '/', PROJECT_ROOT);\n\$parts = explode('/htdocs/', \$projectRoot);\n\$projectSubdir = (count(\$parts) > 1) ? trim(\$parts[1], '/') : basename(\$projectRoot);\ndefine('PROJECT_SUBDIR', \$projectSubdir);\n\ndefine('PROJECT_DB_PATH', SERVER_PATH . DIRECTORY_SEPARATOR . 'database' . DIRECTORY_SEPARATOR . 'project.sqlite');\ndefine('DEV_DB_PATH', DEV_ROOT . DIRECTORY_SEPARATOR . 'database' . DIRECTORY_SEPARATOR . 'dev_tool.sqlite');\ndefine('TEMPLATES_PATH', DEV_ROOT . DIRECTORY_SEPARATOR . 'templates');\n\nfunction ensureDir(\$path) { if (!file_exists(\$path)) mkdir(\$path, 0777, true); }";
    file_put_contents('../config.php', $defaultConfig);
}

require_once '../config.php';
require_once '../src/Database.php';
require_once '../src/Generator.php';
require_once '../src/HtmlParser.php';
require_once '../src/Initializer.php';

$database = new Database();
$db = $database->getDevConnection();
Initializer::run(); 

// PROACTIVE ENFORCEMENT: Ensure all core Admin files exist as soon as /dev is opened
try {
    // Migration: Ensure 'status' and 'sort_order' columns exist
    try {
        $db->exec("ALTER TABLE sections ADD COLUMN status TEXT DEFAULT 'Active'");
    } catch (Exception $e) { /* Column already exists */ }
    try {
        $db->exec("ALTER TABLE sections ADD COLUMN sort_order INTEGER DEFAULT 0");
    } catch (Exception $e) { /* Column already exists */ }
    try {
        $db->exec("ALTER TABLE sections ADD COLUMN icon TEXT DEFAULT 'Sparkles'");
    } catch (Exception $e) { /* Column already exists */ }
    try {
        $db->exec("ALTER TABLE fields ADD COLUMN field_label TEXT");
    } catch (Exception $e) { /* Column already exists */ }
    try {
        $db->exec("ALTER TABLE fields ADD COLUMN sort_order INTEGER DEFAULT 0");
    } catch (Exception $e) { /* Column already exists */ }

    $stmt = $db->prepare("SELECT COUNT(*) FROM field_types WHERE value = 'lucide-icon'");
    $stmt->execute();
    if ($stmt->fetchColumn() == 0) {
        $db->exec("INSERT INTO field_types (label, value, icon) VALUES ('Lucide Icon', 'lucide-icon', 'Sparkles')");
    } else {
        // Ensure label is correct
        $db->exec("UPDATE field_types SET label = 'Lucide Icon' WHERE value = 'lucide-icon'");
    }

    $stmt = $db->prepare("SELECT COUNT(*) FROM field_types WHERE value = 'icon'");
    $stmt->execute();
    if ($stmt->fetchColumn() == 0) {
        $db->exec("INSERT INTO field_types (label, value, icon) VALUES ('Icon Picker', 'icon', 'Search')");
    }

    $stmt = $db->prepare("SELECT COUNT(*) FROM field_types WHERE value = 'icon-picker'");
    $stmt->execute();
    if ($stmt->fetchColumn() == 0) {
        $db->exec("INSERT INTO field_types (label, value, icon) VALUES ('Icon Picker (Alt)', 'icon-picker', 'Search')");
    }

    $stmt = $db->prepare("SELECT COUNT(*) FROM field_types WHERE value = 'icon_picker'");
    $stmt->execute();
    if ($stmt->fetchColumn() == 0) {
        $db->exec("INSERT INTO field_types (label, value, icon) VALUES ('Icon Picker (Alt2)', 'icon_picker', 'Search')");
    }

    $generator = new CrudGenerator($db);
    $generator->ensureCoreFiles();
} catch (Exception $e) {
    // Silently fail if paths aren't set yet, will retry on generation
}

$action = $_GET['action'] ?? '';

if ($action === 'sync_admin') {
    try {
        $generator = new CrudGenerator($db);
        $generator->updateReactFiles();
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

if ($action === 'toggle_status') {
    $id = $_GET['id'] ?? null;
    if (!$id) exit;
    try {
        $stmt = $db->prepare("SELECT status FROM sections WHERE id = ?");
        $stmt->execute([$id]);
        $current = $stmt->fetchColumn();
        $newStatus = ($current === 'Active') ? 'Inactive' : 'Active';
        
        $stmt = $db->prepare("UPDATE sections SET status = ? WHERE id = ?");
        $stmt->execute([$newStatus, $id]);
        
        $generator = new CrudGenerator($db);
        $generator->updateReactFiles();
        echo json_encode(['success' => true, 'status' => $newStatus]);
    } catch (Exception $e) { echo json_encode(['error' => $e->getMessage()]); }
    exit;
}

if ($action === 'update_order') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !isset($input['order'])) exit;
    try {
        $stmt = $db->prepare("UPDATE sections SET sort_order = ? WHERE id = ?");
        foreach ($input['order'] as $index => $id) {
            $stmt->execute([$index, $id]);
        }
        $generator = new CrudGenerator($db);
        $generator->updateReactFiles();
        echo json_encode(['success' => true]);
    } catch (Exception $e) { echo json_encode(['error' => $e->getMessage()]); }
    exit;
}

if ($action === 'reset_project') {
    try {
        $generator = new CrudGenerator($db);
        $generator->resetProject();
        echo json_encode(['success' => true]);
    } catch (Exception $e) { echo json_encode(['error' => $e->getMessage()]); }
    exit;
}

if ($action === 'parse_html') {
    if (!isset($_FILES['template'])) {
        echo json_encode(['error' => 'No file uploaded']);
        exit;
    }
    $html = file_get_contents($_FILES['template']['tmp_name']);
    $sections = HtmlParser::parse($html);
    echo json_encode(['success' => true, 'sections' => $sections]);
    exit;
}

if ($action === 'save_section') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        echo json_encode(['error' => 'Invalid input']);
        exit;
    }

    $name = $input['name'];
    $slug = $input['slug'] ?? strtolower(preg_replace('/[^a-zA-Z0-9]/', '_', $name));
    $id = $input['id'] ?? null;
    
    try {
        // 1. Validate Slug Uniqueness in Dev DB
        $checkStmt = $db->prepare("SELECT id FROM sections WHERE slug = ? AND id != ?");
        $checkStmt->execute([$slug, $id ?? 0]);
        if ($checkStmt->fetch()) {
            echo json_encode(['error' => "Section with slug '$slug' already exists. Please use a different name."]);
            exit;
        }

        $db->beginTransaction();
        $generator = new CrudGenerator($db);

        if ($id) {
            $stmt = $db->prepare("SELECT * FROM sections WHERE id = ?");
            $stmt->execute([$id]);
            $oldSection = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($oldSection) $generator->deleteSection($oldSection, false);

            $stmt = $db->prepare("UPDATE sections SET name = :name, slug = :slug, icon = :icon WHERE id = :id");
            $stmt->execute([':name' => $name, ':slug' => $slug, ':icon' => ($input['icon'] ?? 'Sparkles'), ':id' => $id]);
            $sectionId = $id;
            $db->prepare("DELETE FROM fields WHERE section_id = ?")->execute([$id]);
        } else {
            $stmt = $db->prepare("INSERT INTO sections (name, slug, icon) VALUES (:name, :slug, :icon)");
            $stmt->execute([':name' => $name, ':slug' => $slug, ':icon' => ($input['icon'] ?? 'Sparkles')]);
            $sectionId = $db->lastInsertId();
        }
        
        $savedFieldNames = [];
        foreach ($input['fields'] as $field) {
            $fName = strtolower(preg_replace('/[^a-zA-Z0-9]/', '_', $field['name']));
            if (empty($fName)) $fName = "field_" . rand(100, 999);
            
            // Deduplicate field names within the same section (Robustness)
            if (in_array($fName, $savedFieldNames)) continue;
            $savedFieldNames[] = $fName;

            $fStmt = $db->prepare("INSERT INTO fields (section_id, field_name, field_label, field_type, is_required) VALUES (:sid, :name, :label, :type, :req)");
            $fStmt->execute([
                ':sid' => $sectionId,
                ':name' => $fName,
                ':label' => $field['name'],
                ':type' => $field['type'],
                ':req' => ($field['required'] ?? false) ? 1 : 0
            ]);
            $fieldId = $db->lastInsertId();

            if (isset($field['options']) && is_array($field['options'])) {
                $oStmt = $db->prepare("INSERT INTO field_options (field_id, option_label, option_value) VALUES (?, ?, ?)");
                foreach ($field['options'] as $opt) {
                    $label = in_array($field['type'], ['checkbox', 'radio', 'select']) ? "" : $opt['label'];
                    $oStmt->execute([$fieldId, $label, $opt['value']]);
                }
            }
        }
        
        $generator->generate($sectionId);
        
        $db->commit();
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        if ($db->inTransaction()) $db->rollBack();
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

if ($action === 'copy_section') {
    $id = $_GET['id'] ?? null;
    if (!$id) exit;
    try {
        $stmt = $db->prepare("SELECT * FROM sections WHERE id = ?");
        $stmt->execute([$id]);
        $section = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($section) {
            $newName = $section['name'] . " (Copy)";
            $newSlug = $section['slug'] . "_copy";
            $db->prepare("INSERT INTO sections (name, slug) VALUES (?, ?)")->execute([$newName, $newSlug]);
            $newId = $db->lastInsertId();

            $fStmt = $db->prepare("SELECT * FROM fields WHERE section_id = ?");
            $fStmt->execute([$id]);
            $fields = $fStmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($fields as $f) {
                $db->prepare("INSERT INTO fields (section_id, field_name, field_type, is_required) VALUES (?, ?, ?, ?)")
                   ->execute([$newId, $f['field_name'], $f['field_type'], $f['is_required']]);
                $newFieldId = $db->lastInsertId();

                $oStmt = $db->prepare("SELECT * FROM field_options WHERE field_id = ?");
                $oStmt->execute([$f['id']]);
                $options = $oStmt->fetchAll(PDO::FETCH_ASSOC);
                foreach ($options as $o) {
                    $db->prepare("INSERT INTO field_options (field_id, option_label, option_value) VALUES (?, ?, ?)")
                       ->execute([$newFieldId, $o['option_label'], $o['option_value']]);
                }
            }
            echo json_encode(['success' => true]);
        }
    } catch (Exception $e) { echo json_encode(['error' => $e->getMessage()]); }
    exit;
}

if ($action === 'get_field_types') {
    $stmt = $db->query("SELECT * FROM field_types ORDER BY label ASC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

if ($action === 'delete_section') {
    $id = $_GET['id'] ?? null;
    if (!$id) exit;
    try {
        $stmt = $db->prepare("SELECT * FROM sections WHERE id = ?");
        $stmt->execute([$id]);
        $section = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($section) {
            $generator = new CrudGenerator($db);
            $generator->deleteSection($section);
            $db->prepare("DELETE FROM sections WHERE id = ?")->execute([$id]);
            $generator->updateReactFiles();
            echo json_encode(['success' => true]);
        }
    } catch (Exception $e) { echo json_encode(['error' => $e->getMessage()]); }
    exit;
}

if ($action === 'get_section') {
    $id = $_GET['id'] ?? null;
    $stmt = $db->prepare("SELECT * FROM sections WHERE id = ?");
    $stmt->execute([$id]);
    $section = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($section) {
        $fStmt = $db->prepare("SELECT id, field_name as name, field_label, field_type as type, is_required as required FROM fields WHERE section_id = ?");
        $fStmt->execute([$id]);
        $fields = $fStmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($fields as &$f) {
            $oStmt = $db->prepare("SELECT option_label as label, option_value as value FROM field_options WHERE field_id = ?");
            $oStmt->execute([$f['id']]);
            $f['options'] = $oStmt->fetchAll(PDO::FETCH_ASSOC);
        }
        $section['fields'] = $fields;
    }
    echo json_encode($section);
    exit;
}

if ($action === 'delete_dev_data') {
    set_time_limit(300); // Give it 5 minutes
    try {
        $generator = new CrudGenerator($db);
        // 1. Get all sections to delete their files
        $sections = $db->query("SELECT * FROM sections")->fetchAll(PDO::FETCH_ASSOC);
        foreach ($sections as $s) {
            $generator->deleteSection($s, false); // Don't delete from DB yet, we'll do it in bulk
        }

        // 2. Clear Database Data
        $db->exec("DELETE FROM field_options");
        $db->exec("DELETE FROM fields");
        $db->exec("DELETE FROM sections");

        // 3. Sync React (which will now be empty)
        $generator->updateReactFiles();

        echo json_encode(['success' => true]);
    } catch (Exception $e) { echo json_encode(['error' => $e->getMessage()]); }
    exit;
}

if ($action === 'list_users') {
    try {
        $projectDb = new PDO('sqlite:' . PROJECT_DB_PATH);
        $stmt = $projectDb->query("SELECT id, name, email, role, created_at FROM users ORDER BY name ASC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } catch (Exception $e) { echo json_encode(['error' => $e->getMessage()]); }
    exit;
}

if ($action === 'save_user') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) exit;
    try {
        $projectDb = new PDO('sqlite:' . PROJECT_DB_PATH);
        if (isset($input['id'])) {
            if (!empty($input['password'])) {
                $hashed = password_hash($input['password'], PASSWORD_DEFAULT);
                $stmt = $projectDb->prepare("UPDATE users SET name = ?, email = ?, password = ?, role = ? WHERE id = ?");
                $stmt->execute([$input['name'], $input['email'], $hashed, $input['role'], $input['id']]);
            } else {
                $stmt = $projectDb->prepare("UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?");
                $stmt->execute([$input['name'], $input['email'], $input['role'], $input['id']]);
            }
        } else {
            $hashed = password_hash($input['password'], PASSWORD_DEFAULT);
            $stmt = $projectDb->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
            $stmt->execute([$input['name'], $input['email'], $hashed, $input['role']]);
        }
        echo json_encode(['success' => true]);
    } catch (Exception $e) { echo json_encode(['error' => $e->getMessage()]); }
    exit;
}

if ($action === 'delete_user') {
    $id = $_GET['id'] ?? null;
    if (!$id) exit;
    try {
        $projectDb = new PDO('sqlite:' . PROJECT_DB_PATH);
        $stmt = $projectDb->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
    } catch (Exception $e) { echo json_encode(['error' => $e->getMessage()]); }
    exit;
}

if ($action === 'list_sections') {
    $stmt = $db->query("SELECT s.*, (SELECT COUNT(*) FROM fields WHERE section_id = s.id) as fields_count FROM sections s ORDER BY s.sort_order ASC, s.name ASC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

$initialView = $_GET['view'] ?? 'dashboard';
$editId = $_GET['edit_id'] ?? null;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dev Studio | Portable CRUD Generator</title>
    <link rel="icon" type="image/png" href="assets/favicon.png">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
:root {
            --primary: #6366f1;
            --primary-light: #f5f7ff;
            --primary-hover: #4f46e5;
            --bg: #f8fafc;
            --card-bg: #ffffff;
            --text-main: #0f172a;
            --text-secondary: #64748b;
            --border: #e2e8f0;
            --radius: 12px;
            --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: var(--bg);
            color: var(--text-main);
            overflow-x: hidden;
            min-height: 100vh;
        }

        /* Top Navigation */
        .top-nav {
            background: #ffffff;
            border-bottom: 1px solid var(--border);
            height: 72px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 2rem;
            position: sticky;
            top: 0;
            z-index: 100;
            box-shadow: var(--shadow-sm);
        }

        .logo {
            font-size: 1.25rem;
            font-weight: 800;
            color: var(--primary);
            display: flex;
            align-items: center;
            gap: 10px;
            text-decoration: none;
        }

        /* Container */
        .studio-container {
            max-width: 1100px;
            margin: 2rem auto;
            padding: 0 1.5rem;
        }

        /* Table Styles */
        .section-table {
            width: 100%;
            background: var(--card-bg);
            border-radius: var(--radius);
            border-collapse: collapse;
            overflow: hidden;
            box-shadow: var(--shadow-sm);
            table-layout: fixed;
        }

        .section-table th {
            text-align: left;
            padding: 1rem 1.5rem;
            background: #f8fafc;
            font-size: 11px;
            font-weight: 800;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-bottom: 1px solid var(--border);
        }

        .section-table td {
            padding: 1.25rem 1.5rem;
            border-bottom: 1px solid var(--border);
            font-size: 14px;
            color: var(--text-main);
        }

        .section-table tr:last-child td { border-bottom: none; }
        .section-table tr:hover { background: #fcfdfe; }

        .icon-badge {
            width: 36px;
            height: 36px;
            background: var(--primary-light);
            color: var(--primary);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .action-btn {
            padding: 8px;
            border-radius: 8px;
            border: 1px solid var(--border);
            background: white;
            cursor: pointer;
            transition: 0.2s;
            color: var(--text-secondary);
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }

        .action-btn:hover {
            border-color: var(--primary);
            color: var(--primary);
            background: var(--primary-light);
        }

        .action-btn.delete:hover {
            border-color: #fee2e2;
            color: #ef4444;
            background: #fef2f2;
        }

        /* Existing View Containers */
        .view-container { display: none; }
        .view-container.active { display: block; animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        /* Buttons & Cards (Kept for consistency) */
        .btn { padding: 0.6rem 1.25rem; border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.2s; border: none; font-size: 14px; display: inline-flex; align-items: center; gap: 8px; }
        .btn-primary { background: var(--primary); color: white; }
        .btn-primary:hover { background: var(--primary-hover); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }
        .btn-outline { background: white; border: 1px solid var(--border); color: var(--text-secondary); }
        .btn-outline:hover { background: #f8fafc; border-color: var(--primary); color: var(--primary); }
        .btn-danger { background: #fff1f2; color: #ef4444; }
        .btn-danger:hover { background: #fee2e2; }

        .card { background: var(--card-bg); border-radius: var(--radius); border: 1px solid var(--border); box-shadow: var(--shadow-sm); padding: 2rem; position: relative; }
        .editor-width { max-width: 800px; margin: 0 auto; }
        .header-input { width: 100%; border: none; font-size: 2.5rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.5rem; outline: none; }
        .form-input { width: 100%; padding: 0.75rem 1rem; border: 1px solid var(--border); border-radius: 10px; font-size: 14px; transition: 0.2s; outline: none; }
        .form-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }

        .icon-picker-dropdown { position: absolute; top: 100%; left: 0; width: 300px; background: white; border: 1px solid var(--border); border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); z-index: 50; padding: 15px; margin-top: 8px; }
        .icon-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; max-height: 250px; overflow-y: auto; padding: 4px; }
        .icon-item { padding: 10px; display: flex; justify-content: center; border-radius: 8px; cursor: pointer; border: 1px solid #f1f5f9; }
        .icon-item:hover { background: var(--primary-light); border-color: var(--primary); color: var(--primary); }

        .field-card.dragging { opacity: 0.5; border: 2px dashed var(--primary); background: var(--primary-light); }
        .toast { position: fixed; bottom: 24px; right: 24px; padding: 1rem 1.5rem; border-radius: 12px; background: white; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border-left: 4px solid var(--primary); display: flex; align-items: center; gap: 12px; transform: translateY(100px); transition: 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55); z-index: 1000; }
        .toast.show { transform: translateY(0); }
        .toast.error { border-left-color: #ef4444; }
        .toast.warning { border-left-color: #f59e0b; }
        .toast-icon { font-size: 18px; }
        .toast-close { cursor: pointer; color: #94a3b8; font-size: 20px; font-weight: 400; transition: 0.2s; padding: 4px; line-height: 1; }
        .toast-close:hover { color: #1e293b; }

        /* Modal Styles */
        .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(4px); z-index: 2000; display: none; align-items: center; justify-content: center; padding: 20px; }
        .modal-overlay.active { display: flex; }
        .modal-card { background: white; border-radius: 16px; width: 100%; max-width: 500px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; animation: modalIn 0.3s ease-out; }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .modal-header { padding: 24px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 12px; }
        .modal-title { font-weight: 800; font-size: 18px; color: #1e293b; }
        .modal-body { padding: 24px; color: var(--text-secondary); line-height: 1.6; }
        .modal-footer { padding: 16px 24px; background: #f8fafc; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 12px; }
        .warning-list { margin-top: 16px; background: #fff1f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; }
        .warning-list ul { margin-left: 20px; font-size: 13px; color: #991b1b; }
        .warning-list li { margin-bottom: 4px; }

        /* Form Builder specific styles */
        .field-card { margin-top: 20px; border-left: 0px solid var(--primary); transition: 0.3s; padding: 1.5rem !important; }
        .field-card.active { border-left: 5px solid var(--primary); border-radius: 4px var(--radius) var(--radius) 4px; }
        .form-group label { display: block; font-size: 11px; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px; }
        .type-picker-btn { width: 100%; padding: 12px; background: #f8fafc; border: 1px solid var(--border); border-radius: 8px; display: flex; align-items: center; gap: 10px; cursor: pointer; font-weight: 600; font-size: 14px; }
        .type-dropdown { position: absolute; top: 100%; left: 0; right: 0; z-index: 1001; background: white; border: 1px solid var(--border); border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); margin-top: 8px; overflow: hidden; width: 300px; }
        .type-search-wrap { padding: 8px; border-bottom: 1px solid #f1f5f9; background: #f8fafc; }
        .type-list { max-height: 250px; overflow-y: auto; padding: 6px; }
        .type-item { display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500; }
        .type-item:hover, .type-item.active { background: var(--primary-light); color: var(--primary); }
        .hidden { display: none !important; }
        .add-btn { display: flex; align-items: center; justify-content: center; gap: 12px; font-weight: 700; color: var(--text-secondary); cursor: pointer; transition: 0.2s; background: white; border: 2px dashed var(--border); border-radius: var(--radius); }
        .add-btn:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-light); }
    </style>
    <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body>
    <!-- Top Nav -->
    <nav class="top-nav">
        <div style="display: flex; align-items: center; gap: 16px;">
            <button id="backBtn" class="btn btn-outline hidden" onclick="switchView('dashboard')" style="padding: 8px; border-radius: 8px;">
                <i data-lucide="arrow-left"></i>
            </button>
            <a href="#" class="logo" onclick="switchView('dashboard')">
                <img src="assets/logo_icon.png" alt="Dev Studio Logo" style="height: 28px; width: auto;">
            </a>
        </div>
        <div style="display: flex; gap: 12px; align-items: center;">
            <button class="btn btn-outline" onclick="switchView('users')" title="User Management" style="padding: 10px;">
                <i data-lucide="users"></i>
            </button>
            <button class="btn btn-outline" onclick="switchView('settings')" title="Studio Settings" style="padding: 10px;">
                <i data-lucide="settings"></i>
            </button>
            <button class="btn btn-primary" onclick="switchView('builder')">
                <i data-lucide="plus"></i> New Section
            </button>
        </div>
    </nav>

    <div class="studio-container">
        <!-- DASHBOARD (Table View) -->
        <div id="dashboardView" class="view-container active">
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem;">
                <div>
                    <h1 style="font-size: 1.8rem; font-weight: 800; color: #1e293b;">Project Sections</h1>
                    <p style="color: var(--text-secondary); margin-top: 4px;">Manage and generate CRUD sections for your project.</p>
                </div>
                <div id="sectionStats" style="font-size: 13px; font-weight: 700; color: var(--primary); background: var(--primary-light); padding: 8px 16px; border-radius: 20px;">
                    0 Sections Total
                </div>
            </div>

            <table class="section-table">
                <thead>
                    <tr>
                        <th style="width: 40px;"></th>
                        <th style="width: 70px;">Icon</th>
                        <th style="width: 280px;">Section Name</th>
                        <th style="width: 220px;">Table / Slug</th>
                        <th style="width: 140px;">Fields</th>
                        <th style="width: 100px;">Status</th>
                        <th style="width: 120px; text-align: right;">Actions</th>
                    </tr>
                </thead>
                <tbody id="sectionTableBody">
                    <!-- Sections will be loaded here via JS -->
                </tbody>
            </table>

            <!-- Empty State (hidden by default if data exists) -->
            <div id="emptyState" class="hidden" style="text-align: center; padding: 5rem 0; background: white; border-radius: 20px; border: 1px dashed var(--border); margin-top: 1rem;">
                <div style="background: var(--bg); width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: var(--text-secondary);">
                    <i data-lucide="layers" style="width: 32px; height: 32px;"></i>
                </div>
                <h3 style="font-weight: 800; color: #1e293b;">No sections found</h3>
                <p style="color: var(--text-secondary); margin-top: 8px; margin-bottom: 24px;">Start by creating your first CRUD section.</p>
                <button class="btn btn-primary" onclick="switchView('builder')">Create New Section</button>
            </div>
        </div>

        <!-- BUILDER -->
        <div id="builderView" class="view-container">
            <div class="editor-width">
                <div class="card" style="margin-bottom: 24px; border-top: none; background: #f8fafc; padding: 1.25rem;">
                    <label style="font-size: 11px; font-weight: 800; color: var(--primary); display: block; margin-bottom: 12px; text-transform: uppercase;">Quick Presets</label>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;" id="presetList">
                        <!-- Presets -->
                    </div>
                </div>

                <div class="card" style="margin-bottom: 24px; padding-bottom: 1rem;">
                            <input type="text" id="sectionName" class="header-input" placeholder="Section Name (e.g. Hero Banner)">
                            <div style="display: flex; gap: 20px; align-items: center;">
                                <div style="flex: 1;">
                                    <label style="font-size: 11px; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; display: block; margin-bottom: 4px;">URL Slug / Table Name</label>
                                    <input type="text" id="sectionSlug" class="form-input" style="font-family: monospace; background: transparent; border-color: transparent; padding: 4px 0;" placeholder="slug_will_auto_generate">
                                </div>
                                <div style="width: 140px; position: relative;">
                                    <label style="font-size: 11px; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; display: block; margin-bottom: 4px;">Sidebar Icon</label>
                                    <div class="form-input" style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px;" onclick="toggleIconPicker('section')">
                                        <i id="sectionIconPreview" data-lucide="Sparkles" style="width: 16px; height: 16px;"></i>
                                        <span style="font-size: 12px; font-weight: 600;" id="sectionIconName">Sparkles</span>
                                    </div>
                                    <div id="sectionIconPicker" class="icon-picker-dropdown hidden">
                                        <input type="text" class="form-input" placeholder="Search..." style="margin-bottom: 8px; font-size: 12px; padding: 6px;" onkeyup="filterIcons(this, 'section')">
                                        <div class="icon-grid" id="sectionIconGrid"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div id="fieldsContainer"></div>

                        <div style="margin-top: 24px;">
                            <button class="card add-btn" onclick="addField()" style="width: 100%; border-style: dashed; padding: 1.5rem;">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--primary);"><path d="M12 5v14M5 12h14"/></svg>
                                <span>Add New Data Field</span>
                            </button>
                        </div>

                        <div style="margin-top: 40px; display: flex; justify-content: space-between; align-items: center; padding-bottom: 100px;">
                            <div style="display: flex; gap: 12px;">
                                <button class="btn btn-outline" onclick="switchView('dashboard')">Cancel</button>
                                <button id="deleteSectionBtn" class="btn btn-danger hidden" onclick="deleteSection()">Delete Section</button>
                            </div>
                            <button class="btn btn-primary" style="width: auto; padding: 0.75rem 2rem; font-size: 15px;" onclick="saveSection()">Save & Generate Code</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- STUDIO SETTINGS -->
        <div id="settingsView" class="view-container">
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem;">
                <div>
                    <h1 style="font-size: 1.8rem; font-weight: 800; color: #1e293b;">Studio Settings</h1>
                    <p style="color: var(--text-secondary); margin-top: 4px;">Danger zone and system maintenance.</p>
                </div>
            </div>

            <div class="card" style="max-width: 600px; margin: 0 auto; border-top: 4px solid #ef4444;">
                <div style="text-align: center; padding: 20px 0;">
                    <div style="background: #fef2f2; color: #ef4444; width: 64px; height: 64px; border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                        <i data-lucide="alert-triangle" style="width: 32px; height: 32px;"></i>
                    </div>
                    <h2 style="font-size: 20px; font-weight: 800; color: #1e293b; margin-bottom: 10px;">Reset Admin Project</h2>
                    <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.6; margin-bottom: 30px;">
                        This will permanently delete ALL generated sections, fields, database tables, and React components. This action cannot be undone.
                    </p>
                    
                    <button class="btn btn-primary" onclick="confirmReset()" style="background: #ef4444; width: 100%; justify-content: center; padding: 14px;">
                        <i data-lucide="trash-2"></i> Delete Everything & Reset
                    </button>
                </div>
            </div>
        </div>

        <!-- RESET MODAL -->
        <div id="resetModal" class="modal-overlay">
            <div class="modal-card" style="border-top: 4px solid #ef4444;">
                <div class="modal-header">
                    <div style="background: #fee2e2; color: #ef4444; width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                        <i data-lucide="alert-circle"></i>
                    </div>
                    <div class="modal-title">Are you absolutely sure?</div>
                </div>
                <div class="modal-body">
                    This will wipe the entire project and return it to a clean slate. Type <strong>DELETE</strong> to confirm.
                    <input type="text" id="resetConfirmInput" class="form-input" style="margin-top: 15px; border-color: #fecaca;" placeholder="Type DELETE here...">
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="document.getElementById('resetModal').classList.remove('active')">Cancel</button>
                    <button id="finalResetBtn" class="btn btn-primary" style="background: #ef4444;" onclick="executeReset()">Yes, Reset Everything</button>
                </div>
            </div>
        </div>

        <!-- USER MANAGEMENT -->
        <div id="usersView" class="view-container">
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem;">
                <div>
                    <h1 style="font-size: 1.8rem; font-weight: 800; color: #1e293b;">Admin Users</h1>
                    <p style="color: var(--text-secondary); margin-top: 4px;">Manage administrative accounts for the project.</p>
                </div>
                <button class="btn btn-primary" onclick="showUserModal()">
                    <i data-lucide="user-plus"></i> Add User
                </button>
            </div>

            <table class="section-table">
                <thead>
                    <tr>
                        <th style="width: 250px;">Name</th>
                        <th style="width: 250px;">Email</th>
                        <th style="width: 150px;">Role</th>
                        <th style="width: 200px;">Created At</th>
                        <th style="width: 120px; text-align: right;">Actions</th>
                    </tr>
                </thead>
                <tbody id="userTableBody">
                    <!-- Users will be loaded here via JS -->
                </tbody>
            </table>
        </div>

    </div>

    <!-- User Modal -->
    <div id="userModal" class="modal-overlay">
        <div class="modal-card">
            <div class="modal-header">
                <div style="background: var(--primary-light); color: var(--primary); width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                    <i data-lucide="user"></i>
                </div>
                <div class="modal-title" id="userModalTitle">Add Admin User</div>
            </div>
            <div class="modal-body">
                <input type="hidden" id="userId">
                <div class="form-group" style="margin-bottom: 16px;">
                    <label>Full Name</label>
                    <input type="text" id="userName" class="form-input" placeholder="e.g. Administrator">
                </div>
                <div class="form-group" style="margin-bottom: 16px;">
                    <label>Email Address</label>
                    <input type="email" id="userEmail" class="form-input" placeholder="e.g. admin@gmail.com">
                </div>
                <div class="form-group" style="margin-bottom: 16px; position: relative;">
                    <label>Password</label>
                    <input type="password" id="userPassword" class="form-input" placeholder="••••••••">
                    <button type="button" onclick="togglePass('userPassword', this)" style="position: absolute; right: 10px; top: 32px; background: none; border: none; color: #94a3b8; cursor: pointer;">
                        <i data-lucide="eye"></i>
                    </button>
                    <p id="passHint" style="font-size: 11px; color: var(--text-secondary); margin-top: 4px; display: none;">Leave blank to keep current password</p>
                </div>
                <div class="form-group">
                    <label>Role</label>
                    <select id="userRole" class="form-input">
                        <option value="admin">Administrator</option>
                        <option value="editor">Editor</option>
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="hideUserModal()">Cancel</button>
                <button class="btn btn-primary" onclick="saveUser()">Save User</button>
            </div>
        </div>
    </div>

    <div id="toastContainer" style="z-index: 9999;"></div>

    <!-- Delete Confirmation Modal -->
    <div id="deleteModal" class="modal-overlay">
        <div class="modal-card">
            <div class="modal-header">
                <div style="background: #fee2e2; color: #ef4444; width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                    <i data-lucide="trash-2"></i>
                </div>
                <div class="modal-title">Delete Section?</div>
            </div>
            <div class="modal-body">
                <p>Are you sure you want to delete the <strong id="deleteSectionName"></strong> section?</p>
                <div class="warning-list">
                    <p style="font-weight: 700; font-size: 13px; color: #991b1b; margin-bottom: 8px;">This will permanently remove:</p>
                    <ul>
                        <li>Generated React Manager and Routes</li>
                        <li>PHP Model and Controller</li>
                        <li>Database table and all stored data</li>
                        <li>All associated upload folders</li>
                    </ul>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="hideDeleteModal()">Cancel</button>
                <button id="confirmDeleteBtn" class="btn btn-danger" style="background: #ef4444; color: white;">Yes, Delete Section</button>
            </div>
        </div>
    </div>

    <!-- Reset Confirmation Modal -->
    <div id="resetModal" class="modal-overlay">
        <div class="modal-card">
            <div class="modal-header">
                <div style="background: #fee2e2; color: #ef4444; width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                    <i data-lucide="alert-triangle"></i>
                </div>
                <div class="modal-title">Reset Dev Studio?</div>
            </div>
            <div class="modal-body">
                <p>This action is <strong>permanent</strong> and will wipe the development environment for this project.</p>
                <div class="warning-list">
                    <p style="font-weight: 700; font-size: 13px; color: #991b1b; margin-bottom: 8px;">The following will be DELETED:</p>
                    <ul>
                        <li>All generated PHP Models, Controllers, and Routes</li>
                        <li>All React Manager components in the Admin panel</li>
                        <li>All associated database tables in the project</li>
                        <li>All sidebar links and routing entries</li>
                        <li>All Dev Studio metadata and field definitions</li>
                    </ul>
                </div>
                <p style="margin-top: 16px; font-size: 13px;">Are you absolutely sure you want to proceed?</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="hideResetModal()">Cancel</button>
                <button class="btn btn-danger" style="background: #ef4444; color: white; padding: 0.75rem 1.5rem;" onclick="deleteDevData()">Yes, Delete Everything</button>
            </div>
        </div>
    </div>

    <script>
        let fields = [];
        let sectionIcon = 'Sparkles';
        let fieldTypes = [];
        let editId = null;

        const PRESETS = {
            'navbar': { name: 'Main Navigation', icon: 'Menu', fields: [{name: 'Menu Label', type: 'text'}, {name: 'URL Link', type: 'url'}, {name: 'Order', type: 'number'}] },
            'hero': { name: 'Hero Banner', icon: 'Layout', fields: [{name: 'Main Heading', type: 'text'}, {name: 'Sub Heading', type: 'textarea'}, {name: 'Banner Image', type: 'image'}, {name: 'Primary CTA', type: 'link'}] },
            'services': { name: 'Our Services', icon: 'Briefcase', fields: [{name: 'Service Name', type: 'text'}, {name: 'Icon', type: 'icon'}, {name: 'Description', type: 'textarea'}] },
            'testimonials': { name: 'Testimonials', icon: 'MessageSquare', fields: [{name: 'Author Name', type: 'text'}, {name: 'Author Role', type: 'text'}, {name: 'Quote', type: 'textarea'}, {name: 'Avatar', type: 'image'}] },
            'contact': { name: 'Contact Info', icon: 'Phone', fields: [{name: 'Address', type: 'textarea'}, {name: 'Email', type: 'email'}, {name: 'Phone Number', type: 'text'}] }
        };

        const COMMON_ICONS = [
            'Sparkles', 'Layout', 'Menu', 'Home', 'User', 'Settings', 'Mail', 'Phone', 'Calendar', 'MapPin', 'Search',
            'Bell', 'Check', 'Info', 'AlertCircle', 'Camera', 'Image', 'Video', 'Music', 'FileText',
            'Folder', 'Plus', 'Minus', 'ArrowRight', 'ArrowLeft', 'ChevronDown', 'ChevronUp',
            'ShoppingCart', 'CreditCard', 'Lock', 'Unlock', 'Eye', 'EyeOff', 'Trash2', 'Edit3',
            'Share2', 'Download', 'Upload', 'Cloud', 'Zap', 'Sun', 'Moon', 'Star', 'Heart', 'Briefcase', 'MessageSquare'
        ];

        async function fetchFieldTypes() {
            const res = await fetch('index.php?action=get_field_types');
            fieldTypes = await res.json();
        }

        async function loadSections() {
            const res = await fetch('index.php?action=list_sections');
            const sections = await res.json();
            const tableBody = document.getElementById('sectionTableBody');
            const emptyState = document.getElementById('emptyState');
            const stats = document.getElementById('sectionStats');

            stats.innerText = `${sections.length} Section${sections.length !== 1 ? 's' : ''} Total`;

            if (sections.length === 0) {
                tableBody.innerHTML = '';
                emptyState.classList.remove('hidden');
                document.querySelector('.section-table').classList.add('hidden');
            } else {
                emptyState.classList.add('hidden');
                document.querySelector('.section-table').classList.remove('hidden');
                
                tableBody.innerHTML = sections.map(s => {
                    const kebabIcon = (s.icon || 'Sparkles').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
                    const isActive = s.status === 'Active';
                    return `
                    <tr data-id="${s.id}" style="${!isActive ? 'opacity: 0.7; background: #f8fafc;' : ''}">
                        <td style="color: #94a3b8; cursor: grab;" draggable="true" ondragstart="handleDragStart(event)" ondragover="handleDragOver(event)" ondrop="handleDrop(event)" ondragend="handleDragEnd(event)">
                            <i data-lucide="grip-vertical" style="width: 16px; height: 16px;"></i>
                        </td>
                        <td>
                            <div class="icon-badge" style="${!isActive ? 'background: #e2e8f0; color: #94a3b8;' : ''}">
                                <i data-lucide="${kebabIcon}"></i>
                            </div>
                        </td>
                        <td>
                            <div style="font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 8px;">
                                <span style="white-space: nowrap;">${s.name}</span>
                                ${!isActive ? '<span style="font-size: 10px; background: #f1f5f9; color: #64748b; padding: 2px 6px; border-radius: 4px; flex-shrink: 0;">Disabled</span>' : ''}
                            </div>
                            <div style="font-size: 12px; color: var(--text-secondary);">Updated just now</div>
                        </td>
                        <td>
                            <code style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-size: 12px;">/${s.slug}</code>
                        </td>
                        <td>
                            <span style="background: #eff6ff; color: #2563eb; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700;">
                                ${s.fields_count || 0} Fields
                            </span>
                        </td>
                        <td>
                            <div class="status-toggle" onclick="toggleStatus(${s.id})" title="${isActive ? 'Deactivate' : 'Activate'}" style="cursor: pointer; width: 42px; height: 22px; background: ${isActive ? 'var(--primary)' : '#cbd5e1'}; border-radius: 20px; position: relative; transition: 0.3s;">
                                <div style="width: 16px; height: 16px; background: white; border-radius: 50%; position: absolute; top: 3px; left: ${isActive ? '23px' : '3px'}; transition: 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></div>
                            </div>
                        </td>
                        <td style="text-align: right;">
                            <div style="display: flex; gap: 8px; justify-content: flex-end; align-items: center;">
                                <button class="action-btn" onclick="switchView('edit', ${s.id})" title="Edit Structure">
                                    <i data-lucide="edit-3" style="width: 16px; height: 16px;"></i>
                                </button>
                                <button class="action-btn delete" onclick="confirmDelete(${s.id})" title="Delete Section">
                                    <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `}).join('');
            }
            
            lucide.createIcons();
        }

        let pendingDeleteId = null;
        async function confirmDelete(id) {
            pendingDeleteId = id;
            const res = await fetch(`index.php?action=get_section&id=${id}`);
            const data = await res.json();
            document.getElementById('deleteSectionName').innerText = data.name;
            document.getElementById('confirmDeleteBtn').onclick = () => deleteSection(id);
            document.getElementById('deleteModal').classList.add('active');
            lucide.createIcons();
        }

        function hideDeleteModal() {
            document.getElementById('deleteModal').classList.remove('active');
            pendingDeleteId = null;
        }

        async function deleteSection(id) {
            const targetId = id || pendingDeleteId || editId;
            if (!targetId) return;
            
            const btn = document.getElementById('confirmDeleteBtn');
            const originalText = btn.innerText;
            btn.innerText = 'Deleting...';
            btn.disabled = true;

            try {
                const res = await fetch(`index.php?action=delete_section&id=${targetId}`);
                const data = await res.json();
                if (data.success) {
                    showToast('Section Deleted Successfully');
                    await syncAdmin(true); 
                    loadSections();
                    switchView('dashboard');
                    hideDeleteModal();
                } else {
                    showToast(data.error, 'error');
                }
            } catch (e) {
                showToast('Server error during deletion', 'error');
            } finally {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        }

        async function toggleStatus(id) {
            try {
                const res = await fetch(`index.php?action=toggle_status&id=${id}`);
                const data = await res.json();
                if (data.success) {
                    const isNowActive = data.status === 'Active';
                    showToast(
                        isNowActive ? 'Section Activated successfully!' : 'Section Deactivated and removed from Admin.',
                        isNowActive ? 'success' : 'warning'
                    );
                    loadSections();
                } else {
                    showToast(data.error, 'error');
                }
            } catch (e) {
                showToast('Server error during toggle', 'error');
            }
        }

        let draggedRow = null;

        let originalOrder = [];
        function handleDragStart(e) {
            draggedRow = e.target.closest('tr');
            e.dataTransfer.effectAllowed = 'move';
            draggedRow.style.opacity = '0.4';
            originalOrder = Array.from(document.querySelectorAll('#sectionTableBody tr')).map(row => row.dataset.id);
        }

        function handleDragOver(e) {
            e.preventDefault();
            const overRow = e.target.closest('tr');
            if (overRow && overRow !== draggedRow) {
                const rect = overRow.getBoundingClientRect();
                const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
                overRow.parentNode.insertBefore(draggedRow, next ? overRow.nextSibling : overRow);
            }
        }

        function handleDragEnd(e) {
            if (draggedRow) draggedRow.style.opacity = '1';
            const newOrder = Array.from(document.querySelectorAll('#sectionTableBody tr')).map(row => row.dataset.id);
            if (JSON.stringify(originalOrder) !== JSON.stringify(newOrder)) {
                saveNewOrder();
            }
        }

        function handleDrop(e) {
            e.preventDefault();
        }

        async function saveNewOrder() {
            const rows = document.querySelectorAll('#sectionTableBody tr');
            const order = Array.from(rows).map(row => row.dataset.id);
            
            try {
                await fetch('index.php?action=update_order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ order })
                });
                showToast('Order saved and Admin Sidebar updated!');
            } catch (e) {
                showToast('Error saving order', 'error');
            }
        }

        let draggedField = null;

        let originalFieldOrder = [];
        function handleFieldDragStart(e) {
            draggedField = e.target.closest('.field-card');
            e.dataTransfer.effectAllowed = 'move';
            draggedField.classList.add('dragging');
            originalFieldOrder = Array.from(document.querySelectorAll('.field-card')).map(card => card.dataset.id);
        }

        function handleFieldDragOver(e) {
            e.preventDefault();
            const overCard = e.target.closest('.field-card');
            if (overCard && overCard !== draggedField) {
                const rect = overCard.getBoundingClientRect();
                const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
                const parent = overCard.parentNode;
                
                // Visual feedback only
                if (next) {
                    parent.insertBefore(draggedField, overCard.nextSibling);
                } else {
                    parent.insertBefore(draggedField, overCard);
                }
            }
        }

        function handleFieldDragEnd(e) {
            if (draggedField) draggedField.classList.remove('dragging');
            const newOrder = Array.from(document.querySelectorAll('.field-card')).map(card => card.dataset.id);
            if (JSON.stringify(originalFieldOrder) !== JSON.stringify(newOrder)) {
                syncFieldOrder();
            }
        }

        function handleFieldDrop(e) {
            e.preventDefault();
        }

        function syncFieldOrder() {
            const cards = document.querySelectorAll('.field-card');
            const newFields = [];
            cards.forEach(card => {
                const id = parseInt(card.dataset.id);
                const field = fields.find(f => f.id === id);
                if (field) newFields.push(field);
            });
            fields = newFields;
        }

        function switchView(view, id = null) {
            document.querySelectorAll('.view-container').forEach(v => v.classList.remove('active'));
            const backBtn = document.getElementById('backBtn');
            
            if (view === 'dashboard') {
                document.getElementById('dashboardView').classList.add('active');
                backBtn.classList.add('hidden');
                loadSections();
                editId = null;
            } else if (view === 'settings') {
                document.getElementById('settingsView').classList.add('active');
                backBtn.classList.remove('hidden');
                editId = null;
            } else if (view === 'users') {
                document.getElementById('usersView').classList.add('active');
                backBtn.classList.remove('hidden');
                loadUsers();
                editId = null;
            } else if (view === 'builder' || view === 'edit') {
                document.getElementById('builderView').classList.add('active');
                backBtn.classList.remove('hidden');
                resetEditor();
                if (id) {
                    editId = id;
                    loadSectionData(id);
                    document.getElementById('deleteSectionBtn').classList.remove('hidden');
                } else {
                    document.getElementById('deleteSectionBtn').classList.add('hidden');
                }
            }
            lucide.createIcons();
        }

        function resetEditor() {
            editId = null;
            fields = [];
            sectionIcon = 'Sparkles';
            document.getElementById('sectionName').value = '';
            document.getElementById('sectionSlug').value = '';
            updateSectionIcon('Sparkles');
            renderFields();
        }

        async function loadSectionData(id) {
            const res = await fetch(`index.php?action=get_section&id=${id}`);
            const data = await res.json();
            document.getElementById('sectionName').value = data.name;
            document.getElementById('sectionSlug').value = data.slug;
            updateSectionIcon(data.icon || 'Sparkles');
            fields = data.fields.map(f => ({
                id: f.id,
                name: f.name,
                type: f.type,
                required: f.required == 1,
                options: f.options || []
            }));
            renderFields();
        }

        function addField() {
            const id = Date.now();
            fields.push({ id, name: '', type: 'text', required: false, options: [], active: true });
            renderFields();
            activateField(id);
        }

        function updateField(id, key, val) {
            const f = fields.find(x => x.id === id);
            if (f) f[key] = val;
            if (key === 'name' && !editId) {
                updateSlug();
            }
        }

        function updateSlug() {
            const name = document.getElementById('sectionName').value;
            const slug = name.toLowerCase().trim().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
            document.getElementById('sectionSlug').value = slug;
        }

        document.getElementById('sectionName').oninput = updateSlug;

        function renderFields() {
            const container = document.getElementById('fieldsContainer');
            container.innerHTML = fields.map((f, i) => {
                const typeInfo = fieldTypes.find(t => t.value === f.type) || { label: 'Short Text', icon: 'Type' };
                const showOptions = ['select', 'checkbox', 'radio'].includes(f.type);
                
                return `
                <div class="card field-card ${f.active ? 'active' : ''}" data-id="${f.id}" onclick="activateField(${f.id})">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
                        <div style="flex: 1; display: grid; grid-template-columns: 30px 1fr 200px; gap: 20px; align-items: center;">
                            <div style="cursor: grab; color: #cbd5e1;" draggable="true" ondragstart="handleFieldDragStart(event)" ondragover="handleFieldDragOver(event)" ondrop="handleFieldDrop(event)" ondragend="handleFieldDragEnd(event)">
                                <i data-lucide="grip-vertical" style="width: 18px; height: 18px;"></i>
                            </div>
                            <div class="form-group">
                                <label>Field Label</label>
                                <input type="text" class="form-input" value="${f.name}" placeholder="e.g. Hero Heading" oninput="updateField(${f.id}, 'name', this.value)">
                            </div>
                            <div class="form-group" style="position: relative;">
                                <label>Field Type</label>
                                <div class="type-picker-btn" onclick="toggleTypeDropdown(${f.id}, event)">
                                    <i data-lucide="${typeInfo.icon || 'HelpCircle'}" style="width: 16px; height: 16px;"></i>
                                    <span>${typeInfo.label}</span>
                                    <i data-lucide="chevron-down" style="width: 14px; height: 14px; margin-left: auto;"></i>
                                </div>
                                <div id="typeDropdown_${f.id}" class="type-dropdown hidden">
                                    <div class="type-search-wrap">
                                        <input type="text" class="form-input" style="padding: 6px 10px; font-size: 12px;" placeholder="Search types..." onkeyup="filterFieldTypes(${f.id}, this.value)" onclick="event.stopPropagation()">
                                    </div>
                                    <div class="type-list">
                                        ${fieldTypes.map(t => `
                                            <div class="type-item field-type-item-${f.id} ${f.type === t.value ? 'active' : ''}" data-label="${t.label}" onclick="selectFieldType(${f.id}, '${t.value}')">
                                                <i data-lucide="${t.icon || 'HelpCircle'}" style="width: 14px; height: 14px;"></i>
                                                <span>${t.label}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    ${showOptions ? `
                        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                            <label style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 10px; display: block;">Options</label>
                            <div style="display: flex; flex-direction: column; gap: 8px;">
                                ${(f.options || []).map((opt, idx) => `
                                    <div style="display: flex; gap: 8px;">
                                        <input type="text" class="form-input" style="background: white; flex: 1;" value="${opt.value}" oninput="updateOption(${f.id}, ${idx}, this.value)">
                                        <button class="btn btn-danger" style="padding: 8px;" onclick="removeOption(${f.id}, ${idx})"><i data-lucide="trash-2" style="width: 14px; height: 14px;"></i></button>
                                    </div>
                                `).join('')}
                                <button class="btn btn-outline" style="width: 100%; border-style: dashed; font-size: 12px;" onclick="addOption(${f.id})">+ Add Option</button>
                            </div>
                        </div>
                    ` : ''}

                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 12px;">
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; font-weight: 600;">
                            <input type="checkbox" ${f.required ? 'checked' : ''} onchange="updateField(${f.id}, 'required', this.checked)">
                            Required
                        </label>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn btn-outline" style="padding: 6px 10px;" onclick="duplicateField(${f.id})"><i data-lucide="copy" style="width: 14px; height: 14px;"></i></button>
                            <button class="btn btn-danger" style="padding: 6px 10px;" onclick="removeField(${f.id})"><i data-lucide="trash-2" style="width: 14px; height: 14px;"></i></button>
                        </div>
                    </div>
                </div>
                `;
            }).join('');
            lucide.createIcons();
        }

        function activateField(id) {
            fields.forEach(f => f.active = (f.id === id));
            document.querySelectorAll('.field-card').forEach(c => {
                c.classList.toggle('active', parseInt(c.dataset.id) === id);
            });
        }

        function filterFieldTypes(id, query) {
            const items = document.querySelectorAll(`.field-type-item-${id}`);
            query = query.toLowerCase();
            items.forEach(item => {
                const label = item.getAttribute('data-label').toLowerCase();
                item.classList.toggle('hidden', !label.includes(query));
            });
        }

        function toggleTypeDropdown(id, e) {
            e.stopPropagation();
            const dd = document.getElementById(`typeDropdown_${id}`);
            const isHidden = dd.classList.contains('hidden');
            document.querySelectorAll('.type-dropdown').forEach(d => d.classList.add('hidden'));
            if (isHidden) dd.classList.remove('hidden');
        }

        function selectFieldType(id, type) {
            updateField(id, 'type', type);
            if (['select', 'checkbox', 'radio'].includes(type) && (!fields.find(x => x.id === id).options.length)) {
                updateField(id, 'options', [{value: 'Option 1'}]);
            }
            renderFields();
        }

        function addOption(id) {
            const f = fields.find(x => x.id === id);
            f.options.push({value: 'New Option'});
            renderFields();
        }

        function updateOption(id, idx, val) {
            const f = fields.find(x => x.id === id);
            f.options[idx].value = val;
        }

        function removeOption(id, idx) {
            const f = fields.find(x => x.id === id);
            f.options.splice(idx, 1);
            renderFields();
        }

        function removeField(id) {
            fields = fields.filter(f => f.id !== id);
            renderFields();
        }

        function duplicateField(id) {
            const idx = fields.findIndex(x => x.id === id);
            if (idx === -1) return;
            const f = fields[idx];
            const newF = JSON.parse(JSON.stringify(f));
            newF.id = Date.now();
            newF.active = true;
            
            // Insert right after the source field (Robustness)
            fields.splice(idx + 1, 0, newF);
            
            fields.forEach(x => x.active = (x.id === newF.id));
            renderFields();
        }

        function filterIcons(input, type) {
            const query = input.value.toLowerCase();
            const grid = document.getElementById('sectionIconGrid');
            const icons = (typeof lucide !== 'undefined' && lucide.icons) ? Object.keys(lucide.icons) : COMMON_ICONS;
            
            const filtered = icons.filter(i => i.toLowerCase().includes(query)).slice(0, 100);
            
            grid.innerHTML = filtered.map(i => {
                // Convert to PascalCase for storage if it's kebab-case from lucide.icons
                const pascal = i.includes('-') ? i.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('') : i.charAt(0).toUpperCase() + i.slice(1);
                return `
                    <div class="icon-item" onclick="updateSectionIcon('${pascal}')" title="${pascal}">
                        <i data-lucide="${i}"></i>
                    </div>
                `;
            }).join('');
            lucide.createIcons();
        }

        function toggleIconPicker(type) {
            const picker = document.getElementById('sectionIconPicker');
            picker.classList.toggle('hidden');
            if (!picker.classList.contains('hidden')) {
                const grid = document.getElementById('sectionIconGrid');
                const icons = (typeof lucide !== 'undefined' && lucide.icons) ? Object.keys(lucide.icons) : COMMON_ICONS;
                
                // Show first 100 icons initially
                grid.innerHTML = icons.slice(0, 100).map(i => {
                    const pascal = i.includes('-') ? i.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('') : i.charAt(0).toUpperCase() + i.slice(1);
                    return `
                        <div class="icon-item" onclick="updateSectionIcon('${pascal}')" title="${pascal}">
                            <i data-lucide="${i}"></i>
                        </div>
                    `;
                }).join('');
                lucide.createIcons();
            }
        }

        function updateSectionIcon(name) {
            sectionIcon = name;
            document.getElementById('sectionIconName').innerText = name;
            // Use kebab-case for data-lucide preview if name is PascalCase
            const kebab = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
            document.getElementById('sectionIconPreview').setAttribute('data-lucide', kebab);
            document.getElementById('sectionIconPicker').classList.add('hidden');
            lucide.createIcons();
        }

        async function saveSection() {
            const name = document.getElementById('sectionName').value;
            const slug = document.getElementById('sectionSlug').value;
            if (!name || !slug) return showToast('Please fill all header fields', 'error');
            if (fields.length === 0) return showToast('Add at least one field', 'error');

            try {
                const res = await fetch('index.php?action=save_section', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: editId, name, slug, icon: sectionIcon, fields })
                });
                const data = await res.json();
                if (data.success) {
                    showToast('Section Saved Successfully!');
                    await syncAdmin(true); // Auto Sync
                    loadSections();
                    switchView('dashboard');
                } else {
                    showToast(data.error, 'error');
                }
            } catch (e) {
                showToast('Server error during save', 'error');
            }
        }


        async function syncAdmin(silent = false) {
            const btn = document.getElementById('syncBtn');
            if (btn) {
                if (!silent) btn.innerText = 'Syncing...';
            }
            const res = await fetch('index.php?action=sync_admin');
            const data = await res.json();
            if (data.success && !silent) showToast('Admin Environment Synced!');
            if (btn) {
                if (!silent) btn.innerText = 'Sync Admin';
            }
        }

        function confirmReset() {
            document.getElementById('resetConfirmInput').value = '';
            document.getElementById('resetModal').classList.add('active');
        }

        async function executeReset() {
            const input = document.getElementById('resetConfirmInput').value;
            if (input !== 'DELETE') {
                showToast('Please type DELETE to confirm', 'error');
                return;
            }

            const btn = document.getElementById('finalResetBtn');
            btn.innerText = 'Resetting...';
            btn.disabled = true;

            try {
                const res = await fetch('index.php?action=reset_project');
                const data = await res.json();
                if (data.success) {
                    showToast('Project Reset Successfully!');
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    showToast(data.error, 'error');
                }
            } catch (e) {
                showToast('Server error during reset', 'error');
            } finally {
                btn.innerText = 'Yes, Reset Everything';
                btn.disabled = false;
            }
        }

        // --- USER MANAGEMENT JS ---
        async function loadUsers() {
            const res = await fetch('index.php?action=list_users');
            const users = await res.json();
            const tableBody = document.getElementById('userTableBody');
            
            tableBody.innerHTML = users.map(u => `
                <tr>
                    <td style="font-weight: 700;">${u.name}</td>
                    <td>${u.email}</td>
                    <td><span style="background: var(--primary-light); color: var(--primary); padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase;">${u.role}</span></td>
                    <td style="color: var(--text-secondary); font-size: 13px;">${u.created_at}</td>
                    <td style="text-align: right;">
                        <div style="display: flex; gap: 8px; justify-content: flex-end;">
                            <button class="action-btn" onclick="editUser(${JSON.stringify(u).replace(/"/g, '&quot;')})" title="Edit User">
                                <i data-lucide="edit-2" style="width: 14px; height: 14px;"></i>
                            </button>
                            <button class="action-btn delete" onclick="deleteUser(${u.id})" title="Delete User">
                                <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
            lucide.createIcons();
        }

        function showUserModal(user = null) {
            const modal = document.getElementById('userModal');
            document.getElementById('userId').value = user ? user.id : '';
            document.getElementById('userName').value = user ? user.name : '';
            document.getElementById('userEmail').value = user ? user.email : '';
            document.getElementById('userPassword').value = '';
            document.getElementById('userRole').value = user ? user.role : 'admin';
            
            document.getElementById('userModalTitle').innerText = user ? 'Edit Admin User' : 'Add Admin User';
            document.getElementById('passHint').style.display = user ? 'block' : 'none';
            
            modal.classList.add('active');
            lucide.createIcons();
        }

        function hideUserModal() {
            document.getElementById('userModal').classList.remove('active');
        }

        function editUser(user) {
            showUserModal(user);
        }

        async function saveUser() {
            const id = document.getElementById('userId').value;
            const name = document.getElementById('userName').value;
            const email = document.getElementById('userEmail').value;
            const password = document.getElementById('userPassword').value;
            const role = document.getElementById('userRole').value;

            if (!name || !email || (!id && !password)) {
                return showToast('Please fill all required fields', 'error');
            }

            const res = await fetch('index.php?action=save_user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id || undefined, name, email, password, role })
            });
            const data = await res.json();
            if (data.success) {
                showToast('User saved successfully');
                hideUserModal();
                loadUsers();
            } else {
                showToast(data.error, 'error');
            }
        }

        function togglePass(inputId, btn) {
            const input = document.getElementById(inputId);
            const icon = btn.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.setAttribute('data-lucide', 'eye-off');
            } else {
                input.type = 'password';
                icon.setAttribute('data-lucide', 'eye');
            }
            lucide.createIcons();
        }

        async function deleteUser(id) {
            if (!confirm('Are you sure you want to delete this user?')) return;
            const res = await fetch(`index.php?action=delete_user&id=${id}`);
            const data = await res.json();
            if (data.success) {
                showToast('User deleted successfully');
                loadUsers();
            }
        }

        function showResetModal() {
            document.getElementById('resetModal').classList.add('active');
            lucide.createIcons();
        }

        function hideResetModal() {
            document.getElementById('resetModal').classList.remove('active');
        }

        async function deleteDevData() {
            const btn = event.target;
            const originalText = btn.innerText;
            btn.innerText = 'Deleting...';
            btn.disabled = true;
            
            try {
                const res = await fetch('index.php?action=delete_dev_data');
                const data = await res.json();
                if (data.success) {
                    window.location.reload();
                } else {
                    showToast(data.error, 'error');
                    btn.innerText = originalText;
                    btn.disabled = false;
                }
            } catch (e) {
                showToast('Server error during reset', 'error');
                btn.innerText = originalText;
                btn.disabled = false;
            }
        }

        function showToast(msg, type = 'success') {
            const container = document.getElementById('toastContainer');
            const id = 'toast_' + Date.now();
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.id = id;
            const icons = { success: '✅', error: '❌', warning: '⚠️' };
            toast.innerHTML = `
                <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
                <span style="flex: 1; font-weight: 500; font-size: 14px; color: #334155;">${msg}</span>
                <span class="toast-close" onclick="this.closest('.toast').remove()">&times;</span>
            `;
            container.appendChild(toast);
            setTimeout(() => toast.classList.add('show'), 10);
            setTimeout(() => toast.remove(), 4500);
        }

        function applyPreset(key) {
            const p = PRESETS[key];
            document.getElementById('sectionName').value = p.name;
            updateSlug();
            updateSectionIcon(p.icon);
            fields = p.fields.map(f => ({
                id: Math.random(),
                name: f.name,
                type: f.type,
                required: false,
                options: []
            }));
            renderFields();
        }

        // Global search/close pickers
        window.onclick = (e) => {
            if (!e.target.closest('.type-picker-btn') && !e.target.closest('.type-dropdown')) {
                document.querySelectorAll('.type-dropdown').forEach(d => d.classList.add('hidden'));
            }
            if (!e.target.closest('.icon-picker-dropdown') && !e.target.closest('.form-input')) {
                document.getElementById('sectionIconPicker').classList.add('hidden');
            }
        };

        (async () => {
            const presetContainer = document.getElementById('presetList');
            presetContainer.innerHTML = Object.keys(PRESETS).map(key => `
                <button class="btn btn-outline" style="padding: 6px 12px; font-size: 11px;" onclick="applyPreset('${key}')">${PRESETS[key].name}</button>
            `).join('');

            await fetchFieldTypes();
            await loadSections();
            const view = "<?php echo $initialView; ?>";
            const id = "<?php echo $editId; ?>";
            if (id && view === 'edit') switchView('edit', id);
            else if (view === 'users') switchView('users');
            else switchView('dashboard');
        })();
    </script>
</body>
</html>
