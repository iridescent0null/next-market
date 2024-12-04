import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/utlis/database";
import { ItemModel } from "../../../utlis/schemaModels";

type ItemCreateRequest = {
    name: string,
    message: string
};

export async function POST(request: NextRequest) {
    let rtnValue: NextResponse;

    try {
        await request.json()
        .then((b: ItemCreateRequest) => {
            connectDB();
            return b;
        })
        .then( b => ItemModel.create(b))
        .then( () => rtnValue = NextResponse.json({message: "item was created successfully"}))
        return rtnValue!; // My editor complains it is NOT initialized (really in any situation?)
    } catch (err) {
        console.error(err);
        return NextResponse.json({message: "failure to create an item"});
    }


}