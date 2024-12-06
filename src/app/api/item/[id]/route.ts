import { NextResponse } from "next/server";
import connectDB from "@/app/utlis/database";
import { ItemModel } from "@/app/utlis/schemaModels";

interface Parameter {
    id: string
}
interface ResponseContext {
    params: Promise<Parameter>
}

// FIXME rectify the path of this page (readsingle is bizarre)

interface Item {
    _id: string,
    title: string,
    image: string,
    price: string,
    description: string,
    email: string,
    __v: number
}

interface ItemMessage {
    message: string,
    item?: Item
}

export async function GET(ignored: unknown, context: ResponseContext) { // context must be placed in the second position
    const params: Parameter = await context.params;
    try {
        await connectDB();
        const item = await ItemModel.findById(params.id);
        return NextResponse.json({message: "read an item sucessfully", item: item} as ItemMessage);
    } catch (err) {
        console.error(err); 
        return NextResponse.json({message: "failed to read an item"} as ItemMessage);
    }
}

export default ResponseContext; // FIXME move it to more appropriate place
export type { Item };
export type { ItemMessage };