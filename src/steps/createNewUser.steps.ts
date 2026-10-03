import { Then, Given } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { DataTable } from "@cucumber/cucumber";
import { Page, Locator, BrowserContext } from "@playwright/test";
import { EmailResponse } from "e2e-mailbox/types/types";
import { checkForEmailsInMailBox, login } from "./login";
import { updateCucumberConfig } from "../storage/user";
import { State } from "../state/state";
import type { KayakDeleteAccountEmailRegExpMatch } from "./deleteAccount.steps";
import MailboxService from "e2e-mailbox/types/services/mailboxService";
import GuerrillaMailService from "e2e-mailbox/types/services/guerrillaMailService";

Given('I am on the Kayak homepage', async function(this: State) {
    await goToHomePage(this);
});

Then('I accept the cookie consent prompt', async function(this: State){
    await acceptCookies(this.getPage());
});

Then('I land on Kayak English homepage', async function(this: State){
   await navigateToEnglishApp(this.getPage());
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

Then('I fill in the email field with the random email address automatically generated beforehand', async function(this: State){
    await typeInGeneratedEmailAddress(this);
});

Then('I proceed by signing in', async function(this: State){
   await continueWithSigningIn(this);
});

Then('I type in the verification code', async function(this: State){
    await typeInVerificationCode(this);
});

Then('I click on account menu', async function(this: State){
   await waitForHomePageToReload(this.getPage());
   await clickOnAccountMenu(this.getPage());
});

Then('I type in the email address automatically generated for verification', async function(this: State){
    await typeInEmailAddressForVerification(this);
});

Then('I open the account confirmation link', async function(this: State){
    await openAccountConfirmationLink(this);
});

Then('I click on {string} menu item', async function(this: State, menuItem: string) {
   const page: Page = this.getPage();
   const menuItemLocator: Locator = page.getByRole('menuitem', {name: menuItem});
   await expect(menuItemLocator).toHaveCount(1);
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

   await expect(heading).toHaveCount(1, {timeout: 30000});
});

async function goToHomePage(state: State): Promise<void> {
    const baseUrl = state.getBaseUrl();
    const page: Page = state.getPage();
    await page.goto(baseUrl);
}

async function acceptCookies(page: Page): Promise<void> {
    const dialog: Locator = page.getByRole('dialog');
    await expect(dialog).toHaveCount(1, {timeout: 30000});
    const acceptCookiesBtn: Locator = dialog.locator('.RxNS-mod-variant-solid.RxNS-mod-theme-action');
    await expect(acceptCookiesBtn).toHaveRole('button', {timeout: 30000});
    await expect(acceptCookiesBtn).toHaveCount(1, {timeout: 30000});
    await acceptCookiesBtn.click();
}

async function navigateToEnglishApp(page: Page): Promise<void> {
    const kayakEnglishPageLink: Locator = page.getByRole('link', {name: 'Go to kayak.com instead.'});
    await expect(kayakEnglishPageLink).toHaveCount(1, {timeout: 30000});
    await kayakEnglishPageLink.click();
}

async function confirmAccount(page: Page): Promise<void> {
    const confirmAccountBtn: Locator = page.getByRole('button', {name: 'Confirm Account'});
    await expect(confirmAccountBtn).toHaveCount(1, {timeout: 30000});
    await expect(confirmAccountBtn).toHaveCount(1);
    await confirmAccountBtn.click();
}

async function sendConfirmationEmail(page: Page): Promise<void> {
    const sendBtn: Locator = await page.getByRole('button', {name: 'Send'});
    await expect(sendBtn).toHaveCount(1, {timeout: 30000});
    await sendBtn.click();
}

async function signIn(page: Page): Promise<void> {
    const signInBtn: Locator = page.getByRole('button', {name: 'Sign in'});
    await expect(signInBtn).toHaveCount(1, {timeout: 30000});
    await signInBtn.click();
}

async function getSignInOrCreateAccountModal(page: Page): Promise<Locator> {
    const modal: Locator = page.getByRole('dialog', {name: 'Sign in or create an account'});
    await expect(modal).toHaveCount(1, {timeout: 30000});
    return modal;
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

    await typeInEmailAddress(page, emailAddress);

    updateCucumberConfig(emailAddress);

    state.setMailbox(mailbox);
    state.setEmailAddress(emailAddress);
}

async function typeInGeneratedEmailAddress(state: State): Promise<void> {
    const mailbox: GuerrillaMailService = new GuerrillaMailService();
    const page: Page = state.getPage();
    const user: string = state.getEmailAddress();
    const emailAddress: string = await mailbox.createEmailAddress();
    await mailbox.forgetEmailAddress(emailAddress);
    await mailbox.setEmailAddress(user);
    state.setMailbox(mailbox);
    expect(user).toBeDefined();
    expect(user).not.toBe('');
    await typeInEmailAddress(page, user);
}

async function continueWithSigningIn(state: State): Promise<void> {
    const page: Page = state.getPage();
    const mailbox: MailboxService = state.getMailBox();
    const modal: Locator = await getSignInOrCreateAccountModal(page);
    await expect(modal).toHaveCount(1, {timeout: 30000});
    const signInBtn: Locator = modal.getByRole('button', {name: 'Sign in'});
    await expect(signInBtn).toHaveCount(1, {timeout: 30000});
    await deleteReceivedEmails(mailbox);
    await signInBtn.click();
}

async function createAccount(page: Page): Promise<void> {
    const createAccountBtn: Locator = page.getByRole('button', {name: 'Create your account'});
    await expect(createAccountBtn).toHaveCount(1, {timeout: 30000});
    await createAccountBtn.click();
}

async function clickOnAccountMenu(page: Page): Promise<void> {
    const accountMenuBtn: Locator = getAccountMenu(page);
    await expect(accountMenuBtn).toHaveCount(1, {timeout: 30000});
    await accountMenuBtn.click();
}

async function typeInEmailAddress(page: Page, emailAddress: string): Promise<void> {
    const emailField: Locator = page.getByRole('textbox', {name: "Enter email"});
    await expect(emailField).toHaveCount(1, {timeout: 30000});
    await emailField.fill(emailAddress);
}

async function typeInEmailAddressForVerification(state: State): Promise<void> {
    const page: Page = state.getPage();
    const mailbox: MailboxService = state.getMailBox();
    const emailAddress: string = state.getEmailAddress();
    const emailAddressField: Locator = page.locator('input[type="email"]');
    await deleteReceivedEmails(mailbox);
    await expect(emailAddressField).toHaveCount(1, {timeout: 30000});
    await emailAddressField.fill(emailAddress);
    await emailAddressField.blur();
    await expect(emailAddressField).toHaveValue(emailAddress, {timeout: 30000});
}

async function openAccountConfirmationLink(state: State): Promise<void> {
    const page: Page = state.getPage();
    const mailbox: MailboxService = state.getMailBox();
    await expect.poll(async () =>  await mailbox.fetchEmailList(), {timeout: 30000, intervals: [1_000, 2_000, 4_000, 8_000, 16_000]}).toHaveLength(1);
    const emailResponse: EmailResponse = (await mailbox.fetchEmailList())[0];
    const mail_id: string = emailResponse.mail_id;
    const email: EmailResponse = (await mailbox.fetchEmailById(mail_id))!;
    const email_body: string = email.mail_body
    const { url }: {url: string} = (email_body.match(new RegExp('<a href="(?<url>.+)">Confirm your email</a>'))! as KayakDeleteAccountEmailRegExpMatch).groups!;
    await page.goto(url, {waitUntil: 'load'});
    await clearMailbox(mailbox, await mailbox.fetchEmailList());
}

async function waitForHomePageToReload(page: Page): Promise<void> {
    const accountMenu: Locator = getAccountMenu(page);
    await expect(accountMenu).not.toHaveText('Sign in', {timeout: 30000});
    await expect(accountMenu).toBeVisible({timeout: 30000});
}

async function typeInVerificationCode(state: State): Promise<void> {
    const page: Page = state.getPage();
    const mailbox: MailboxService = state.getMailBox();
    const sender: string = state.getSender();
    const dialog: Locator = await getSignInOrCreateAccountModal(page);

    await expect(dialog).toContainText(/\d-digit verification code/, {timeout: 30000});

    const textContent: string = (await dialog.textContent())!;
    const verificationCodeDigitsNumber: string = textContent.match(new RegExp('\\d-digit verification code', 'g'))![0];
    const verificationCodeLength: number = Number(verificationCodeDigitsNumber.match(new RegExp('\\d', 'g'))![0]);

    await expect(dialog.locator('input')).toHaveCount(verificationCodeLength, {timeout: 30000});
    await expect.poll(async () => mailbox.fetchEmailList(), {timeout: 30000, intervals: [1_000, 2_000, 4_000, 8_000, 16_000]}).toHaveLength(1);

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

    await waitForHomePageToReload(page);
    await clearMailbox(mailbox, await mailbox.fetchEmailList());
}

async function clearMailbox(mailbox: MailboxService, emails: EmailResponse[]): Promise<void> {
    for(const email of emails)
        await mailbox.deleteEmailById(email.mail_id);
    emails = await mailbox.fetchEmailList();
    expect(emails).toHaveLength(0);
}

async function deleteReceivedEmails(mailbox: MailboxService): Promise<void> {
    if(await checkForEmailsInMailBox(mailbox, 8))
        await clearMailbox(mailbox, await mailbox.fetchEmailList());
}

function getAccountMenu(page: Page): Locator {
    return page.getByRole('button', {name: 'Account menu'});
}

type CucumberDataTable = Record<Uppercase<'field' | 'value'>, string>;

async function createNewUser(state: State): Promise<void> {
    const page: Page = state.getPage();
    await signIn(page);
    await continueWithEmail(page);
    await generateRandomEmailAddress(state);
    await continueWithSigningIn(state);
    await createAccount(page);
    await clickOnAccountMenu(page);
    await waitForHomePageToReload(page);
    await confirmAccount(page);
    await typeInEmailAddressForVerification(state);
    await sendConfirmationEmail(page);
    await openAccountConfirmationLink(state);
    const context: BrowserContext = page.context();
    await context.clearCookies();
    await goToHomePage(state);
    await acceptCookies(page);
    await navigateToEnglishApp(page);
    await acceptCookies(page);
    await signIn(page);
    await continueWithEmail(page);
    await typeInEmailAddress(page, state.getEmailAddress());
    await waitForHomePageToReload(page);
}

export { signIn, clearMailbox, deleteReceivedEmails, continueWithEmail, typeInEmailAddress, continueWithSigningIn, typeInVerificationCode, createNewUser };