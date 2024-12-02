import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/app/utlis/database";
import { UserModel } from "@/app/utlis/schemaModels";
import bcrypt from "bcrypt";

interface UserInput {
    name: string,
    email: string,
    password: string // plain text from client
}

interface UserForInsertion {
    name: string,
    email: string,
    password: string // hashed one for DB
    salt: string
}

/**
 * Hash the password input to save it into the DB
 * @param user user information having a plain password
 * @returns the object of which password was hashed and added the used salt
 */
const makeStorableIntoDB = async (user: UserInput) => {
    let rtnValue: UserForInsertion;
    let salt: string;
    try {
        const s = await bcrypt.genSalt();
        salt = s;
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return rtnValue = {
            name: user.name,
            email: user.email,
            password: hashedPassword,
            salt: salt
        } as UserForInsertion;
    } catch (err) {
        console.error(err);
        throw new Error();
    }
};

export async function POST(request: NextRequest) {
    const reqBody: UserInput = await request.json();
    try {
        await connectDB();
        const userForInsert = await makeStorableIntoDB(reqBody);
        await UserModel.create(userForInsert);
        return NextResponse.json({message: "registered a user successfully"});
    } catch (err) {
        console.error(err);
        return NextResponse.json({message: "failed to registered a user"});
    }
}