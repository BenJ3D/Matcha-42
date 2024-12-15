# Matcha - Projet de rencontre en ligne

## Présentation
Matcha est une application de rencontre en ligne développée dans le cadre du cursus de l'école 42. Ce projet met l'accent sur la sécurité, la performance et l'expérience utilisateur.

### Statut
- **Validation** : 125%
- **Bonus implémentés** :
  - Carte "Nearby" (utilisation des coordonnées géographiques pour afficher les profils à proximité)
  - Refresh token pour une authentification sécurisée et fluide
  - Suppression de compte
  - Gestion des "likes"
  - Suppression des messages


## Contraintes spécifiques

- **Pas d'utilisation d'ORM** : Toutes les requêtes SQL ont été écrites manuellement pour garantir un contrôle total sur les interactions avec la base de données.

## Fonctionnalités principales
- **Inscription et connexion sécurisées**
  - Hashage des mots de passe avec bcrypt
  - Validation des données en backend
  - Authentification JWT avec support du refresh token

- **Gestion des profils utilisateurs**
  - Complétion de profil (photos, bio, intérêts)
  - Mise à jour des informations personnelles
  - Critères de recherche avancés (âge, localisation, centres d'intérêt)

- **Navigation et recherche**
  - Carte "Nearby" pour explorer les profils proches
  - Recherche personnalisée avec filtres dynamiques

- **Interaction entre utilisateurs**
  - Système de "likes" et "dislikes"
  - Messagerie en temps réel (chat)
  - Notifications en temps réel (likes, messages, visites de profil)

- **Suppression de données**
  - Suppression complète des comptes utilisateurs
  - Suppression des messages envoyés

- **Sécurité et performance**
  - Protection contre les injections SQL
  - Validation stricte des formulaires
  - Pas de mots de passe en clair

## Technologies utilisées
- **Backend** : Express.js avec TypeScript
- **Frontend** : Angular 18
- **Base de données** : PostgreSQL
- **Conteneurisation** : Docker et Docker Compose

## Auteur
Ce projet a été réalisé par @acroisie & @BenJ3D.


![image](https://github.com/user-attachments/assets/12912b4f-64db-44b8-b026-7fee5152642f)
![image](https://github.com/user-attachments/assets/8d2f9e16-00cd-4cfd-bbf7-05f72436566e)
![image](https://github.com/user-attachments/assets/a5b8d6e9-cee5-4d65-a203-ac403135c349)
![image](https://github.com/user-attachments/assets/db6ba58f-f482-4eab-9a71-81614ea6f208)
![image](https://github.com/user-attachments/assets/3bf741d9-0b3a-4afe-bb7f-9b33a4d18507)
![image](https://github.com/user-attachments/assets/2518775a-cfa0-46c0-a6bb-7ef690e2a016)
![image](https://github.com/user-attachments/assets/3226eded-9a25-4f0b-9182-147641d67878)
![image](https://github.com/user-attachments/assets/bd92a061-70ac-40b6-b13b-b49b7a8388fb)








