<?php
require_once __DIR__ . "/../controllers/AppointmentSubmissionController.php";

$appointmentSubmissionController = new AppointmentSubmissionController();

global $router;

$router->get('/appointment_submissions', [$appointmentSubmissionController, 'getAll']);
$router->get('/appointment_submissions/{id}', [$appointmentSubmissionController, 'getOne']);
$router->post('/appointment_submissions', [$appointmentSubmissionController, 'create']);
$router->put('/appointment_submissions/{id}', [$appointmentSubmissionController, 'update']);
$router->delete('/appointment_submissions/{id}', [$appointmentSubmissionController, 'delete']);
