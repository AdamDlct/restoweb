<?php
session_start();
include("../../../db_functions.php");

$dbh = db_connect();

$sql = "SELECT l.id_ligne_commande, p.libelle, l.qte
        FROM ligne_commande l, produit p
        WHERE l.id_produit = p.id_produit
        AND l.id_commande = :id;";

$id_commande = $_GET['id'] ?? null;

$stmt = $dbh->prepare($sql);
$stmt->execute(array(":id" => $id_commande));
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

$json = json_encode($rows);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    header("Content-type: application/json; charset=utf-8");
    echo $json;
}
