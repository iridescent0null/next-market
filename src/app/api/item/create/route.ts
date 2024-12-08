import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/utlis/database";
import { ItemModel } from "../../../utlis/schemaModels";
import { Item } from "../[id]/route";

type ItemCreateRequest = {
    name: string,
    message: string
};

type ItemEntry = Item & { _id: string };

/** message with id (string(optional)). Not concerned about the kind of id */
interface IdMessage {
    message: string,
    id?: string
}

export async function POST(request: NextRequest) {
    let rtnValue: NextResponse<IdMessage>;

    try {
        await request.json()
        .then((b: ItemCreateRequest) => {
            connectDB();
            return b;
        })
        .then( b => ItemModel.create(b))
        .then((r: ItemEntry) => {
            rtnValue = NextResponse.json({message: "item was created successfully", id: r._id.toString()});
        })
        return rtnValue!; // My editor complains it is NOT initialized (really in any situation?)
    } catch (err) {
        console.error(err);
        return NextResponse.json({message: "failure to create an item"});
    }
}

export type { IdMessage };