<?php

require_once __DIR__ . "/../controllers/DoctorsSectionController.php";

$doctorsSectionController = new DoctorsSectionController();

global $router;

$router->get('/doctors_section', [$doctorsSectionController, 'getAll']);
$router->get('/doctors_section/active', [$doctorsSectionController, 'getActive']);
$router->get('/doctors_section/{id}', [$doctorsSectionController, 'getOne']);
$router->post('/doctors_section', [$doctorsSectionController, 'create']);
$router->put('/doctors_section/{id}', [$doctorsSectionController, 'update']);
$router->delete('/doctors_section/{id}', [$doctorsSectionController, 'delete']);
$router->post('/doctors_section/reorder', [$doctorsSectionController, 'reorder']);
