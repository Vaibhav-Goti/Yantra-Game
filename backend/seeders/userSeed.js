import dotenv from "dotenv"
dotenv.config()

import '../config/dbConnect.js'
import User from "../modals/user.modal.js"
import mongoose from "mongoose"
const UserSeed = async () => {
    try {
        const superAdmin = new User({
            name: 'Super Admin',
            email: 'superAdmin@gmail.com',
            password: 'SuperAdmin@123',
            role: 'SuperAdmin'
        })

        await superAdmin.save();

        // Disconnect cleanly
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.log(error.message);
        // Disconnect cleanly
        await mongoose.disconnect();
        process.exit(1);
    }
}

UserSeed();