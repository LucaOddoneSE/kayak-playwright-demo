import {Then, Given } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { DataTable } from "@cucumber/cucumber";
import { Page, Locator } from "@playwright/test";
import { EmailResponse } from "e2e-mailbox/types/types";
import { State } from "../state/state";
import { updateCucumberConfig } from "../storage/user";
import MailboxService from "e2e-mailbox/types/services/mailboxService";
import GuerrillaMailService from "e2e-mailbox/types/services/guerrillaMailService";

Given('I am on the Kayak homepage', async function(this: State) {
    const baseUrl = this.getBaseUrl();
    const page: Page = this.getPage();

    await page.goto(baseUrl);
});

Then('I accept the cookie consent prompt', async function(this: State){
    const page: Page = this.getPage();

    const dialog: Locator = page.getByRole('dialog');
    await expect(dialog).toHaveCount(1, {timeout: 30000});

    const acceptCookiesBtn: Locator = dialog.locator('.RxNS-mod-variant-solid.RxNS-mod-theme-action');
    await expect(acceptCookiesBtn).toHaveRole('button', {timeout: 30000});
    await expect(acceptCookiesBtn).toHaveCount(1, {timeout: 30000});

    await acceptCookiesBtn.click();
});

Then('I land on Kayak English homepage', async function(this: State){
   const page: Page = this.getPage();

   const kayakEnglishPageLink: Locator = page.getByRole('link', {name: 'Go to kayak.com instead.'});
   await expect(kayakEnglishPageLink).toHaveCount(1, {timeout: 30000});

   await kayakEnglishPageLink.click();
});

Then('I click on the Sign in button', async function(this: State){
    await signIn(this.getPage());
});

Then('I choose to continue with email', async function(this: State) {
    await continueWithEmail(this.getPage());
});

Then('I fill in the email field with a randomly generated email value', async function(this: State){
    await generateRandomEmailAddress(this);
});

Then('I proceed by signing in', async function(this: State){
   await continueWithSigningIn(this.getPage());
});

Then('I create my account', async function(this: State){
    await createAccount(this.getPage());
});

Then('I type in the verification code', async function(this: State){
    await typeInVerificationCode(this);
});

Then('I click on account menu', async function(this: State){
   const page: Page = this.getPage();

   const acountMenuBtn: Locator = page.getByRole('button', {name: 'Account menu'});
   await expect(acountMenuBtn).toHaveCount(1, {timeout: 30000});
   await acountMenuBtn.click();
});

Then('I click on {string} menu item', async function(this: State, menuItem: string) {
   const page: Page = this.getPage();
   const menuItemLocator: Locator = page.getByRole('menuitem', {name: menuItem});

   await expect( async () => {
       const accountMenuBtn: Locator = page.getByRole('button', {name: 'Account menu'})
       if(!(await menuItemLocator.isVisible()))
           await accountMenuBtn.click()
       await expect(menuItemLocator).toBeVisible()
   }).toPass({timeout: 30000, intervals: [1_000, 2_000, 4_000, 8_000, 16_000]});

   await menuItemLocator.click();
});

Then('I see my profile page', async function(this: State) {
   const page: Page = this.getPage();
   await page.waitForURL('**/profile/dashboard');
   const welcomeHeading: Locator = page.getByRole('heading', {name: 'Welcome'});
   await expect(welcomeHeading).toHaveCount(1, {timeout: 30000});
});

Then('I click on {string} button', async function(this: State, btnName: string) {
   const page: Page = this.getPage();
   const btn: Locator = page.getByRole('button', {name: btnName});
   await expect(btn).toHaveCount(1, {timeout: 30000});
   await btn.click();
});

Then('I click on {string} section', async function(this: State, section: string) {
    const page: Page = this.getPage();
    const sectionLocator: Locator = page.getByRole('button', {name: section, exact: true});
    await expect(sectionLocator).toHaveCount(1, {timeout: 30000});
    await sectionLocator.click();
});

Then('I edit my account information', async function(this: State, table: DataTable) {
   const page: Page = this.getPage();
   const editBtn: Locator = page.locator('button[aria-label="Edit Your name"]');
   await expect(editBtn).toHaveCount(1, {timeout: 30000});
   await editBtn.click();
   const tableValues: CucumberDataTable[] = table.hashes() as CucumberDataTable[];
   for(const tableValue of tableValues) {
       const field: Locator = page.getByRole('textbox', {name: tableValue.FIELD});
       await expect(field).toHaveCount(1, {timeout: 30000});
       await field.fill(tableValue.VALUE);
   }
});

Then('I reload the page', async function(this: State) {
   const page: Page = this.getPage();
   await page.reload();
});

