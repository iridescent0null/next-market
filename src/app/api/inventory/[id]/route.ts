import { NextRequest, NextResponse } from "next/server";
import RequestContext, { Parameter, Item } from "../../item/[id]/route";
import connectDB from "@/app/utlis/database";
import { InventoryModel, ItemModel } from "@/app/utlis/schemaModels";

interface InventoryCreateRequest {
    release: Date,
    discontinue?: Date,
    stock?: number,
    specialPrice?: string,
}

interface Inventory extends InventoryCreateRequest {
    _id: string,
    stock: number
    item: string 
}

interface UpsertMessage {
    message: string,
    inserted?: boolean,
    itemId?: string
}

interface InventoryMessage {
    message: string,
    inventory?: Inventory
}

export async function PUT(request: NextRequest, context: RequestContext) { // TODO reject request without reqiured values (MongoDB doesn't do for some reason) 
    const urlParams: Parameter = await context.params;
    const bodyParam: InventoryCreateRequest = await request.json();
    try {
        await connectDB();

        const item: Item | null = await ItemModel.findById(urlParams.id);

        if (!item) {
            return new NextResponse("the item is gone", {status: 410});
        }
        
        const dbResult = await InventoryModel.updateOne(
            {"item": urlParams.id},
            {
                ...bodyParam, ...{"item": urlParams.id}
            },
            {"upsert": true}
        );

        if (dbResult.upsertedCount < 1 && dbResult.modifiedCount < 1) {
            return NextResponse.json ({
                message: "NOT upserted (you might input the same data)"
            } as UpsertMessage);
        }

        return NextResponse.json ({
            message: "inventory upserted",
            inserted: (dbResult.upsertedCount - dbResult.modifiedCount) > 0,
            itemId: urlParams.id
        } as UpsertMessage);
    } catch (err) {
        console.error(err);
        return new NextResponse("failure", {status: 500});
    }
}

export async function GET(ignored: unknown, context: RequestContext) {
    const urlParams: Parameter = await context.params;
    try {
        await connectDB();
        const inventories: Inventory[] = await InventoryModel.find({item:urlParams.id});

        if (!inventories || inventories.length < 1) {
            return NextResponse.json({
                    message: "not found (you must use an id of an Item, instead of one of an inventory record)"
            } as InventoryMessage);
        }

        if (inventories.length > 1) {
            console.error("duplicated inventry records found!: " + inventories);
            return new NextResponse("FATAL ERROR", {status: 500});
        }
        return NextResponse.json({message: "found", inventory: inventories[0]} as InventoryMessage)
    } catch (err) {
        console.error(err);
        return new NextResponse("failure", {status: 500});
    }
}

export type { Inventory, InventoryMessage };