<?php
require_once 'config.php';
require_once 'src/Database.php';
require_once 'src/Generator.php';
require_once 'src/HtmlParser.php';
require_once 'src/Initializer.php';

echo "Running Initializer (Force)...\n";
Initializer::run(true);
echo "Done.\n";
