"use client"
import { AllItemsMessage } from "./api/item/readall/route";
import Image from "next/image";
import { getRootURL } from "./utlis/config";
import Link from "next/link";
import { Item } from "./api/item/[id]/route";
import { SyntheticEvent, useEffect, useState } from "react";
import { ItemsMessage } from "./api/item/route";
import { Inventory } from "./api/inventory/[id]/route";
import { InventoriesMessage } from "./api/inventory/route";
import InventoryPart from "@/components/inventory";
import { CartCreationRequest } from "./api/cart/route";

/** for Next's Image's loader property */
interface ImageSource {
  src: string,
  width?: number,
  quality?: number
}

type paging = "previous" | "new" | "next" | "neutral";

const problematicImages = new Set<string>();
const dummyImagePath = "/blank.png";

/** 
 * If it has valid image file as src, return it. If not, return the path to dummy png file \
 * Non-first attempts to parse a specific file are canceled and to get the dummy png file path immediately. 
 */
const attempToParseImageURLFromSrc = (imgSrc: ImageSource) => {
  let path = imgSrc.src; // should be like "/foo.png" (starting with a slash and ending with its extension)
  let rtnValue: string;

  // suppress attempts to check the image already failed
  if (problematicImages.has(path)) {
    return dummyImagePath;
  }

  rtnValue = `${getRootURL()}_next/image/?url=${path}&w=${1080}&q=${imgSrc.quality?imgSrc.quality:75}`; // for some reason, imgSrc.width has an invalid value (like 500) then we can't adopt it there
  try {
    fetch(rtnValue)
      .then (res => {
        if (!res.ok) {
          problematicImages.add(path);
          rtnValue = dummyImagePath;
        } else {
          rtnValue = path;
        }
      })
      .catch(() => {rtnValue = dummyImagePath});

    if (!rtnValue) { // guard against errors which rarely happen
      console.error(`invalid item image: ${path}`);
      problematicImages.add(path);
      return dummyImagePath;
    }

    return rtnValue;
  } catch (err) {
    console.error(`invalid item image: ${path}`);
    return dummyImagePath;
  }
};

