import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";
import Config from "./app/utlis/config";

/** delimiter in header values */
const delimiter = " ";

export async function middleware(request: NextRequest) {
    // expecting Authorization header with a value like "Bearer lengthyTokenBlahBlahBlahBlahBlah" (there is a space between the prefix and the token)
    const token = request.headers.get("Authorization")?.split(delimiter)[1];

    if (!token) {
        return NextResponse.json({message: "failed to check your token"});
    }

    try {
        const response = NextResponse.next();

        const secretKey = new TextEncoder().encode(Config.next.secretKey);
        const decodedJwt = await jwtVerify(token, secretKey);

        if (true && decodedJwt.payload.email) { // TODO give it the appropriate condition
            response.cookies.set("email", decodedJwt.payload.email.toString());
        }

        return response;
    } catch (err) {
        console.error(err);
        return NextResponse.json({message: "Please sign in again (failed to check your token.)"});
    }
}

export const config = {
    matcher:[ //FIXME use it with inventory!
        "/api/item/create",
        "/api/item/update/:path*",
        "/api/item/delete/:path*",
        "/api/cart/:path*",
    ]
};