import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from "../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })

const prisma = new PrismaClient({
    adapter,
    log: ["query", "info", "warn", "error"],
})

const PERMISSIONS = [
    // Project
    {
        key: "project:read",
        description: "Read project details",
    },
    {
        key: "project:update",
        description: "Update project settings",
    },
    {
        key: "project:delete",
        description: "Delete project",
    },

    // Users
    {
        key: "user:invite",
        description: "Invite users to project",
    },
    {
        key: "user:suspend",
        description: "Suspend project user",
    },
    {
        key: "user:remove",
        description: "Remove user from project",
    },

    // Roles & permissions
    {
        key: "role:create",
        description: "Create roles",
    },
    {
        key: "role:update",
        description: "Update roles",
    },
    {
        key: "role:assign",
        description: "Assign roles to users",
    },

    // Auth / config
    {
        key: "auth:configure",
        description: "Configure authentication settings",
    },
];

async function main() {
    console.log("🌱 Seeding permissions...");

    for (const permission of PERMISSIONS) {
        await prisma.permission.upsert({
            where: { key: permission.key },
            update: {}, // do nothing if exists
            create: {
                key: permission.key,
                description: permission.description,
            },
        });
    }

    console.log("✅ Permission seeding completed");
}

main()
    .catch((error) => {
        console.error("❌ Error while seeding permissions:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
