import { compare, hash } from "bcryptjs";
import { prisma } from "../../config/db";
import { RegisterUserData, LoginUserData } from "./auth.types"
import { validateRegisterUserData } from "./auth.validator";
import ApiError from "../../utils/ApiError";

// Register user service
export const registerUserService = async (userData: RegisterUserData) => {
    // Validate user data
    validateRegisterUserData(userData);

    let { client_id, client_secret, name, email, password } = userData;

    email = email.toLowerCase().trim();

    // Authenticate project
    const project = await prisma.project.findUnique({
        where: {
            client_id
        }
    })

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    if (!project.is_active) {
        throw new ApiError(400, "Project is not active");
    }

    const isClientSecretValid = await compare(client_secret, project.client_secret_hash);

    if (!isClientSecretValid) {
        throw new ApiError(401, "Invalid client secret");
    }

    // Transaction Starts
    return await prisma.$transaction(async (tx) => {
        let projectUser;

        // Check if user already exists
        let user = await tx.user.findUnique({
            where: {
                email
            }
        })

        if (!user) {
            user = await tx.user.create({
                data: {
                    name,
                    email,
                    password_hash: await hash(password, 10),
                }
            })
        }

        // Check if user is already registered in the project
        const existingProjectUser = await tx.projectUser.findUnique({
            where: {
                project_id_user_id: {
                    project_id: project.id,
                    user_id: user.id,
                }
            }
        })

        if (existingProjectUser) {
            if (existingProjectUser.status === "active") {
                throw new ApiError(409, "User is already registered in the project");
            }

            if (existingProjectUser.status === "suspended") {

                throw new ApiError(403, "User is suspended in the project");
            }

            if (existingProjectUser.status === "invited") {
                projectUser = await tx.projectUser.update({
                    where: {
                        project_id_user_id: {
                            project_id: project.id,
                            user_id: user.id,
                        }
                    },
                    data: {
                        status: "active",
                        joined_at: new Date(),
                    }
                })
            }
        } else {
            projectUser = await tx.projectUser.create({
                data: {
                    project_id: project.id,
                    user_id: user.id,
                    status: "active",
                    joined_at: new Date(),
                }
            })
        }

        // Assign default role to the user
        const memberRole = await tx.role.findFirst({
            where: {
                project_id: project.id,
                name: "MEMBER"
            }
        })

        if (!memberRole) {
            throw new ApiError(404, "Default MEMBER role not configured for project");
        }

        // Return response
        return {
            message: "User registered successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                project_id: project.id
            }
        }
    })
}

// Login user service
export const loginUser = async (userData: LoginUserData) => {
    let { client_id, client_secret, email, password } = userData;

    email = email.toLowerCase().trim();

    const project = await prisma.project.findUnique({
        where: {
            client_id
        }
    })

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    if (!project.is_active) {
        throw new ApiError(400, "Project is not active");
    }

    // Validate client secret
    const isClientSecretValid = await compare(client_secret, project.client_secret_hash);

    if (!isClientSecretValid) {
        throw new ApiError(401, "Invalid client secret");
    }

    // Find user by email
    const user = await prisma.user.findUnique({
        where: {
            email
        }
    })

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await compare(password, user.password_hash);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    // Check membership
    const projectUser = await prisma.projectUser.findUnique({
        where: {
            project_id_user_id: {
                project_id: project.id,
                user_id: user.id,
            }
        }
    })
}

export const refreshSession = () => { }

export const logoutUser = () => { }