<?php

require_once __DIR__ . "/../controllers/AboutSectionController.php";

$aboutSectionController = new AboutSectionController();

global $router;

$router->get('/about_section', [$aboutSectionController, 'getAll']);
$router->get('/about_section/active', [$aboutSectionController, 'getActive']);
$router->get('/about_section/{id}', [$aboutSectionController, 'getOne']);
$router->post('/about_section', [$aboutSectionController, 'create']);
$router->put('/about_section/{id}', [$aboutSectionController, 'update']);
$router->delete('/about_section/{id}', [$aboutSectionController, 'delete']);
$router->post('/about_section/reorder', [$aboutSectionController, 'reorder']);
