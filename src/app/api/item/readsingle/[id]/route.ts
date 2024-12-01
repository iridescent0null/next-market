import { NextResponse } from "next/server";
import connectDB from "@/app/utlis/database";
import { ItemModel } from "@/app/utlis/schemaModels";

interface Parameter {
    id: string
}
interface ResponseContext {
    params: Promise<Parameter>
}

export async function GET(ignored: unknown, context: ResponseContext) { // context must be placed in the second position
    const params: Parameter = await context.params;
    try {
        await connectDB();
        const item = await ItemModel.findById(params.id);
        return NextResponse.json({message: "read an item sucessfully", item: item});
    } catch (err) {
        return NextResponse.json({message: "failed to read an item"});
    }
}