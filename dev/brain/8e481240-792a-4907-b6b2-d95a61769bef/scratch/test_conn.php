<?php
$urls = [
    'http://127.0.0.1:8080/Triveni_Brass_test/server/public/auth/check',
    'http://localhost:8080/Triveni_Brass_test/server/public/auth/check'
];

foreach ($urls as $url) {
    echo "Testing $url ...\n";
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    $res = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    echo "Status: $code\n";
    echo "Response: $res\n";
    if (curl_errno($ch)) echo "Error: " . curl_error($ch) . "\n";
    curl_close($ch);
    echo "-------------------\n";
}
