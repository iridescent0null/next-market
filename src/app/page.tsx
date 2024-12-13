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

const getItemsNonPromise = (skip: number, length: number = 5) => { // TODO delete me (this was a try to implement something)
  let rtnValue: (Item | undefined)[];
  const allIdsString = localStorage.getItem("allIds");

  if (skip) {
    // return; // suppress the infinit loop for the time being...
  }
  
  if (!allIdsString) {
    return;
  }
  let ids: readonly string[];
  ids = JSON.parse(allIdsString); // TODO set it // TODO any // TODO might be public item instead of the object countlessly generates

  console.log(ids);

  // try {
  //   retriveItems(ids, skip)
  //   .then((messages: (ItemMessage|null)[]) => 
  //     messages.filter(item => item) as ItemMessage[]      
  //   )
  //   .then(messages => messages.map(message => message.item))
  //   .then(a=>rtnValue=a);
  // } catch (err) {
  //   console.log(err);
  //   rtnValue = [];
  // }
  rtnValue = retriveItemsNoPromise(ids, skip).filter(message => message) .map(message => message!.item);
  console.log(rtnValue!);
  return rtnValue!;
};

const getItems = async (skip: number, length: number = 5) => { // TODO delete me (this was a try to implement something)
  const allIdsString = localStorage.getItem("allIds");

  if (skip) {
      return; //  suppress the infinit loop for the time being...
  }
  
  if (!allIdsString) {
    return;
  }
  let ids: readonly string[];
  ids = JSON.parse(allIdsString); // TODO set it // TODO any // TODO might be public item instead of the object countlessly generates

  console.log(ids);

  const bar = await retriveItems(ids, skip);
  console.log(bar);
  return bar.filter(message=>message && message.item) .map(message => message?.item!);
  return await retriveItems(ids, skip)
    .then((messages: (ItemMessage|null)[]) => 
      messages.filter(item => item) as ItemMessage[]      
    )
    .then(messages => messages.map(message => message.item));

    // .then( ids => {
    //   console.log(ids);
    //   for (let i = 0; i < ids.length; i++) {
    //     const itemMessage = ids[i]
        
    //     if (itemMessage && itemMessage.item) {
    //       rtnValue.push(itemMessage.item);

    //     };

    //   }
    // });

    // return rtnValue;
};

const retriveItems = async (ids: readonly string[], skip: number = 0) => { // TODO delete me (worked out, but this was a try to implement something)
  const messagesPromise = Promise.all([
    (ids[0+skip]? await getItem(ids[0+skip]) : null),
    (ids[1+skip]? await getItem(ids[1+skip]) : null),
    (ids[2+skip]? await getItem(ids[2+skip]) : null),
    (ids[3+skip]? await getItem(ids[3+skip]) : null),
    (ids[4+skip]? await getItem(ids[4+skip]) : null),
    (ids[5+skip]? await getItem(ids[5+skip]) : null),
    (ids[6+skip]? await getItem(ids[6+skip]) : null),
    (ids[7+skip]? await getItem(ids[7+skip]) : null),
    (ids[8+skip]? await getItem(ids[8+skip]) : null),
    (ids[9+skip]? await getItem(ids[9+skip]) : null),
    ]
  );
  console.log(messagesPromise);
  return messagesPromise;

  // return Promise.all([
  //   (ids[0+skip]? await getItem(ids[0+skip]) : null),
  //   (ids[1+skip]? await getItem(ids[1+skip]) : null),
  //   (ids[2+skip]? await getItem(ids[2+skip]) : null),
  //   (ids[3+skip]? await getItem(ids[3+skip]) : null),
  //   (ids[4+skip]? await getItem(ids[4+skip]) : null),
  //   (ids[5+skip]? await getItem(ids[5+skip]) : null),
  //   (ids[6+skip]? await getItem(ids[6+skip]) : null),
  //   (ids[7+skip]? await getItem(ids[7+skip]) : null),
  //   (ids[8+skip]? await getItem(ids[8+skip]) : null),
  //   (ids[9+skip]? await getItem(ids[9+skip]) : null),
  //   ]
  // );
};

const retriveItemsNoPromise =  (ids: readonly string[], skip: number = 0) => { // TODO delete me (worked out, but this was a try to implement something)
  let messages: (ItemMessage | undefined)[] = [];
  
  try {
  Promise.all([
    (ids[0+skip]?  getItem(ids[0+skip]) : undefined),
    (ids[1+skip]?  getItem(ids[1+skip]) : undefined),
    (ids[2+skip]?  getItem(ids[2+skip]) : undefined),
    (ids[3+skip]?  getItem(ids[3+skip]) : undefined),
    (ids[4+skip]?  getItem(ids[4+skip]) : undefined),
    (ids[5+skip]?  getItem(ids[5+skip]) : undefined),
    (ids[6+skip]?  getItem(ids[6+skip]) : undefined),
    (ids[7+skip]?  getItem(ids[7+skip]) : undefined),
    (ids[8+skip]?  getItem(ids[8+skip]) : undefined),
    (ids[9+skip]?  getItem(ids[9+skip]) : undefined),
    ]
  ).then(array => messages = array);
  } catch (err) {
    console.error(err);
  }
  console.log(messages);
  return messages;

  // return Promise.all([
  //   (ids[0+skip]? await getItem(ids[0+skip]) : null),
  //   (ids[1+skip]? await getItem(ids[1+skip]) : null),
  //   (ids[2+skip]? await getItem(ids[2+skip]) : null),
  //   (ids[3+skip]? await getItem(ids[3+skip]) : null),
  //   (ids[4+skip]? await getItem(ids[4+skip]) : null),
  //   (ids[5+skip]? await getItem(ids[5+skip]) : null),
  //   (ids[6+skip]? await getItem(ids[6+skip]) : null),
  //   (ids[7+skip]? await getItem(ids[7+skip]) : null),
  //   (ids[8+skip]? await getItem(ids[8+skip]) : null),
  //   (ids[9+skip]? await getItem(ids[9+skip]) : null),
  //   ]
  // );
};

