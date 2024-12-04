import { NextResponse } from "next/server";

const version = "0.1.0";

/** mainly for alive monitoring */
export async function GET(ignored: unknown) { // it's NextRequest if needed
    return NextResponse.json({version: version});
}