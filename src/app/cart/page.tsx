"use client"
import { useEffect, useState } from "react";
import { getRootURL } from "./../utlis/config";
import { CartMessage } from "../api/cart/route";
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
                setOrders(json.orders? json.orders : []);
                let total = 0;
                json.orders?.forEach(order =>{
                    const price = Number.parseInt(order.item.price);
                    if (price) {
                        total += price * order.quantity;
                    }
                })
                setTotal(total);
            })
            .catch(() => setOrders([]));
        }
        hydrate()
    },
    [props.user]
    );


    // TODO blaim non number price
    return <> 
        {!orders? <>no items in your cart...</>
        :orders.map(order => {
            return (
            <div key={order.item._id} className="order">
                <div>title: {order.item.title}</div>
                <div>quantity: {order.quantity}</div>
                <div>price: {order.item.price}</div>
            </div>
        )
        })}
        {
            (!orders || !orders.length)? <></>
            : <div>Total: {total}</div>
        }
        </>
}

export default Cart;
export type { Order };