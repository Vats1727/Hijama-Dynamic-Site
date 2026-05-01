<?php

require_once __DIR__ . "/../controllers/HeroSectionController.php";

$heroSectionController = new HeroSectionController();

global $router;

$router->get('/hero_section', [$heroSectionController, 'getAll']);
$router->get('/hero_section/active', [$heroSectionController, 'getActive']);
$router->get('/hero_section/{id}', [$heroSectionController, 'getOne']);
$router->post('/hero_section', [$heroSectionController, 'create']);
$router->put('/hero_section/{id}', [$heroSectionController, 'update']);
$router->delete('/hero_section/{id}', [$heroSectionController, 'delete']);
$router->post('/hero_section/{id}/remove-image', [$heroSectionController, 'removeImage']);
$router->post('/hero_section/reorder', [$heroSectionController, 'reorder']);
