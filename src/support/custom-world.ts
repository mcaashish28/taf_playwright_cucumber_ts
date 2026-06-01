import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import * as messages from '@cucumber/messages';
import { BrowserContext, Page, PlaywrightTestOptions, APIRequestContext } from '@playwright/test';

export interface CucumberWorldConstructorParams {
  parameters: { [key: string]: string };
}

export interface ICustomWorld extends World {
  loginCount: number;
  welTeamData: string;
  welTeamData1: string;
  welTeamData2: string;

  global_data_map?: Map<string, string>;
  HomePage?: unknown;
  taskname?: string;
  colorvalue?: number;
  debug: boolean;
  feature?: messages.Pickle;
  context?: BrowserContext;
  page?: Page;
  page1?: Page;
  context1?: BrowserContext;
  testName?: string;
  startTime?: Date;

  server?: APIRequestContext;

  playwrightOptions?: PlaywrightTestOptions;
  [key: string]: any;
}

export class CustomWorld extends World implements ICustomWorld {
  constructor(options: IWorldOptions) {
    super(options);
  }
  loginCount!: number;
  page1?: Page | undefined;
  context1!: BrowserContext;
  welTeamData!: string;
  welTeamData1!: string;
  welTeamData2!: string;
  global_data_map?: Map<string, string>;

  HomePage?: unknown;
  taskname?: string | undefined;
  colorvalue?: number | undefined;
  feature?: messages.Pickle | undefined;
  context?: BrowserContext | undefined;
  page?: Page | undefined;
  testName?: string | undefined;
  startTime?: Date | undefined;
  server?: APIRequestContext | undefined;
  playwrightOptions?: PlaywrightTestOptions | undefined;
  debug = false;
}

setWorldConstructor(CustomWorld);
