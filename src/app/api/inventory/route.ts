import { NextRequest, NextResponse } from "next/server";
import { Inventory } from "./[id]/route";
import { Schema } from "mongoose";
import { InventoryModel } from "@/app/utlis/schemaModels";
import connectDB from "@/app/utlis/database";

interface InventoriesMessage {
    message: string,
    inventories: Inventory[],
    invalidIds: Schema.Types.ObjectId[]
}

export async function POST(request: NextRequest) {
    try {
        const ids: readonly Schema.Types.ObjectId[] = (await request.json()).ids;
        await connectDB();

        const foundInventories = await InventoryModel.find({
            item: {
                $in: ids
            }

        });
        return NextResponse.json({message: "success", inventories:foundInventories} as InventoriesMessage);
    } catch (err) {
        //TODO
    }
}

export type {InventoriesMessage};