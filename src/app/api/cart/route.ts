import connectDB from "@/app/utlis/database";
import { Schema, Types } from "mongoose";
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
    email: string,
    option?: Option
}

interface Option {
    shipments: undefined | Types.ObjectId[]
}

interface CartCreationMessage {
    message: string,
    inserted: boolean
}

interface CartMessage {
    message: string,
    orders?: MaterializedOrder[],
    error?: string // currently DELETE only uses it
}

interface OrderInMongo { // in DB
    item: string,
    quantity: number,
    user: string,
    _id: Types.ObjectId,
    shipment?: Types.ObjectId
}

interface MaterializedOrder { // should returned
    _id: Types.ObjectId,
    item: Item,
    quantity: number,
    user: string,
    shipment?: Types.ObjectId
}

export async function PUT (request: NextRequest) {　// this function doesn't have idempotency...
    try {
        const params: CartCreationRequest = await request.json();

        if (!params.item
            || !params.quantity // 0 quantity also gets rejected
            || !params.email
        ) {
            return new NextResponse("item, quantity(positive) and email are needed", {status: 400});
        }

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
                "user": users[0],
                "shipment": undefined
            },
            {
                $inc: {
                    "quantity": params.quantity
                }
            },
            {"upsert": true}
        );

        return NextResponse.json({message: "success", inserted:dbResult.upsertedCount > 0 } as CartCreationMessage);
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

        const queryObject = (!params.option || !params.option.shipments)?
            {shipment: undefined}
            :(params.option.shipments.length < 1)? 
                {} // TODO show the meaning of the empty object
                :{shipment: {$in: params.option.shipments}};

        const retrievedOrders: OrderInMongo[] = await OrderModel.find(
            {
                ...queryObject,
                user: users[0]._id
            }
        );

        const ids = retrievedOrders.map(order => order.item)
        const foundItems: Item[] = await ItemModel.find({
            _id: {
                $in: ids
            }
        });

        const filledOrders = retrievedOrders.map(order => { 
            return {
                _id: order._id,
                item: foundItems.find(item => item._id.toString() === order.item.toString()),
                quantity: order.quantity,
                user: order.user,
                shipment: order.shipment
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
export type { CartCreationMessage };
export type { CartCreationRequest };
export type { CartDeleteRequest };
export type { MaterializedOrder };
export type { User };