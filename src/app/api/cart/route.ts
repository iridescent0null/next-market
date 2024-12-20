import connectDB from "@/app/utlis/database";
import { Schema } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { Item } from "../item/[id]/route";
import { ItemModel, OrderModel, UserModel } from "@/app/utlis/schemaModels";

interface CartCreationRequest {
    item: Schema.Types.ObjectId,
    quantity: number,
    email: string
}

interface CartDeleteRequest {
    item: Schema.Types.ObjectId,
    email: string
}

interface User { // temporal interface for dev
    _id: Schema.Types.ObjectId,
    email: string
}

interface CartMessage {
    message: string,
    orders?: MaterializedOrder[],
    error?: string // currently DELETE only uses it
}

interface OrderInMongo { // in DB
    item: string,
    quantity: number,
    user: string
}

interface MaterializedOrder { // should returned
    item: Item,
    quantity: number,
    user: string
}


export async function PUT (request: NextRequest) {
    try {
        const params: CartCreationRequest = await request.json();
        await connectDB();

        const item: Item | null = await ItemModel.findById(params.item);
        const users: User[] = await UserModel.find({email: params.email});

        if (!item) {
            return new NextResponse("the item is gone", {status: 410});
        }

        if (!users || users.length < 1) {
            return new NextResponse("the user is gone", {status: 410});
        }

        if (users.length > 1) {
            // inconsistency!
            console.error("something very bad happens...");
            throw new Error();
        }

        const dbResult = await OrderModel.updateOne(
            {
                "item": params.item,
                "user": users[0]
            },
            {
                $inc: {
                    "quantity": params.quantity
                }
            },
            {"upsert": true}
        );

        return NextResponse.json({message: "OK", number: dbResult.upsertedCount}); //TODO sophisticate
    } catch (err) {
        console.error(err);
        return new NextResponse("failure", {status: 500});
    }
}

export async function POST(request: NextRequest) {
    try {
        const params: User = await request.json();

        await connectDB();
        const users: User[] = await UserModel.find({email: params.email});
        if (!users || users.length < 1) {
            return new NextResponse("the user is gone", {status: 410});
        }

        if (users.length > 1) {
            // inconsistency!
            console.error("something very bad happens...");
            throw new Error();
        }

        const retrievedOrders: OrderInMongo[] = await OrderModel.find({user: users[0]});

        const ids = retrievedOrders.map(order => order.item)
        const foundItems: Item[] = await ItemModel.find({
            _id: {
                $in: ids
            }
        });

        const filledOrders = retrievedOrders.map(order => { 
            return {
                item: foundItems.find(item => item._id.toString() === order.item.toString()),
                quantity: order.quantity,
                user: order.user
            } as MaterializedOrder
        });

        return NextResponse.json({message: "success", orders:filledOrders} as CartMessage);

    } catch (err) {
        console.log(err);
        return new NextResponse("failure", {status: 500});
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const params: CartDeleteRequest = await request.json();

        await connectDB();
        const users: User[] = await UserModel.find({email: params.email});
        if (!users || users.length < 1) {
            return new NextResponse("the user is gone", {status: 410});
        }

        if (users.length > 1) {
            // inconsistency!
            console.error("something very bad happens...");
            throw new Error();
        }

        const result = await OrderModel.deleteOne({
            item: params.item,
            user:users[0]
        });

        if (result.deletedCount < 1) {
            return NextResponse.json({message: "success", error:"no item was deleted"} as CartMessage);
        }

        return NextResponse.json({message: "success"} as CartMessage);

    } catch (err) {
        console.log(err);
        return new NextResponse("failure", {status: 500});
    }
}

export type { CartMessage };
export type { CartCreationRequest };
export type { CartDeleteRequest };