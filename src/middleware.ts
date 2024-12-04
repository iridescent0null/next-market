import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";
import Config from "./app/utlis/config";

/** delimiter in header values */
const delimiter = " ";

export async function middleware(request: NextRequest) {
    // expecting Authorization header with a value like "ignored lengthyTokenBlahBlahBlahBlahBlah" (there is a space between the prefix and the token)
    const token = await request.headers.get("Authorization")?.split(delimiter)[1]; // TODO my editor insists the await word doesn't have any effects (right?)

    if (!token) {
        return NextResponse.json({message: "failed to check your token"});
    }

    try {
        const secretKey = new TextEncoder().encode(Config.next.secretKey);
        const decodedJwt = await jwtVerify(token, secretKey);
        return NextResponse.next();
    } catch (err) {
        console.error(err);
        return NextResponse.json({message: "Please sign in again (failed to check your token.)"});
    }
}

export const config = {
    matcher:[
        "/api/item/create",
        "/api/item/update/:path*",
        "/api/item/delete/:path*"
    ]
}