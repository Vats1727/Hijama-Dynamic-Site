<?php
$content = file_get_contents('c:/xampp/htdocs/Triveni_Brass_test/dev/src/Initializer.php');
$tokens = token_get_all($content);
$depth = 0;
foreach ($tokens as $token) {
    if (is_array($token)) {
        if ($token[0] === T_OPEN_TAG) continue;
    } else {
        if ($token === '{') $depth++;
        if ($token === '}') $depth--;
    }
}
echo "Final depth: $depth\n";
