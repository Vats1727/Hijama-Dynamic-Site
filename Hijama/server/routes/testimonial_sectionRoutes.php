<?php

require_once __DIR__ . "/../controllers/TestimonialSectionController.php";

$testimonialSectionController = new TestimonialSectionController();

global $router;

$router->get('/testimonial_section', [$testimonialSectionController, 'getAll']);
$router->get('/testimonial_section/active', [$testimonialSectionController, 'getActive']);
$router->get('/testimonial_section/{id}', [$testimonialSectionController, 'getOne']);
$router->post('/testimonial_section', [$testimonialSectionController, 'create']);
$router->put('/testimonial_section/{id}', [$testimonialSectionController, 'update']);
$router->delete('/testimonial_section/{id}', [$testimonialSectionController, 'delete']);
$router->post('/testimonial_section/reorder', [$testimonialSectionController, 'reorder']);
