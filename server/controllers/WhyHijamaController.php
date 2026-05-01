<?php

require_once __DIR__ . "/../models/WhyHijama.php";
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../helpers/response.php";
require_once __DIR__ . "/../helpers/FileHelper.php";

class WhyHijamaController
{
    private $db;
    private $model;

    public function __construct()
    {
        $this->db = Database::connect();
        $this->model = new WhyHijama($this->db);
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
            jsonResponse(["error" => "WhyHijama not found"], 404);
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
            


            if ($this->model->create($data)) {
                jsonResponse(["message" => "WhyHijama created successfully"]);
            } else {
                jsonResponse(["error" => "Failed to create WhyHijama"], 500);
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
                jsonResponse(["error" => "WhyHijama not found"], 404);
            }

            // Handle both JSON and FormData
            $data = $_POST;
            if (empty($data)) {
                $data = json_decode(file_get_contents("php://input"), true) ?? [];
            }
            
            // Clean up internal fields
            unset($data['_method']);
            


            if ($this->model->update($id, $data)) {
                jsonResponse(["message" => "WhyHijama updated successfully"]);
            } else {
                jsonResponse(["error" => "Failed to update WhyHijama"], 500);
            }
        } catch (Exception $e) {
            jsonResponse(["error" => $e->getMessage()], 500);
        }
    }

    public function delete($id)
    {
        $item = $this->model->getById($id);
        if (!$item) {
            jsonResponse(["error" => "WhyHijama not found"], 404);
            return;
        }



        if ($this->model->delete($id)) {
            jsonResponse(["message" => "WhyHijama deleted successfully"]);
        } else {
            jsonResponse(["error" => "Failed to delete WhyHijama"], 500);
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
