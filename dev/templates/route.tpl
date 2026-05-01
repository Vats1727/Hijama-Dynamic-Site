<?php

require_once __DIR__ . "/../controllers/{{CLASS_NAME}}Controller.php";

${{INSTANCE_NAME}}Controller = new {{CLASS_NAME}}Controller();

global $router;

$router->get('/{{SLUG}}', [${{INSTANCE_NAME}}Controller, 'getAll']);
$router->get('/{{SLUG}}/active', [${{INSTANCE_NAME}}Controller, 'getActive']);
$router->get('/{{SLUG}}/{id}', [${{INSTANCE_NAME}}Controller, 'getOne']);
$router->post('/{{SLUG}}', [${{INSTANCE_NAME}}Controller, 'create']);
$router->put('/{{SLUG}}/{id}', [${{INSTANCE_NAME}}Controller, 'update']);
$router->delete('/{{SLUG}}/{id}', [${{INSTANCE_NAME}}Controller, 'delete']);
$router->post('/{{SLUG}}/reorder', [${{INSTANCE_NAME}}Controller, 'reorder']);
