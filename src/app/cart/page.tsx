"use client"
import { SyntheticEvent, useEffect, useState } from "react";
import { getRootURL } from "./../utlis/config";
import { CartDeleteRequest, CartMessage } from "../api/cart/route";
import { Item } from "../api/item/[id]/route";

interface Order {
    item: Item,
    quantity: number,
    user: string
}

interface CartProps {
    user: {
        email: string
    }
}

const Cart = (props: CartProps) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [modified, setModified] = useState<boolean>(false);

    useEffect(() => {
        const hydrate = () => { 
            const email = props.user.email;
            if (!email) {
                return;
            }
            fetch(`${getRootURL()}api/cart`, {
                method: "POST",
                headers: {
                  "Accept": "application/json",
                  "Content-Type": "application/json",
                  "Authorization": "Bearer" + " " + localStorage.getItem("token")
                },
                body: JSON.stringify({
                    email: email
                  })
            })
            .then(res => res.json())
            .then((json: CartMessage) => {
                if (!json.orders) { // basically it means invalid token
                    alert("Please sign in (again)");
                    return;
                }
                setOrders(json.orders? json.orders : []);
                let total = 0;
                json.orders?.forEach(order =>{
                    const price = Number.parseInt(order.item.price);
                    if (price) {
                        total += price * order.quantity;
                    }
                })
                setTotal(total);
                setModified(false);
            })
            .catch(err => {
                setOrders([]);
                setModified(false);
                alert("Error happens. Try to sign in again or try later");
                console.log(err);
            });
        }
        hydrate()
    },
    [props.user, modified]
    );

    const cancelOrder = (event: SyntheticEvent, itemId: string) => {
        event.preventDefault();
        const volition = confirm("are you sure to cancel the order?");
        if (!volition) {
            return;
        }
        fetch(`${getRootURL()}api/cart`, {
            method: "DELETE",
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json",
              "Authorization": "Bearer" + " " + localStorage.getItem("token")
            },
            body: JSON.stringify({
                item: itemId as any, 
                // item: "674c3cd31423e04e6b52aca5" as any, // to cause intentional error (NEVER commit the source not in comment!) //TODO adopt a more solid way...
                email: props.user.email
              } as CartDeleteRequest)
        })
        .then(res => res.json())
        .then((json: CartMessage) => {
            if (json.error) {
                alert("Server Error (Try it later)");
                console.log(json);
                return;
            }
            console.log(json);
            setModified(true);
        })
    }

    const proceedToCheckout = (event: SyntheticEvent) => {
        event.preventDefault();
        alert("implementing...");
        console.log(event)
        return;
    }

    // TODO blaim non number price
    return <> 
        {!orders? <>no items in your cart...</>
        :orders.map(order => {
            return (
            <div key={order.item._id} className="order">
                <div className="forty-padding order-main">
                    <div>title: {order.item.title}</div>
                    <div>quantity: {order.quantity}</div>
                    <div>price: {order.item.price}</div>
                </div>
                <div className="thirty-padding">
                </div>
                <form className="thirty-padding">
                    <button onClick={event => cancelOrder(event,order.item._id)} className="cancel-button">cancel</button>
                </form>
            </div>
        )
        })}
        {
            (!orders || !orders.length)? <></>
            : <div className="purchase-list-tail"> 
                <div><strong>Total: {total}</strong></div>
                <button className="checkout-button" onClick={event => proceedToCheckout(event)}>Proceed to Checkout</button>
            </div>
        }
        </>
}

export default Cart;
export type { Order };