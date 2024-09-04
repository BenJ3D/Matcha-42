import bcrypt from 'bcrypt';

export class PasswordService {


    static async hashPassword(password: string): Promise<string> {

        return await bcrypt.hash(password, 10);
    }

    static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }
}
