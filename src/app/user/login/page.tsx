"use client"

import { FormEvent } from "react";
import { LoginResultMessage } from "@/app/api/user/login/route";
import { useRouter } from "next/navigation";

const Login = () => {

    const router = useRouter();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const email = (document.getElementById("login-email")! as HTMLInputElement).value!;
        const plainPassword = (document.getElementById("login-password")! as HTMLInputElement).value!;
        fetch("../api/user/login", {
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
        .then((json: LoginResultMessage) => {
            if (!json) {
                alert("server failure. try again later");
                return;
            }
    
            if (!json.token || (json.token === "null")) {
                alert("failed to sign in");
                return;
            }

            localStorage.setItem("token", json.token);
            localStorage.setItem("email", email);
            alert("signed in successfully");
        })
        .then(()=>{
            router.push(`/`);
        })
        .catch(err => {
            console.log(err);
        });
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