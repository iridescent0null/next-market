"use client"
import { SyntheticEvent, useEffect, useState } from "react";
import { getRootURL } from "./../utlis/config";
import { CartDeleteRequest, CartMessage } from "../api/cart/route";
import { Item } from "../api/item/[id]/route";
import { useRouter } from "next/navigation";
import { Types } from "mongoose";

interface Order {
    _id: Types.ObjectId,
    item: Item,
    quantity: number,
    user: string
}

interface CartProps {
    user: {
        email: string
    }
    fixed: boolean;
}

const Cart = (props: CartProps) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [modified, setModified] = useState<boolean>(false);

    const router = useRouter();

    useEffect(() => {
        const hydrate = () => { 
            const email = props.user?.email;
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
        };
        hydrate();
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
        //TODO check?
        router.push("/checkout");
        return;
    }

    return <> 
        {(!orders || orders.length < 1)? <>no items in your cart...</>
        :orders.map(order => {
            return (Number.isNaN(Number.parseInt(order.item.price))?<div key={order.item._id} className={props.fixed? "fixed-order order" : "order"}>Error!</div> // invalid price TODO make it pretty
            :<div key={order.item._id} className={props.fixed? "fixed-order order" : "order"}>
                <div className="forty-padding order-main">
                    <div>title: {order.item.title}</div>
                    <div>quantity: {order.quantity}</div>
                    <div>price: {order.item.price}</div>
                </div>
                <div className="thirty-padding">
                </div>
                <form className="thirty-padding">
                    {props.fixed?
                        <></>
                        :<button onClick={event => cancelOrder(event,order.item._id)} className="cancel-button">cancel</button>
                    }
                </form>
            </div>
        )
        })}
        {
            (!orders || !orders.length)? <></>
            :<div className="purchase-list-tail"> 
                <div id="total"><strong>Total: {total}</strong></div>
                {props.fixed?
                    <></>
                    :<button className="checkout-button" onClick={event => proceedToCheckout(event)}>Proceed to Checkout</button>
                }
            </div>
        }
        </>
}

export default Cart;
export type { Order };