"use client"
import React, { useEffect, useState } from "react";
import Cart from "../cart/page"
import { getCookie } from 'cookies-next';

interface User {
    email: string
}

const Homepage = () => {
    const[user,setUser] = useState<User>({email:""});

    useEffect(() => {
        const hydrate = () => {
            const email: (string | undefined | Promise <string | undefined>) = getCookie("email");

            Promise.resolve(email).then(email =>{
                if(email) {
                    setUser({email:email});
                }
            }
            )
            .catch(err=>console.error(err));
        };
        hydrate();
    },
    []
    );

    // webkit's test fails without the lousy default value 
    // TODO resolve it!
    return <>
        <Cart user={user.email?user: {email: localStorage.getItem("email")!}} fixed={false}/> 
    </>
}

export default Homepage;