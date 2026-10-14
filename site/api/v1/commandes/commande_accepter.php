<?php
/*
 * Accepte une commande payée en attente pour la transmettre à la cuisine.
 * Transition autorisée : id_etat 1 (en attente) -> 2 (en préparation).
 * RestoSwing appelle cet endpoint en GET avec le paramètre id_commande.
 */
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

// Centralise le code HTTP et le JSON de succès. Sans données, la réponse reste vide,
// comme le prévoit le contrat du lot pour les erreurs.
$repondre = static function (int $statut, ?array $donnees = null): void {
  http_response_code($statut);
  if ($donnees !== null) {
    echo json_encode($donnees, JSON_UNESCAPED_UNICODE);
  }
  exit;
};

// RestoSwing appelle cet endpoint en GET, conformément au contrat du lot 5.
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  header('Allow: GET');
  $repondre(405);
}

// L'identifiant doit être un entier strictement positif avant toute requête SQL.
// La vérification de type rejette aussi les paramètres reçus sous forme de tableau.
$idCommandeBrut = $_GET['id_commande'] ?? null;
$idCommande = is_string($idCommandeBrut)
  ? filter_var($idCommandeBrut, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]])
  : false;

if ($idCommande === false) {
  $repondre(400);
}

require_once dirname(__DIR__, 3) . '/db_functions.php';

try {
  $dbh = db_connect(true);

  // La condition sur l'état empêche une seconde acceptation ou une transition incorrecte.
  $requete = $dbh->prepare(
    'UPDATE commande
     SET id_etat = 2
     WHERE id_commande = :id_commande AND id_etat = 1'
  );
  $requete->execute([':id_commande' => $idCommande]);

  if ($requete->rowCount() === 0) {
    // Aucune ligne modifiée : distinguer une commande absente (404) d'un état
    // différent de 1 (409), notamment lors d'une seconde tentative d'acceptation.
    $verification = $dbh->prepare('SELECT id_etat FROM commande WHERE id_commande = :id_commande');
    $verification->execute([':id_commande' => $idCommande]);
    $commande = $verification->fetch(PDO::FETCH_ASSOC);

    if ($commande === false) {
      $repondre(404);
    }

    $repondre(409);
  }

  $repondre(200, [
    'succes' => true,
    'id_commande' => (int) $idCommande,
    'id_etat' => 2
  ]);
} catch (PDOException $exception) {
  // Le contrat du lot demande une erreur silencieuse côté client : journaliser
  // le détail pour l'administrateur sans exposer d'information SQL à RestoSwing.
  error_log('commande_accepter.php : ' . $exception->getMessage());
  $repondre(500);
}