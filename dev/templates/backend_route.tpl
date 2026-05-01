<?php

require_once __DIR__ . "/../controllers/{{CLASS_NAME}}Controller.php";

${{VAR_NAME}}Controller = new {{CLASS_NAME}}Controller();

global $router;

$router->get('/{{SLUG}}', [${{VAR_NAME}}Controller, 'getAll']);
$router->get('/{{SLUG}}/active', [${{VAR_NAME}}Controller, 'getActive']);
$router->get('/{{SLUG}}/{id}', [${{VAR_NAME}}Controller, 'getOne']);
$router->post('/{{SLUG}}', [${{VAR_NAME}}Controller, 'create']);
$router->put('/{{SLUG}}/{id}', [${{VAR_NAME}}Controller, 'update']);
$router->delete('/{{SLUG}}/{id}', [${{VAR_NAME}}Controller, 'delete']);
$router->post('/{{SLUG}}/reorder', [${{VAR_NAME}}Controller, 'reorder']);
