import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/utlis/database";
import { ItemModel } from "../../../utlis/schemaModels";
import { Item } from "../[id]/route";
import { writeFile } from "fs/promises";
import { mkdirSync } from 'fs';
import { Types } from "mongoose";

/** message with id (string(optional)). Not concerned about the kind of id */
interface IdMessage {
    message: string,
    id?: string
}

const imageFolderName = "public/item/";

const parseEmailHeader = (headerValue: string | null) => {
    // FIXME lousy trick to handle the webkit cookie values like: 
    //      email=hoge@example.co.jp; email=hoge@example.co.jp
    const regex  = /(?<=\=)[^;]*/;

    const regexResult = headerValue? headerValue.match(regex) : null;
    if (!regexResult) {
        throw new Error("invalid input as email "+ headerValue);
    }

    if (regexResult.length > 1) {
        console.log("problematic cookie: " + headerValue);
    }

    return regexResult[0].replace("%40","@");
};

export async function POST(request: NextResponse) {
    const formData = await request.formData();

    const email = parseEmailHeader(request.headers.get("cookie"));

    // there are two ways to give the image
    const imageSrcItem = formData.get("image"); // existed item which provides the new item with its image 
    const imageFile = formData.get("imageFile"); // file to be used as the image of the new item

    if (imageSrcItem && imageFile) {
        throw new Error("inconsistent image submission: an exsited image or new image can be adoptted");
    }
    if (!imageSrcItem && !imageFile) {
        throw new Error("image is required");
    }

    let image: string;
    try {
        if (imageSrcItem) {
            try {
                new Types.ObjectId(imageSrcItem as string);
            } catch {
                return NextResponse.json({message: "the item is not found: " + imageSrcItem}, {status:400});
            }
            const item = await ItemModel.findById(imageSrcItem) as Item;
            if (!item) {
                return NextResponse.json({message: "the item is not found: " + imageSrcItem}, {status:400});
            }

            image = item.image;
        } else {
            const file = formData.get("imageFile") as File;
            const buffer = Buffer.from(await (file).arrayBuffer());

            const midFolder = new Date().getTime();
            let path = imageFolderName + midFolder +"/"+ file.name;
            mkdirSync(imageFolderName + midFolder);
            await writeFile(path, buffer);

            image = path.substring("public".length);
        }

        await connectDB();
        const item = await ItemModel.create({
            title: formData.get("title"),
            image: image,
            price: formData.get("price"),
            description: formData.get("description"),
            email: email
        });
        return NextResponse.json({message: "item was created successfully", id: item._id.toString()});
    }
    catch(err)  {
        console.error(err);
        return NextResponse.json({message: "failure to create an item"}, {status: 500});
    }
}

export type { IdMessage };