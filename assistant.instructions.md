Quickstart
----------

To run Playwright E2E quickly against the dev server:

~~~bash
cd friendly-city-print-shop
npm ci
npm run playwright test
~~~
To run a full CI-like e2e locally (seed -> production build -> start -> test -> cleanup):

~~~bash
cd friendly-city-print-shop
npm ci
npm run npm run e2e:seed && npm run build && start-server-and-test 'npm run start' http://localhost:3000 'npm run test:e2e:ci' && npm run e2e:cleanup || npm run e2e:cleanup
~~~
