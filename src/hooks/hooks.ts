import { AfterAll } from "@cucumber/cucumber";
import { After, Before } from "@cucumber/cucumber";
import { chromium } from "playwright";
import { sep } from "node:path";
import { writeFileSync } from "node:fs";
import { setDefaultTimeout, setWorldConstructor } from "@cucumber/cucumber";
import { Browser, BrowserContext, Page } from "@playwright/test";
import { State } from "../state/state";
import { loadUserConfiguration } from "../storage/user";
import { getRootPrjDir } from "../utils/utils";

const ROOT_DIR: string = getRootPrjDir(__dirname);
setDefaultTimeout(120 * 1000);
setWorldConstructor(State);

Before(async function (this: State): Promise<void> {
   const browser: Browser = await chromium.launch({headless: false, args: ['--start-maximized']});
   const context: BrowserContext = await browser.newContext({viewport: null});
   await context.credentials.install();
   const page: Page = await context.newPage();
   const user: string = loadUserConfiguration();

   page.setDefaultTimeout(60 * 1000);

   this.init(user, page, context, browser, this.parameters.baseUrl, this.parameters.sender);
});

After(async function (this: State): Promise<void> {
   await this.closeBrowserContext();
   await this.closeBrowser();
});

AfterAll(async function (): Promise<void> {
   if(this.parameters.cucumberConfig)
      writeFileSync(`${ROOT_DIR}${sep}cucumber.json`, this.parameters.cucumberConfig as string);
});