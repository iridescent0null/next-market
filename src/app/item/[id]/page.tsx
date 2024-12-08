import ResponseContext from "@/app/api/item/[id]/route";
import { getRootURL } from "@/app/utlis/config";
import { Item, ItemMessage } from "@/app/api/item/[id]/route";
import Image from "next/image";

/** currently this function says OK when no item was found... */
const getItem = async (id: string) => {
    return fetch(`${getRootURL()}/api/item/${id}`)
        .then(res => res.json() as Promise<ItemMessage>)
        .catch(err => {console.error(err); return {message: "not found"} as ItemMessage});
};

const ViewItem = async (context: ResponseContext) => {
    const params = await context.params;
    let item: Item | undefined;

    await getItem(params.id)
            .then((i: ItemMessage) => {
                item = i.item; // FIXME the fetch says OK in NOT FOUND situation and this line cannot handle it appropriately
            })
            .catch(err => {
                console.error(err);
                item = undefined;
            });
    
    return (
        <>
          {item? <span></span> : <h2>NOT FOUND</h2>}
          <div key={item? item._id : ""} className="item">
            <h3>{item? item.title : ""}</h3>
            <h3>{item? item.price : ""}</h3>
            <h3>{item? item.description : ""}</h3>
            <div className="img-wrapper">
              {item? 
                <Image src={item.image} fill={true} alt={"image"}/>
                :""}
            </div>
          </div>
        </>
    );
};

export default ViewItem;
export { getItem };