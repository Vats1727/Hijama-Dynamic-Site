<?php
require 'dev/config.php';
require 'dev/src/Database.php';
require 'dev/src/Generator.php';

$gen = new Generator();
$gen->updateReactFiles();
echo "Sync complete.\n";
