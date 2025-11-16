Quickstart
----------

To run Playwright E2E quickly against the dev server:

~~~bash
cd friendly-city-print-shop
npm ci
npm run test:e2e
~~~
To run a full CI-like e2e locally (seed -> production build -> start -> test -> cleanup):

~~~bash
cd friendly-city-print-shop
npm ci
npm run e2e:run-prod
~~~
