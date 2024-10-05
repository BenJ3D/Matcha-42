/**
 * Vérifie si un ID est valide.
 * @param id - L'ID à vérifier.
 * @returns {boolean} - `true` si l'ID est valide, `false` sinon.
 */
export function isValidId(id: any): boolean {
    const parsedId = Number(id);
    return Number.isInteger(parsedId) && parsedId >= 0 && parsedId <= 2147483647;
}