// This file is not used in actual function of the app

import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({message: "hello! bye"});
}