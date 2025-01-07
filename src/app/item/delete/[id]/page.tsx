"use client"
import { getRootURL } from "@/app/utlis/config";
import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IdMessage } from "@/app/api/item/create/route";
import { getItem } from "../../[id]/page";
import RequestContext, { Item, ItemMessage } from "@/app/api/item/[id]/route";
import { BooleanMessage, isCurrentUser } from "@/app/utlis/useAuth";

/** this page rejects accesses from the others than the items owner (update page accept those) */
const DeleteItem = (context: RequestContext) => {
    const [title,setTitle] = useState<string>("");
    const [price,setPrice] = useState<string>("");
    const [imagePath,setImagePath] = useState<string>("");
    const [description,setDescription] = useState<string>("");
    const [yours,judgeYours] = useState<boolean | undefined>(undefined);
    const [creator, setCreator] = useState<string>("");

    const router = useRouter();

    useEffect(() => {
        const hydrate = () => {
            let _item: Item;
            context.params
            .then(params => getItem(params.id))
            .then((message: ItemMessage) => {
                const item = message.item;
                if (!item) {
                    alert("item not found");
                    throw new Error();
                }
                _item = item; 
                return item;
            })
            .then(item => isCurrentUser(item.email))
            .then((message: BooleanMessage) => message.result)
            .then(isYours=>{
                if(!isYours) {
                    alert("You cannot delete the other's items");
                    router.push("/");
                    return;
                }
                setTitle(_item.title);
                setPrice(_item.price);
                setImagePath(_item.image);
                setDescription(_item.description);
                setCreator(_item.email);
                judgeYours(_item.email === localStorage.getItem("email"));
            })
            .catch(err => {
                console.error(err);
                alert("try again later")
            })

        };
        hydrate();
    }, []);

    const handleSubmit = (e: FormEvent) => {
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

        isCurrentUser(creator)
        .then((message: BooleanMessage) => message.result)
        .then(result => {
                judgeYours(result);
                if (!result) {
                    alert("You can delete only your items (delete is canceled)");
                    return false;
                }
                return true;
        })
        .then(OK => {
            if (!OK) {
                return;
            }
            
            return context.params
            .then(params => params.id)
            .then(id => {
                return fetch(`${getRootURL()}api/item/delete/${id}`, {
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
            })
            .then(res => res.json())
            .then((json: IdMessage) => {
                console.log(json);
                alert(json.message);
                if (!json.id) {
                    return;
                }
                router.push(`/`);
                return;
            })
        })
        .catch(err => {
            console.error(err);
        })
    };

    return (
        (yours === void 0)? <h4>loading...</h4>: // prevent hasty rendering
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