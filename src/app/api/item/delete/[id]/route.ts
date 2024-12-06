import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/app/utlis/database";
import { ItemModel } from "@/app/utlis/schemaModels";
import ResponseContext from "../../readsingle/[id]/route";

export async function DELETE(request: NextRequest, context: ResponseContext) {
    const reqBody = await request.json();
    try {
        await connectDB();
        const params = await context.params;
        const item = await ItemModel.findById(params.id);

        if (!item || item.email !== reqBody.email) {
            // this deceptively says the item is there when the given id is wrong. 
            return NextResponse.json({message: "You don't have privilege to delete the item"});
        }

        await ItemModel.deleteOne({_id: params.id});
        return NextResponse.json({message: "deleted the item successfully"});
    } catch (err) {
        return NextResponse.json({messaga: "failed to delete the item"});
    }
}