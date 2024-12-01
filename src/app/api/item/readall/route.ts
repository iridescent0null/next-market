import { NextResponse } from "next/server";
import connectDB from "@/app/utlis/database"; // suggested in the different form in the Miyoshi's text
import { ItemModel } from "@/app/utlis/schemaModels";

export async function GET() {
    try {
        await connectDB();
        const allItems = await ItemModel.find();
        return NextResponse.json({message: "read all items sucessfully", allItems: allItems});
    } catch (err) {
        return NextResponse.json({message: "failed to read all items"});
    }
}