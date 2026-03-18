"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminEmail || !adminPassword) {
        throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set');
    }
    const existing = await prisma.user.findUnique({
        where: { email: adminEmail }
    });
    if (existing) {
        console.log('Admin already exists');
        return;
    }
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
        data: {
            email: adminEmail,
            password: hashedPassword,
            role: client_1.UserRole.ADMIN,
            status: 'ACTIVE'
        }
    });
    console.log('✅ Admin user created');
}
main()
    .catch(e => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-admin.js.map