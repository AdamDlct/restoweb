<?php
//
// ph20b : pays de l'U.E. avec une BD
//
/**
 * Ouvre une connexion PDO à la base restoswing.
 *
 * Par défaut, conserve le comportement historique des pages du site en affichant
 * une erreur puis en arrêtant le script en cas d'échec. Les endpoints API peuvent
 * passer true pour recevoir l'exception et renvoyer eux-mêmes une réponse HTTP/JSON
 * sans divulguer le détail de la connexion au client.
 *
 * @param bool $throwException true pour laisser l'appelant gérer l'erreur SQL
 * @return PDO objet de connexion
 * @throws PDOException si la connexion échoue et que $throwException vaut true
 */
function db_connect($throwException = false) {
  $dsn = 'mysql:host=localhost;dbname=restoswing';  // contient le nom du serveur et de la base
  $user = 'root';
  $password = '';
  try {
    $dbh = new PDO($dsn, $user, $password, array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"));
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  } catch (PDOException $ex) {
    if ($throwException) {
      throw $ex;
    }
    die("Erreur lors de la connexion SQL : " . $ex->getMessage());
  }
  return $dbh;
}
?>