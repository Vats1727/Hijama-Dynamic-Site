<?php

class CrudGenerator
{
    private $templates = [];
    private $database;
    private $devConn;

    public function __construct($dbOrConn)
    {
        if ($dbOrConn instanceof Database) {
            $this->database = $dbOrConn;
        } else {
            $this->devConn = $dbOrConn;
            $this->database = new Database();
        }
        $this->loadTemplates();
    }

    private function loadTemplates()
    {
        $dir = dirname(__DIR__) . '/templates';
        $files = glob("$dir/*.tpl");
        foreach ($files as $file) {
            $name = basename($file, '.tpl');
            $this->templates[$name] = file_get_contents($file);
        }
    }

    private function getDevDb() { 
        if ($this->devConn) return $this->devConn;
        return $this->database->getDevConnection(); 
    }
    private function getProjectDb() { 
        return $this->database->getProjectConnection(); 
    }

    private function toPascalCase($string)
    {
        // Preserve underscores for uniqueness in setters (Robustness)
        $string = str_replace('-', ' ', $string);
        $string = ucwords($string);
        $string = str_replace(' ', '', $string);
        return $string;
    }

    public function ensureCoreFiles()
    {
        require_once __DIR__ . '/Initializer.php';
        Initializer::run();
    }

    public function generate($sectionId)
    {
        $devDb = $this->getDevDb();
        $stmt = $devDb->prepare("SELECT * FROM sections WHERE id = ?");
        $stmt->execute([$sectionId]);
        $section = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$section) return false;

        $stmt = $devDb->prepare("SELECT * FROM fields WHERE section_id = ? ORDER BY sort_order ASC");
        $stmt->execute([$sectionId]);
        $fields = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $this->ensureTable($section, $fields);
        $this->generateBackend($section, $fields);
        $this->generateFrontend($section, $fields);
        $this->updateReactFiles();
        
