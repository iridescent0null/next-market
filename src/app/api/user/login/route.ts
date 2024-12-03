import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/app/utlis/database";
import { UserModel } from "@/app/utlis/schemaModels";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import Config from "@/app/utlis/config";

const failureMessage = {message: "failed to sign in"};

export async function POST(request: NextRequest) {
    const userInput = await request.json();
    try {
        await connectDB();
        const registeredUser = await UserModel.findOne({email: userInput.email}); //FIXME any

        if (!registeredUser) {
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
                .sign(secretKey);

        return NextResponse.json({message: "signed in successfully", token: token});  
    } catch (err) {
        console.error(err);
        return NextResponse.json({message: "error in signing in"});
    }
}