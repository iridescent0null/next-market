"use client"
import { AllItemsMessage } from "./api/item/readall/route";
import Image from "next/image";
import { getRootURL } from "./utlis/config";
import Link from "next/link";
import RequestContext, { Item, ItemMessage } from "./api/item/[id]/route";
import { getItem } from "./item/[id]/page";
import { useEffect, useState } from "react";
import { ItemsMessage } from "./api/item/route";

/** for Next's Image's loader property */
interface ImageSource {
  src: string,
  width?: number,
  quality?: number
}

type paging = "previous" | "new" | "next";

const getAllItems = async () => {
  return fetch(`${getRootURL()}api/item/readall`)
    .then(res => res.json() as Promise<AllItemsMessage>)
    .then(json => {
      json.items! //TODO null check
        .forEach(async item => {
          const image = item.image;
          // const img = await attempToParseImageURL(item);
          const img = image;
          if (!img) {
            item.image = "";
          }
        })
      return json;
    })
    .catch(err => {
      console.error(err);
      // the err doesn't have json form, then new json object is needed to return the response
      return Promise.resolve({message: "failed to get items"} ) as Promise<AllItemsMessage>;
    });
};

const attempToParseImageURLFromSrc = (imgSrc: ImageSource) => {
  let url = imgSrc.src; //like "/foo.png" (starting with a slash and ending with its extension)
  let rtnValue: string | null;
  rtnValue = null; // unfortunetely TS insists the variable might not be initialized without this line...
  rtnValue = `${getRootURL()}_next/image/?url=${url}&w=3840&q=1`; //FIXME use the width and quality values in the imgSrc
  try {
    fetch(rtnValue)
      .then (res => {
        rtnValue = res.ok? url : null; 
      })
      .catch(() => {rtnValue = null});

    if (!rtnValue) {
      console.error(`invalid item image: ${url}`);
      return "";
    }
    return rtnValue;
  } catch (err) {
    console.error(`invalid item image: ${url}`);
    return "";
  }
};

const ReadItemPaging = (context: RequestContext) => { // TODO context is needed?
  const [page, setPage] = useState<number>(1);
  const [itemPerPage, setItemPerPage] = useState<number>(5); // currently effectively constant
  const [itemState, setItems] = useState<(Item | undefined)[]>([]); // todo remove the undefined[]
  const [direction, setDirection] = useState<paging>("new");

useEffect(() => {
  const hydrate = () => {
    const pageToBeShown = page + ((direction === "next")? (+1) : (direction === "new")? 0 : -1);
    setDirection("new");
    setPage(pageToBeShown);
    const ids = (JSON.parse(localStorage.getItem("allIds")!) as string[])
      .slice((pageToBeShown-1)*5,(pageToBeShown-1)*5+5);
    
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
    })
    .then(res => res.json())
    .then((message: ItemsMessage) => {
      if (!message.items ) {
        console.log(message.message);
        throw new Error();
      }
      console.log(message.items);
      return message.items;
    })
    .then(items => setItems(items));
  };
  hydrate();
},[direction,page]);

  return (
    !itemState? <>loading</>:
    <>
      <h1 className="greeting"> Available Products (pagination)</h1>
      <div className="button-wrapper">
        <button onClick={() => setDirection("previous")}>&#60;</button><button onClick={event =>{setDirection("next") }}>&#62;</button>
      </div>
      <div className="page-number-wrapper">
        <span className="page-number" >{page} / TotalPageNumber</span>
      </div>
      
      {
        itemState.map(item => {
          return !item? <></>
          :<div key={item?._id} className="item">
            <Link href={`/item/${item._id}`}>
              <h3>{item.title}</h3>
              <h3>${item.price}</h3>
              <h3>{item.description}</h3>
              <div className="img-wrapper">
                {!item.image?<><i>image not found</i></>
                  :<Image loader={attempToParseImageURLFromSrc} src={item.image} fill={true} alt={`product image of ${item.title}`}/>
                }
              </div>
            </Link>
          </div>
        })
      }

    </>
  )
}

const ReadAllItems = async () => { // currently suppressed
  const allItems = await getAllItems();

  console.log(allItems);

  const ids =  allItems.items! //TODO null check
    .map(item => item._id);

  localStorage.setItem("allIds", JSON.stringify(ids));

  const items = allItems.items;
  return (
    <>
      <h1 className="greeting"> Available Products </h1>
      {!items? "":
        items.map(async item => {
          const imagePath = item.image;
          return <div key={item._id} className="item">
            <Link href={`/item/${item._id}`}>
              <h3>{item.title}</h3>
              <h3>{"$"+item.price}</h3>
              <div>{item.description}</div>
              <div className="img-wrapper">
                {imagePath?
                  <Image loader={attempToParseImageURLFromSrc} src={imagePath} fill={true} alt={"product image"}/>
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

export default ReadItemPaging;
export const dynamic = "force-dynamic";