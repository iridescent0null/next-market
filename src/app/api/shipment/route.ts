import { Order } from "@/app/cart/page";
import connectDB, { connectDBForTransaction } from "@/app/utlis/database";
import { OrderModel, ShipmentModel, UserModel } from "@/app/utlis/schemaModels";
import { ClientSession, Connection, Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

type Mode = "checkout" | "retrieve";

interface ShipmentRequest {
    mode: "checkout",
    email: string,
    total: number,
    orderDate: Date,
    expectedDate: Date,
    address: string,
    zip: string,
    nation: string,
    orders: readonly Order[]
}

interface ShipmentRetrieveRequest {
    mode: "retrieve",
    email: string
}

interface ShipmentDeleteRequest {
    id: string
}

interface Shipment {
    _id?: Types.ObjectId,
    user: Types.ObjectId,
    address: string,
    zip: string,
    totalInCents: number,
    orderDate: Date,
    expectedArrival: Date,
    phase: ShipmentPhase,
    arrival?: Date, // undefined means not arrived yet
    note?: string
}

/** 0: just ordered, 1: in process, 2: shipped, 3: canneled, 4: suspended, 5: recieved */
type ShipmentPhase = 0 | 1 | 2 | 3 | 4 | 5;

interface ShipmentMessage {
    message: string
    shipments?: Shipment[]
}

interface User { 
    _id: Types.ObjectId,
    email: string
}

export async function POST (request: NextRequest) {
    let db: Connection | undefined = undefined;
    try {
        const params: ShipmentRequest | ShipmentRetrieveRequest = await request.json();

        if (params.mode === "retrieve") {
            const users: User[] = await UserModel.find({email: params.email});

            if (users.length > 1) {
                throw Error("inconsistency");
            }
            if (users.length < 1) {
                return NextResponse.json({message: "the user is gone"}, {status: 409});
            }
            const shipments: Shipment[] = await ShipmentModel.find(
                {
                    user: users[0]._id
                }
            )
            return NextResponse.json({message: "success", shipments: shipments} as ShipmentMessage);
        }

        const recalculatedTotal = 
                params.orders.reduce((acc: number, o: Order) => {return acc + (Number.parseInt(o.item.price) * o.quantity)}, 0)
                + (params.nation === "Japan"? 0 : 500);

        if (Number.isNaN(recalculatedTotal)) {
            return new NextResponse("invalid total price!", {status: 500});
        }

        if (recalculatedTotal !== params.total) {
            return new NextResponse("The information of the items is not consistent with the server", {status: 409});
        }

        // FIXME duplicated code in the retrieve mode!
        const purchasers: User[] = await UserModel.find({email: params.email});
        if (purchasers.length > 1) {
            throw new Error("fatal error"); // inconsistency!
        }

        db = await connectDBForTransaction();
        let session : ClientSession;
        db.startSession()
        .then(_session => {
            session = _session;
            return session.withTransaction(() => {
                return ShipmentModel.create({
                    user: purchasers[0]._id,
                    address: params.address,
                    zip: params.zip,
                    totalInCents: params.total * 100,
                    orderDate: params.orderDate,
                    expectedArrival: params.expectedDate,
                    phase: 0
                } as Shipment);
            })
        })
        .then(shipment => {
            return OrderModel.updateMany(
                {_id: {
                    $in: params.orders.map(order => order._id)
                }},
                {$set: {
                    shipment: shipment._id!
                }}
            )
        })
        .then(() => {
            session.endSession();
        })
        .catch(err => {
            console.error(err);
        })
        .finally(()=>{
            if(session){
                session.endSession();
            }
        })
        return NextResponse.json({message: "success!"});
    } catch (err) {
        console.error(err);
        return new NextResponse("failure", {status: 500})
    } finally {
        if (db) {
            db.close();
        }
    }
}

/**
 * DO NOT LET USERS CALL THIS \
 * Delete the purchase history. This is an exceptional operation only 
 * for managing unexpected errors or development.
 * @param request designatin the id of the shipment
 * @returns NextResponse which just shows scceeded or not
 */
export async function DELETE(request: NextRequest) {
    // FIXME authenticate and reject him if the caller is not a listed administrator
    try {
        const params: ShipmentDeleteRequest = await request.json();

        await connectDB();
        const result = await ShipmentModel.deleteOne(
            {
                _id: new Types.ObjectId(params.id)
            }
        );

        console.log("history deleted: acknowledged," + result.acknowledged + "; deleteCount, "+result.deletedCount);
        return NextResponse.json({message: "success"});
    
    } catch (err) {
        console.error(err);
        return NextResponse.json({message: "error"}, {status: 500});
    }
}

export type { ShipmentRequest };
export type { ShipmentMessage };
export type { Shipment };
export type { ShipmentRetrieveRequest };
export type { ShipmentPhase };