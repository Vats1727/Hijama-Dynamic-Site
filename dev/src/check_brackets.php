<?php
$content = file_get_contents('dev/src/Initializer.php');
$tokens = token_get_all($content);
$brackets = 0;
foreach ($tokens as $token) {
    if ($token === '[') $brackets++;
    if ($token === ']') $brackets--;
}
echo "Bracket balance: $brackets\n";
