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
        $database = new Database();
        $this->db = $database->connect();
        $this->model = new {{CLASS_NAME}}($this->db);
        $this->model->createTable();
    }

    public function getAll()
    {
        $data = $this->model->getAll();
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

    public function getActive()
    {
        $data = $this->model->getActive();
        jsonResponse($data);
    }

    public function create()
    {
        try {
            $input = json_decode(file_get_contents("php://input"), true);
            if (!$input) {
                jsonResponse(["error" => "Invalid JSON input"], 400);
            }

{{CONTROLLER_CREATE_LOGIC}}

            if ($this->model->create()) {
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
            $input = json_decode(file_get_contents("php://input"), true);
            if (!$input) {
                jsonResponse(["error" => "Invalid JSON input"], 400);
            }

            $existing = $this->model->getById($id);
            if (!$existing) {
                jsonResponse(["error" => "{{CLASS_NAME}} not found"], 404);
            }

{{CONTROLLER_UPDATE_LOGIC}}

            if ($this->model->update($id)) {
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
        $existing = $this->model->getById($id);
        if (!$existing) {
            jsonResponse(["error" => "{{CLASS_NAME}} not found"], 404);
            return;
        }

{{CONTROLLER_DELETE_IMAGE_LOGIC}}

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
            if (!$input || !isset($input['order'])) {
                jsonResponse(["error" => "Invalid order data"], 400);
            }
            if ($this->model->updateOrder($input['order'])) {
                jsonResponse(["message" => "Order updated successfully"]);
            } else {
                jsonResponse(["error" => "Failed to update order"], 500);
            }
        } catch (Exception $e) {
            jsonResponse(["error" => $e->getMessage()], 500);
        }
    }
}
