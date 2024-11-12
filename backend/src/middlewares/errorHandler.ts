import {Request, Response, NextFunction} from 'express';
import multer from 'multer';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    // Gérer les erreurs spécifiques de Multer
    if (err instanceof multer.MulterError) {
        let message = 'Erreur lors du téléchargement du fichier.';
        switch (err.code) {
            case 'LIMIT_FILE_SIZE':
                message = 'La taille du fichier est trop grande. La taille maximale autorisée est de 5MB.';
                break;
            case 'LIMIT_UNEXPECTED_FILE':
                message = 'Champ de fichier inattendu. Attendez-vous à un champ nommé "photo".';
                break;
            case 'LIMIT_FIELD_COUNT':
                message = 'Nombre de champs trop élevé.';
                break;
            default:
                message = err.message;
        }
        return res.status(400).json({error: message});
    }

    // Gérer les erreurs de parsing JSON
    if (err instanceof SyntaxError && 'body' in err) {
        return res.status(400).json({ error: 'JSON malformé dans le corps de la requête.' });
    }

    // Gérer l'erreur "Unexpected end of form"
    if (err.message === 'Unexpected end of form') {
        return res.status(400).json({
            error: 'Le formulaire est incomplet. Assurez-vous de fournir tous les champs requis, y compris le fichier.'
        });
    }

    // Gérer d'autres erreurs génériques
    if (err) {
        console.error('Erreur inconnue:', err);
        return res.status(400).json({error: 'Erreur.'});
    }

    // Passer à la middleware suivante si aucune erreur détectée
    next();
};

export default errorHandler;