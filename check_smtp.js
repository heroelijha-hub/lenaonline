const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');

const prisma = new PrismaClient();

async function main() {
  const settingsDb = await prisma.setting.findMany({
    where: {
      key: {
        in: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM', 'CONTACT_RECEIVER_EMAIL']
      }
    }
  });

  const settings = settingsDb.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
  console.log('Settings:', { ...settings, SMTP_PASS: settings.SMTP_PASS ? '***' : undefined });

  if (!settings.SMTP_HOST || !settings.SMTP_USER || !settings.SMTP_PASS) {
    console.log('SMTP config missing');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: settings.SMTP_HOST,
    port: parseInt(settings.SMTP_PORT || '587'),
    secure: settings.SMTP_PORT === '465',
    auth: {
      user: settings.SMTP_USER,
      pass: settings.SMTP_PASS,
    },
    connectionTimeout: 10000
  });

  try {
    console.log('Verifying connection...');
    await transporter.verify();
    console.log('Connection verified successfully!');
  } catch (err) {
    console.error('Error verifying connection:', err);
  }
}

main().finally(() => prisma.$disconnect());
