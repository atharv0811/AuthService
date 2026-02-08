import { compare, hash } from "bcryptjs";
import { prisma } from "../../config/db";
import { RegisterUserData } from "./auth.types"
import { validateRegisterUserData } from "./auth.validator";

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
        throw {
            statusCode: 404,
            message: "Project not found"
        }
    }

    if (!project.is_active) {
        throw {
            statusCode: 400,
            message: "Project is not active"
        }
    }

    const isClientSecretValid = await compare(client_secret, project.client_secret_hash);

    if (!isClientSecretValid) {
        throw {
            statusCode: 401,
            message: "Invalid client secret"
        }
    }

    // Transaction Starts
    return await prisma.$transaction(async (tx) => {
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
                throw {
                    statusCode: 409,
                    message: "User is already registered in the project"
                }
            }

            if (existingProjectUser.status === "suspended") {
                throw {
                    statusCode: 403,
                    message: "User is suspended in the project"
                }
            }

            if (existingProjectUser.status === "invited") {
                await tx.projectUser.update({
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
            await tx.projectUser.create({
                data: {
                    project_id: project.id,
                    user_id: user.id,
                    status: "active",
                    joined_at: new Date(),
                }
            })
        }

        // Assign default role to the user

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

export const loginUser = () => { }

export const refreshSession = () => { }

export const logoutUser = () => { }