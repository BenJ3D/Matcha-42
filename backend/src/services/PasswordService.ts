import bcrypt from 'bcryptjs';

export class PasswordService {
    static async hashPassword(password: string): Promise<string> {
        try {
            return await bcrypt.hash(password, 10);
        } catch (error) {
            throw error;
        }
    }

    static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
        try {
            return await bcrypt.compare(password, hashedPassword);
        } catch (error) {
            throw error;
        }
    }
}