const ReadItemPaging = () => {
  const [page, setPage] = useState<number>(1);
  const [itemPerPage] = useState<number>(5); // currently effective constant
  const [itemState, setItems] = useState<Item[]>([]);
  const [direction, setDirection] = useState<paging>("new");
  const [allItemsCount,setAllItemsCount] = useState<number>(0);
  const [inventories, setInventories] = useState<(Inventory | undefined)[]>([]);

  useEffect(() => {
    const hydrate = () => {
      const pageToBeShown = page + ((direction === "next")? +1 : (direction === "previous")? -1 : 0);
      const startIndex = (pageToBeShown-1)*itemPerPage;
      setDirection("neutral");
      setPage(pageToBeShown);

      let shownItemIdsPromise: Promise<string[]>;
      if (!localStorage.getItem("allIds")) {
        shownItemIdsPromise = fetch(`${getRootURL()}api/item/readall?type=id`)
          .then(res => res.json())
          .then((message: AllItemsMessage) => message.ids)
          .then(retrievedIds => {
            localStorage.setItem("allIds", JSON.stringify(retrievedIds!));
            return retrievedIds!.slice(startIndex, startIndex+itemPerPage);
          });
      } else {
        shownItemIdsPromise = Promise.resolve(
          (JSON.parse(localStorage.getItem("allIds")!) as string[])
              .slice(startIndex, startIndex+itemPerPage)
        );
      }

      shownItemIdsPromise.then(ids =>
          fetch(`${getRootURL()}api/item/`,{
            method: "POST",
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json",
              "Authorization": "Bearer" + " " + localStorage.getItem("token")
            },
            body: JSON.stringify({
              ids: ids
            })
          }))
          .then(res => res.json())
          .then((message: ItemsMessage) => {
            if (!message.items) {
              console.log(message.message);
              throw new Error();
            }
            return message.items;
          })
          .then(items => {
            setItems(items);
            fetch(`${getRootURL()}api/inventory/`,{
              method: "POST",
              headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer" + " " + localStorage.getItem("token")
              },
              body: JSON.stringify({
                ids: items.map(item => item._id)
              })
          })
          .then(res => res.json())
          .then((message: InventoriesMessage) => {
            if (!message.message || !message.inventories) {
              console.error(message.message);
              throw new Error(); //TODO explain it
            }
            // re-convert the date in strings to pure Dates
            message.inventories = message.inventories.map(
                inventory => {
                  inventory.release = new Date(inventory.release);
                  inventory.discontinue = inventory.discontinue?
                      new Date(inventory.discontinue)
                      : undefined;
                  return inventory;
                }
            )
            return message.inventories;
          })
          .then(inventories => setInventories(inventories!));      
          })
          .catch(err=>{
            console.error(err);
          });
    };
    hydrate();
  }, [direction]);

  const addCart = (event: SyntheticEvent, quantity: HTMLInputElement) => {
    event.preventDefault();

    fetch(`${getRootURL()}api/cart`,{
      method: "PUT",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": "Bearer" + " " + localStorage.getItem("token")
      },
      body: JSON.stringify({
        item: quantity.id.substring(9) as any, // It should be ObjectId. but, generating ObjectId instance causes error...
        quantity: quantity.valueAsNumber,
        email: localStorage.getItem("email")
      } as CartCreationRequest)
    })
    .then(res => {
      alert("added to your cart");
    })
    .catch(err=> console.error(err))
  }

  // setting the number of item (regarding it as static)
  fetch(`${getRootURL()}api/item/readall?type=count`)
      .then(res => res.json() as Promise<AllItemsMessage>)
      .then(message => {
        setAllItemsCount(message.count);
      });

  return (
    (!itemState || itemState.length < 1)? <>loading</>:
    <>
      <h1 className="greeting"> Available Products</h1>
      <div className="button-wrapper">
      {(page > 1)? 
        <button onClick={() => setDirection("previous")} className="direction-button">&#60;</button>
        : <button className="disabled-button direction-button" disabled>&#60; </button>
      }
      {(Math.ceil(allItemsCount/itemPerPage) - page > 0)?
        <button onClick={() =>{setDirection("next") }} className="direction-button">&#62;</button>
        : <button className="disabled-button direction-button" disabled >&#62; </button>
      }
      </div>
      <div className="button-wrapper">
        <button onClick={() =>  {localStorage.setItem("allIds",""); setDirection("new")}} className="direction-button"> force reload</button>
        <div className="minor-note">note: if you cannot see items which are created recently, the button may help to find those</div>
      </div>
      <div className="page-number-wrapper">
        <span className="page-number" >{page} / {Math.ceil(allItemsCount/itemPerPage)}</span>
        <div>items: {allItemsCount}</div>
      </div>
      
      {
        itemState.map(item => {
          return !item? <></>
          :<div key={item?._id} className="item">
            <Link href={`/item/${item._id}`}>
              <h3>{item.title}</h3>
              <h4 className="price">${item.price}</h4><span className="minor-note"> tax included</span>
              <div className="two-wrapper">
                <div className="img-wrapper">
                  {!item.image?<><i>image not found</i></>
                    :<Image loader={attempToParseImageURLFromSrc} src={item.image} fill={true} alt={`product image of ${item.title}`}/>
                  }
                </div>
                <div className="description">{item.description}</div>
              </div>
            </Link>
              {!inventories.find(inventory => inventory?.item === item?._id)?<>sorry <strong>not avaliable</strong> now!</>
                :<div className="purchase-area">
                  <InventoryPart inventory={inventories.find(inventory => inventory?.item === item?._id)!}/>
                  <div className="forty-padding">
                  </div>
                  <div className="right-button-wrapper thirty-padding">
                  { ((inventories.find(inventory => inventory?.item === item?._id)!.release) > new Date())?
                      <form>
                        <button className="cart-button disabled-button" disabled>add to cart</button>
                      </form>
                      :
                      <form>
                        <button onClick={e => {
                          e.preventDefault();
                          const input = document.getElementById(`quantity-${item._id}`) as HTMLInputElement;
                          if (input.valueAsNumber < 1) {
                            return;
                          }
                          input.valueAsNumber = input.valueAsNumber - 1} 
                        }> - </button>
                        <input className="number-input" type="number" id={`quantity-${item._id}`} value={1} />
                        <button onClick={e => {
                          e.preventDefault();
                          const input = document.getElementById(`quantity-${item._id}`) as HTMLInputElement;
                          input.valueAsNumber = input.valueAsNumber + 1} 
                        }> + </button>
                        <button className="cart-button" onClick={ e => addCart(e, document.getElementById(`quantity-${item._id}`)! as HTMLInputElement)}>add to cart</button>
                      </form>
                  }
                  </div>
                </div>
              }
          </div>
        })
      }
    </>
  )
}

export default ReadItemPaging;
export const dynamic = "force-dynamic";