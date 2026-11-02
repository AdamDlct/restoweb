<?php
/*
 * Cet endpoint permet à RestoSwing d'accepter une commande.
 * Seule une commande payée et en attente (état 1) peut passer
 * en préparation (état 2).
 */

// Annoncer que la réponse utilise le format JSON et ne doit pas être mise en cache.
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

// RestoSwing appelle cette adresse avec GET. Les autres méthodes ne sont pas acceptées.
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  header('Allow: GET');
  http_response_code(405);
  exit;
}

// Lire le numéro transmis dans l'URL, par exemple ?id_commande=12.
$idCommandeBrute = $_GET['id_commande'] ?? null;

// Vérifier qu'il s'agit d'un entier positif. On rejette aussi un paramètre
// manquant, du texte ou une valeur envoyée sous forme de tableau.
if (!is_string($idCommandeBrute)) {
  http_response_code(400);
  exit;
}
$idCommande = filter_var(
  $idCommandeBrute,
  FILTER_VALIDATE_INT,
  ['options' => ['min_range' => 1]]
);

if ($idCommande === false) {
  http_response_code(400);
  exit;
}

// Charger la fonction qui ouvre la connexion PDO à la base de données.
require_once dirname(__DIR__, 3) . '/db_functions.php';

try {
  // Le paramètre true laisse l'API gérer elle-même les erreurs de connexion.
  $connexion = db_connect(true);

  // Changer l'état seulement si la commande existe et est encore en attente.
  // Le paramètre :id est lié séparément à la requête pour sécuriser l'identifiant.
  $miseAJour = $connexion->prepare(
    'UPDATE commande
     SET id_etat = 2
     WHERE id_commande = :id AND id_etat = 1'
  );
  $miseAJour->execute([':id' => $idCommande]);

  // Aucune ligne mise à jour : vérifier si le numéro existe.
  // 404 signifie « commande inconnue » ; 409 signifie « mauvais état ».
  if ($miseAJour->rowCount() === 0) {
    $recherche = $connexion->prepare(
      'SELECT 1 FROM commande WHERE id_commande = :id'
    );
    $recherche->execute([':id' => $idCommande]);

    if ($recherche->fetchColumn() === false) {
      http_response_code(404);
    } else {
      http_response_code(409);
    }
    exit;
  }

  // La commande a bien été acceptée : renvoyer son numéro et son nouvel état.
  http_response_code(200);
  echo json_encode([
    'succes' => true,
    'id_commande' => (int) $idCommande,
    'id_etat' => 2
  ], JSON_UNESCAPED_UNICODE);
} catch (PDOException $exception) {
  // Ne pas envoyer les détails de la base au client. Le journal serveur
  // les conserve pour aider à trouver la cause du problème.
  error_log('commande_accepter.php : ' . $exception->getMessage());
  http_response_code(500);
}