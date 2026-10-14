<?php
session_start();
include("../../../db_functions.php");

$dbh = db_connect();

$stmt = $dbh->query("SELECT * FROM commande WHERE id_etat=1");
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

print("test");