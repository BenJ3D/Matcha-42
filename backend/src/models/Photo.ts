interface Photo {
    photo_id: number;
    url: string;
    description?: string; // Optionnel car il n'y a pas de contrainte NOT NULL
    owner_user_id: number; // référence à l'ID de l'utilisateur
}

export default Photo;
