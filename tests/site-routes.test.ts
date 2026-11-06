import assert from "node:assert/strict";
import { test } from "node:test";
import {
  footerHelpRoutes,
  footerShopRoutes,
  primaryNavigationRoutes,
  publicSiteRoutes,
} from "../lib/site-routes";

test("global site routes are unique and resolve to internal destinations", () => {
  const hrefs = publicSiteRoutes.map((route) => route.href);
  assert.equal(new Set(hrefs).size, hrefs.length);
  hrefs.forEach((href) => {
    assert.ok(href.startsWith("/"), `${href} must be an internal route`);
    assert.notEqual(href, "#");
  });
});

test("navigation and footer expose every intended public route", () => {
  const navigationIds = new Set(primaryNavigationRoutes.map((route) => route.id));
  const footerIds = new Set(
    [...footerShopRoutes, ...footerHelpRoutes].map((route) => route.id),
  );

  assert.ok(navigationIds.has("terms"));
  assert.ok(navigationIds.has("size-guide"));
  publicSiteRoutes.forEach((route) => assert.ok(footerIds.has(route.id)));
});
