import { NextRequest, NextResponse } from "next/server";

type ItemCreateRequest = {
    name: string,
    message: string
}

export async function POST(request: NextRequest) {
    request.json().then(b => {
        const body: ItemCreateRequest = b;
        console.log(b);
        return NextResponse.json({message: "アイテム作成"});
    });
}