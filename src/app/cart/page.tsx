"use client"
import { useEffect, useState } from "react";
import { getRootURL } from "./../utlis/config";
import { CartMessage } from "../api/cart/route";

interface Order {
    item: string,
    quantity: number,
    user: string
}

interface CartProps {
    user: {
        email: string
    }
}

const mock: Order[] = [{item: "123456789", quantity:2, user:"me"}
    ,{item: "234567890", quantity:3, user:"me"}
    ,{item: "345678901", quantity:55555, user:"me"}]

const Cart = (props: CartProps) => {
    const [orders, setOrders] = useState<Order[]>();

    useEffect(() => { // FIXME this page causes infinite loop
        const hydrate = () => { 

            if (!props || !props.user) { // FIXME naive mock
                props = {};
                props.user = {};
                props.user.email = "Hanako@exmaple.co.jp";
            }

            fetch(`${getRootURL()}api/cart`, {
                method: "POST",
                headers: {
                  "Accept": "application/json",
                  "Content-Type": "application/json",
                  "Authorization": "Bearer" + " " + localStorage.getItem("token")
                },
                body: JSON.stringify({
                    email: props.user.email
                  })
            })
            .then(res => res.json())
            .then((json: CartMessage) => setOrders(json.orders));
           // setOrders(mock);
        }
        hydrate()
    },
    [orders,props]
    );

    return <>
        {!orders? <>no items in your cart...</>
        :orders.map(order => {
            return (<div key={order.item}>
                <div>title: {order.item}</div>
                <div>quality: {order.quantity}</div>
                <div>------</div>
            </div>
        )
        })}
        </>
}

export default Cart;
export type { Order };