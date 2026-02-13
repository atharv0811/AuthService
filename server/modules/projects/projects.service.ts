import { hash } from "bcryptjs";
import { prisma } from "../../config/db";
import { CreateProjectData } from "./projects.types";
import { v4 as uuidv4 } from "uuid";
import ApiError from "../../utils/ApiError";

export const createProjectService = async (data: CreateProjectData, userId: number) => {
    let { name } = data;

    name = name.trim();

    if (!name) {
        throw new ApiError(400, "Project name is required");
    }

    if (name.length < 3) {
        throw new ApiError(400, "Project name must be at least 3 characters long");
    }

    const isProjectNameExist = await prisma.project.findUnique({
        where: {
            name,
        },
    });

    if (isProjectNameExist) {
        throw new ApiError(400, "Project name already exist");
    }

    const clientId = uuidv4();
    const clientSecret = uuidv4();

    const clientSecretHash = await hash(clientSecret, 10);

    return await prisma.$transaction(async (tx) => {
        const project = await tx.project.create({
            data: {
                name,
                client_id: clientId,
                client_secret_hash: clientSecretHash,
            },
        });

        const projectUser = await tx.projectUser.create({
            data: {
                project_id: project.id,
                user_id: userId,
                status: "active",
                joined_at: new Date(),
            },
        });

        const roles = await tx.role.createManyAndReturn({
            data: [
                { name: "OWNER", project_id: project.id, is_system: true },
                { name: "ADMIN", project_id: project.id, is_system: true },
                { name: "MEMBER", project_id: project.id, is_system: true },
            ],
        });

        const permissions = await tx.permission.findMany();

        const ownerRole = roles.find((role) => role.name === "OWNER");
        const adminRole = roles.find((role) => role.name === "ADMIN");
        const memberRole = roles.find((role) => role.name === "MEMBER");

        if (!ownerRole || !adminRole || !memberRole) {
            throw new ApiError(500, "Default roles not found");
        }

        await tx.userRole.create({
            data: {
                project_user_id: projectUser.id,
                role_id: ownerRole.id,
            },
        })

        await tx.rolePermission.createMany({
            data: permissions.map((permission) => {
                return {
                    role_id: ownerRole.id,
                    permission_id: permission.id,
                };
            }),
        });

        await tx.rolePermission.createMany({
            data: permissions
                .filter((permission) => !["project:delete"].includes(permission.key))
                .map((permission) => ({
                    role_id: adminRole.id,
                    permission_id: permission.id,
                })),
        });

        await tx.rolePermission.createMany({
            data: permissions
                .filter((p) => ["project:read", "task:read"].includes(p.key))
                .map((permission) => ({
                    role_id: memberRole.id,
                    permission_id: permission.id,
                })),
        });

        return {
            project,
            clientId,
            clientSecret
        }
    });
};
