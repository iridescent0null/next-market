import { CartMessage, MaterializedOrder, User } from "@/app/api/cart/route";
import { Shipment, ShipmentMessage, ShipmentPhase, ShipmentRetrieveRequest } from "@/app/api/shipment/route";
import { getRootURL } from "@/app/utlis/config";
import { Types } from "mongoose";
import { useEffect, useState } from "react";
import { prettyDate } from "./inventory";
import Link from "next/link";

interface HistoryProps {
    user: {
        email: string
    }
}

interface ShipmentOrderRelation {
    shipment: Types.ObjectId,
    orders: MaterializedOrder[]
}

const HistoryPart = (props: HistoryProps) => {
    const [shipmentOrderRelations,setShipmentOrderRelations] = useState<ShipmentOrderRelation[]>([]);
    const [shipments,setShipments] = useState<Shipment[]>([]);

    // temporary save area used in the lengthy promise chain
    let unorderedRelation: ShipmentOrderRelation[];

    useEffect(() => {
        const hydrate = () => {
            fetch(`${getRootURL()}api/cart`, {
                method: "POST",
                headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer" + " " + localStorage.getItem("token")
                },
                body: JSON.stringify({
                    email: props.user.email,
                    option: {shipments: [] as Types.ObjectId[]}
                } as User)
            })
            .then(res => res.json())
            .then((message: CartMessage) => message.orders!)
            .then((orders: MaterializedOrder[]) => {
                const orderSet = new Set<Types.ObjectId>();
                orders.forEach(order => orderSet.add(order.shipment!))

                // cannot sort it yet here, then just save 
                unorderedRelation = Array.from(orderSet).filter(id=>id).map(id => {
                    return {
                        shipment:id,
                        orders: !id? [] : orders.filter(order => order && order.shipment && order.shipment.toString() === id.toString())
                    }
                })    
            })
            .then(() => {
                return fetch(`${getRootURL()}api/shipment`, {
                    method: "POST",
                    headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": "Bearer" + " " + localStorage.getItem("token")
                    },
                    body: JSON.stringify({
                        mode: "retrieve",
                        email: props.user.email,
                    } as ShipmentRetrieveRequest)
                })
            })
            .then(res => res.json())
            .then((message: ShipmentMessage) => {
                const shipmentsHere = message.shipments!;

                unorderedRelation.filter(
                    relation => !shipmentsHere.find(detail => detail._id?.toString() === relation.shipment?.toString())
                )
                .forEach(relation => {
                    console.error("orders with a shipment miss the shipment!: ");
                    alert("Please contanct customer service: Shipment Information is missing, id:" + relation.shipment);
                    console.warn({shipment:relation.shipment,id:relation.orders.map(order=>order._id)});
                });

                setShipments(shipmentsHere);
                setShipmentOrderRelations(
                    // finally sort it based on order date (newer to older)
                    unorderedRelation
                        .sort((a,b) => {
                        return 0 -
                        new Date(shipmentsHere.find(detail => detail._id?.toString() === a.shipment?.toString())!.orderDate).getTime()
                        +
                        new Date(shipmentsHere.find(detail => detail._id?.toString() === b.shipment?.toString())!.orderDate).getTime();
                    })
                );
            });
        };
        hydrate();
    },
    []
    );

    const parseShipment = (shipment: Shipment) =>{
        if (!shipment) {
            return <></>;
        }
        return <>
            <div>Total: ${shipment.totalInCents/100}</div>
            <div>Ordered: {prettyDate(shipment.orderDate.toString())}</div>
            <div>Arrival: {prettyDate(shipment.arrival? shipment.arrival.toString():shipment.expectedArrival?.toString())}</div>
            <div>Status: {parsePhase(shipment.phase)}</div>
        </>;
    };

    const parsePhase = (phase: ShipmentPhase) =>  {
        return (phase === 0)? "just ordered"
            : (phase === 1)? "in process"
            : (phase === 2)? "shipped"
            : (phase === 3)? "canceled"
            : (phase === 4)? "suspended"
            : (phase === 5)? "recieved"
            : "failed to parse"; // TODO throw an error explicitly
    }

    return <>
        <>{shipmentOrderRelations.map(relation => 
            <div className="shipment" key={relation.shipment?.toString()}>
                <div>Shipment id: {relation.shipment?.toString()}</div>
                <div className="minor-note">Please tell the id to the operator in inquiry</div>
                {relation.orders.map(order => <div className="order">
                    <div className="row">Product Name: <Link href={`/item/${order.item._id}`}><strong>{order.item.title}</strong></Link></div>
                    <div className="row">Price: ${order.item.price}</div>
                    <div className="row">Quintity: {order.quantity}</div>
                    <div className="row minor-note">{order.item.description}</div>
                </div>)}
                <>{parseShipment(shipments.find(sm => sm._id?.toString() === relation.shipment?.toString())!)}</>
            </div>
        )}</>
    </>;
}

export default HistoryPart;