"use client"

import { FormEvent } from "react";
import { LoginResultMessage } from "@/app/api/user/login/route";
import { useRouter } from "next/navigation";

const Login = () => {

    const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const email = (document.getElementById("login-email")! as HTMLInputElement).value!;
        const plainPassword = (document.getElementById("login-password")! as HTMLInputElement).value!;
        const json: LoginResultMessage = await fetch("../api/user/login", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email, 
                password: plainPassword,
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
        localStorage.setItem("email", email);
        alert("signed in successfully");
        router.push(`/`);
    }

    return (
        <>
            <h1>Sign in</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" id="login-email" name="email" placeholder="your e-mail address" required/>
                <input type="password" id="login-password" name="password" placeholder="your password" required />
                <button>Sign in</button>
            </form>
        </>
    )
}

export default Login;