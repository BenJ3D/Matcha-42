/**
 * Valide un ID en vérifiant s'il est conforme aux critères spécifiés.
 *
 * @param id - L'ID à valider, pouvant être de n'importe quel type.
 * @param res - L'objet de réponse Express utilisé pour envoyer une réponse en cas d'ID invalide.
 * @throws {Error} Si l'ID n'est pas valide, une réponse avec le statut 400 sera renvoyée.
 */
export function validateIdNumber(id: any, res: any): any {
    if (!isValidInterger(id)) {
        throw res.status(400).json({
            "error": {
                "message": "ID invalide",
            }
        })
    }
}

function isValidInterger(id: any) {
    return Number.isInteger(id) && id >= 0 && id <= 2147483647;
}
    