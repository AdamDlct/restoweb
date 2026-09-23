<?php
/*
  ============================================================================
  INTEGRATION PHP - PAGE CONNEXION / INSCRIPTION
  ============================================================================
*/

session_start(); // Démarre la session PHP pour gérer l'authentification
require_once __DIR__ . '/db_functions.php'; // Inclut le fichier de configuration (base de données, etc.)

$pdo = db_connect();
$error_message = []; // Variable pour stocker les messages d'erreur

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Récupère les données du formulaire
    $auth_mode = $_POST['auth_mode'] ?? 'login';
    $login = trim($_POST['login'] ?? '');
    $identifiant = trim($_POST['identifiant'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm'] ?? '';

    // Vérifie si le formulaire est pour l'inscription ou la connexion
    if ($auth_mode === 'register') {
        // Inscription
        if (empty($login) || empty($identifiant) || empty($password) || empty($confirm_password)) {
            $error_message[] = "Tous les champs sont requis pour l'inscription.";
        } elseif ($password !== $confirm_password) {
            $error_message[] = "Les mots de passe ne correspondent pas.";
        } else {
            $stmt = $pdo->prepare(
                'SELECT id_user FROM utilisateur WHERE login = :login OR email = :email LIMIT 1'
            );
            $stmt->execute([
                'login' => $login,
                'email' => $identifiant
            ]);

            if ($stmt->fetch()) {
                $error_message[] = "Ce login ou cet email existe déjà.";
            } else {
                $hashed_password = password_hash($password, PASSWORD_DEFAULT);

                $stmt = $pdo->prepare(
                    'INSERT INTO utilisateur(login, password, email) VALUES (:login, :password, :email)'
                );
                $stmt->execute([
                    'login' => $login,
                    'password' => $hashed_password,
                    'email' => $identifiant
                ]);

                $_SESSION['id_user'] = $pdo->lastInsertId();
                $_SESSION['login'] = $login;

                header('Location: catalogue.php');
                exit();
            }
        }
    } else {
        // Connexion
        if (empty($identifiant) || empty($password)) {
            $error_message[] = "Tous les champs sont requis pour la connexion.";
        } else {
            $stmt = $pdo->prepare(
                'SELECT * FROM utilisateur WHERE login = :identifiant OR email = :identifiant LIMIT 1'
            );
            $stmt->execute([
                'identifiant' => $identifiant
            ]);

            $user = $stmt->fetch();

            /*
              password_verify() sert pour les nouveaux mots de passe hashés.
              hash_equals() garde temporairement compatible l'utilisateur de test SQL :
              INSERT INTO utilisateur(login, password, email) VALUES ("jef", "jef", ...).
              Idéalement, il faudra remplacer ce mot de passe en clair par un hash.
            */
            $password_ok = $user && (
                password_verify($password, $user['password']) ||
                hash_equals($user['password'], $password)
            );

            if ($password_ok) {
                $_SESSION['id_user'] = $user['id_user'];
                $_SESSION['login'] = $user['login'];

                header('Location: catalogue.php');
                exit();
            } else {
                $error_message[] = "Identifiant ou mot de passe incorrect.";
            }
        }
    }
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Resto Web</title>
<!-- Une seule feuille de style pour tout le site : voir css/style.css -->
<link rel="stylesheet" href="css/style.css" />
</head>
<body>

<!-- Page Connexion / Inscription extraite de l'ancienne SPA index.html. -->
<div id="page-auth" class="page active">
  <div class="auth-layout">

    <!-- Colonne gauche : photo d'ambiance + texte d'accroche (cachée en dessous de 1024px, voir media query CSS) -->
    <div class="auth-hero">
      <img src="https://images.unsplash.com/photo-1469234496837-d0101f54be3e?w=900&h=1200&fit=crop&auto=format" alt="Ambiance Resto Web, verres de vin sur table en bois" />
      <!-- Dégradé sombre posé au-dessus de la photo pour que le texte reste lisible -->
      <div class="auth-hero-gradient"></div>
      <div class="auth-hero-content">
        <img src="assets/logo.svg" alt="Logo Resto Web" width="56" />
      </div>
      <div class="auth-hero-text">
        <p class="auth-hero-title">
          Commandez,<br />
          <em>savourez</em>,<br />
          répétez.
        </p>
        <p class="auth-hero-sub">
          Cuisine de saison, produits locaux. Votre expérience culinaire commence ici.
        </p>
      </div>
    </div>

    <!-- Colonne droite : formulaire de connexion / inscription -->
    <div class="auth-panel">
      <div class="auth-panel-inner">
        <!-- Logo affiché uniquement sur mobile (le panneau photo de gauche est masqué) -->
        <div class="auth-logo-mobile">
          <img src="assets/logo.svg" alt="Logo Resto Web" width="72" />
        </div>

        <h2 id="auth-title">Bon retour</h2>
        <p class="auth-subtitle" id="auth-subtitle">Connectez-vous pour accéder à la carte.</p>

        <!-- Onglets Connexion / Inscription : data-mode lu par app.js pour savoir lequel a été cliqué -->
        <div class="auth-tabs">
          <button type="button" class="auth-tab active" data-mode="login">Connexion</button>
          <button type="button" class="auth-tab" data-mode="register">Inscription</button>
        </div>

        <!--
          Formulaire : chaque <label for="..."> pointe vers l'id de son <input>.
          Principe d'accessibilité : cliquer sur le label active/sélectionne le champ.
          Les champs "hidden-field" sont masqués par CSS en mode Connexion,
          et affichés uniquement en mode Inscription (voir app.js → écouteur ".auth-tab").
        -->
        <!--
  GUIDE HTML / PHP :
  - Quand le traitement PHP sera pret, ajouter method="post" au formulaire.
  - Ajouter des attributs name="..." aux champs pour les recuperer avec $_POST.
  - Prevoir un champ cache ou deux boutons nommes pour distinguer connexion et inscription.
  - En cas d'erreur serveur, afficher les messages dans #auth-error.
  - Ne jamais pre-remplir les champs de mot de passe apres une erreur.
-->
        <form id="auth-form" class="auth-form" method="post">
          <input type="hidden" name="auth_mode" id="auth-mode" value="login" />
          <div class="field hidden-field" id="field-login-register">
            <label for="reg-login">Login</label>
            <input type="text" id="reg-login" name="login" placeholder="votre_pseudo" />
          </div>
          <div class="field">
            <label id="field-main-label" for="main-id">Login ou Email</label>
            <input type="text" id="main-id" name="identifiant" placeholder="pseudo ou email@..." />
          </div>
          <div class="field">
            <label for="password">Mot de passe</label>
            <input type="password" id="password" name="password" />
          </div>
          <div class="field hidden-field" id="field-confirm">
            <label for="confirm">Confirmation du mot de passe</label>
            <input type="password" id="confirm" name="confirm" placeholder="••••••••" />
          </div>

          <!-- Message d'erreur : vide par défaut, rempli et affiché par app.js si la validation échoue -->
          <!-- GUIDE PHP : ce paragraphe pourra afficher les erreurs generees par la validation serveur. -->
          <?php if (!empty($error_message)): ?>
            <p class="error-msg" id="auth-error">
              <?= htmlspecialchars($error_message[0]) ?>
            </p>
          <?php else: ?>
            <p class="error-msg" id="auth-error" style="display:none;"></p>
          <?php endif; ?>

          <button type="submit" class="btn-primary auth-submit" id="auth-submit">Se connecter →</button>
        </form>
      </div>
    </div>
  </div>
</div>


<script src="js/data.js"></script>
<script src="js/app.js"></script>
</body>
</html>


