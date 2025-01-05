import mongoose, { Query, Types } from "mongoose";

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
    title: String,
    image: String, 
    price: String,
    description: String,
    email: {
        type: String,
        required: true    
    }
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

const OrderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"   
    },
    item: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Item"
    },
    quantity: {
        type: Number,
        required: true
    },
    shipment: {
        type: Schema.Types.ObjectId,
        ref: "Shipment"
    }
});

OrderSchema.index(
    {user: 1, item: 1, shipment: 1},
    {unique: true}
);

const ShipmentSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"  
    },
    address: {
        type: String,
        required: true
    },
    zip: {
        type: String,
        required: true  
    },
    totalInCents: {
        type: Number,
        required: true
    },
    orderDate: {
        type: Date,
        required: true
    },
    expectedArrival: {
        type: Date,
        required: true
    },
    phase: { 
        type: Number,
        require: true,
        default: 0 // 0: just ordered, 1: in process, 2: shipped, 3: canneled, 4: suspended, 5: recieved
    },
    arrival: {
        type: Date 
    },
    note: {
        type: String
    }
});

ShipmentSchema.pre("deleteOne", async function(next) {
    // delete orders which linked with the shipment to be deleted

    // horribly complicated type copied from the editor... (seems to work out)
    const query: Query<unknown, unknown, unknown, unknown, "find", Record<string, never>> = this; 

    const result = await OrderModel.deleteMany({
        shipment: new Types.ObjectId(query.getQuery()._id as string)
    })

    if (result.deletedCount < 1) {
        console.error(result);
        throw new Error("failed to delete orders!");
    }

    console.log("cascade delete result: acknowledged," + result.acknowledged +"; deleteCount, "+result.deletedCount);
    next();
});

const ShipmentOrderRelationSchema = new Schema({
    shipment: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Shipment"   
    },
    order: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Order"  
    }
});

ShipmentOrderRelationSchema.index(
    {user: 1, item: 1},
    {unique: true}
);

export const ItemModel = mongoose.models.Item || mongoose.model("Item", ItemSchema); // what's the former??
export const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);
export const InventoryModel = mongoose.models.Inventory || mongoose.model("Inventory", InventorySchema);
export const OrderModel = mongoose.models.Order || mongoose.model("Order" , OrderSchema);
export const ShipmentModel = mongoose.models.Shipment || mongoose.model("Shipment", ShipmentSchema);
export const ShipmentOrderRelationModel = mongoose.models.ShipmentOrderRelation || mongoose.model("ShipmentOrderRelation", ShipmentOrderRelationSchema);