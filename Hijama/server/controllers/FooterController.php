<?php

require_once __DIR__ . "/../models/Footer.php";
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../helpers/response.php";
require_once __DIR__ . "/../helpers/FileHelper.php";

class FooterController
{
    private $db;
    private $model;

    public function __construct()
    {
        $this->db = Database::connect();
        $this->model = new Footer($this->db);
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
            jsonResponse(["error" => "Footer not found"], 404);
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
            
        if (isset($_FILES['logo']) && $_FILES['logo']['error'] === UPLOAD_ERR_OK) {
            $data['logo'] = FileHelper::upload($_FILES['logo'], 'footer');
        }

            if ($this->model->create($data)) {
                jsonResponse(["message" => "Footer created successfully"]);
            } else {
                jsonResponse(["error" => "Failed to create Footer"], 500);
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
                jsonResponse(["error" => "Footer not found"], 404);
            }

            // Handle both JSON and FormData
            $data = $_POST;
            if (empty($data)) {
                $data = json_decode(file_get_contents("php://input"), true) ?? [];
            }
            
            // Clean up internal fields
            unset($data['_method']);
            
        if (isset($_FILES['logo']) && $_FILES['logo']['error'] === UPLOAD_ERR_OK) {
            $data['logo'] = FileHelper::upload($_FILES['logo'], 'footer');
        }

            if ($this->model->update($id, $data)) {
                jsonResponse(["message" => "Footer updated successfully"]);
            } else {
                jsonResponse(["error" => "Failed to update Footer"], 500);
            }
        } catch (Exception $e) {
            jsonResponse(["error" => $e->getMessage()], 500);
        }
    }

    public function delete($id)
    {
        $item = $this->model->getById($id);
        if (!$item) {
            jsonResponse(["error" => "Footer not found"], 404);
            return;
        }

        if (!empty($item['logo'])) FileHelper::delete($item['logo']);

        if ($this->model->delete($id)) {
            jsonResponse(["message" => "Footer deleted successfully"]);
        } else {
            jsonResponse(["error" => "Failed to delete Footer"], 500);
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
