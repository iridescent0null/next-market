import { NextResponse } from "next/server";

const version = "0.1.0";

/** mainly for alive monitoring */
export async function GET() {
    return NextResponse.json({version: version});
}