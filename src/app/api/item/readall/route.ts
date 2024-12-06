import { NextResponse } from "next/server";
import connectDB from "@/app/utlis/database"; // suggested in the different form in the Miyoshi's text
import { ItemModel } from "@/app/utlis/schemaModels";
import { Item } from "../[id]/route";

interface AllItemsMessage {
    message: string,
    items?: Item[] // undefined means error, not normal 0 hit
}

export async function GET() {
    try {
        await connectDB();
        const allItems = await ItemModel.find();
        return NextResponse.json({message: "read all items sucessfully", items: allItems} as AllItemsMessage);
    } catch (err) {
        console.error(err);  //TODO test this line
        return NextResponse.json({message: "failed to read all items"} as AllItemsMessage);
    }
}

export type { AllItemsMessage };