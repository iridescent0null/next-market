"use client"
import { getRootURL } from "@/app/utlis/config";
import { FormEvent, useState, useEffect, CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { IdMessage } from "@/app/api/item/create/route";
import { getItem } from "../../[id]/page";
import ResponseContext, { ItemMessage } from "@/app/api/item/[id]/route";
import { isCurrentUser } from "@/app/utlis/useAuth";
import Link from "next/link";

/** this page accepct accesses from the others than the items owner (delete page reject those) */
const UpdateItem = (context: ResponseContext) => {
    const [title,setTitle] = useState<string>("");
    const [price,setPrice] = useState<string>("");
    const [imagePath,setImagePath] = useState<string>("");
    const [description,setDescription] = useState<string>("");
    const [yours,judgeYours] = useState<boolean | undefined>(undefined);
    const [id,setId] = useState<string>();
    const [creator, setCreator] = useState<string>("");

    const router = useRouter();

    useEffect(() => {
        const hydrate = async () => {
            const params = await context.params;
            const itemMessage = await getItem(params.id) as ItemMessage;

            if (!itemMessage.item) {
                alert("item not found (invalid id?)");
                return;
            }

            setId(itemMessage.item._id);

            const yoursMessage = await isCurrentUser(itemMessage.item.email);
            judgeYours(yoursMessage.result);

            setTitle(itemMessage.item.title);
            setPrice(itemMessage.item.price);
            setImagePath(itemMessage.item.image);
            setDescription(itemMessage.item.description);
            setCreator(itemMessage.item.email);
        };
        hydrate();
    },[context]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const hasPeriod = /.+\..*/; // TODO implement similar check also in item creation page 
        if (!hasPeriod.test(imagePath)) {
            alert("an extension is a must in image file names");
            return;
        }

        const email = localStorage.getItem("email");
        if (!email) {
            alert("You have not authenticated (please sign in)");
            return;
        }

        const isYours = await isCurrentUser(creator); // if needed, it has the reason of the failure (BooleanMessage.message)
        judgeYours(isYours.result);
        if (!isYours.result) {
            alert("You can update only your items (update is canceled)");
            return;
        }

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
                email: email
            })
        })
        .then(res => res.json())
        .then((json: IdMessage) => {
            console.log(json);
            alert(json.message);
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
        (yours === void 0)? <h4>loading...</h4>: // prevent hasty rendering
        yours?
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
        :
            <>
                <div className="item">
                    <div><strong>the item is not yours: </strong> {title}</div>
                    <div>You can update or delete items only which you've created.</div>
                    <div>
                        You still can see the item from <strong><Link href={`/item/${id}`} style={{"textDecoration": "underline"}}> here </Link> </strong>
                    </div>
                </div>
            </>
    );
};

export default UpdateItem;