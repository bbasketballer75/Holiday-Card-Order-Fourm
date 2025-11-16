This PR bumps Prettier to v3 and pins package overrides for rimraf and glob  
  
Summary:  
- Bump Prettier to 3.6.2  
- Add npm overrides for rimraf and glob to avoid transitive vulnerability paths  
- Use Node CLI for Playwright test script invocation (avoid PowerShell npx issues)  
- Provide a Node-based e2e runner to avoid wmic usage on Windows  
