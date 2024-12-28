import { test, expect } from "@playwright/test";

const login = async ({ page } :any, name: string) => { // can be contained in beforeEach if all test worker should sign in
  await page.goto("/user/login").then(()=>
    page.getByPlaceholder("your e-mail address").fill(`${name}@example.co.jp`))
    .then(()=>page.getByRole("textbox", {name: "password"}).fill("123456789"))
    .then(()=>page.getByRole("button", {name: "Sign in"}).click());

  await expect(page.getByText("Available Products")).toBeVisible();
}

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
test("cast dummy item into cart", async ({ page }, info) => { // TODO resolve the non general expectation
  await login( { page }, info.project.name);
  await page.screenshot({path: "./screenshots/"+info.project.name+".png", fullPage: true});

  await page.locator(".item").filter({has: page.getByRole("heading", {name: "dummy title"})})
    .getByRole("button", {name: "add to cart"})
    .click();

  await page.getByRole("button", {name: "Cart"}).first().click();

  await expect(page.getByText("dummy title")).toBeVisible();
  await expect(page.getByText("Available Products")).toBeVisible({visible:false});
  await page.screenshot({path: "./screenshots/"+info.project.name+".png", fullPage: true});

  await expect(page.getByText(/Total\:.*/)).toBeVisible();
  await expect(page.getByRole("button", {name: "Proceed to Checkout"})).toBeVisible();
  await page.screenshot({path: "./screenshots/"+info.project.name+".png", fullPage: true});
});

test("subscribe RSS feed", async ({ page }, info) => {
  await page.goto("/rss?mocked=true");
  await page.screenshot({path: "./screenshots/rss/"+info.project.name+".png", fullPage: true});
  await expect(page.getByText("MOCK RSS")).toHaveCount(5);
  await page.screenshot({path: "./screenshots/rss/"+info.project.name+".png", fullPage: true}); // incluing thubmnails or not is under a race condition in rendering
})