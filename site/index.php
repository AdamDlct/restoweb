<?php
/*
  ============================================================================
  INTEGRATION PHP - PAGE CONNEXION / INSCRIPTION
  ============================================================================
  Objectif futur :
  - Demarrer la session avec session_start().
  - Si l'utilisateur est deja connecte, le rediriger vers catalogue.php ou commander.php.
  - Traiter le formulaire de connexion en POST.
  - Traiter le formulaire d'inscription en POST.
  - Verifier les champs obligatoires cote serveur.
  - Utiliser des requetes preparees PDO pour lire/creer un utilisateur.
  - Verifier les mots de passe avec password_verify().
  - Hasher les nouveaux mots de passe avec password_hash().
  - Stocker l'id utilisateur en session apres connexion.

  A prevoir :
  - Un fichier de connexion a la base de donnees.
  - Un tableau d'erreurs PHP a afficher dans la page.
  - Une protection contre les doublons de login/email.
  - Une redirection apres succes vers la page de commande.

  Pour le moment, aucune logique PHP n'est ajoutee : ce bloc sert uniquement
  de guide pour la future integration.
*/
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

    <!-- Colonne gauche : photo d'ambiance + texte d'accroche (cachÃ©e en dessous de 1024px, voir media query CSS) -->
    <div class="auth-hero">
      <img src="https://images.unsplash.com/photo-1469234496837-d0101f54be3e?w=900&h=1200&fit=crop&auto=format" alt="Ambiance Resto Web, verres de vin sur table en bois" />
      <!-- DÃ©gradÃ© sombre posÃ© au-dessus de la photo pour que le texte reste lisible -->
      <div class="auth-hero-gradient"></div>
      <div class="auth-hero-content">
        <img src="assets/logo.svg" alt="Logo Resto Web" width="56" />
      </div>
      <div class="auth-hero-text">
        <p class="auth-hero-title">
          Commandez,<br />
          <em>savourez</em>,<br />
          rÃ©pÃ©tez.
        </p>
        <p class="auth-hero-sub">
          Cuisine de saison, produits locaux. Votre expÃ©rience culinaire commence ici.
        </p>
      </div>
    </div>

    <!-- Colonne droite : formulaire de connexion / inscription -->
    <div class="auth-panel">
      <div class="auth-panel-inner">
        <!-- Logo affichÃ© uniquement sur mobile (le panneau photo de gauche est masquÃ©) -->
        <div class="auth-logo-mobile">
          <img src="assets/logo.svg" alt="Logo Resto Web" width="72" />
        </div>

        <h2 id="auth-title">Bon retour</h2>
        <p class="auth-subtitle" id="auth-subtitle">Connectez-vous pour accÃ©der Ã  la carte.</p>

        <!-- Onglets Connexion / Inscription : data-mode lu par app.js pour savoir lequel a Ã©tÃ© cliquÃ© -->
        <div class="auth-tabs">
          <button type="button" class="auth-tab active" data-mode="login">Connexion</button>
          <button type="button" class="auth-tab" data-mode="register">Inscription</button>
        </div>

        <!--
          Formulaire : chaque <label for="..."> pointe vers l'id de son <input>.
          Principe d'accessibilitÃ© : cliquer sur le label active/sÃ©lectionne le champ.
          Les champs "hidden-field" sont masquÃ©s par CSS en mode Connexion,
          et affichÃ©s uniquement en mode Inscription (voir app.js â†’ Ã©couteur ".auth-tab").
        -->
        <!--
  GUIDE HTML / PHP :
  - Quand le traitement PHP sera pret, ajouter method="post" au formulaire.
  - Ajouter des attributs name="..." aux champs pour les recuperer avec $_POST.
  - Prevoir un champ cache ou deux boutons nommes pour distinguer connexion et inscription.
  - En cas d'erreur serveur, afficher les messages dans #auth-error.
  - Ne jamais pre-remplir les champs de mot de passe apres une erreur.
-->
        <form id="auth-form" class="auth-form">
          <div class="field hidden-field" id="field-login-register">
            <label for="reg-login">Login</label>
            <input type="text" id="reg-login" placeholder="votre_pseudo" />
          </div>
          <div class="field">
            <label id="field-main-label" for="main-id">Login ou Email</label>
            <input type="text" id="main-id" placeholder="pseudo ou email@..." />
          </div>
          <div class="field">
            <label for="password">Mot de passe</label>
            <input type="password" id="password" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" />
          </div>
          <div class="field hidden-field" id="field-confirm">
            <label for="confirm">Confirmation du mot de passe</label>
            <input type="password" id="confirm" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" />
          </div>

          <!-- Message d'erreur : vide par dÃ©faut, rempli et affichÃ© par app.js si la validation Ã©choue -->
          <!-- GUIDE PHP : ce paragraphe pourra afficher les erreurs generees par la validation serveur. -->
          <p class="error-msg" id="auth-error" style="display:none;"></p>

          <button type="submit" class="btn-primary auth-submit" id="auth-submit">Se connecter â†’</button>
        </form>
      </div>
    </div>
  </div>
</div>


<script src="js/data.js"></script>
<script src="js/app.js"></script>
</body>
</html>


