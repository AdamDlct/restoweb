<?php
// ============================================================================
// Page inscription / connexion
// ============================================================================
// Role prevu :
// - Afficher le formulaire de connexion.
// - Afficher le formulaire d'inscription.
// - Traiter les donnees envoyees en POST.
//
// Partie connexion a coder plus tard :
// - Recuperer le login ou l'email.
// - Recuperer le mot de passe.
// - Verifier que les champs sont remplis.
// - Chercher l'utilisateur en base de donnees.
// - Verifier le mot de passe avec password_verify().
// - Creer les variables de session si la connexion est valide.
// - Rediriger vers commander.php.
//
// Partie inscription a coder plus tard :
// - Recuperer le login, l'email, le mot de passe et sa confirmation.
// - Verifier que tous les champs sont remplis.
// - Verifier que les deux mots de passe correspondent.
// - Verifier que le login ou l'email n'existe pas deja.
// - Hasher le mot de passe avec password_hash().
// - Inserer le nouvel utilisateur en base de donnees.
// - Connecter l'utilisateur ou le rediriger vers la connexion.
//
// Securite a penser :
// - Ne jamais stocker un mot de passe en clair.
// - Toujours utiliser des requetes preparees PDO.
// - Echaper les donnees affichees avec htmlspecialchars().
//
// Pour le moment, ce fichier contient uniquement des commentaires d'aide.
