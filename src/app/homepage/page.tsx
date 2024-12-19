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
        }
        hydrate()
    },
    []
    );

    return <>
        <Cart user={user} />
    </>
}

export default Homepage;