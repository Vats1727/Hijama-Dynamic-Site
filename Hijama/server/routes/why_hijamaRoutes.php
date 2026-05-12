<?php

require_once __DIR__ . "/../controllers/WhyHijamaController.php";

$whyHijamaController = new WhyHijamaController();

global $router;

$router->get('/why_hijama', [$whyHijamaController, 'getAll']);
$router->get('/why_hijama/active', [$whyHijamaController, 'getActive']);
$router->get('/why_hijama/{id}', [$whyHijamaController, 'getOne']);
$router->post('/why_hijama', [$whyHijamaController, 'create']);
$router->put('/why_hijama/{id}', [$whyHijamaController, 'update']);
$router->delete('/why_hijama/{id}', [$whyHijamaController, 'delete']);
$router->post('/why_hijama/reorder', [$whyHijamaController, 'reorder']);
