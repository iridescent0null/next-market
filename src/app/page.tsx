import { AllItemsMessage } from "./api/item/readall/route";
import Image from "next/image";
import { getRootURL } from "./utlis/config";

const getAllItems = async () => {
  return fetch(`${getRootURL()}api/item/readall`)
    .then(res => res.json() as Promise<AllItemsMessage>)
    .catch(err => {
      console.error(err);
      // the err doesn't have json form, then new json object is needed to return the response
      return Promise.resolve({message: "failed to get items"} ) as Promise<AllItemsMessage>
    });
};

const ReadAllItems = async () => {
  const allItems = await getAllItems();
  const items = allItems.items;
  return (
    <>
      <h1 className="greeting"> Available Products </h1>
      {!items? "":
        items.map(item => {
          return <div key={item._id} className="item">
            <h3>{item.title}</h3>
            <h3>{"$"+item.price}</h3>
            <div>{item.description}</div>
            <div className="img-wrapper">
              <Image src={item.image} fill={true} alt={"image"}/>
            </div>
          </div>
        })
      }
    </>
  )
};

export default ReadAllItems;
export const dynamic = "force-dynamic";