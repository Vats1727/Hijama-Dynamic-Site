<?php

class {{CLASS_NAME}}
{
    private $conn;
    private $table = "{{TABLE_NAME}}";

    public $id;
{{PROPERTIES}}

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function createTable()
    {
        $query = "CREATE TABLE IF NOT EXISTS \"$this->table\" (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
{{TABLE_COLUMNS}},
            status TEXT DEFAULT 'Active',
            sort_order INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )";

        $this->conn->exec($query);
    }

    public function getAll()
    {
        $stmt = $this->conn->prepare("SELECT * FROM \"$this->table\" ORDER BY sort_order ASC, id ASC");
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return array_map([$this, 'decodeRow'], $rows);
    }

    public function getById($id)
    {
        $stmt = $this->conn->prepare("SELECT * FROM \"$this->table\" WHERE id = :id LIMIT 1");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? $this->decodeRow($row) : false;
    }

    public function getActive()
    {
        $stmt = $this->conn->prepare("SELECT * FROM \"$this->table\" WHERE status = 'Active' ORDER BY sort_order ASC, id ASC");
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return array_map([$this, 'decodeRow'], $rows);
    }

    public function create()
    {
        $query = "INSERT INTO \"$this->table\" ({{INSERT_COLUMNS}}, status)
            VALUES ({{INSERT_VALUES}}, :status)";

        $stmt = $this->conn->prepare($query);
{{BIND_PARAMS}}
        $stmt->bindParam(':status', $this->status);
        return $stmt->execute();
    }

    public function update($id)
    {
        $query = "UPDATE \"$this->table\" SET {{UPDATE_SET}}, status = :status WHERE id = :id";

        $stmt = $this->conn->prepare($query);
{{BIND_PARAMS}}
        $stmt->bindParam(':status', $this->status);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function delete($id)
    {
        $stmt = $this->conn->prepare("DELETE FROM \"$this->table\" WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function updateOrder($order)
    {
        try {
            $stmt = $this->conn->prepare("UPDATE \"$this->table\" SET sort_order = ? WHERE id = ?");
            foreach ($order as $index => $id) {
                $stmt->execute([$index, $id]);
            }
            return true;
        } catch (Exception $e) {
            return false;
        }
    }

    private function decodeRow($row)
    {
{{DECODE_JSON}}
        return $row;
    }
}
