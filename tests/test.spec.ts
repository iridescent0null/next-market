import { test, expect, Page } from "@playwright/test";

interface PageObject {
  page: Page
}

const login = async ({ page }: PageObject, name: string) => { // can be contained in beforeEach if all test worker should sign in
  // await page.context().clearCookies({name:"email"});

  await page.goto("/user/login").then(()=>
    page.getByPlaceholder("your e-mail address").fill(`${name}@example.co.jp`))
    .then(()=>page.getByRole("textbox", {name: "password"}).fill("123456789"))
    .then(()=>page.getByRole("button", {name: "Sign in"}).click());

    // tests often fail without manually setting the cookie...
    await page.context().addCookies([{
      name: "email",
      value: `${name}@example.co.jp`.replace("@","%40"),
      domain: "localhost",
      httpOnly: false,
      secure: false,
      sameSite: "Lax",
      path: "/"
    }]);
}

const prettyToday = () => { // mocking the parsing in the "prettyDate()"
  const date = new Date();
  return date.getFullYear() + "/" +(date.getMonth()+1) + "/" + date.getDate();
};

test.beforeEach (async ({ page }) => {
  page.on('dialog', dialog => {
    console.log(dialog.message());
    dialog.accept();
  });
});

/**
 * see the header
 */
test("has title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Iridescent's Next Sandbox Application/);
});

/**
 * visit the 2nd, 3rd and 2nd page and see the page number ( = 2/x or 3/x) in the top page
 */
test("go to second page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", {name: ">"}).click();
  await expect(page.getByText(/2 \/ \d+/)).toBeVisible();
  await page.getByRole("button", {name: ">"}).click();
  await expect(page.getByText(/3 \/ \d+/)).toBeVisible();
  await page.getByRole("button", {name: "<"}).click();
  await expect(page.getByText(/2 \/ \d+/)).toBeVisible();
});

/**
 * NOTE: this test expects the first placed item to be named as "dummy title"; 
 */
test("cast dummy item into cart and purchase it", async ({ page }, info) => { // TODO resolve the non general expectation
  await login( { page }, info.project.name);
  await page.screenshot({path: "./screenshots/"+info.project.name+".png", fullPage: true});

  await expect(page.getByText("Available Products").first()).toBeVisible();

  await page.locator(".item").filter({has: page.getByRole("heading", {name: "dummy title"})})
    .getByRole("button", {name: "add to cart"})
    .click();

  await expect(page.getByText("Available Products").first()).toBeVisible();
  await page.getByRole("button", {name: "Cart"}).first().click();

  await expect(page.getByText("dummy title")).toBeVisible();
  await expect(page.getByText("Available Products")).toBeVisible({visible:false});
  await page.screenshot({path: "./screenshots/"+info.project.name+".png", fullPage: true});

  await expect(page.getByText(/Total\:.*/).first()).toBeVisible();
  await expect(page.getByRole("button", {name: "Proceed to Checkout"})).toBeVisible();
  await page.screenshot({path: "./screenshots/"+info.project.name+".png", fullPage: true});

  await page.getByRole("button", {name: "Proceed to Checkout"}).first().click();

  await page.getByPlaceholder("like 000-0000").fill("test-zip")
      .then(()=>page.getByPlaceholder("address to deliver").fill("Tokyo Chiyoda 1-1"))
      .then(()=>page.getByRole("button", {name: "Order!"}).click()); // FIXME webkit and chromium sometimes fail to pass
  await page.screenshot({path: "./screenshots/"+info.project.name+"_order"+".png", fullPage: true});

  await expect(page.getByText("Available Products").first()).toBeVisible();

  await page.getByRole("button", {name: "Cart"}).first().click();
  await page.screenshot({path: "./screenshots/"+info.project.name+"_order"+".png", fullPage: true});

  await expect(page.getByText(prettyToday(), {exact: false}).first()).toBeVisible(); // TODO check the shipment id
  await page.screenshot({path: "./screenshots/"+info.project.name+"_order"+".png", fullPage: true});
});

test("subscribe RSS feed", async ({ page }, info) => {
  await page.goto("/rss?mocked=true");
  await page.screenshot({path: "./screenshots/rss/"+info.project.name+".png", fullPage: true});
  await expect(page.getByText("MOCK RSS")).toHaveCount(5);
  await page.screenshot({path: "./screenshots/rss/"+info.project.name+".png", fullPage: true}); // incluing thubmnails or not is under a race condition in rendering
});

test("create and delete new item", async ( {page }, info) => {
  const idOfItemAlreadyExists = "6754f1f148f1aa71017dd335";
  const screenshotObj = {path: "./screenshots/itemCreation/"+info.project.name+".png", fullPage: true};

  await login( { page }, info.project.name);

  // wait for the localStorage to get prepared... (firefox and webkit hastly progress and use null as token without this line...)
  await expect(page.getByText("Available Products").first()).toBeVisible();

  await page.goto("/item/create")
  .then(() => page.getByRole("checkbox").first() // believing there is only the image mode checkbox...
    .check()
    .then(() => page.getByPlaceholder("title shown in the page").fill(info.project.name + "item"))
    .then(() => page.getByPlaceholder("price in US dollar").fill("200"))
    .then(() => page.getByPlaceholder("description").fill("description written by " + info.project.name))
    .then(() => page.getByPlaceholder("item id which shares the image").fill(idOfItemAlreadyExists)) //visible yet?
    .then(() => page.screenshot(screenshotObj))
    .then(() => page.getByRole("button", {name: "Create!"}).click())
  );

  await expect(page.getByText(info.project.name + "item").first()).toBeVisible();
  await page.screenshot(screenshotObj);

  const paramsRegex = /(?<=(http(s){0,1}\:\/.*item\/))(.*)/;
  await page.goto("/item/delete/"+page.url().match(paramsRegex)![0])
      .then(() => page.getByRole("button", {name: "Delete!"}).click());
  await expect(page.getByText("Available Products").first()).toBeVisible();
});