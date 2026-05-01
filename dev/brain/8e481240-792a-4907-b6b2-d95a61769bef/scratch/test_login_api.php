<?php
$ch = curl_init('http://localhost/Triveni_Brass_test/server/public/auth/login');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['email'=>'admin@gmail.com', 'password'=>'Admin123#']));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$res = curl_exec($ch);
$info = curl_getinfo($ch);
echo "Status: " . $info['http_code'] . "\n";
echo "Response: " . $res . "\n";
if (curl_errno($ch)) echo "Error: " . curl_error($ch) . "\n";
curl_close($ch);
