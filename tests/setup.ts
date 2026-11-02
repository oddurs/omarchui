import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Testing Library only auto-cleans when test globals are on; they are off here.
afterEach(cleanup);

// jsdom does no layout, so it has no scrolling API; the menu calls it to keep the
// selected row in view.
Element.prototype.scrollIntoView = function scrollIntoView() {};
