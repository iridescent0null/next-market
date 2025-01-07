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
    const requestShadowText = await request.clone().text();
    if (requestShadowText.length < 1) {
        console.warn("blank request for item post!");
        console.log(request);
        return NextResponse.json({message: "blank request"}, {status: 400});
    }
    try {
        const ids: readonly string[] = (await request.json()).ids;
        await connectDB();

        const foundItems: Item[] = await ItemModel.find({
            _id: {
                $in: ids
            }
        });

        const invalidIds = ids.filter(id => foundItems.filter(item => item._id.toString() === id));

        return NextResponse.json({message: "success", items: foundItems, notFound: invalidIds} as ItemsMessage);
    } catch (err) {
        console.error(err);
        return new NextResponse("failure", {status: 400});
    }
}

export type { ItemsMessage };  