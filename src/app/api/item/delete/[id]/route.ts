import { NextResponse } from "next/server";
import connectDB from "@/app/utlis/database";
import { ItemModel } from "@/app/utlis/schemaModels";
import ResponseContext from "../../readsingle/[id]/route";

export async function DELETE(ignored: unknown, context: ResponseContext){
    try {
        await connectDB();
        const params = await context.params;
        await ItemModel.deleteOne({_id: params.id});
        return NextResponse.json({message: "Deleted the item successfully"});
    } catch (err) {
        return NextResponse.json({messaga: "Failed to delete the item"});
    }
}