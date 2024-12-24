import { test, expect } from "@playwright/test";

test.beforeEach (async ({ page }) => {
  page.on('dialog', dialog => {console.log(dialog.message());  dialog.accept();});
});

test("has title", async ({ page }) => {
  // await page.goto('https://playwright.dev/'); // default line
  await page.goto("/");

  // Expect a title "to contain" a substring.
  // await expect(page).toHaveTitle(/Playwright/); // default line
  await expect(page).toHaveTitle(/Iridescent's Next Sandbox Application/);
});

test("go second page", async ({ page }) => {
  // await page.goto('https://playwright.dev/'); // default line
  await page.goto("/");

  // Click the get started link.
  // await page.getByRole('link', { name: 'Get started' }).click(); // default line
  await page.getByRole("button", { name: ">" }).click();
  

  // Expects page to have a heading with the name of Installation.
  // await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible(); // default line
  await expect(page.getByText(/2 \/ \d+/)).toBeVisible();
});

test("cast dummy item into cart", async ({page},info) => {
  await page.goto("/user/login").then(()=>
    page.getByPlaceholder("your e-mail address").fill(`${info.project.name}@example.co.jp`))
    .then(()=>page.getByRole("textbox", {name: "password"}).fill("123456789"))
    .then(()=>page.getByPlaceholder("your e-mail address").blur()) // Next's state requires bluring from the input to adopt the input value
    .then(()=>page.getByRole("textbox", {name: "password"}).blur())
    .then(()=>page.getByRole("button",{name: "Sign in"}).click()); // FIXME webkit cannot log in

  await page.screenshot({path: "./screenshots/"+info.project.name+".png", fullPage: true});

  await expect(page.getByText("Available Products")).toBeVisible({visible:true});
  await page.locator(".item").filter({has: page.getByRole("heading", {name: "dummy title"})})
    .getByRole("button", { name: "add to cart"})
    .click();

  await page.getByRole("button", { name: "Cart"}).first().click();

  await expect(page.getByText("dummy title")).toBeVisible();
  await expect(page.getByText("Available Products")).toBeVisible({visible:false});
  // await page.locator(".purchase-list-tail").all().then(ss => ss.forEach(s=>s.innerHTML().then(res=>console.log(res))));
  
  await page.screenshot({path: "./screenshots/"+info.project.name+".png", fullPage: true}); // first screenchot will be gone if the test reaches this line
  await expect(page.getByText(/Total\:.*/)).toBeVisible();
  await expect(page.getByRole("button", {name: "Proceed to Checkout"})).toBeVisible();
});