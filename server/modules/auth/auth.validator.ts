import ApiError from "../../utils/ApiError";
import { RegisterUserData } from "./auth.types";

export const validateRegisterUserData = ({ name, email, password }: RegisterUserData) => {
    if (!name || !email || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError(400, 'Invalid email format');
    }

    if (password.length < 8) {
        throw new ApiError(400, 'Password must be at least 8 characters long');
    }
}