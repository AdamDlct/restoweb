<?php
/*
 * Cet endpoint permet à RestoSwing de terminer une commande.
 * Seule une commande acceptée (état 2) peut passer
 * en commande terminée (état 4).
 */

// Annoncer que la réponse utilise le format JSON et ne doit pas être mise en cache.
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

// RestoSwing appelle cette adresse avec GET. Les autres méthodes ne sont pas acceptées.
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  header('Allow: GET');
  // 405 indique au client que l'URL existe, mais que cette méthode n'est pas autorisée.
  http_response_code(405);
  exit;
}

// Lire l'identifiant transmis dans l'URL, par exemple ?id_commande=12.
$idCommandeBrute = $_GET['id_commande'] ?? null;

// Un paramètre absent ou envoyé sous forme de tableau n'est pas un identifiant valide.
if (!is_string($idCommandeBrute)) {
  http_response_code(400);
  exit;
}

// Accepter uniquement un entier strictement positif : une commande a un identifiant supérieur à zéro.
$idCommande = filter_var(
  $idCommandeBrute,
  FILTER_VALIDATE_INT,
  ['options' => ['min_range' => 1]]
);

if ($idCommande === false) {
  http_response_code(400);
  exit;
}

// Charger la connexion à la base avec un chemin construit depuis le dossier de cet endpoint.
require_once dirname(__DIR__, 3) . '/db_functions.php';

try {
  // Le paramètre true laisse cet endpoint intercepter les erreurs et répondre avec un code HTTP.
  $connexion = db_connect(true);

  // La condition sur l'état empêche de terminer une commande déjà terminée,
  // refusée ou qui n'a pas encore été acceptée.
  $miseAJour = $connexion->prepare(
    'UPDATE commande
     SET id_etat = 4
     WHERE id_commande = :id AND id_etat = 2'
  );
  // Lier l'identifiant séparément à la requête évite de l'insérer directement dans le SQL.
  $miseAJour->execute([':id' => $idCommande]);

  // Si aucune ligne n'a changé, distinguer une commande inconnue d'un état incompatible.
  if ($miseAJour->rowCount() === 0) {
    $recherche = $connexion->prepare(
      'SELECT 1 FROM commande WHERE id_commande = :id'
    );
    $recherche->execute([':id' => $idCommande]);

    if ($recherche->fetchColumn() === false) {
      // 404 : aucune commande ne porte cet identifiant.
      http_response_code(404);
    } else {
      // 409 : la commande existe, mais son état n'est pas « en préparation ».
      http_response_code(409);
    }
    exit;
  }

  // 200 confirme la transition et le JSON donne au client le nouvel état enregistré.
  http_response_code(200);
  echo json_encode([
    'succes' => true,
    'id_commande' => (int) $idCommande,
    'id_etat' => 4
  ], JSON_UNESCAPED_UNICODE);
} catch (PDOException $exception) {
  // Garder les détails techniques dans le journal serveur sans les exposer au client.
  error_log('commande_terminer.php : ' . $exception->getMessage());
  http_response_code(500);
}
