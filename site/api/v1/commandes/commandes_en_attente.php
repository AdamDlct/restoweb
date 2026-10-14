<?php
session_start();
include("../../../db_functions.php");

try {
    $dbh = db_connect();

    $sql = "SELECT DISTINCT c.id_commande, c.date_commande, c.id_etat, SUM(l.qte) AS Total
            FROM commande c, ligne_commande l
            WHERE c.id_commande = l.id_commande
            AND c.id_etat = 1
            GROUP BY c.id_commande;
            ";

    $stmt = $dbh->query($sql);
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
