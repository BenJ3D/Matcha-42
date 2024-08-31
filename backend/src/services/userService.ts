// Importation de modèles ou autres dépendances si nécessaire

// Service utilisateur
const userService = {
    getUserById: (id: string) => {
        // Ici, vous pouvez faire une requête à une base de données ou autre source de données
        // Pour l'instant, nous allons retourner un objet simulé
        return {
            id: id,
            name: 'John Doe',
            email: 'john.doe@example.com',
        };
    },
};

export default userService;