Then('I should see my profile page stating {string}', async function(this: State, message: string) {
   const page: Page = this.getPage();
   const heading: Locator = page.getByRole('heading', {name: message});

   await expect(heading).toHaveCount(1, {timeout: 30 * 1000});
});

async function getSignInOrCreateAccountModal(page: Page): Promise<Locator> {
    const modal: Locator = page.getByRole('dialog', {name: 'Sign in or create an account'});
    await expect(modal).toHaveCount(1, {timeout: 30000});
    return modal;
}

async function signIn(page: Page): Promise<void> {
    const signInBtn: Locator = page.getByRole('button', {name: 'Sign in'});
    await expect(signInBtn).toHaveCount(1, {timeout: 30000});
    await signInBtn.click();
}

async function continueWithEmail(page: Page): Promise<void> {
    const btn: Locator = page.getByRole('button', {name: 'Continue with email'});
    await expect(btn).toHaveCount(1, {timeout: 30000});
    await btn.click();
}

async function generateRandomEmailAddress(state: State): Promise<void> {
    const page: Page = state.getPage();
    const mailbox: GuerrillaMailService = new GuerrillaMailService();
    const emailAddress: string = await mailbox.createEmailAddress();
    const emailField: Locator = page.getByRole('textbox', {name: "Enter email"});

    updateCucumberConfig(emailAddress);

    state.setMailbox(mailbox);
    state.setEmailAddress(emailAddress);

    await clearMailbox(mailbox, await mailbox.fetchEmailList());
    await emailField.fill(emailAddress);
}

async function continueWithSigningIn(page: Page): Promise<void> {
    const modal: Locator = await getSignInOrCreateAccountModal(page);
    await expect(modal).toHaveCount(1, {timeout: 30000});
    const signInBtn: Locator = modal.getByRole('button', {name: 'Sign in'});
    await expect(signInBtn).toHaveCount(1, {timeout: 30000});
    await signInBtn.click();
}

async function createAccount(page: Page): Promise<void> {
    const createAccountBtn: Locator = page.getByRole('button', {name: 'Create your account'});
    await expect(createAccountBtn).toHaveCount(1, {timeout: 30000});
    await createAccountBtn.click();
}

async function typeInVerificationCode(state: State): Promise<void> {
    const page: Page = state.getPage();
    const mailbox: MailboxService = state.getMailBox();
    const sender: string = state.getSender();
    const dialog: Locator = await getSignInOrCreateAccountModal(page);

    await expect(dialog).toContainText(/\d-digit verification code/);

    const textContent: string = (await dialog.textContent())!;
    const verificationCodeDigitsNumber: string = textContent.match(new RegExp('\\d-digit verification code', 'g'))![0];
    const verificationCodeLength: number = Number(verificationCodeDigitsNumber.match(new RegExp('\\d', 'g'))![0]);

    await expect(await dialog.locator('input').all()).toHaveLength(verificationCodeLength);
    await expect.poll(async () => mailbox.fetchEmailList(), {timeout: 60000, intervals: [1_000, 2_000, 4_000, 8_000, 16_000]}).toHaveLength(1);

    const mailList: EmailResponse[] = await mailbox.fetchEmailList();
    const mail: EmailResponse = mailList[0];
    expect(mail.mail_from).toEqual(sender);

    const email: EmailResponse = (await mailbox.fetchEmailById(mail.mail_id))!;
    const body: string = email.mail_body;
    const regExp: RegExp = new RegExp(`\\s(\\d{${verificationCodeLength}})\\s`, 'g');
    const matches: string[] = body.match(regExp)!;
    expect(matches).toHaveLength(1);
    const verificationCode: string = matches[0].trim();

    for(let counter: number = 1; counter <= verificationCodeLength; counter++) {
        const cell: Locator = dialog.getByRole('textbox', {name: `Digit ${counter} of ${verificationCodeLength}`});
        await expect(cell).toHaveCount(1, {timeout: 30000});
        await cell.fill(verificationCode[counter-1])
    }

    await clearMailbox(mailbox, await mailbox.fetchEmailList());
}

async function clearMailbox(mailbox: MailboxService, emails: EmailResponse[]): Promise<void> {
    for(const email of emails)
        await mailbox.deleteEmailById(email.mail_id);
    emails = await mailbox.fetchEmailList();
    expect(emails).toHaveLength(0);
}

type CucumberDataTable = Record<Uppercase<'field' | 'value'>, string>;

async function createNewUser(state: State): Promise<void> {
    await signIn(state.getPage());
    await continueWithEmail(state.getPage());
    await generateRandomEmailAddress(state);
    await continueWithSigningIn(state.getPage());
    await createAccount(state.getPage());
    await typeInVerificationCode(state);
}

export { signIn, clearMailbox, continueWithEmail, continueWithSigningIn, typeInVerificationCode, createNewUser };