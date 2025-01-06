import { Order } from "@/app/cart/page";
import connectDB, { connectDBForTransaction } from "@/app/utlis/database";
import { OrderModel, ShipmentModel, UserModel } from "@/app/utlis/schemaModels";
import { ClientSession, Connection, Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

type Mode = "checkout" | "retrieve";
type DeleteMode = "single" | "multi" | "duration";

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

interface SingleShipmentDeleteRequest {
    mode: "single",
    id: string
}

interface MultiShipmentDeleteRequest { //no implemented yet
    mode: "multi",
    ids: string[]
}

interface DurationShipmentDeleteRequest {
    mode: "duration",
    startIncluded: string,
    endExcluded: string,
    limitation: number
}

interface Document {
    _id: string
}

interface ShipmentBulkDeletionResponse {
    message: string,
    deleted: number,
    failed: string[]
}

type ShipmentDeleteRequest = SingleShipmentDeleteRequest | MultiShipmentDeleteRequest | DurationShipmentDeleteRequest;

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
                return NextResponse.json({message: "the user is gone"}, {status: 410});
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
 * @param request designatin the shipment(s)
 * @returns NextResponse which just shows scceeded or not
 */
export async function DELETE(request: NextRequest) {

    let publicized = false; // make true and rebuild the project only when this function is needed!
    if (!publicized) {
        return NextResponse.json("",{status: 404});
    }

    try {
        const params: ShipmentDeleteRequest = await request.json();

        await connectDB();

        if (params.mode === "multi") {
            // TODO 
            return NextResponse.json({message: "not supported yet"}, {status: 400});
        }

        if (params.mode === "duration") {
            if (!params.limitation) {
                if (params.limitation < 0) {
                    return NextResponse.json({message: "you should enter positive number limitation (if you declare it as 10, only 10 or less history and these related orders will get deleted.)"},
                         {status: 400});
                }
                console.warn("bulk shipment deletion with limitation zero was requested. It technically means dry run.");
            }

            const obj =  {
                orderDate: {
                    $gt: new Date(params.startIncluded),
                    $lt: new Date(params.endExcluded)
            }};
            const shipments: Document[] = await ShipmentModel.find(
                obj 
            );

            if (shipments.length < 1) {
                return NextResponse.json({message: `there is no shipment in the duration`}, {status: 200});
            }

            if (shipments.length > params.limitation) {
                return NextResponse.json({message: `No shipment deleted. your limitation, ${params.limitation}; the number of shipment found, ${shipments.length}`}, {status: 200});
            }

            console.warn("bulk shipment deletion start. items: " + shipments.length);
            let deleted = 0;
            const failure: Document[] = [];
            for (let i = 0; i < shipments.length ; i++) {
                const result = await ShipmentModel.deleteOne(
                    {
                        _id: new Types.ObjectId(shipments[i]._id)
                    }
                );
                if (result.deletedCount > 0) {
                    deleted += result.deletedCount;
                    continue;
                }
                failure.push(shipments[i]);    
            }

            if (failure.length > 0) {
                if (deleted < 1) {
                    console.error("bulk shipment deletion failed!");
                    return NextResponse.json({message: "no shipment was deleted by internal errors", deleted: deleted, failed: failure.map(shipment=> shipment._id)} as ShipmentBulkDeletionResponse,  {status: 500});
                }
                console.error(`bulk shipment deletion failed to complete. deleted: ${deleted}, failed: ${failure}`);
                return NextResponse.json({message: "failed to complete", deleted: deleted, failed: failure.map(shipment => shipment._id) } as ShipmentBulkDeletionResponse,  {status: 500});
            }
            console.warn("purchase history deleted: " + shipments.map(shipment=> shipment._id));
            return NextResponse.json({message: "success", deleted: deleted, failed: []} as ShipmentBulkDeletionResponse);
        }

        const result = await ShipmentModel.deleteOne(
            {
                _id: new Types.ObjectId(params.id)
            }
        );

        console.warn("purchase history deleted: acknowledged, " + result.acknowledged + "; deleteCount, "+result.deletedCount);
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