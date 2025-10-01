import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

dbConnect();
export default dbConnect;