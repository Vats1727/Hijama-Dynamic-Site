<?php
require_once __DIR__ . '/../../../../server/config/database.php';
require_once __DIR__ . '/../../../../server/models/ContactInfo.php';

$db = Database::connect();
$model = new ContactInfo($db);

echo "Testing CRUD for ContactInfo...\n";

// 1. Create
$testData = [
    'title' => 'Test Title ' . time(),
    'content' => 'Test Content',
    'status' => 'Active'
];
$res = $model->create($testData);
echo "Create: " . ($res ? "PASS" : "FAIL") . "\n";

// 2. Get All
$all = $model->getAll();
echo "Get All count: " . count($all) . "\n";
$lastItem = end($all);

// 3. Update
$updateData = [
    'title' => 'Updated Title',
    'status' => 'Inactive'
];
$res = $model->update($lastItem['id'], $updateData);
echo "Update: " . ($res ? "PASS" : "FAIL") . "\n";

// 4. Get by ID
$item = $model->getById($lastItem['id']);
echo "Get by ID: " . ($item['title'] === 'Updated Title' ? "PASS" : "FAIL") . "\n";

// 5. Delete
$res = $model->delete($lastItem['id']);
echo "Delete: " . ($res ? "PASS" : "FAIL") . "\n";

echo "Tests Completed.\n";