/** return the item's image path if the image file is confirmed to be accessible */
const attempToParseImageURL = async (item: Item) => { // TODO remove me
  let url = item.image; //like "/foo.png" (starting with a slash and ending with its extension)
  url = url.substring(1);
  let rtnValue: string | null;
  rtnValue  = null; // unfortunetely TS insists the variable might not be initialized without this line...
  try {
    rtnValue = await fetch(`${getRootURL()}_next/image/?url=/${url}&w=3840&q=1`) // TODO magic path
      .then (res => {
        console.log(res);
        // rtnValue = res.ok? url : null; 
        return res.ok? url : null;
      })
      // .catch(() => {rtnValue = null});
      .catch(() => {return null});

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

const attempToParseImageURLFromSrc = (imgSrc: ImageSource) => {
  let url = imgSrc.src; //like "/foo.png" (starting with a slash and ending with its extension)
  let rtnValue: string | null;
  rtnValue = null; // unfortunetely TS insists the variable might not be initialized without this line...
  rtnValue = `${getRootURL()}_next/image/?url=${url}&w=3840&q=1`; //FIXME use the width and quality values in the imgSrc
  try {
    fetch(rtnValue)
      .then (res => {
        console.log(res);
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

const ReadItemPaging = async (context: RequestContext) => { // TODO context is needed?
  const [page, setPage] = useState<number>(1);
  const [itemPerPage, setItemPerPage] = useState<number>(5); // currently effectively constant
  // const [itemState, setItems] = useState<(Item | undefined)[]>([]); // todo remove the undefined[]
  const [direction, setDirection] = useState<paging>("new");

  // FIXME remove the following mayhem...
  // const readPreviousPage = () => {
  //   let tmp = page;
  //   tmp = tmp -1;
  //   getItems((tmp -1 )* itemPerPage,itemPerPage) //TODO handle minus value
  //     .then(items => {
  //       setItems(items!);
  //       setPage(tmp);
  //     });
  // }

  // useEffect( () => {

  //   const hydrate = async () => {

  //     if (direction === "new") {
  //       return;
  //     }

  // // const tmp = page
  // //     + ((direction === "next")? (+1)
  // //     : (direction === "new")? 0
  // //     : -1); 

  //     const tmp = page + ((direction === "next")? (+1): -1); 
  //     const items = await getItems((tmp -1 )* itemPerPage,itemPerPage);

  //     setItems(items!);

  //     // setPage(page);
  //     // setDirection("new"); //reset TODO new might be a bad name
  //     setDirection("new");

  // }
  // hydrate();
  // }, [context]);
  

//   const readNextPage = async () => {
    
//     let tmp = page;
//     tmp = tmp +1;

//     // console.log((tmp -1 )* itemPerPage);
//     // return;
//     const items = await getItems((tmp -1 )* itemPerPage,itemPerPage) ;
//     // setItems(items!);
//     // setPage(tmp);
//     console.log(items);
//     refreshItem(items!,tmp);
//     return;
//     getItems((tmp -1 )* itemPerPage,itemPerPage) //TODO handle minus value
//       .then(items => {
//         console.log(items);
//         setItems(items!);
//         setPage(tmp);
//       })
//       .catch( err => {
//         console.error(err);
//         throw new Error("failure in getting the next page");
//       });
//   }

// const refreshItem = (items: (Item | undefined)[],page: number)  => {
//       setItems(items!);
//       setPage(page);

// }

  // const tmp = page
  //     + ((direction === "next")? (-1)
  //     : (direction === "new")? 0
  //     : +1); 

  // const increasePage = () => { // should be async?
  //   const tmp = page + 1 ;
  //   setPage(tmp);
  // };

  // const decreasePage = () => { // should be async?
  //   const tmp = page - 1 ;
  //   setPage(tmp);
  // };

  // TODO enjoy useEffect to implement the pagination

  const pageToBeShown = page + ((direction === "next")? (+1) : (direction === "new")? 0 : -1); 
  console.log({pageToBeShown: pageToBeShown});

  const ids = (JSON.parse(localStorage.getItem("allIds")!) as string[])
      .slice((pageToBeShown-1)*5,(pageToBeShown-1)*5+5);

  const items = await fetch(`${getRootURL()}api/item/`,{
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
  .then((message: ItemsMessage) => message.items) 
    // TODO .catch

  // TODO remove those attempting lines
  // const items = await fetch();   getItemsNonPromise((tmp -1 )* itemPerPage,itemPerPage);
  // const items = getItemsNonPromise((tmp -1 )* itemPerPage,itemPerPage);
  // const items = await getItems((tmp -1 )* itemPerPage,itemPerPage);
  // const items = itemsj?
  // itemsj
  // : await getItems((tmp -1 )* itemPerPage,itemPerPage);
  
  // setItems(items!);
  // setPage(page);
  setPage(pageToBeShown);

  return (
    !items? <>loading</>:
    <>
      <h1 className="greeting"> Available Products (pagination)</h1>
      <div className="button-wrapper">
        <button onClick={() => setDirection("previous")}>&#60;</button><button onClick={event =>{setDirection("next") }}>&#62;</button>
      </div>
      {
        items.map(async item => {
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
                  <span>{page}</span>
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