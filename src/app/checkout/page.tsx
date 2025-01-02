"use client"
import { SyntheticEvent, useEffect, useState } from "react";
import Cart from "../cart/page";
import { getCookie } from "cookies-next";
import { prettyDate } from "@/components/inventory";
import { getNames } from "country-list";
import { getRootURL } from "../utlis/config";
import { ShipmentMessage, ShipmentRequest } from "../api/shipment/route";
import { CartMessage } from "../api/cart/route";
import { useRouter } from "next/navigation";

interface User {
    email: string
}

const nations = getNames().sort();

const Checkout = () => {
    const[displayDate] = useState<Date>(new Date());
    const[user,setUser] = useState<User>({email:""});
    const[destinationNation,setDesitinationNation] = useState<string>("");

    const router = useRouter();
    
    const calcShipFee = () => {
        return destinationNation === "Japan"? 0 : 500;
    }

    const theDayAfter = (days: number) => {
        const rtnValue = new Date(displayDate);
        rtnValue.setDate(rtnValue.getDate() + days);
        return rtnValue;
    };

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

    const recordOrder = (event: SyntheticEvent) => {
        event.preventDefault();

        fetch(`${getRootURL()}api/cart`, { // copied from cart's page.tsx
            method: "POST",
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json",
              "Authorization": "Bearer" + " " + localStorage.getItem("token")
            },
            body: JSON.stringify({
                email: localStorage.getItem("email")
              })
        })
        .then(res => res.json())
        .then((json: CartMessage) => {
                if (!json.orders) { // basically it means invalid token
                    alert("Please sign in (again)");
                    return;
                }
                return json.orders;
            }
        )
        .then(orders => {
            return fetch(`${getRootURL()}api/shipment`,{
                method: "POST",
                headers: {
                    "Accecpt": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": "Bearer" + " " + localStorage.getItem("token")
                },
                body: JSON.stringify({
                    mode: "checkout",
                    email: localStorage.getItem("email"),
                    total: caclucateTotal(),
                    orderDate: new Date(),
                    expectedDate: arrivingDate(),
                    address: (document.getElementById("address") as HTMLInputElement).value,
                    zip: (document.getElementById("zip") as HTMLInputElement).value,
                    nation: (document.getElementById("nation") as HTMLSelectElement).value,
                    orders: orders
                } as ShipmentRequest)
            })
         })
         .then(res => res.json())
         .then((json: ShipmentMessage) => {
            alert(json.message);
            router.push("/");
         })
    };

    const arrivingDate = () => {
        return theDayAfter(2 + (destinationNation === "Japan"? 0 : 3));
    };

    const caclucateTotal = () => {
        return Number.parseInt(document.getElementById("total")!.textContent!.substring(7)) + calcShipFee();
    };

    return <>
        <Cart user={user} fixed={true}/>
        <form onSubmit={event => recordOrder(event)}>
            <div className="checkin-info">
                <label htmlFor="address" >Address: </label> <input type="text" name="address" id="address" placeholder="address to deliver" required></input><br/>
                <label htmlFor="ZIP" >ZIP: </label> <input type="text" name="zip" id="zip" placeholder="like 000-0000" required></input><br/>
                Nation: <select onChange={event => setDesitinationNation(event.target.value)} id="nation" required>
                    {nations.map(name => <option value={name} key={name}>{name}</option>)}
                </select>
            </div>
            <div className="checkin-info">
                <div>Arriving date: {prettyDate(arrivingDate().toString())}</div>
                <span>Shipping Fee: </span><span id="shipping-fee">{calcShipFee()}</span>
                {!document.getElementById("total")?
                    <div>
                        Total Fee: Choose your nation...
                    </div>
                    :<div>
                        Total Fee: {caclucateTotal()} 
                    </div>
                } 
            </div>
            <div className="order-button-wrapper">
                <button className="order-button">Order!</button>
            </div>
            <p className="order-button-note">...or, if you want to revoke it, just back to the previous page or close this page using your browser function</p>
        </form>
    </>;
}

export default Checkout;
