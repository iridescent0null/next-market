import { AllItemsMessage } from "./api/item/readall/route";
import Image from "next/image";
import { getRootURL } from "./utlis/config";
import Link from "next/link";
import { Item } from "./api/item/[id]/route";

const getAllItems = async () => {
  return fetch(`${getRootURL()}api/item/readall`)
    .then(res => res.json() as Promise<AllItemsMessage>)
    .catch(err => {
      console.error(err);
      // the err doesn't have json form, then new json object is needed to return the response
      return Promise.resolve({message: "failed to get items"} ) as Promise<AllItemsMessage>
    });
};

/** return the item's image path if the image file is confirmed to be accessible */
const attempToParseImageURL = async (item: Item) => {
  const url = item.image; //like "/foo.png" (starting with a slash and ending with its extension)
  let rtnValue: string | null;
  rtnValue  = null; // unfortunetely TS insists the variable might not be initialized without this line...
  try {
    await fetch(`${getRootURL()}_next/image/?url=${url}&w=3840&q=1`) // TODO magic path
      .then (res => {
        rtnValue = res.ok? url : null; 
      })
      .catch(() => {rtnValue = null});

    if (!rtnValue) {
      console.error(`invalid item image: ${url}`);
    }
    return rtnValue!;
  } catch (err) {
    console.error(`invalid item image: ${url}`);
    return null;
  }
};

const ReadAllItems = async () => {
  const allItems = await getAllItems();
  const items = allItems.items;
  return (
    <>
      <h1 className="greeting"> Available Products </h1>
      {!items? "":
        items.map(async item => {
          const imagePath = await attempToParseImageURL(item);
          return <div key={item._id} className="item">
            <Link href={`/item/${item._id}`}>
              <h3>{item.title}</h3>
              <h3>{"$"+item.price}</h3>
              <div>{item.description}</div>
              <div className="img-wrapper">
                {imagePath?
                  <Image src={imagePath} fill={true} alt={"product image"}/>
                  :<span><i>image not found</i></span>
                }
              </div>
            </Link>
          </div>
        })
      }
    </>
  );
};

export default ReadAllItems;
export const dynamic = "force-dynamic";