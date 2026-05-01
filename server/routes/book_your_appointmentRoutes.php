<?php

require_once __DIR__ . "/../controllers/BookYourAppointmentController.php";

$bookYourAppointmentController = new BookYourAppointmentController();

global $router;

$router->get('/book_your_appointment', [$bookYourAppointmentController, 'getAll']);
$router->get('/book_your_appointment/active', [$bookYourAppointmentController, 'getActive']);
$router->get('/book_your_appointment/{id}', [$bookYourAppointmentController, 'getOne']);
$router->post('/book_your_appointment', [$bookYourAppointmentController, 'create']);
$router->put('/book_your_appointment/{id}', [$bookYourAppointmentController, 'update']);
$router->delete('/book_your_appointment/{id}', [$bookYourAppointmentController, 'delete']);
$router->post('/book_your_appointment/reorder', [$bookYourAppointmentController, 'reorder']);
