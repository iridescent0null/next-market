import connectDB from "@/app/utlis/database";
import { Schema } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { Item } from "../item/[id]/route";
import { ItemModel, OrderModel, UserModel } from "@/app/utlis/schemaModels";
import { Order } from "@/app/cart/page";

interface CartCreationRequest {
    item: Schema.Types.ObjectId,
    quantity: number,
    email: string
}

interface User { // temporal interface for dev
    _id: Schema.Types.ObjectId,
    email: string
}

interface CartMessage {
    message: string,
    orders?: Order[]
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
                "quantity": params.quantity
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

        await connectDB(); //FIXME don't connect the DB as the user
        const users: User[] = await UserModel.find({email: params.email});
        if (!users || users.length < 1) {
            return new NextResponse("the user is gone", {status: 410});
        }

        if (users.length > 1) {
            // inconsistency!
            console.error("something very bad happens...");
            throw new Error();
        }

        const orders: Order[] = await OrderModel.find({user: users[0]});
        return NextResponse.json({message: "success", orders:orders} as CartMessage);

    } catch (err) {
        console.log(err);
        return new NextResponse("failure", {status: 500});
    }
}

export type { CartMessage };
    // retrieving, not creation