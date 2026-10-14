<?php
session_start();
include("../../../db_functions.php");

$dbh = db_connect();

$id_commande = $_GET['id'] ?? null;

header("Content-Type: application/json; charset=utf-8");

if ($id_commande) {
    $sql = "UPDATE commande SET id_etat = 5 WHERE id_commande = :id;";
    $stmt = $dbh->prepare($sql);
    $stmt->execute(array(":id" => $id_commande));

    echo json_encode([
        "succes" => true,
        "id_commande" => (int) $id_commande,
        "id_etat" => 5
    ]);
} else {
    echo json_encode([
        "succes" => false,
        "message" => "Identifiant de commande manquant"
    ]);
}
