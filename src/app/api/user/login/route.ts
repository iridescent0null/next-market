import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/app/utlis/database";
import { UserModel } from "@/app/utlis/schemaModels";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import Config, { getRootURL } from "@/app/utlis/config";
import { UserInput } from "../register/route";

type NullableRetrievedUser = {
    name: string,
    email: string,
    password: string, // hashed
    salt: string
} | null;

/**
 * falsy token means failure in the signing in 
 */
interface LoginResultMessage {
    message: string,
    token: string | undefined 
}

const failureMessage: LoginResultMessage = {
    message: "failed to sign in",
    token: undefined 
};

export async function POST(request: NextRequest) {
    try {
        const userInput: UserInput = await request.json();
        await connectDB();
        
        const registeredUser: NullableRetrievedUser = await UserModel.findOne({email: userInput.email});

        if (!registeredUser) {
            console.warn("login attempt with unknown email address: " + userInput.email);
            return NextResponse.json(failureMessage);
        }

        const storedHash = registeredUser.password;
        const hashedPasswordInput = await bcrypt.hash(userInput.password, registeredUser.salt);

        if (storedHash !== hashedPasswordInput) {
            return NextResponse.json(failureMessage); 
        }

        const secretKey = new TextEncoder().encode(Config.next.secretKey);
        const payload = {email: userInput.email};

        const token = await new SignJWT(payload)
                .setProtectedHeader({alg: "HS256"})
                .setExpirationTime("1d")
                .setIssuedAt("-1d")
                .setAudience(getRootURL())
                .setIssuer(getRootURL())
                .sign(secretKey);

        return NextResponse.json({message: "signed in successfully", token: token});  
    } catch (err) {
        console.error(err);
        return NextResponse.json({message: "error in signing in", token: undefined});
    }
}

export type { LoginResultMessage };