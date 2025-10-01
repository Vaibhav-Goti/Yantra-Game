import pkg from 'bcryptjs';
const { hash, compare } = pkg;

const hashPassword = async (pass) => {
    try {
        const encryptPass = await hash(pass, 10)
        return encryptPass
    } catch (error) {
        throw error
    }
}

const verifyHashPassword = async (pass, hashPass) => {
    try {
        const verifyPass = await compare(pass, hashPass);
        return verifyPass;
    } catch (error) {
        console.error("Error in bcrypt.compare:", error);
        throw error;
    }
};


export { hashPassword, verifyHashPassword }