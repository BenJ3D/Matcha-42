import nodemailer from 'nodemailer';
import config from './config';

const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
    },
});

export default transporter;