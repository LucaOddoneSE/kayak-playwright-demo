import { World } from "@cucumber/cucumber";
import { BrowserContext, Browser, Page } from "@playwright/test";
import MailBox from "e2e-mailbox/types/services/mailboxService"

export class State extends World {
    private page?: Page;
    private browserContext?: BrowserContext;
    private browser?: Browser;
    private baseUrl?: string;
    private sender?: string;
    private emailAddress?: string;
    private mailbox?: MailBox;
    private share?: Map<string, string>;

    init(user: string, page: Page, browserContext: BrowserContext, browser: Browser, baseUrl: string, sender: string) {
        this.emailAddress = user;
        this.page = page;
        this.browserContext = browserContext;
        this.browser = browser;
        this.baseUrl = baseUrl;
        this.sender = sender;
        this.share = new Map<string, string>();
    }

    getBaseUrl(): string {
        return this.baseUrl!;
    }

    getSender(): string {
        return this.sender!;
    }

    getPage(): Page {
        return this.page!;
    }

    getEmailAddress(): string {
        return this.emailAddress!;
    }

    getMailBox(): MailBox {
        return this.mailbox!;
    }

    setEmailAddress(emailAddress: string): void {
        this.emailAddress = emailAddress;
    }

    setMailbox(mailbox: MailBox): void {
        this.mailbox = mailbox;
    }

    saveValue(key:string, value: string) {
        this.share!.set(key, value)!;
    }

    getValue(key: string): string {
        if(this.share!.has(key))
            return this.share!.get(key)!;
        else
            throw new Error(`The following key: '${key}' has not been found.`);
    }

    async closeBrowserContext(): Promise<void> {
        await this.browserContext!.close();
    }

    async closeBrowser(): Promise<void> {
        await this.browser!.close();
    }
}