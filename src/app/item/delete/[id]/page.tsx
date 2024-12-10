"use client"
import { getRootURL } from "@/app/utlis/config";
import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IdMessage } from "@/app/api/item/create/route";
import { getItem } from "../../[id]/page";
import ResponseContext, { ItemMessage } from "@/app/api/item/[id]/route";
import { isCurrentUser, rejectAccessNonYourItem } from "@/app/utlis/useAuth";

const DeleteItem = (context: ResponseContext) => {
    const [title,setTitle] = useState<string>("");
    const [price,setPrice] = useState<string>("");
    const [imagePath,setImagePath] = useState<string>("");
    const [description,setDescription] = useState<string>("");
    const [yours,judgeYours] = useState<boolean>(false);
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

            const yoursMessage = await isCurrentUser(itemMessage.item.email);
            const yours = yoursMessage.result;

            if (!yours) {
                alert("You cannot delete the other's items");
                router.push("/");
                return;
            }

            setTitle(itemMessage.item.title);
            setPrice(itemMessage.item.price);
            setImagePath(itemMessage.item.image);
            setDescription(itemMessage.item.description);
            setCreator(itemMessage.item.email);

            judgeYours(itemMessage.item.email === localStorage.getItem("email"));
        };
        hydrate();
    },[context]);

    const handleSubmit = async (e: FormEvent) => {
        
        e.preventDefault();

        const confirmed = confirm("are you sure to delete this item?");

        if (!confirmed) {
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
            alert("You can delete only your items (delete is canceled)");
            return;
        }

        fetch(`${getRootURL()}api/item/delete/${(await context.params).id}`, {
            method: "DELETE",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer" + " " + localStorage.getItem("token")
            },
            body: JSON.stringify({
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
            router.push(`/n`);
            return;
        })
        .catch(err => {
            console.error(err);
        })
    };

    return (
        <>
            <h2>Item Delete</h2>
            <form onSubmit={handleSubmit}>
                <div className="item">
                <h4>title: {title} </h4>
                <h4>price:  {price} (in US doller)</h4>
                <h4>image path: {imagePath} </h4>
                <div> {description}</div>
                </div>
                {yours?
                    <button className="delete-button">Delete!</button>
                    :<div><button className="disabled-button" disabled>Delete!</button><div className="warning-message">* you cannot delete the item because it's not yours</div></div>
                } 

            </form>
        </>
    );
};

export default DeleteItem;