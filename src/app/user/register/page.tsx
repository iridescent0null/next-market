"use client"
import { FormEvent, useState } from "react";

const Register = () => {
    
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const handleSubmit = async (e: FormEvent) => { // FIXME remove async!
        e.preventDefault();
        const response = await fetch("../../api/user/register", {
            method: "POST",
            headers:{
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password
            })
        })
        .catch(err => {
            console.error(err);
            alert("failed to register you");
        });

        if (response) {
            const json = await response.json();
            console.log("registered: " + json.message);
            return;
        }
        console.log("registered, but no response was returned");
    };

    return (
        <>
            <h1> User Registration Form</h1>

            <form onSubmit={handleSubmit}>
                <input type="text" name="name" onChange={(e) => setName(e.target.value)} placeholder="user username" required />
                <input type="text" name="emali" onChange={(e) => setEmail(e.target.value)} placeholder="youradress@example.co.jp" required/>
                <input type="text" name="password" onChange={(e) => setPassword(e.target.value)} placeholder="password" required/>
                <button type="submit"> Register!</button>
            </form>
        </>
    )
}

export default Register;