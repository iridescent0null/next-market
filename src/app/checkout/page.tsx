"use client"
import { useEffect, useState } from "react";
import Cart from "../cart/page";
import { getCookie } from "cookies-next";
import { prettyDate } from "@/components/inventory";
import { getNames } from "country-list";

interface User {
    email: string
}

const theDayAfter = (days: number) => {
    const rtnValue = new Date();
    rtnValue.setDate(rtnValue.getDate() + days);
    return rtnValue;
};

const nations = getNames().sort();

const Checkout = () => {
    const[user,setUser] = useState<User>({email:""});
    const[destinationNation,setDesitinationNation] = useState<string>("");
    const calcShipFee = () => {
        return destinationNation === "Japan"? 0 : 500;
    }

    useEffect(() => { //the same behavior in Homepage (can refere to it?)
        const hydrate = () => {
            const email: (string | undefined | Promise <string | undefined>) = getCookie("email");
        
            Promise.resolve(email).then(email => {
                if(email) {
                    setUser({email:email});
                }
            }
            );
        };
        hydrate();
    },
    []
    );

    return <>
        <Cart user={user} fixed={true}/>
        <form>
            <div className="checkin-info">
                <label htmlFor="address" >Address: </label> <input type="text" name="address" id="address"></input><br/>
                <label htmlFor="ZIP" >ZIP: </label> <input type="text" name="zip" id="zip"></input><br/>
                Nation: <select onChange={event => setDesitinationNation(event.target.value)}>
                    {nations.map(name => <option value={name} key={name}>{name}</option>)}
                </select>
            </div>
            <div className="checkin-info">
                <div>Arriving date: {prettyDate(theDayAfter(2 + (destinationNation === "Japan"? 0 : 3)).toString())}</div>
                <span>Shipping Fee: </span><span id="shipping-fee">{calcShipFee()}</span>
                {!document.getElementById("total")?
                    <div>
                        Total Fee: Choose your nation...
                    </div>
                    :<div>
                        Total Fee: {Number.parseInt(document.getElementById("total")!.textContent!.substring(7)) + calcShipFee()} 
                    </div>
                } 
            </div>
            <div className="order-button-wrapper">
                <button className="order-button">Order!</button>
            </div>
        </form>
    </>
}

export default Checkout;
