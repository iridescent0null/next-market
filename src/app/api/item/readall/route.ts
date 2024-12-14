import { NextResponse } from "next/server";
import connectDB from "@/app/utlis/database"; // suggested in the different form in the Miyoshi's text
import { ItemModel } from "@/app/utlis/schemaModels";
import { Item } from "../[id]/route";

interface AllItemsMessage {
    message: string,
    items?: Item[], // undefined means no result, not normal 0 hit
    ids?: string[]
    count: number
}

interface GETContext {
    url: string
}

/** valid type options (currently never refered to technically) */
type searchType = "count" | "id";

const paramsRegex = /(?<=(http(s){0,1}\:\/\/.*readall\?))(.*)/;

/**
 * GET all items. You can use an option by writing like ~/readitem?type=count in the url:\
 * count: only returns the number of the items which you can retrieve\
 * id: only returns the ids of the items which you can retrieve. 
 * The values are unwrapped (e.g. [aaa,bbb,ccc], not [{_id:aaa},{_id:bbb},{_id:ccc}])\
 * (default): retrive all data\
 * @param context 
 * @returns AllItemsMessage object with the data you specified or all data (default)
 */
export async function GET(context?: GETContext) {
    try {
        await connectDB();
        const count =  (await ItemModel.find (ItemModel.countDocuments())).length;

        if (context && context.url) {
            const paramsInURL = context.url.match(paramsRegex);
            const params = paramsInURL? paramsInURL[0].split("&") : null;
            if (params) {
                // currently lefter option wins (not documented)
                const types = params.filter(entry => entry && entry.startsWith("type="))?.map(entry => entry.split("=")[1]);
                if (types.find(value => value === "count")) {
                    return NextResponse.json({message: "read all items sucessfully", count:count} as AllItemsMessage);
                }
                if (types.find(value => value === "id")) {
                    const ids: string[] = (await ItemModel.find().select("_id")).map(obj => obj._id);
                    return NextResponse.json({message: "read all items sucessfully", count:count, ids:ids} as AllItemsMessage);
                }
            }    
        }

        const allItems: Item[] = await ItemModel.find();
        return NextResponse.json({message: "read all items sucessfully", items: allItems, count:count} as AllItemsMessage);
    } catch (err) {
        return NextResponse.json({message: "failed to read all items"} as AllItemsMessage);
    }
}

export type { AllItemsMessage };