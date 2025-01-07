import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";
import Config, { getDomain, getRootURL } from "./app/utlis/config";

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

        if (!token || token === "null") {
            return NextResponse.json({message: "invalid token: "+token}, {status: 401});
        }
     
        const decodedJwt = await jwtVerify(token, secretKey, {
            issuer: getRootURL(),
            audience: getRootURL(),
            algorithms: ["HS256"]
        });
        // Note if the token is null, "null" or another problematic value, jwtVerify() just says 'Invalid Compact JWS'...

        if (true && decodedJwt.payload.email) { // TODO give it the appropriate condition
            // naive cookies are unstable in tests with Playwright, then give it better one
            response.cookies.set({ 
                name:"email",
                value: decodedJwt.payload.email.toString(),
                domain: getDomain(),
                httpOnly: false,
                secure: false,
                sameSite: "lax"
            });
        }
        return response;
    } catch (err) {
        console.error(err);
        return NextResponse.json({message: "Please sign in again (failed to check your token.)"}, {status: 401});
    }
}

export const config = {
    matcher:[
        "/api/item/create",
        "/api/item/update/:path*",
        "/api/item/delete/:path*",
        "/api/cart/:path*",
        "/api/inventory/:path*",
        "/api/inventory"
    ]
};