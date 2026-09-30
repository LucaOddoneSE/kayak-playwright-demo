import { Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { DataTable } from "@cucumber/cucumber";
import { Locator, Page } from "@playwright/test";
import { setTimeout} from "node:timers";
import { EmailResponse } from "e2e-mailbox/types/types";
import { signIn, continueWithEmail, clearMailbox } from "./createNewUser.steps";
import { continueWithSigningIn, typeInVerificationCode, createNewUser } from "./createNewUser.steps";
import { State } from "../state/state";
import MailboxService from "e2e-mailbox/types/services/mailboxService";
import GuerrillaMailService from "e2e-mailbox/types/services/guerrillaMailService";

type DataTableStructure = Record<'city'|'country'|'code',string>;

Then('I log in with the previously generated account if it exists, otherwise I create a new one', async function (this: State) {
   const user: string = this.getEmailAddress();
   if(user === "" || user === undefined)
       await createNewUser(this);
   else
       await login(this);
   if(!(await checkForEmailsInMailBox(this.getMailBox(), 0.5)))
       await clearMailbox(this.getMailBox(), await this.getMailBox().fetchEmailList());
});

Then('I clear the default departure airport', async function(this: State) {
    const page: Page = this.getPage();
    const departureField: Locator = page.locator('div[aria-label="Flight origin input"]');
    await expect(departureField).toHaveCount(1, {timeout: 30000});
    const removeBtn: Locator = page.getByRole('button', {name: 'Remove value'});
    await expect(removeBtn).toHaveCount(1, {timeout: 30000});
    await removeBtn.click();
    const departureInputField: Locator = page.getByRole('combobox', {name: 'Origin location'});
    await expect(departureInputField).toHaveCount(1, {timeout: 30000});

});

Then(/^I select the airport described by the following values as (origin|destination)$/, async function(this: State, way: string, table: DataTable) {
    const page: Page = this.getPage();

    expect(table.hashes()).toHaveLength(1);
    const place: DataTableStructure = remapKeys(table.hashes()[0]) as DataTableStructure;

    way = way.charAt(0).toUpperCase() + way.substring(1);
    const location: Locator = page.getByRole('combobox', {name: `${way} location`});
    await expect(location).toHaveCount(1, {timeout: 30000});

    const city: string = place.city;
    const country: string = place.country;
    const code: string = place.code;

    await location.fill(city);

    way = way.toLowerCase();
    const menu: Locator = page.locator(`#flight-${way}-smarty-input-list`);
    await expect(menu).toHaveCount(1, {timeout: 30000});

    const airport: Locator = menu.getByRole('option', {name: `${city}, ${country}`});
    await expect(airport).toHaveCount(1, {timeout: 30000});
    await airport.click();

    const inputAirportField: Locator = page.getByLabel(`Flight ${way} input`);
    await expect(inputAirportField).toHaveCount(1, {timeout: 30000});
    await expect(inputAirportField).toHaveText(`${city}, ${country} (${code})`, {timeout: 30000});
});

Then(/I select a random (departure|return) date within the next calendar month$/, async function(this: State, type: string) {
   const page: Page = this.getPage();
   const timezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone
   const currentDate: string = Intl.DateTimeFormat('en', {year: 'numeric', month: 'long', day: '2-digit'}).format(Date.now()) + ' ' + Intl.DateTimeFormat('en', {hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short', timeZone: timezone}).format(Date.now());
   type = type.charAt(0).toUpperCase() + type.substring(1);
   const dateField: Locator = page.getByRole('button', {name: `${type} date`});
   await expect(dateField).toHaveCount(1, {timeout: 30000});
   await dateField.click();
   const nextMonth: string = computeNextMonthWithYear(new Date(currentDate));
   const datePicker: Locator = page.getByRole('grid', {name: nextMonth});
   await expect(datePicker).toHaveCount(1, {timeout: 30000});
   const monthDays: number = await datePicker.getByRole('gridcell').evaluateAll((gridCells: HTMLElement[]) => {
       let counter: number = 0
       for(const gridcell of gridCells)
           if(gridcell.textContent.trim() !== "")
               counter++
       return counter
   });
   type = type.toLowerCase();
   const startIndex: number = type === "departure" ? 1 : Number(this.getValue('departure date'));
   const date: number = Math.floor(startIndex + Math.random()*(monthDays-startIndex+1));
   const monthName: string = computeNextMonthName(new Date(currentDate));
   const nextMonthYear: number = computeNextMonthYear(new Date(currentDate));
   const datePicked: Locator = page.getByRole('button', {name: `${monthName} ${date}, ${nextMonthYear}`});
   type === "departure" ? this.saveValue('departure date', String(date)) : null;
   await expect(datePicked).toHaveCount(1, {timeout: 30000});
   await datePicked.click();
});

Then('I verify the default criteria for the travel search is {string}', async function(this: State, defaultValue: string) {
    const page: Page = this.getPage();
    const trip: Locator = page.getByRole('combobox', {name: 'Trip type', exact: true});

    await expect(trip).toHaveCount(1, {timeout: 30000});
    await expect(trip).toHaveText(defaultValue, {timeout: 30000});
});

Then('I uncheck the option to compare prices with Priceline', async function(this: State) {
    const page: Page = this.getPage();
    const priceline: Locator = page.getByRole('checkbox', {name: 'Priceline'});
    await expect(priceline).toHaveCount(1, {timeout: 30000});
    await priceline.uncheck();
});

Then('I search for flights', async function(this: State) {
   const page: Page = this.getPage();
   const searchBtn: Locator = await page.getByRole('button', {name: 'Search', exact: true});
   await expect(searchBtn).toHaveCount(1, {timeout: 30000});
   await searchBtn.click();
});

Then('I land on flights results page and I wait for all the entries to be fully loaded', async function(this: State) {
    const page: Page = this.getPage();
    const progressbar: Locator = await page.getByRole('progressbar')
    await expect(progressbar).toHaveCount(1, {timeout: 30000});
    await expect(progressbar).not.toBeVisible({timeout: 30000});
});

function remapKeys(record: Record<string,string>): Record<string,string> {
    let r: Record<string, string> = {};
    for(const key in record)
        eval(`r.${key.toLowerCase()}=record.${key}`);
    return r;
}

function computeNextMonthYear(currentDate: Date): number {
    const currentMonth: string = Intl.DateTimeFormat('en', {month: 'long'}).format(currentDate);
    return currentMonth === "December" ? currentDate.getFullYear() + 1 : currentDate.getFullYear();
}

function computeNextMonthWithYear(currentDate: Date): string {
    const currentMonth: number = currentDate.getMonth();
    const nextMonth: string = Intl.DateTimeFormat('en', {year: 'numeric', month: 'long'}).format(new Date(computeNextMonthYear(currentDate), (currentMonth+1)%12 ))
    return nextMonth;
}

function computeNextMonthName(currenDate: Date): string {
    const currentMonth: number = currenDate.getMonth();
    const nextMont: string = Intl.DateTimeFormat('en', {month: 'long'}).format(new Date(currenDate.getFullYear(),(currentMonth+1)%12));
    return nextMont;
}

async function sleep(ms: number): Promise<void> {
    return new Promise<void>((resolve) => setTimeout(resolve, ms * 1000))
}

async function isMailBoxEmpty(mailbox: MailboxService): Promise<boolean> {
    const emails: EmailResponse[] = await mailbox.fetchEmailList();
    return emails.length === 0;
}

async function checkForEmailsInMailBox(mailbox: MailboxService, delay: number): Promise<boolean> {
    if((await isMailBoxEmpty(mailbox)) && delay < 32) {
        await sleep(delay);
        return await checkForEmailsInMailBox(mailbox, delay*2);
    }
    return await isMailBoxEmpty(mailbox);
}

async function auth(state: State): Promise<void> {
    const page: Page = state.getPage();
    const user: string = state.getEmailAddress();

    const guerillaMailService: GuerrillaMailService = new GuerrillaMailService();

    const emailAddress: string = await guerillaMailService.createEmailAddress();
    await guerillaMailService.forgetEmailAddress(emailAddress);
    await guerillaMailService.setEmailAddress(user);

    const isMailBoxEmpty: boolean = await checkForEmailsInMailBox(guerillaMailService, 0.5);
    if(!isMailBoxEmpty)
        await clearMailbox(guerillaMailService, await guerillaMailService.fetchEmailList());

    state.setMailbox(guerillaMailService);

    const emailField: Locator = page.getByRole('textbox', {name: 'Enter email'});
    await expect(emailField).toHaveCount(1);
    await emailField.fill(user);
}

async function login(state: State): Promise<void> {
    await signIn(state.getPage());
    await continueWithEmail(state.getPage());
    await auth(state);
    await continueWithSigningIn(state.getPage());
    await typeInVerificationCode(state);
}

export { checkForEmailsInMailBox };
