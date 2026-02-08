import { RegisterUserData } from "./auth.types";

export const validateRegisterUserData = ({ name, email, password }: RegisterUserData) => {
    if (!name || !email || !password) {
        throw {
            statusCode: 400,
            message: "All fields are required"
        }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw {
            statusCode: 400,
            message: 'Invalid email format',
        };
    }

    if (password.length < 8) {
        throw {
            statusCode: 400,
            message: 'Password must be at least 8 characters long',
        };
    }
}