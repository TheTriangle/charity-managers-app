import {auth} from "../../firebase/config";
import {AuthMethods} from "../model/authMethods";

export const userExists = async (
    email: string,
) => {
    const methods = await auth.fetchSignInMethodsForEmail(email)
    let result = AuthMethods.NONE
    if (methods.includes("password")) {
        result |= AuthMethods.EMAIL
    }
    if (methods.includes("google.com")) {
        result |= AuthMethods.GOOGLE
    }
    if (methods.includes("apple.com")) {
        result |= AuthMethods.APPLE
    }
    return result
}
