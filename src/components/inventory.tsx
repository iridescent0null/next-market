import { Inventory } from "@/app/api/inventory/[id]/route"


interface InventoryProps{
    inventory?: Inventory
}

const prettyDate = (dateStr: string | undefined) => {
    console.log(dateStr)


    if (!dateStr) {
        return "";
    }

    const date = new Date(dateStr);

    return (date.getFullYear())?
            date.getFullYear() + "/" +(date.getMonth()+1) + "/" + date.getDay()
            : ""; // with invalid string, no error happens but getFullYear() returns NaN siliently.
}

const InventoryPart = (props: InventoryProps) => {
    return (
        !props.inventory?
            <div className="inventory-wrapper">sorry <strong>not avaliable</strong> now!</div>
            :<div className="inventory-wrapper thirty-padding">
                <div>
                    stock:  {props.inventory.stock} 
                </div>
                <div>
                    release: {prettyDate(props.inventory.release?.toString())}
                </div>
            </div>
    )
}

export default InventoryPart;