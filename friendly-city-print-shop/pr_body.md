This PR restores corrupted UI files due to a previous merge conflict and adds Playwright E2E CI to simplify building/testing  
  
Summary of key changes:  
- Repaired components and app pages (Header, Footer, OrderForm, TemplateCard, templates page)  
- Added Playwright E2E workflow to .github/workflows/playwright-e2e.yml and e2e scripts  
- Added Windows scripts/clean-win.ps1 and clean:win npm script  
- Removed backup .clean files and committed removal  
- Updated TypeScript types (TemplateCard.description optional)  
  
Notes and follow-ups:  
- Run npm run e2e:run-prod to reproduce the CI-like E2E run locally  
- Playwright HTML report is generated under playwright-report/ and will be uploaded by the workflow as a zipped artifact  
- Local Windows runs may show 'wmic.exe ENOENT' during cleanup; this is non-fatal and can be improved in a follow-up  
