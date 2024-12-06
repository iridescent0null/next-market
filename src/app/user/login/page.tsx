"use client"

import { FormEvent, useState } from "react";
import { LoginResultMessage } from "@/app/api/user/login/route";

const Login = () => {

    const [email,setEmail] = useState<string>("");
    const [plainPassword,setPlainPassword] = useState<string>("");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const json: LoginResultMessage = await fetch("../api/user/login", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: plainPassword
            })
        })
        .then(res => res.json())
        .catch(err => {
            console.log(err);
        });

        if (!json) {
            alert("server failure. try again later");
            return;
        }

        if (!json.token) {
            alert("failed to sign in");
            return;
        }

        localStorage.setItem("token", json.token);
        alert("signed in successfully");
        // TODO redirect
    }

    return (
        <>
            <h1>Sign in</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" name="email" onChange={(e) => setEmail(e.target.value)} placeholder="your e-mail address" required/>
                <input type="text" name="password" onChange={(e) => setPlainPassword(e.target.value)}  placeholder="your password" required />
                <button>Sign in</button>
            </form>
        </>
    )
}

export default Login;