<?php
$content = file_get_contents('c:/xampp/htdocs/Triveni_Brass_test/dev/src/Initializer.php');
$lines = explode("\n", $content);
$depth = 0;
foreach ($lines as $i => $line) {
    $open = substr_count($line, '{');
    $close = substr_count($line, '}');
    $depth += $open - $close;
    echo ($i + 1) . ": depth=$depth | " . trim($line) . "\n";
    if ($depth < 0) {
        echo "ERROR: Depth dropped below 0 at line " . ($i + 1) . "\n";
        break;
    }
}
echo "Final depth: $depth\n";
