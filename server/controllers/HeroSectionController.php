<?php

require_once __DIR__ . "/../models/HeroSection.php";
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../helpers/response.php";
require_once __DIR__ . "/../helpers/FileHelper.php";

class HeroSectionController
{
    private $db;
    private $model;

    public function __construct()
    {
        $this->db = Database::connect();
        $this->model = new HeroSection($this->db);
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
            jsonResponse(["error" => "HeroSection not found"], 404);
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
            
        if (isset($_FILES['background_image_']) && $_FILES['background_image_']['error'] === UPLOAD_ERR_OK) {
            $data['background_image_'] = FileHelper::upload($_FILES['background_image_'], 'hero_section');
        }

            if ($this->model->create($data)) {
                jsonResponse(["message" => "HeroSection created successfully"]);
            } else {
                jsonResponse(["error" => "Failed to create HeroSection"], 500);
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
                jsonResponse(["error" => "HeroSection not found"], 404);
            }

            // Handle both JSON and FormData
            $data = $_POST;
            if (empty($data)) {
                $data = json_decode(file_get_contents("php://input"), true) ?? [];
            }
            
            // Clean up internal fields
            unset($data['_method']);
            
        if (isset($_FILES['background_image_']) && $_FILES['background_image_']['error'] === UPLOAD_ERR_OK) {
            $data['background_image_'] = FileHelper::upload($_FILES['background_image_'], 'hero_section');
        }

            if ($this->model->update($id, $data)) {
                jsonResponse(["message" => "HeroSection updated successfully"]);
            } else {
                jsonResponse(["error" => "Failed to update HeroSection"], 500);
            }
        } catch (Exception $e) {
            jsonResponse(["error" => $e->getMessage()], 500);
        }
    }

    public function delete($id)
    {
        $item = $this->model->getById($id);
        if (!$item) {
            jsonResponse(["error" => "HeroSection not found"], 404);
            return;
        }

        if (!empty($item['background_image_'])) FileHelper::delete($item['background_image_']);

        if ($this->model->delete($id)) {
            jsonResponse(["message" => "HeroSection deleted successfully"]);
        } else {
            jsonResponse(["error" => "Failed to delete HeroSection"], 500);
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

    public function removeImage($id)
    {
        try {
            $existing = $this->model->getById($id);
            if (!$existing) {
                jsonResponse(["error" => "HeroSection not found"], 404);
                return;
            }
            if (!empty($existing['background_image_'])) {
                FileHelper::delete($existing['background_image_']);
            }
            if ($this->model->update($id, ['background_image_' => ''])) {
                jsonResponse(["message" => "Image deleted permanently"]);
            } else {
                jsonResponse(["error" => "Failed to update database"], 500);
            }
        } catch (Exception $e) {
            jsonResponse(["error" => $e->getMessage()], 500);
        }
    }
}
