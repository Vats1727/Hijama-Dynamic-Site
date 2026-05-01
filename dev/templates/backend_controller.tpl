<?php

require_once __DIR__ . "/../models/{{CLASS_NAME}}.php";
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../helpers/response.php";
require_once __DIR__ . "/../helpers/FileHelper.php";

class {{CLASS_NAME}}Controller
{
    private $db;
    private $model;

    public function __construct()
    {
        $this->db = Database::connect();
        $this->model = new {{CLASS_NAME}}($this->db);
    }

    public function getAll()
    {
        $data = $this->model->getAll();
        jsonResponse($data);
    }

    public function getActive()
    {
        $data = $this->model->getActive();
        jsonResponse($data);
    }

    public function getOne($id)
    {
        $item = $this->model->getById($id);
        if ($item) {
            jsonResponse($item);
        } else {
            jsonResponse(["error" => "{{CLASS_NAME}} not found"], 404);
        }
    }

    public function create()
    {
        try {
            // Handle both JSON and FormData
            $data = $_POST;
            if (empty($data)) {
                $data = json_decode(file_get_contents("php://input"), true) ?? [];
            }
            
            // Clean up internal fields
            unset($data['_method']);
            
{{PROCESS_FILES}}

            if ($this->model->create($data)) {
                jsonResponse(["message" => "{{CLASS_NAME}} created successfully"]);
            } else {
                jsonResponse(["error" => "Failed to create {{CLASS_NAME}}"], 500);
            }
        } catch (Exception $e) {
            jsonResponse(["error" => $e->getMessage()], 500);
        }
    }

    public function update($id)
    {
        try {
            $existing = $this->model->getById($id);
            if (!$existing) {
                jsonResponse(["error" => "{{CLASS_NAME}} not found"], 404);
            }

            // Handle both JSON and FormData
            $data = $_POST;
            if (empty($data)) {
                $data = json_decode(file_get_contents("php://input"), true) ?? [];
            }
            
            // Clean up internal fields
            unset($data['_method']);
            
{{PROCESS_FILES}}

            if ($this->model->update($id, $data)) {
                jsonResponse(["message" => "{{CLASS_NAME}} updated successfully"]);
            } else {
                jsonResponse(["error" => "Failed to update {{CLASS_NAME}}"], 500);
            }
        } catch (Exception $e) {
            jsonResponse(["error" => $e->getMessage()], 500);
        }
    }

    public function delete($id)
    {
        $item = $this->model->getById($id);
        if (!$item) {
            jsonResponse(["error" => "{{CLASS_NAME}} not found"], 404);
            return;
        }

{{PROCESS_DELETE_FILES}}

        if ($this->model->delete($id)) {
            jsonResponse(["message" => "{{CLASS_NAME}} deleted successfully"]);
        } else {
            jsonResponse(["error" => "Failed to delete {{CLASS_NAME}}"], 500);
        }
    }

    public function reorder()
    {
        try {
            $input = json_decode(file_get_contents("php://input"), true);
            $ids = $input['order'] ?? [];
            if ($this->model->reorder($ids)) {
                jsonResponse(["message" => "Order updated"]);
            } else {
                jsonResponse(["error" => "Failed to reorder"], 500);
            }
        } catch (Exception $e) {
            jsonResponse(["error" => $e->getMessage()], 500);
        }
    }
}
