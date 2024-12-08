"use client"
import { getRootURL } from "@/app/utlis/config";
import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IdMessage } from "@/app/api/item/create/route";
import { getItem } from "../../[id]/page";
import ResponseContext, { ItemMessage } from "@/app/api/item/[id]/route";

const UpdateItem = (context: ResponseContext) => {
    const [title,setTitle] = useState<string>("");
    const [price,setPrice] = useState<string>("");
    const [imagePath,setImagePath] = useState<string>("");
    const [description,setDescription] = useState<string>("");
    const [yours,judgeYours] = useState<boolean>(false);

    const router = useRouter();

    useEffect(() => {
        const hydrate = async () => {
            const params = await context.params;
            const itemMessage = await getItem(params.id) as ItemMessage;

            if (!itemMessage.item) {
                alert("item not found (invalid id?)");
                return;
            }
            setTitle(itemMessage.item.title);
            setPrice(itemMessage.item.price);
            setImagePath(itemMessage.item.image);
            setDescription(itemMessage.item.description);

            judgeYours(itemMessage.item.email === localStorage.getItem("email"));
        };
        hydrate();
    },[context]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // TODO validate the image: extension is required

        fetch(`${getRootURL()}api/item/update/${(await context.params).id}`, {
            method: "PUT",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer" + " " + localStorage.getItem("token")
            },
            body: JSON.stringify({
                title: title,
                price: price,
                image: imagePath.startsWith("/")? imagePath: "/" + imagePath,
                description: description,
                email: localStorage.getItem("email") // TODO is it safe?
            })
        })
        .then(res => res.json())
        .then((json: IdMessage) => {
            alert("result: " + json.message + ", " + (json.id || ""));
            if (!json.id) {
                return;
            }
            router.push(`/item/${json.id}`);
        })
        .catch(err => {
            console.error(err);
        })
    };

    return (
        <>
            <h2>Item Update</h2>
            <form onSubmit={handleSubmit}>
                <input value={title} type="text" name="title" onChange={(e) => setTitle(e.target.value)} placeholder="title shown in the page" required/>
                <input value={price} type="text" name="price" onChange={(e) => setPrice(e.target.value)} placeholder="price in US dollar"  required/>
                <input value={imagePath} type="text" name="image" onChange={(e) => setImagePath(e.target.value)} placeholder="path of the product image" required/>
                <textarea value={description} name="description" onChange={(e) => setDescription(e.target.value)} rows={15} placeholder="description" required/><br/>
                {yours?
                    <button>Update!</button>
                    :<div><button className="disabled-button" disabled>Update!</button><div className="warning-message">* you cannot update the item because it's not yours</div></div>
                } 
            </form>
        </>
    );
};

export default UpdateItem;