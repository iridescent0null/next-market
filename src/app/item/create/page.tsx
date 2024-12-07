"use client"
import { ItemMessage } from "@/app/api/item/[id]/route";
import { getRootURL } from "@/app/utlis/config";
import { FormEvent, useState } from "react";

const CreateItem = () => {
    const [title,setTitle] = useState<string>("");
    const [price,setPrice] = useState<string>("");
    const [imagePath,setImagePath] = useState<string>("");
    const [description,setDescription] =useState<string>("");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        fetch(`${getRootURL()}api/item/create`,{
            method: "POST",
            headers:{
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "ignored" + " " + localStorage.getItem("token") // TODO put appropriate first element
            },
            body: JSON.stringify({
                title: title,
                price: price,
                image: imagePath.startsWith("/")?imagePath:"/"+imagePath,
                description: description,
                email: localStorage.getItem("email") // TODO is it safe?
            })
        })
        .then(res => res.json())
        .then((json: ItemMessage) => alert(json.message))
        .catch(err => {
            console.error(err);
        });
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