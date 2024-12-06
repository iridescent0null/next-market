import mongoose from "mongoose";

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
    title: String, // "string" doesn't work out here!
    image: String, 
    price: String,
    description: String,
    email: String
});

const UserSchema = new Schema({
    name: String,
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String, // Should be hashed one
        required: true
    },
    salt: {
        type: String,
        required: true    
    }
});

export const ItemModel = mongoose.models.Item || mongoose.model("Item", ItemSchema); // what's the former??
export const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);