import { Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { Page, Locator } from "@playwright/test";
import { EmailResponse } from "e2e-mailbox/types/types";
import MailBoxService from "e2e-mailbox/types/services/mailboxService";
import { State } from "../state/state";
import { updateCucumberConfig } from "../storage/user";

interface KayakDeleteAccountUrl {
   url: string
};

type KayakDeleteAccountEmailRegExpMatch = Omit<RegExpMatchArray, 'groups'> & {
   groups?: KayakDeleteAccountUrl
};

Then('I click on {string}', async function(this: State, name: string) {
   const page: Page = this.getPage();
   const deleteAccount: Locator = page.getByRole('link', { name: name});
   await expect(deleteAccount).toHaveCount(1, {timeout: 30000});
   await deleteAccount.scrollIntoViewIfNeeded();
   await deleteAccount.click();
});

Then('I confirm the action by clicking on {string} button', async function(this: State, name: string) {
   const page: Page = this.getPage();
   const deleteAccount: Locator = page.getByRole('button', { name: name});
   await expect(deleteAccount).toHaveCount(1, {timeout: 30000});
   await expect(async () => {
      await deleteAccount.click()
      await expect(deleteAccount).toHaveCount(0)
   }).toPass({timeout: 30000, intervals: [1_000, 2_000, 4_000, 8_000, 16_000]});
});

Then('I open the account deletion confirmation link', async function(this: State) {
   const page: Page = this.getPage();
   const mailbox: MailBoxService = this.getMailBox();
   await expect.poll(async() => await mailbox.fetchEmailList(), {timeout: 60000, intervals: [1_000, 2_000, 4_000, 8_000, 16_000]}).toHaveLength(1);
   const emailResponse: EmailResponse = (await mailbox.fetchEmailList())[0];
   const mailId: string = emailResponse.mail_id;
   const email: EmailResponse = (await mailbox.fetchEmailById(mailId))!;
   const email_body: string = email.mail_body;
   const match:  KayakDeleteAccountEmailRegExpMatch = email_body.match(new RegExp('<a href="(?<url>.+)">Delete your account</a>'))! as KayakDeleteAccountEmailRegExpMatch
   const { url } = match.groups!
   await page.goto(url, {waitUntil: 'load'});
});

Then('I should land on the account deletion confirmation page showing the message {string}', async function(this: State, message: string) {
   const page: Page = this.getPage();
   const main: Locator = page.getByRole('main');
   await expect(main).toHaveCount(1, {timeout: 30000});
   const div: Locator = main.getByText(message, {exact: true});
   await expect(div).toHaveCount(1, {timeout: 30000});
   await expect(div).toBeVisible({timeout: 30000});
   updateCucumberConfig()
});