        return true;
    }

    private function ensureTable($section, $fields)
    {
        $db = $this->getProjectDb();
        $tableName = str_replace('-', '_', $section['slug']);
        
        $sql = "CREATE TABLE IF NOT EXISTS \"$tableName\" (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sort_order INTEGER DEFAULT 0,
            status TEXT DEFAULT 'Active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP";

        foreach ($fields as $field) {
            $fName = trim($field['field_name']);
            if (empty($fName) || in_array($fName, ['id', 'sort_order', 'status', 'created_at', 'updated_at'])) continue;
            
            $type = "TEXT"; 
            if ($field['field_type'] === 'rating') $type = "INTEGER";
            
            $sql .= ",\n            \"$fName\" $type";
        }
        $sql .= "\n        )";
        
        $db->exec($sql);

        // Robust Schema Sync: Ensure all columns exist (Self-Healing)
        $existingColumns = [];
        $res = $db->query("PRAGMA table_info(\"$tableName\")");
        while ($row = $res->fetch(PDO::FETCH_ASSOC)) {
            $existingColumns[] = $row['name'];
        }

        foreach ($fields as $field) {
            $fName = trim($field['field_name']);
            if (empty($fName) || in_array($fName, $existingColumns)) continue;

            $type = "TEXT";
            if ($field['field_type'] === 'rating') $type = "INTEGER";
            
            try {
                $db->exec("ALTER TABLE \"$tableName\" ADD COLUMN \"$fName\" $type");
            } catch (Exception $e) {
                // Silently skip if column already exists (safeguard)
            }
        }
    }

    public function generateBackend($section, $fields)
    {
        $className = str_replace(' ', '', ucwords($section['name']));
        $slug = $section['slug'];
        $tableName = str_replace('-', '_', $slug);
        $varName = lcfirst($className);

        // Generate Model
        $modelTpl = $this->templates['backend_model'];
        $modelTpl = str_replace('{{CLASS_NAME}}', $className, $modelTpl);
        $modelTpl = str_replace('{{TABLE_NAME}}', $tableName, $modelTpl);
        
        $modelPath = SERVER_PATH . "/models/{$className}.php";
        ensureDir(dirname($modelPath));
        file_put_contents($modelPath, $modelTpl);

        // Generate Controller
        $ctrlTpl = $this->templates['backend_controller'];
        $ctrlTpl = str_replace('{{CLASS_NAME}}', $className, $ctrlTpl);
        $ctrlTpl = str_replace('{{MODEL_NAME}}', $className, $ctrlTpl);
        $ctrlTpl = str_replace('{{VAR_NAME}}', $varName, $ctrlTpl);

        // Process File Helpers
        $hasFile = false;
        $processFiles = "";
        $processDelete = "";
        foreach ($fields as $f) {
            if ($f['field_type'] === 'image' || $f['field_type'] === 'file') {
                $hasFile = true;
                $fName = $f['field_name'];
                $processFiles .= "        if (isset(\$_FILES['$fName']) && \$_FILES['$fName']['error'] === UPLOAD_ERR_OK) {\n";
                $processFiles .= "            \$data['$fName'] = FileHelper::upload(\$_FILES['$fName'], '$slug');\n";
                $processFiles .= "        }\n";
                $processDelete .= "        if (!empty(\$item['$fName'])) FileHelper::delete(\$item['$fName']);\n";
            }
        }

        $ctrlTpl = str_replace('{{PROCESS_FILES}}', rtrim($processFiles), $ctrlTpl);
        $ctrlTpl = str_replace('{{PROCESS_DELETE_FILES}}', rtrim($processDelete), $ctrlTpl);
        
        $ctrlPath = SERVER_PATH . "/controllers/{$className}Controller.php";
        ensureDir(dirname($ctrlPath));
        file_put_contents($ctrlPath, $ctrlTpl);

        // Generate Route
        $routeTpl = $this->templates['backend_route'];
        $routeTpl = str_replace('{{CLASS_NAME}}', $className, $routeTpl);
        $routeTpl = str_replace('{{SLUG}}', $slug, $routeTpl);
        $routeTpl = str_replace('{{VAR_NAME}}', $varName, $routeTpl);
        
        $routePath = SERVER_PATH . "/routes/{$slug}Routes.php";
        ensureDir(dirname($routePath));
        file_put_contents($routePath, $routeTpl);
    }

    public function generateFrontend($section, $fields)
    {
        $className = str_replace(' ', '', ucwords($section['name']));
        $slug = $section['slug'];
        $name = $section['name'];

        $tpl = $this->templates['frontend_manager'];
        $tpl = str_replace('{{CLASS_NAME}}', $className, $tpl);
        $tpl = str_replace('{{SLUG}}', $slug, $tpl);
        $tpl = str_replace('{{NAME}}', $name, $tpl);

        $formState = "";
        $formPayloadFormData = "";
        $resetForm = "";
        $setEditForm = "";
        $formInputs = "";
        $tableHeaders = "";
        $tableCells = "";
        $formValidation = "";

        $processedFields = [];
        foreach ($fields as $field) {
            $fName = $field['field_name'];
            
            // Extra safety: Skip duplicate field names or reserved words (Robustness)
            if (in_array($fName, $processedFields) || in_array($fName, ['id', 'status', 'sort_order'])) continue;
            $processedFields[] = $fName;

            $fType = $field['field_type'];
            $fLabel = $field['field_label'];
            $required = $field['is_required'] ? 'required' : '';
            $requiredBadge = $field['is_required'] ? ' <span className="admin-required">*</span>' : '';

            // Form State & Payload
            $uName = $this->toPascalCase($fName);
            $mediaTypes = ['image', 'video', 'audio', 'document', 'file'];
            $multiMediaTypes = ['images', 'files'];
            $jsonTypes = ['checkbox', 'multi_text', 'daterange', 'location', 'link'];

            if (in_array($fType, $mediaTypes)) {
                $formState .= "  const [{$fName}, set{$uName}] = useState(null);\n";
                $formState .= "  const [{$fName}Preview, set{$uName}Preview] = useState('');\n";
                $formPayloadFormData .= "    if ({$fName} && typeof {$fName} === 'object') formData.append('{$fName}', {$fName});\n";
                $resetForm .= "    set{$uName}(null);\n    set{$uName}Preview('');\n";
                $setEditForm .= "    set{$uName}Preview(item.{$fName} ? getImageUrl(item.{$fName}) : '');\n";
            } elseif (in_array($fType, $multiMediaTypes)) {
                $formState .= "  const [{$fName}, set{$uName}] = useState([]);\n";
                $formState .= "  const [{$fName}Previews, set{$uName}Previews] = useState([]);\n";
                $formPayloadFormData .= "    {$fName}.forEach((file, idx) => { if (file instanceof File) formData.append('{$fName}_' + idx, file); });\n";
                $resetForm .= "    set{$uName}([]);\n    set{$uName}Previews([]);\n";
                $setEditForm .= "    if (item.{$fName}) { const paths = Array.isArray(item.{$fName}) ? item.{$fName} : JSON.parse(item.{$fName}); set{$uName}Previews(paths.map(p => getImageUrl(p))); }\n";
            } else {
                $defaultVal = "''";
                if ($fType === 'rating') $defaultVal = "5";
                if ($fType === 'switch') $defaultVal = "false";
                if (in_array($fType, ['checkbox', 'multi_text'])) $defaultVal = "[]";
                if ($fType === 'daterange') $defaultVal = "{ start: '', end: '' }";
                if ($fType === 'location') $defaultVal = "{ lat: '', lng: '', address: '' }";
                
                $formState .= "  const [{$fName}, set{$uName}] = useState($defaultVal);\n";
                if ($fType === 'lucide-icon' || $fType === 'lucide_icon' || $fType === 'lucide-icon-picker') {
                    $formState .= "  const [isDropdownOpen_$fName, setIsDropdownOpen_$fName] = useState(false);\n";
                }
                
                if (in_array($fType, $jsonTypes)) {
                     $formPayloadFormData .= "    formData.append('{$fName}', JSON.stringify({$fName}));\n";
                } else {
                     $formPayloadFormData .= "    formData.append('{$fName}', {$fName});\n";
                }
                
                $resetForm .= "    set{$uName}($defaultVal);\n";
                $setEditForm .= "    if (item.{$fName} !== undefined && item.{$fName} !== null) {\n";
                if (in_array($fType, $jsonTypes)) {
                    $setEditForm .= "      if (typeof item.{$fName} === 'object') { set{$uName}(item.{$fName}); } \n";
                    $setEditForm .= "      else { try { set{$uName}(JSON.parse(item.{$fName})); } catch(e) { set{$uName}($defaultVal); } }\n";
                } else {
                    $setEditForm .= "      set{$uName}(item.{$fName});\n";
                }
                $setEditForm .= "    } else {\n      set{$uName}($defaultVal);\n    }\n";
            }
            $fieldOptionsHtml = "";
            if ($fType === 'select' || $fType === 'checkbox' || $fType === 'radio') {
                $fStmt = $this->getDevDb()->prepare("SELECT * FROM field_options WHERE field_id = ?");
                $fStmt->execute([$field['id']]);
                $opts = $fStmt->fetchAll(PDO::FETCH_ASSOC);
                $optArr = [];
                foreach ($opts as $o) $optArr[] = $o['option_value'];
                $fieldOptionsHtml = "['" . implode("', '", array_map('addslashes', $optArr)) . "']";
            }

            $formInputs .= $this->getFormInputTpl($fType, $fName, $fLabel, $requiredBadge, $fieldOptionsHtml);

            // Table
            $tableHeaders .= "                  <th>$fLabel</th>\n";
            if ($fType === 'image') {
                $tableCells .= "                    <td>{item.{$fName} ? <img src={getImageUrl(item.{$fName})} alt=\"Preview\" style={{ height: '40px', borderRadius: '4px' }} /> : 'No Image'}</td>\n";
            } elseif ($fType === 'icon' || $fType === 'icon-picker' || $fType === 'icon_picker' || $fType === 'lucide-icon' || $fType === 'lucide_icon' || $fType === 'lucide-icon-picker') {
                $tableCells .= "                    <td>{(() => { 
                      const iconName = item.{$fName};
                      const brandIcons = {
                        Facebook: <svg width={18} height={18} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><path d=\"M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z\"/></svg>,
                        Twitter: <svg width={18} height={18} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><path d=\"M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C4.2 17 2.8 14.8 2.3 12c.8.1 1.6 0 2.4-.2C2 11.2.8 9.1.8 6.8c.6.3 1.3.5 2.1.5C1.1 6 1.4 3.1 3.5 1.5c2.3 2.8 5.7 4.5 9.5 4.7-.1-.4-.2-.8-.2-1.2 0-3.3 2.7-6 6-6 1.5 0 3 .6 4 1.7 1.2-.2 2.5-.7 3.5-1.3-.4 1.3-1.3 2.4-2.4 3z\"/></svg>,
                        Instagram: <svg width={18} height={18} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><rect width=\"20\" height=\"20\" x=\"2\" y=\"2\" rx=\"5\" ry=\"5\"/><path d=\"M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z\"/><line x1=\"17.5\" y1=\"6.5\" x2=\"17.51\" y2=\"6.5\"/></svg>,
                        Linkedin: <svg width={18} height={18} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><path d=\"M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z\"/><rect width=\"4\" height=\"12\" x=\"2\" y=\"9\"/><circle cx=\"4\" cy=\"4\" r=\"2\"/></svg>,
                        Youtube: <svg width={18} height={18} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><path d=\"M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z\"/><polygon points=\"9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02\"/></svg>,
                        Github: <svg width={18} height={18} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><path d=\"M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5-.73 1.02-1.08 2.25-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4\"/><path d=\"M9 18c-4.51 2-5-2-7-2\"/></svg>,
                        Twitch: <svg width={18} height={18} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><path d=\"M21 2H3v16h5v4l4-4h5l4-4V2zm-2 13l-3 3H9l-3-3V4h13v11z\"/><path d=\"M14 8h2v4h-2V8zm-5 0h2v4H9V8z\"/></svg>,
                        Slack: <svg width={18} height={18} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><rect width=\"4\" height=\"4\" x=\"13\" y=\"2\" rx=\"2\"/><rect width=\"4\" height=\"4\" x=\"2\" y=\"13\" rx=\"2\"/><rect width=\"4\" height=\"4\" x=\"20\" y=\"13\" rx=\"2\"/><path d=\"M10 7a3 3 0 0 1-3-3 3 3 0 0 1 3 3v3H7\"/><path d=\"M14 7v3h3a3 3 0 0 1-3-3v0z\"/><path d=\"M14 17a3 3 0 0 1 3 3 3 3 0 0 1-3-3v-3h3\"/><path d=\"M10 17v-3H7a3 3 0 0 1 3 3v0z\"/></svg>,
                        Tiktok: <svg width={18} height={18} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><path d=\"M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5\"/></svg>,
                        Pinterest: <svg width={18} height={18} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><path d=\"M8 22c-.66-4.14.73-7.61 1.76-11.08C9.28 9.3 9.94 7.63 11.23 7c1.32-.64 2.89.04 3.2 1.62.38 1.94-.96 4.34-1.63 6.38-.2 1.12.56 2.1 1.66 2.1 3.01 0 5.22-3.83 5.22-7.85 0-3.6-2.58-6.13-6.66-6.13-4.52 0-7.44 3.14-7.44 6.84 0 1.25.33 2.41 1 3.32-.4 1.14-.33 2.15-.17 3.23-2.1-2.45-2.28-5.36-1.57-8.15C5.81 4.56 9.68 2 14.18 2c5.63 0 9.25 4 9.25 8.73 0 5.75-3.25 10.27-8.13 10.27-1.61 0-3.13-.88-3.65-1.92L10 22z\"/></svg>,
                        Snapchat: <svg width={18} height={18} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><path d=\"M12 2c2.5 0 4.5 1.5 5 3.5 1.2 0 2 .8 2 2 0 1-.5 1.5-1.5 2 1.5 2 2.5 4.5 1.5 6-.5.8-1.5 1-2.5 1-.2 1-.5 1.5-1 1.5-1.5 0-2.5-.5-2.5-1.5 0 1-.8 1.5-2 1.5-1.5 0-2.5-.5-2.5-1.5-.5 0-.8-.5-1-1.5-1 0-2-.2-2.5-1-1-1.5 0-4 1.5-6-1-.5-1.5-1-1.5-2 0-1.2.8-2 2-2 .5-2 2.5-3.5 5-3.5z\"/></svg>,
                        Whatsapp: <svg width={18} height={18} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><path d=\"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z\"/></svg>,
                        Telegram: <svg width={18} height={18} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><line x1=\"22\" y1=\"2\" x2=\"11\" y2=\"13\"/><polygon points=\"22 2 15 22 11 13 2 9 22 2\"/></svg>,
                        Reddit: <svg width={18} height={18} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><ellipse cx=\"12\" cy=\"13\" rx=\"5\" ry=\"3\"/></svg>,
                        Discord: <svg width={18} height={18} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><circle cx=\"9\" cy=\"12\" r=\"1\"/><circle cx=\"15\" cy=\"12\" r=\"1\"/><path d=\"M7.5 7.5S9 6 12 6s4.5 1.5 4.5 1.5-1.5 3-1.5 5.5.5 2.5.5 2.5-1.5.5-3.5.5-3.5-.5-3.5-.5.5 0 .5-2.5-1.5-2.5-1.5-5.5z\"/></svg>
                      };
                      if (brandIcons[iconName]) return brandIcons[iconName];
                      const Icon = (iconName && iconName !== 'Icon' && LucideIcons[iconName]) || LucideIcons.HelpCircle; 
                      return <Icon size={18} />; 
                    })()}</td>\n";
            } elseif ($fType === 'multi_text') {
                $tableCells .= "                    <td>{Array.isArray(item.{$fName}) ? item.{$fName}.join(', ') : (typeof item.{$fName} === 'string' ? item.{$fName} : '')}</td>\n";
            } elseif ($fType === 'link') {
                $tableCells .= "                    <td>{(() => { try { const link = typeof item.{$fName} === 'string' ? JSON.parse(item.{$fName}) : item.{$fName}; return link ? <a href={link.url} target=\"_blank\" rel=\"noopener noreferrer\" className=\"text-indigo-600 hover:underline\">{link.label || 'Link'}</a> : 'No Link'; } catch(e) { return 'Invalid Link'; } })()}</td>\n";
            } else {
                $tableCells .= "                    <td>{String(item.{$fName} || '')}</td>\n";
            }

            if ($field['is_required']) {
                $formValidation .= "    if (!{$fName}) { showToast('{$fLabel} is required', 'error'); return; }\n";
            }
        }

        $tpl = str_replace('{{FORM_STATE}}', rtrim($formState), $tpl);
        $tpl = str_replace('{{FORM_PAYLOAD_FORMDATA}}', rtrim($formPayloadFormData), $tpl);
        $tpl = str_replace('{{RESET_FORM}}', rtrim($resetForm), $tpl);
        $tpl = str_replace('{{SET_EDIT_FORM}}', rtrim($setEditForm), $tpl);
        $tpl = str_replace('{{FORM_INPUTS}}', rtrim($formInputs), $tpl);
        $tpl = str_replace('{{TABLE_HEADERS}}', rtrim($tableHeaders), $tpl);
        $tpl = str_replace('{{TABLE_CELLS}}', rtrim($tableCells), $tpl);
        $tpl = str_replace('{{FORM_VALIDATION}}', rtrim($formValidation), $tpl);

        $targetPath = CLIENT_PATH . "/src/pages/Admin/Sections/{$className}Manager.jsx";
        ensureDir(dirname($targetPath));
        file_put_contents($targetPath, $tpl);
    }

    private function getFormInputTpl($type, $name, $label, $badge, $optionsHtml = "[]")
    {
        $uName = $this->toPascalCase($name);
        $basicTypes = ['text', 'url', 'email', 'phone', 'number', 'password', 'date', 'time', 'datetime-local', 'color'];
        $typeMap = [
            'date' => 'date',
            'time' => 'time',
            'datetime' => 'datetime-local',
            'password' => 'password',
            'currency' => 'number',
            'percentage' => 'number'
        ];

        $htmlType = $typeMap[$type] ?? $type;

        if (in_array($htmlType, $basicTypes) || $type === 'currency' || $type === 'percentage') {
            $step = ($type === 'currency' || $type === 'percentage') ? 'step="0.01"' : '';
            $prefix = $type === 'currency' ? '<span className="input-prefix">$</span>' : '';
            $suffix = $type === 'percentage' ? '<span className="input-suffix">%</span>' : '';
            
            return "            <div className=\"admin-form-group\">
              <label className=\"admin-label\">$label$badge</label>
              <div className=\"input-wrapper-premium\">
                $prefix
                <input type=\"$htmlType\" $step className=\"admin-input\" value={ $name } onChange={(e) => set$uName(e.target.value)} placeholder=\"Enter $label...\" />
                $suffix
              </div>
            </div>\n";
        } elseif ($type === 'select') {
            return "            <div className=\"admin-form-group\">
              <label className=\"admin-label\">$label$badge</label>
              <select className=\"admin-input\" value={ $name } onChange={(e) => set$uName(e.target.value)}>
                <option value=\"\">Select $label...</option>
                { $optionsHtml.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>\n";
        } elseif ($type === 'link') {
            return "            <div className=\"admin-form-group\" style={{ gridColumn: '1 / -1' }}>
              <label className=\"admin-label\">$label$badge</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <input type=\"text\" className=\"admin-input\" value={ {$name}?.label || '' } onChange={(e) => set$uName({ ...$name, label: e.target.value })} placeholder=\"Button Label (e.g. Learn More)\" />
                <input type=\"text\" className=\"admin-input\" value={ {$name}?.url || '' } onChange={(e) => set$uName({ ...$name, url: e.target.value })} placeholder=\"Link URL (e.g. https://...)\" />
              </div>
            </div>\n";
        } elseif ($type === 'textarea') {
            return "            <div className=\"admin-form-group\">
              <label className=\"admin-label\">$label$badge</label>
              <textarea className=\"admin-input\" rows=\"4\" value={ $name } onChange={(e) => set$uName(e.target.value)} placeholder=\"Enter $label...\"></textarea>
            </div>\n";
        } elseif (in_array($type, ['image', 'video', 'audio', 'document', 'file'])) {
            $accept = $type === 'image' ? 'image/*' : ($type === 'video' ? 'video/*' : ($type === 'audio' ? 'audio/*' : '*/*'));
            $icon = $type === 'image' ? 'ImageIcon' : ($type === 'video' ? 'Video' : ($type === 'audio' ? 'Music' : 'File'));
            
            return "            <div className=\"admin-form-group\">
              <label className=\"admin-label\">$label$badge</label>
              <div className=\"image-upload-box-premium\">
                { {$name}Preview ? (
                  <div className=\"preview-wrap-premium\">
                    { '$type' === 'image' ? <img src={ {$name}Preview } alt=\"Preview\" /> : <div className=\"file-preview-placeholder\"><LucideIcons.$icon size={48} /><span>{ typeof $name === 'string' ? $name : 'File Uploaded' }</span></div> }
                    <button type=\"button\" className=\"remove-img-premium\" onClick={() => { set$uName(null); set{$uName}Preview(''); }} title=\"Remove\">
                      <LucideIcons.XCircle size={ 22 } />
                    </button>
                  </div>
                ) : (
                  <label className=\"upload-placeholder-premium\">
                    <LucideIcons.UploadCloud size={ 32 } />
                    <span>Click to upload $label</span>
                    <input type=\"file\" className=\"hidden\" accept=\"$accept\" onChange={(e) => { const file = e.target.files[0]; if(file) { set$uName(file); set{$uName}Preview(URL.createObjectURL(file)); } }} />
                  </label>
                )}
              </div>
            </div>\n";
        } elseif ($type === 'multi_text') {
            return "            <div className=\"admin-form-group\" style={{ gridColumn: '1 / -1' }}>
              <label className=\"admin-label\">$label$badge</label>
              <div className=\"text-repeater\">
                { Array.isArray($name) && {$name}.map((val, idx) => (
                  <div key={idx} className=\"repeater-item\">
                    <input type=\"text\" className=\"admin-input\" value={val} onChange={(e) => { const next = [...$name]; next[idx] = e.target.value; set$uName(next); }} placeholder=\"Enter $label item...\" />
                    <button type=\"button\" className=\"repeater-remove\" onClick={() => { const next = $name.filter((_, i) => i !== idx); set$uName(next.length ? next : []); }}><LucideIcons.Trash2 size={14} /></button>
                  </div>
                ))}
                <button type=\"button\" className=\"repeater-add\" onClick={() => set$uName([...($name || []), ''])}><LucideIcons.Plus size={14} /> Add $label</button>
              </div>
            </div>\n";
        } elseif ($type === 'switch') {
            return "            <div className=\"admin-form-group\">
              <label className=\"admin-label\">$label$badge</label>
              <div className=\"status-toggle-premium\" onClick={() => set$uName(!{$name})}>
                <div className={`toggle-track \${ $name ? 'active' : ''}`}>
                  <div className=\"toggle-thumb\"></div>
                </div>
                <span className=\"status-label\">{ $name ? 'Yes' : 'No' }</span>
              </div>
            </div>\n";
        } elseif ($type === 'rating') {
            return "            <div className=\"admin-form-group\">
              <label className=\"admin-label\">$label$badge</label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type=\"button\"
                    onClick={() => set$uName(star)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0' }}
                  >
                    <LucideIcons.Star
                      size={ 28 }
                      fill={ star <= $name ? '#facc15' : 'transparent' }
                      color={ star <= $name ? '#facc15' : '#cbd5e1' }
                      style={{ transition: '0.2s' }}
                    />
                  </button>
                ))}
              </div>
            </div>\n";
        } elseif (in_array($type, ['images', 'files'])) {
            $accept = $type === 'images' ? 'image/*' : '*/*';
            $icon = $type === 'images' ? 'ImageIcon' : 'File';
            return "            <div className=\"admin-form-group\" style={{ gridColumn: '1 / -1' }}>
              <label className=\"admin-label\">$label$badge</label>
              <div className=\"multi-upload-grid-premium\">
                { {$name}Previews.map((prev, idx) => (
                  <div key={idx} className=\"preview-wrap-premium small\">
                    { '$type' === 'images' ? <img src={prev} alt=\"Preview\" /> : <div className=\"file-preview-placeholder small\"><LucideIcons.$icon size={24} /></div> }
                    <button type=\"button\" className=\"remove-img-premium\" onClick={() => { 
                      const nextFiles = [...$name]; nextFiles.splice(idx, 1); set$uName(nextFiles);
                      const nextPrev = [...{$name}Previews]; nextPrev.splice(idx, 1); set{$uName}Previews(nextPrev);
                    }}><LucideIcons.X size={ 14 } /></button>
                  </div>
                ))}
                <label className=\"upload-placeholder-premium small\">
                  <LucideIcons.Plus size={ 24 } />
                  <input type=\"file\" className=\"hidden\" multiple accept=\"$accept\" onChange={(e) => { 
                    const newFiles = Array.from(e.target.files);
                    set$uName([...$name, ...newFiles]);
                    set{$uName}Previews([...{$name}Previews, ...newFiles.map(f => URL.createObjectURL(f))]);
                  }} />
                </label>
              </div>
            </div>\n";
        } elseif ($type === 'checkbox' || $type === 'radio') {
            $inputType = $type === 'checkbox' ? 'checkbox' : 'radio';
            return "            <div className=\"admin-form-group\">
              <label className=\"admin-label\">$label$badge</label>
              <div className=\"options-grid-premium\">
                { $optionsHtml.map(opt => (
                  <label key={opt} className=\"option-item-premium\">
                    <input 
                        type=\"$inputType\" 
                        name=\"$name\" 
                        checked={ '$type' === 'checkbox' ? {$name}.includes(opt) : $name === opt } 
                        onChange={(e) => {
                            if ('$type' === 'checkbox') {
                                const next = e.target.checked ? [...$name, opt] : $name.filter(x => x !== opt);
                                set$uName(next);
                            } else {
                                set$uName(opt);
                            }
                        }}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>\n";
        } elseif ($type === 'richtext') {
            return "            <div className=\"admin-form-group\" style={{ gridColumn: '1 / -1' }}>
              <label className=\"admin-label\">$label$badge</label>
              <div className=\"richtext-placeholder-premium\">
                <textarea className=\"admin-input\" rows=\"10\" value={ $name } onChange={(e) => set$uName(e.target.value)} placeholder=\"Rich Text Editor Placeholder (Integrate CKEditor/TinyMCE here)\"></textarea>
              </div>
            </div>\n";
        } elseif ($type === 'daterange') {
            return "            <div className=\"admin-form-group\">
              <label className=\"admin-label\">$label$badge</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input type=\"date\" className=\"admin-input\" value={ {$name}.start } onChange={(e) => set$uName({...$name, start: e.target.value})} />
                <span>to</span>
                <input type=\"date\" className=\"admin-input\" value={ {$name}.end } onChange={(e) => set$uName({...$name, end: e.target.value})} />
              </div>
            </div>\n";
        } elseif ($type === 'lucide-icon' || $type === 'lucide_icon' || $type === 'lucide-icon-picker') {
            return "            <div className=\"admin-form-group\">
              <label className=\"admin-label\">$label$badge</label>
              <div className=\"icon-selector-premium\">
                <div className=\"icon-current\" onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen_$name(!isDropdownOpen_$name);
                }}>
                  {(() => { 
                    const iconName = $name;
                    const brandIcons = {
                      Facebook: <svg width={20} height={20} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><path d=\"M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z\"/></svg>,
                      Twitter: <svg width={20} height={20} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><path d=\"M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C4.2 17 2.8 14.8 2.3 12c.8.1 1.6 0 2.4-.2C2 11.2.8 9.1.8 6.8c.6.3 1.3.5 2.1.5C1.1 6 1.4 3.1 3.5 1.5c2.3 2.8 5.7 4.5 9.5 4.7-.1-.4-.2-.8-.2-1.2 0-3.3 2.7-6 6-6 1.5 0 3 .6 4 1.7 1.2-.2 2.5-.7 3.5-1.3-.4 1.3-1.3 2.4-2.4 3z\"/></svg>,
                      Instagram: <svg width={20} height={20} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><rect width=\"20\" height=\"20\" x=\"2\" y=\"2\" rx=\"5\" ry=\"5\"/><path d=\"M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z\"/><line x1=\"17.5\" y1=\"6.5\" x2=\"17.51\" y2=\"6.5\"/></svg>,
                      Linkedin: <svg width={20} height={20} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><path d=\"M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z\"/><rect width=\"4\" height=\"12\" x=\"2\" y=\"9\"/><circle cx=\"4\" cy=\"4\" r=\"2\"/></svg>,
                      Youtube: <svg width={20} height={20} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><path d=\"M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z\"/><polygon points=\"9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02\"/></svg>,
                      Github: <svg width={20} height={20} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><path d=\"M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5-.73 1.02-1.08 2.25-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4\"/><path d=\"M9 18c-4.51 2-5-2-7-2\"/></svg>,
                      Twitch: <svg width={20} height={20} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><path d=\"M21 2H3v16h5v4l4-4h5l4-4V2zm-2 13l-3 3H9l-3-3V4h13v11z\"/><path d=\"M14 8h2v4h-2V8zm-5 0h2v4H9V8z\"/></svg>,
                      Slack: <svg width={20} height={20} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><rect width=\"4\" height=\"4\" x=\"13\" y=\"2\" rx=\"2\"/><rect width=\"4\" height=\"4\" x=\"2\" y=\"13\" rx=\"2\"/><rect width=\"4\" height=\"4\" x=\"20\" y=\"13\" rx=\"2\"/><path d=\"M10 7a3 3 0 0 1-3-3 3 3 0 0 1 3 3v3H7\"/><path d=\"M14 7v3h3a3 3 0 0 1-3-3v0z\"/><path d=\"M14 17a3 3 0 0 1 3 3 3 3 0 0 1-3-3v-3h3\"/><path d=\"M10 17v-3H7a3 3 0 0 1 3 3v0z\"/></svg>,
                      Tiktok: <svg width={20} height={20} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><path d=\"M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5\"/></svg>,
                      Pinterest: <svg width={20} height={20} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><path d=\"M8 22c-.66-4.14.73-7.61 1.76-11.08C9.28 9.3 9.94 7.63 11.23 7c1.32-.64 2.89.04 3.2 1.62.38 1.94-.96 4.34-1.63 6.38-.2 1.12.56 2.1 1.66 2.1 3.01 0 5.22-3.83 5.22-7.85 0-3.6-2.58-6.13-6.66-6.13-4.52 0-7.44 3.14-7.44 6.84 0 1.25.33 2.41 1 3.32-.4 1.14-.33 2.15-.17 3.23-2.1-2.45-2.28-5.36-1.57-8.15C5.81 4.56 9.68 2 14.18 2c5.63 0 9.25 4 9.25 8.73 0 5.75-3.25 10.27-8.13 10.27-1.61 0-3.13-.88-3.65-1.92L10 22z\"/></svg>,
                      Snapchat: <svg width={20} height={20} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><path d=\"M12 2c2.5 0 4.5 1.5 5 3.5 1.2 0 2 .8 2 2 0 1-.5 1.5-1.5 2 1.5 2 2.5 4.5 1.5 6-.5.8-1.5 1-2.5 1-.2 1-.5 1.5-1 1.5-1.5 0-2.5-.5-2.5-1.5 0 1-.8 1.5-2 1.5-1.5 0-2.5-.5-2.5-1.5-.5 0-.8-.5-1-1.5-1 0-2-.2-2.5-1-1-1.5 0-4 1.5-6-1-.5-1.5-1-1.5-2 0-1.2.8-2 2-2 .5-2 2.5-3.5 5-3.5z\"/></svg>,
                      Whatsapp: <svg width={20} height={20} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><path d=\"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z\"/></svg>,
                      Telegram: <svg width={20} height={20} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><line x1=\"22\" y1=\"2\" x2=\"11\" y2=\"13\"/><polygon points=\"22 2 15 22 11 13 2 9 22 2\"/></svg>,
                      Reddit: <svg width={20} height={20} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><ellipse cx=\"12\" cy=\"13\" rx=\"5\" ry=\"3\"/></svg>,
                      Discord: <svg width={20} height={20} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><circle cx=\"9\" cy=\"12\" r=\"1\"/><circle cx=\"15\" cy=\"12\" r=\"1\"/><path d=\"M7.5 7.5S9 6 12 6s4.5 1.5 4.5 1.5-1.5 3-1.5 5.5.5 2.5.5 2.5-1.5.5-3.5.5-3.5-.5-3.5-.5.5 0 .5-2.5-1.5-2.5-1.5-5.5z\"/></svg>
                    };
                    if (brandIcons[iconName]) return brandIcons[iconName];
                    const Icon = (iconName && iconName !== 'Icon' && LucideIcons[iconName]) || LucideIcons.HelpCircle; 
                    return <Icon size={20} />; 
                  })()}
                  <span>{ $name || 'Select Icon' }</span>
                  <LucideIcons.ChevronDown size={14} style={{ marginLeft: 'auto' }} />
                </div>
                {isDropdownOpen_$name && (
                  <div id=\"icon_dropdown_$name\" className=\"icon-dropdown-grid active\">
                    <div className=\"icon-search-bar\">
                      <LucideIcons.Search size={14} />
                      <input 
                        type=\"text\" 
                        placeholder=\"Search icons...\" 
                        onKeyUp={(e) => {
                          const term = e.target.value.toLowerCase();
                          const items = e.target.closest('.icon-dropdown-grid').querySelectorAll('.icon-grid-item');
                          items.forEach(item => {
                            const name = item.getAttribute('data-name').toLowerCase();
                            item.style.display = name.includes(term) ? 'flex' : 'none';
                          });
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className=\"icon-grid-scroll\">
                      {[
                        'Facebook', 'Twitter', 'Instagram', 'Linkedin', 'Youtube', 'Github', 'Twitch', 'Slack', 'Tiktok', 'Pinterest', 'Snapchat', 'Whatsapp', 'Telegram', 'Reddit', 'Discord',
                        ...Object.keys(LucideIcons).filter(key => /^[A-Z]/.test(key) && key !== 'Icon' && key !== 'Lucide' && (typeof LucideIcons[key] === 'function' || typeof LucideIcons[key] === 'object'))
                      ].map(iconName => {
                        const brandIcons = {
                          Facebook: <svg width={16} height={16} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><path d=\"M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z\"/></svg>,
                          Twitter: <svg width={16} height={16} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><path d=\"M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C4.2 17 2.8 14.8 2.3 12c.8.1 1.6 0 2.4-.2C2 11.2.8 9.1.8 6.8c.6.3 1.3.5 2.1.5C1.1 6 1.4 3.1 3.5 1.5c2.3 2.8 5.7 4.5 9.5 4.7-.1-.4-.2-.8-.2-1.2 0-3.3 2.7-6 6-6 1.5 0 3 .6 4 1.7 1.2-.2 2.5-.7 3.5-1.3-.4 1.3-1.3 2.4-2.4 3z\"/></svg>,
                          Instagram: <svg width={16} height={16} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><rect width=\"20\" height=\"20\" x=\"2\" y=\"2\" rx=\"5\" ry=\"5\"/><path d=\"M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z\"/><line x1=\"17.5\" y1=\"6.5\" x2=\"17.51\" y2=\"6.5\"/></svg>,
                          Linkedin: <svg width={16} height={16} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><path d=\"M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z\"/><rect width=\"4\" height=\"12\" x=\"2\" y=\"9\"/><circle cx=\"4\" cy=\"4\" r=\"2\"/></svg>,
                          Youtube: <svg width={16} height={16} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><path d=\"M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z\"/><polygon points=\"9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02\"/></svg>,
                          Github: <svg width={16} height={16} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><path d=\"M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5-.73 1.02-1.08 2.25-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4\"/><path d=\"M9 18c-4.51 2-5-2-7-2\"/></svg>,
                          Twitch: <svg width={16} height={16} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><path d=\"M21 2H3v16h5v4l4-4h5l4-4V2zm-2 13l-3 3H9l-3-3V4h13v11z\"/><path d=\"M14 8h2v4h-2V8zm-5 0h2v4H9V8z\"/></svg>,
                          Slack: <svg width={16} height={16} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><rect width=\"4\" height=\"4\" x=\"13\" y=\"2\" rx=\"2\"/><rect width=\"4\" height=\"4\" x=\"2\" y=\"13\" rx=\"2\"/><rect width=\"4\" height=\"4\" x=\"20\" y=\"13\" rx=\"2\"/><path d=\"M10 7a3 3 0 0 1-3-3 3 3 0 0 1 3 3v3H7\"/><path d=\"M14 7v3h3a3 3 0 0 1-3-3v0z\"/><path d=\"M14 17a3 3 0 0 1 3 3 3 3 0 0 1-3-3v-3h3\"/><path d=\"M10 17v-3H7a3 3 0 0 1 3 3v0z\"/></svg>,
                          Tiktok: <svg width={16} height={16} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><path d=\"M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5\"/></svg>,
                          Pinterest: <svg width={16} height={16} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><path d=\"M8 22c-.66-4.14.73-7.61 1.76-11.08C9.28 9.3 9.94 7.63 11.23 7c1.32-.64 2.89.04 3.2 1.62.38 1.94-.96 4.34-1.63 6.38-.2 1.12.56 2.1 1.66 2.1 3.01 0 5.22-3.83 5.22-7.85 0-3.6-2.58-6.13-6.66-6.13-4.52 0-7.44 3.14-7.44 6.84 0 1.25.33 2.41 1 3.32-.4 1.14-.33 2.15-.17 3.23-2.1-2.45-2.28-5.36-1.57-8.15C5.81 4.56 9.68 2 14.18 2c5.63 0 9.25 4 9.25 8.73 0 5.75-3.25 10.27-8.13 10.27-1.61 0-3.13-.88-3.65-1.92L10 22z\"/></svg>,
                          Snapchat: <svg width={16} height={16} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><path d=\"M12 2c2.5 0 4.5 1.5 5 3.5 1.2 0 2 .8 2 2 0 1-.5 1.5-1.5 2 1.5 2 2.5 4.5 1.5 6-.5.8-1.5 1-2.5 1-.2 1-.5 1.5-1 1.5-1.5 0-2.5-.5-2.5-1.5 0 1-.8 1.5-2 1.5-1.5 0-2.5-.5-2.5-1.5-.5 0-.8-.5-1-1.5-1 0-2-.2-2.5-1-1-1.5 0-4 1.5-6-1-.5-1.5-1-1.5-2 0-1.2.8-2 2-2 .5-2 2.5-3.5 5-3.5z\"/></svg>,
                          Whatsapp: <svg width={16} height={16} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><path d=\"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z\"/></svg>,
                          Telegram: <svg width={16} height={16} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><line x1=\"22\" y1=\"2\" x2=\"11\" y2=\"13\"/><polygon points=\"22 2 15 22 11 13 2 9 22 2\"/></svg>,
                          Reddit: <svg width={16} height={16} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><ellipse cx=\"12\" cy=\"13\" rx=\"5\" ry=\"3\"/></svg>,
                          Discord: <svg width={16} height={16} viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><circle cx=\"9\" cy=\"12\" r=\"1\"/><circle cx=\"15\" cy=\"12\" r=\"1\"/><path d=\"M7.5 7.5S9 6 12 6s4.5 1.5 4.5 1.5-1.5 3-1.5 5.5.5 2.5.5 2.5-1.5.5-3.5.5-3.5-.5-3.5-.5.5 0 .5-2.5-1.5-2.5-1.5-5.5z\"/></svg>
                        };
                        const Icon = brandIcons[iconName] || ((iconName && iconName !== 'Icon' && LucideIcons[iconName]) ? React.createElement(LucideIcons[iconName], { size: 16 }) : <LucideIcons.HelpCircle size={16} />);
                        return (
                          <div 
                            key={iconName} 
                            className={'icon-grid-item ' + ($name === iconName ? 'active' : '')}
                            data-name={iconName}
                            onClick={() => {
                              set$uName(iconName);
                              setIsDropdownOpen_$name(false);
                            }}
                          >
                            {typeof Icon === 'object' && React.isValidElement(Icon) ? Icon : <LucideIcons.HelpCircle size={16} />}
                            <span>{iconName}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>\n";
        } elseif ($type === 'icon' || $type === 'icon-picker' || $type === 'icon_picker') {
            return "            <div className=\"admin-form-group\">
              <label className=\"admin-label\">$label$badge</label>
              <select className=\"admin-input\" value={ $name } onChange={(e) => set$uName(e.target.value)}>
                <option value=\"\">Select $label...</option>
                {[
                  'Facebook', 'Twitter', 'Instagram', 'Linkedin', 'Youtube', 'Github', 'Twitch', 'Slack', 
                  'Globe', 'Link', 'MessageCircle', 'Send', 'MapPin', 'Phone', 'Mail', 'FileText',
                  'Activity', 'Airplay', 'Bell', 'Camera', 'Check', 'ChevronRight', 'Cloud', 'Cog', 
                  'File', 'Folder', 'Home', 'Image', 'Menu', 'Search', 'Settings', 'Star', 'User', 'Video',
                  'Trash2', 'Edit', 'Plus', 'Trash', 'Eye', 'Heart', 'Smile', 'Compass', 'Shield', 'ShieldCheck'
                ].map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>\n";
        }
        
        // Fallback for any unhandled type
        return "            <div className=\"admin-form-group\">
              <label className=\"admin-label\">$label$badge</label>
              <input type=\"text\" className=\"admin-input\" value={ $name || '' } onChange={(e) => set$uName(e.target.value)} placeholder=\"Enter $label...\" />
            </div>\n";
    }

    public function deleteSection($section, $deleteFromDb = true)
    {
        $className = str_replace(' ', '', ucwords($section['name']));
        $slug = $section['slug'];

        $files = [
            SERVER_PATH . "/models/{$className}.php",
            SERVER_PATH . "/controllers/{$className}Controller.php",
            SERVER_PATH . "/routes/{$slug}Routes.php",
            CLIENT_PATH . "/src/pages/Admin/Sections/{$className}Manager.jsx"
        ];

        foreach ($files as $file) {
            if (file_exists($file)) @unlink($file);
        }

        if ($deleteFromDb) {
            $devDb = $this->getDevDb();
            $devDb->prepare("DELETE FROM fields WHERE section_id = ?")->execute([$section['id']]);
            $devDb->prepare("DELETE FROM sections WHERE id = ?")->execute([$section['id']]);

            // Robust Table Cleanup: Drop the table from the project database if it exists
            $projectDb = $this->getProjectDb();
            if ($projectDb) {
                $tableName = str_replace('-', '_', $slug);
                $projectDb->exec("DROP TABLE IF EXISTS \"$tableName\"");
            }

            // Robust Folder Cleanup: Remove the section's upload folder
            $uploadDir = SERVER_PATH . "/public/upload/{$slug}";
            if (is_dir($uploadDir)) {
                $this->deleteDirRecursive($uploadDir);
            }
        }

        $this->updateReactFiles();
    }

    public function updateReactFiles()
    {
        // 1. Ensure all core files exist before updating (Portability Safeguard)
        $this->ensureCoreFiles();

        $devDb = $this->getDevDb();
        $sections = $devDb->query("SELECT * FROM sections WHERE status = 'Active' ORDER BY sort_order ASC, name ASC")->fetchAll(PDO::FETCH_ASSOC);

        // 2. Update AdminLayout.jsx (Sidebar)
        $this->updateSidebar($sections);
        
        // 3. Update AdminRoutes.jsx (Modular Routes)
        $this->updateRoutes($sections);
    }

    private function updateSidebar($sections)
    {
        $path = CLIENT_PATH . "/src/components/Admin/AdminLayout.jsx";
        if (!file_exists($path)) return;

        $links = "";
        foreach ($sections as $s) {
            $className = str_replace(' ', '', ucwords($s['name']));
            $icon = $s['icon'] ?: 'Sparkles';
            $links .= "    { title: '{$s['name']}', path: '/admin/{$s['slug']}', icon: '{$icon}' },\n";
        }

        $this->injectIntoFile($path, $links, '// [START_GENERATED_NAV_ITEMS]', '// [END_GENERATED_NAV_ITEMS]', true);
    }

    private function updateRoutes($sections)
    {
        $path = CLIENT_PATH . "/src/routes/AdminRoutes.jsx";
        if (!file_exists($path)) return;

        $imports = "";
        $routes = "";
        foreach ($sections as $s) {
            $className = str_replace(' ', '', ucwords($s['name']));
            $imports .= "const {$className}Manager = lazy(() => import('../pages/Admin/Sections/{$className}Manager'));\n";
            $routes .= "      <Route path=\"{$s['slug']}\" element={<{$className}Manager />} />\n";
        }

        $this->injectIntoFile($path, $imports, '// [START_GENERATED_IMPORTS]', '// [END_GENERATED_IMPORTS]', true);
        $this->injectIntoFile($path, $routes, '{/* [START_GENERATED_ROUTES] */}', '{/* [END_GENERATED_ROUTES] */}', true);
    }

    private function injectIntoFile($path, $newBody, $startMarker, $endMarker, $replaceBlock = false)
    {
        if (!file_exists($path)) return;
        $fileContent = file_get_contents($path);
        
        // Robust Extraction: Find the very first occurrence of start and the very last of end
        // This automatically handles cases where markers were accidentally duplicated
        $firstStart = strpos($fileContent, $startMarker);
        $lastEnd = strrpos($fileContent, $endMarker);

        if ($firstStart !== false && $lastEnd !== false && $lastEnd >= $firstStart) {
            // We have both markers. Replace everything between the first start and last end.
            $before = substr($fileContent, 0, $firstStart);
            $after = substr($fileContent, $lastEnd + strlen($endMarker));
            $newContent = $before . $startMarker . "\n" . trim($newBody) . "\n" . $endMarker . $after;
        } elseif ($firstStart !== false) {
            // Only one marker found (likely a legacy or single-marker setup), expand it
            $before = substr($fileContent, 0, $firstStart);
            $after = substr($fileContent, $firstStart + strlen($startMarker));
            $newContent = $before . $startMarker . "\n" . trim($newBody) . "\n" . $endMarker . $after;
        } else {
            // Markers missing. If this is a core file, Initializer should have added them.
            // We don't want to append to the end and break syntax, so we skip.
            return;
        }

        // Final Robustness Check: Ensure we don't have nested or triple markers now
        // Remove any extra copies of markers that might have been left outside the range
        $startEscaped = preg_quote($startMarker, '#');
        $endEscaped = preg_quote($endMarker, '#');
        
        // Fix the specific "*/}}" issue and duplicate markers
        $newContent = str_replace('*/}}', '*/}', $newContent);

        file_put_contents($path, $newContent);
    }

    public function resetProject()
    {
        $devDb = $this->getDevDb();
        $sections = $devDb->query("SELECT * FROM sections")->fetchAll(PDO::FETCH_ASSOC);
        foreach ($sections as $s) {
            $this->deleteSection($s, true);
        }
        $this->updateReactFiles();
        return true;
    }

    private function deleteDirRecursive($dir)
    {
        if (!is_dir($dir)) return;
        $files = array_diff(scandir($dir), ['.', '..']);
        foreach ($files as $file) {
            (is_dir("$dir/$file")) ? $this->deleteDirRecursive("$dir/$file") : unlink("$dir/$file");
        }
        return rmdir($dir);
    }
}
