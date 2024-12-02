import { NextRequest,NextResponse } from "next/server";
import connectDB from "@/app/utlis/database";
import { ItemModel } from "@/app/utlis/schemaModels";
import ResponseContext from "../../readsingle/[id]/route";

export async function PUT(request: NextRequest, context: ResponseContext) {
    const reqBody = await request.json();
    try {
        await connectDB();
        const params = await context.params;
        await ItemModel.updateOne({_id: params.id}, reqBody);
        return NextResponse.json({message: "updated an item successfully"});
    } catch (err) {
        return NextResponse.json({message: "failed to update an item successfully"});
    }
}