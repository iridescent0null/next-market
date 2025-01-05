"use client"
import { getRootURL } from "@/app/utlis/config";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { IdMessage } from "@/app/api/item/create/route";

const CreateItem = () => {
    const [reuse,setReuse] = useState<boolean>(false);

    const router = useRouter();

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        fetch(`${getRootURL()}api/item/create`,{
            method: "POST",
            headers: {
                "Accept": "application/json",
                // "Content-Type": "multipart/form-data",　　// should not be declared manually! (it causes failure to add boundary info)
                "Authorization": "Bearer" + " " + localStorage.getItem("token")
            },
            body: formData
        })
        .then(res => res.json())
        .then((json: IdMessage) => {
            alert("result: " + json.message + (json.id?  ", " + json.id: ""));
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
            <input type="checkbox" onChange={(e) => {setReuse(e.target.checked)}}/> reuse an image on the server 
            <form onSubmit={handleSubmit}>
                <input type="text" name="title" placeholder="title shown in the page" required/>
                <input type="text" name="price" placeholder="price in US dollar" required/>
                <textarea name="description" rows={15} placeholder="description" required/> 
                {reuse?
                    <input type="text" name="image" placeholder="item id which shares the image" required/>
                    :<input type="file" name="imageFile" id="imageFile" required/>
                }
                <button>Create!</button>
            </form>
        </>
    );
};

export default CreateItem;