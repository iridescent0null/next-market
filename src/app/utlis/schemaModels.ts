import mongoose from "mongoose";

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
    title: String,
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

const InventorySchema = new Schema({
    release: { //TODO reject null
        type: Date,
        required: true
    },
    discontinue: Date,
    stock: {
        type: Number,
        require: true,
        default: 0
    },
    specialPrice: String,
    item: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Item"
    }
});

export const ItemModel = mongoose.models.Item || mongoose.model("Item", ItemSchema); // what's the former??
export const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);
export const InventoryModel = mongoose.models.Inventory || mongoose.model("Inventory", InventorySchema);