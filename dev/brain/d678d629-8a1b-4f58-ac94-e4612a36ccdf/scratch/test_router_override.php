<?php
// Mocking the router environment
$_SERVER['REQUEST_METHOD'] = 'POST';
$_POST['_method'] = 'DELETE';
$_SERVER['REQUEST_URI'] = '/Triveni_Brass_test/server/public/contact_info/3';

require_once __DIR__ . '/../../../../server/routes/api.php';
// The script will try to resolve the route.
