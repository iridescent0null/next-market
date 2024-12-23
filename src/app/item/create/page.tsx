"use client"
import { getRootURL } from "@/app/utlis/config";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { IdMessage } from "@/app/api/item/create/route";

const CreateItem = () => {
    const [title,setTitle] = useState<string>("");
    const [price,setPrice] = useState<string>("");
    const [imagePath,setImagePath] = useState<string>("");
    const [description,setDescription] =useState<string>("");

    const router = useRouter();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        fetch(`${getRootURL()}api/item/create`,{
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer" + " " + localStorage.getItem("token")
            },
            body: JSON.stringify({
                title: title,
                price: price,
                image: imagePath.startsWith("/")?imagePath:"/"+imagePath, // TODO accept image file, not path
                description: description,
                email: localStorage.getItem("email")
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
            <h2>Item Registration</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="title" onChange={(e) => setTitle(e.target.value)} placeholder="title shown in the page" required/>
                <input type="text" name="price" onChange={(e) => setPrice(e.target.value)} placeholder="price in US dollar"  required/>
                <input type="text" name="image" onChange={(e) => setImagePath(e.target.value)} placeholder="path of the product image" required/>
                <textarea name="description" onChange={(e) => setDescription(e.target.value)} rows={15} placeholder="description" required/> 
                <button>Create!</button>
            </form>
        </>
    );
};

export default CreateItem;