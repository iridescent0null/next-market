import { NextRequest, NextResponse } from "next/server";
import { Item } from "./[id]/route";
import connectDB from "@/app/utlis/database";
import { ItemModel } from "@/app/utlis/schemaModels";

interface ItemsMessage {
    message: string,
    items?: Item[],
    notFound?: string[] // has not been used yet
}

/** 
 * retrieve items using given ids (should be string[]) from the DB. \
 * valid but not found ids are omitted implicitly.
 */
export async function POST(request: NextRequest) {
    try {
        const ids: readonly string[] = (await request.json()).ids;
        await connectDB();

        const foundItems: Item[] = await ItemModel.find({
            _id: {
                $in: ids
            }
        });
        return NextResponse.json({message: "success", items: foundItems} as ItemsMessage);
    } catch (err) {
        console.error(err);
        return new NextResponse("failure", {status: 400});
        // return NextResponse.json({message: "failure"})
    }
}

export type { ItemsMessage };  