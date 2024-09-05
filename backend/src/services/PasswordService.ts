import bcrypt from 'bcryptjs';

export class PasswordService {
    static async hashPassword(password: string): Promise<string> {
        try {
            console.log("Coucou BCRYPT");
            return await bcrypt.hash(password, 10);
        } catch (error) {
            console.error('Error hashing password:', error);
            throw error; // Re-lance l'erreur pour être capturée dans createUser
        }
    }

    static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
        try {
            console.log("Coucou Verify Password:", password, ' hashedPassword:', hashedPassword);
            return await bcrypt.compare(password, hashedPassword);
        } catch (error) {
            console.error('Error verifying password:', error);
            throw error;
        }
    }
}
