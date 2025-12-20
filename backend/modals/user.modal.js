import mongoose from 'mongoose';
import { hashPassword } from '../utils/passwordUtils.js';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        // required: true,
        default: 'Admin',
        enum: ['Admin', 'SuperAdmin', 'User'],
    },
    // refreshToken: {
    //     type: String,
    //     default: null,
    // },
    // expiresAt: {
    //     type: Date,
    //     default: null,
    // },
    resetPasswordToken: {
        type: String,
        default: null,
    },
    resetPasswordExpires: {
        type: Date,
        default: null,
    },
    // tokenVersion: {
    //     type: Number,
    //     default: 0,
    // },
},{timestamps: true})

//hash password before saving
userSchema.pre('save', async function(next){
    const user = this;
    if(user.isModified('password')){
        user.password = await hashPassword(user.password);
    }
    next();
})

userSchema.index({ email: 1 }, { unique: true });


const User = mongoose.model('User', userSchema);

export default User;