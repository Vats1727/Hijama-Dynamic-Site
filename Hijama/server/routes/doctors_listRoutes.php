<?php

require_once __DIR__ . "/../controllers/DoctorsListController.php";

$doctorsListController = new DoctorsListController();

global $router;

$router->get('/doctors_list', [$doctorsListController, 'getAll']);
$router->get('/doctors_list/active', [$doctorsListController, 'getActive']);
$router->get('/doctors_list/{id}', [$doctorsListController, 'getOne']);
$router->post('/doctors_list', [$doctorsListController, 'create']);
$router->put('/doctors_list/{id}', [$doctorsListController, 'update']);
$router->delete('/doctors_list/{id}', [$doctorsListController, 'delete']);
$router->post('/doctors_list/reorder', [$doctorsListController, 'reorder']);
