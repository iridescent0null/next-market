"use client"
import { AllItemsMessage } from "./api/item/readall/route";
import Image from "next/image";
import { getRootURL } from "./utlis/config";
import Link from "next/link";
import { Item } from "./api/item/[id]/route";
import { useEffect, useState } from "react";
import { ItemsMessage } from "./api/item/route";

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
      .then(items => setItems(items))
      .catch(err=>{
        console.error(err);
      });
    };
    hydrate();
  },[direction]);

  // setting the number of item (regarding it as static)
  fetch(`${getRootURL()}api/item/readall?type=count`)
      .then(res => res.json() as Promise<AllItemsMessage>)
      .then(message => {
        setAllItemsCount(message.count);
      });

  return (
    (!itemState || itemState.length < 1)? <>loading</>:
    <>
      <h1 className="greeting"> Available Products (pagination)</h1>
      <div className="button-wrapper">
      {(page > 1)? 
        <button onClick={() => setDirection("previous")}>&#60;</button>
        : <button className="disabled-button" disabled>&#60; </button>
      }
      {(Math.ceil(allItemsCount/itemPerPage) - page > 0)?
        <button onClick={() =>{setDirection("next") }}>&#62;</button>
        : <button className="disabled-button" disabled>&#62; </button>
      }
      </div>
      <div className="button-wrapper">
        <button onClick={() =>  {localStorage.setItem("allIds",""); setDirection("new")}}> force reload</button>
        <div>note: if you cannot items which are created recently, the button may help to find those</div>
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

export default ReadItemPaging;
export const dynamic = "force-dynamic";