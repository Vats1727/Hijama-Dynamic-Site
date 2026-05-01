<?php

require_once __DIR__ . "/../controllers/ServiceListController.php";

$serviceListController = new ServiceListController();

global $router;

$router->get('/service_list', [$serviceListController, 'getAll']);
$router->get('/service_list/active', [$serviceListController, 'getActive']);
$router->get('/service_list/{id}', [$serviceListController, 'getOne']);
$router->post('/service_list', [$serviceListController, 'create']);
$router->put('/service_list/{id}', [$serviceListController, 'update']);
$router->delete('/service_list/{id}', [$serviceListController, 'delete']);
$router->post('/service_list/reorder', [$serviceListController, 'reorder']);
