import { mergeTests } from "@playwright/test";
import { authFixtures } from "./auth";
import { i18nFixtures } from "./i18n";

export const test = mergeTests(authFixtures, i18nFixtures);
export { expect } from "@playwright/test";
