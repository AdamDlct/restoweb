<?php
session_start();
include("../../../db_functions.php");

$id_commande = $_GET['id'] ?? null;

try {
    $dbh = db_connect();

    $sql = "SELECT l.id_ligne_commande, p.libelle, l.qte
        FROM ligne_commande l, produit p
        WHERE l.id_produit = p.id_produit
        AND l.id_commande = :id;
            ";

    $stmt = $dbh->prepare($sql);
    $stmt->execute(array(":id" => $id_commande));
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    $rows = "";
    echo "Erreur dans le SQL, " . $e->getMessage();
}

$json = json_encode($rows);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    header("Content-type: application/json; charset=utf-8");
    echo $json;
}
