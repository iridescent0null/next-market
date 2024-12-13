import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/utlis/database";
import { ItemModel } from "@/app/utlis/schemaModels";
import RequestContext from "../../[id]/route";

export async function PUT(request: NextRequest, context: RequestContext) {
    const reqBody = await request.json();
    try {
        await connectDB();
        const params = await context.params;
        const pristineItem = await ItemModel.findById(params.id);

        if (!pristineItem || pristineItem.email !== reqBody.email) {
            // this deceptively says the item is there when the given id is wrong. 
            return NextResponse.json({message: "You don't have privilege to update the item"});
        }

        await ItemModel.updateOne({_id: params.id}, reqBody);
        return NextResponse.json({message: "updated the item successfully", id:params.id});
    } catch (err) {
        console.error(err);
        return NextResponse.json({message: "failed to update the item"});
    }
}