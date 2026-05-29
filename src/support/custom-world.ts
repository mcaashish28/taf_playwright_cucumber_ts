import { World, IWorldOptions, setWorldConstructor } from "@cucumber/cucumber";
import { Browser, BrowserContext, Page } from "@playwright/test";

export interface ICustomWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  testName?: string;
  startTime?: Date;
}

export class CustomWorld extends World implements ICustomWorld {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  testName?: string;
  startTime?: Date;

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(CustomWorld);
