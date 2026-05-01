<?php

require_once __DIR__ . "/../controllers/Testimonials_ListController.php";

$testimonials_ListController = new Testimonials_ListController();

global $router;

$router->get('/testimonials_list', [$testimonials_ListController, 'getAll']);
$router->get('/testimonials_list/active', [$testimonials_ListController, 'getActive']);
$router->get('/testimonials_list/{id}', [$testimonials_ListController, 'getOne']);
$router->post('/testimonials_list', [$testimonials_ListController, 'create']);
$router->put('/testimonials_list/{id}', [$testimonials_ListController, 'update']);
$router->delete('/testimonials_list/{id}', [$testimonials_ListController, 'delete']);
$router->post('/testimonials_list/reorder', [$testimonials_ListController, 'reorder']);
