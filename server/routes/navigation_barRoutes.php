<?php

require_once __DIR__ . "/../controllers/NavigationBarController.php";

$navigationBarController = new NavigationBarController();

global $router;

$router->get('/navigation_bar', [$navigationBarController, 'getAll']);
$router->get('/navigation_bar/active', [$navigationBarController, 'getActive']);
$router->get('/navigation_bar/{id}', [$navigationBarController, 'getOne']);
$router->post('/navigation_bar', [$navigationBarController, 'create']);
$router->put('/navigation_bar/{id}', [$navigationBarController, 'update']);
$router->delete('/navigation_bar/{id}', [$navigationBarController, 'delete']);
$router->post('/navigation_bar/reorder', [$navigationBarController, 'reorder']);
