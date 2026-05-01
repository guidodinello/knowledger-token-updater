> is there a way to see requests made by firefox addons? i remember in chrome being able to click on the service worker and see
some dedicated dev tools

> Yes, Firefox has a dedicated tool for this:

1. Go to about:debugging in the address bar
2. Click This Firefox in the left sidebar
3. Find your extension and click Inspect

This opens a dedicated DevTools window for your addon with its own Network, Console, Debugger, etc. tabs — scoped to the
extension's background context (equivalent to Chrome's service worker DevTools).

For the popup specifically, you can also right-click inside the popup and choose Inspect Element to open DevTools scoped to
that context.