<?php

require_once __DIR__ . "/../models/AppointmentSubmission.php";
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../helpers/response.php";
require_once __DIR__ . "/../helpers/MailHelper.php";

class AppointmentSubmissionController
{
    private $db;
    private $model;

    public function __construct()
    {
        $this->db = Database::connect();
        $this->model = new AppointmentSubmission($this->db);
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
            jsonResponse(["error" => "AppointmentSubmission not found"], 404);
        }
    }

    public function create()
    {
        try {
            $data = $_POST;
            if (empty($data)) {
                $data = json_decode(file_get_contents("php://input"), true) ?? [];
            }
            unset($data['_method']);

            if ($this->model->create($data)) {
                $email = $data['email'] ?? $data['femail'] ?? $data['femail_'] ?? '';
                if (!empty($email)) {
                    try {
                        $name = $data['name'] ?? $data['fname'] ?? $data['fname_'] ?? 'Valued Customer';
                        MailHelper::sendThankYouEmail($email, $name);
                    } catch (Exception $mailEx) {
                        error_log("Mail sending failed for appointment: " . $mailEx->getMessage());
                    }
                }
                jsonResponse(["message" => "Appointment request submitted successfully"]);
            } else {
                jsonResponse(["error" => "Failed to submit appointment request"], 500);
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
                jsonResponse(["error" => "AppointmentSubmission not found"], 404);
            }

            $data = $_POST;
            if (empty($data)) {
                $data = json_decode(file_get_contents("php://input"), true) ?? [];
            }
            unset($data['_method']);

            if ($this->model->update($id, $data)) {
                jsonResponse(["message" => "AppointmentSubmission updated successfully"]);
            } else {
                jsonResponse(["error" => "Failed to update AppointmentSubmission"], 500);
            }
        } catch (Exception $e) {
            jsonResponse(["error" => $e->getMessage()], 500);
        }
    }

    public function delete($id)
    {
        $item = $this->model->getById($id);
        if (!$item) {
            jsonResponse(["error" => "AppointmentSubmission not found"], 404);
            return;
        }

        if ($this->model->delete($id)) {
            jsonResponse(["message" => "AppointmentSubmission deleted successfully"]);
        } else {
            jsonResponse(["error" => "Failed to delete AppointmentSubmission"], 500);
        }
    }
}
