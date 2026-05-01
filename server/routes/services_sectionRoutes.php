<?php

require_once __DIR__ . "/../controllers/Services_sectionController.php";

$services_sectionController = new Services_sectionController();

global $router;

$router->get('/services_section', [$services_sectionController, 'getAll']);
$router->get('/services_section/active', [$services_sectionController, 'getActive']);
$router->get('/services_section/{id}', [$services_sectionController, 'getOne']);
$router->post('/services_section', [$services_sectionController, 'create']);
$router->put('/services_section/{id}', [$services_sectionController, 'update']);
$router->delete('/services_section/{id}', [$services_sectionController, 'delete']);
$router->post('/services_section/reorder', [$services_sectionController, 'reorder']);
