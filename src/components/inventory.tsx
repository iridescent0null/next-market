import { Inventory } from "@/app/api/inventory/[id]/route"

interface InventoryProps{
    inventory?: Inventory
}

/**
 * If possible, convert the string into like 2022/02/23. If not, just return a blank. \
 * This function is assumed to used with string values generated in a JSON, not manually written
 * @param dateStr e.g. Mon Dec 14 2026 03:25:43 GMT+0900 (Japan Standard Time) 
 * @returns like "2022/02/23" or blank
 */
const prettyDate = (dateStr: string | undefined) => {
    if (!dateStr) {
        return "";
    }

    const date = new Date(dateStr); // expecting a string in a JSON's date field
    return (date.getFullYear())?
            date.getFullYear() + "/" +(date.getMonth()+1) + "/" + date.getDate()
            : ""; // with invalid string, getFullYear() returns NaN siliently.
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
                <div>
                    discon: {prettyDate(props.inventory.discontinue?.toString())  
                    || <span className="minor-note">not scheduled</span>}
                </div>
            </div>
    )
}

export default InventoryPart;
export { prettyDate };