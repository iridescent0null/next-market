import { NextRequest, NextResponse } from "next/server";
import { Inventory } from "./[id]/route";
import { Schema, Types } from "mongoose";
import { InventoryModel } from "@/app/utlis/schemaModels";
import connectDB from "@/app/utlis/database";

interface InventoriesMessage {
    message: string,
    inventories?: Inventory[],
    invalidIds?: string[]
}

export async function POST(request: NextRequest) {
    try {
        const ids: readonly string[] = (await request.json()).ids;
        await connectDB();

        const foundInventories: Inventory[] = await InventoryModel.find({
            item: {
                $in: ids
            }
        });

        const foundItemIds: Types.ObjectId[] = foundInventories.map(inventory => inventory.item as unknown as Types.ObjectId) ;
        const notFoundInventories = ids.filter(id => foundItemIds.find(foundItemIdsId => foundItemIdsId.toString() === id));

        return NextResponse.json({message: "success", inventories:foundInventories, invalidIds:notFoundInventories} as InventoriesMessage);
    } catch (err) {
        console.error(err);
        return NextResponse.json({message: "falilure"} as InventoriesMessage);
    }
}

export type { InventoriesMessage };