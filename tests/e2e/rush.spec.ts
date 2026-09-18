import {test,expect} from "@playwright/test";
test("public discovery works without a wallet",async({page})=>{
 await page.goto("/");await expect(page.getByText("See what people are watching.")).toBeVisible();await page.getByRole("link",{name:"Explore markets"}).click();await expect(page).toHaveURL(/\/discover$/);await expect(page.getByRole("heading",{name:"Markets people are watching"})).toBeVisible();
 const cards=page.locator('a[href^="/markets/"]');
 if(await cards.count()>0){await cards.first().click();await expect(page).toHaveURL(/\/markets\//);await expect(page.locator("main h1")).toBeVisible();}
});
test("authenticated actions never require a wallet just to browse",async({page})=>{
 await page.goto("/discover");await expect(page.getByText("Connect wallet")).toBeVisible();await expect(page.getByText("Sign in")).toBeVisible();
});