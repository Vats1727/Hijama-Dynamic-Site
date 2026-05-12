<?php

require_once __DIR__ . "/../controllers/FooterController.php";

$footerController = new FooterController();

global $router;

$router->get('/footer', [$footerController, 'getAll']);
$router->get('/footer/active', [$footerController, 'getActive']);
$router->get('/footer/{id}', [$footerController, 'getOne']);
$router->post('/footer', [$footerController, 'create']);
$router->put('/footer/{id}', [$footerController, 'update']);
$router->delete('/footer/{id}', [$footerController, 'delete']);
$router->post('/footer/reorder', [$footerController, 'reorder']);
