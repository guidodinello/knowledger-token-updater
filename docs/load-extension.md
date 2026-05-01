❯ how do i load the firefox addon?                                                                                               
                                                                                                                                 
● To load the Firefox addon in development mode:                                                                                 
                                                                                                                                 
  1. Run pnpm dev:firefox to start the dev server and build for Firefox                                                          
  2. Open Firefox and go to about:debugging                                                                                      
  3. Click This Firefox in the left sidebar                                                                                      
  4. Click Load Temporary Add-on...                                                                                              
  5. Navigate to the .output/firefox-mv2/ directory in your project and select the manifest.json file                            
                                                                                                                                 
  The addon will be loaded temporarily (it disappears when Firefox restarts). For persistent testing, you'd need a signed build  
  or use Firefox Developer Edition with xpinstall.signatures.required set to false in about:config.

✻ Worked for 4s

❯ can we do a signed build easily?                                                                                               

● Let me check the project setup to see what signing support exists.

  Read 1 file, listed 2 directories (ctrl+o to expand)

● Yes, it's fairly straightforward. WXT supports Firefox signing via Mozilla's AMO API. Here's the process:

  1. Get AMO API credentials
  - Go to https://addons.mozilla.org/en-US/developers/addon/api/key/
  - Generate a JWT issuer + secret

  2. Sign with web-ext (unlisted/self-distribution, no public listing required):
  pnpm wxt zip -b firefox
  npx web-ext sign \
    --api-key=<your-jwt-issuer> \
    --api-secret=<your-jwt-secret> \
    --channel=unlisted \
    --source-dir=.output/firefox-mv2

  The --channel=unlisted flag signs it for self-distribution without submitting it to the AMO public catalog. You get back a
  signed .xpi file you can install permanently in regular Firefox.

  3. Install the signed .xpi
  Drag it into Firefox or go to about:addons → gear icon → Install Add-on From File.

  The gecko ID knowledger-token-updater@guidodinello.dev is already set in wxt.config.ts, so you're good there — Mozilla requires
   a stable ID for signing and you already have one.

✻ Worked for 20s

※ recap: You're building a Firefox browser extension that auto-updates a bot token when you log into claude.ai. Next step is
  getting AMO API credentials to sign the extension for permanent installation. (disable recaps in /config)

❯ npx web-ext sign \                                                                                                             
    --api-key=${MOZILLA_JWT_ISSUER} \                                                                                            
    --api-secret=${MOZILLA_JWT_SECRET} \                                                                                         
    --channel=unlisted \                                                                                                         
    --source-dir=.output/firefox-mv2 add it as a command in the package.json                                                     
  ⎿  ⧉ Selected 5 lines from Untitled-1 in Visual Studio Code

  Read 1 file (ctrl+o to expand)

● Update(package.json)
  ⎿  Added 1 line
      22          "build:firefox": "wxt build -b firefox",
      23          "zip": "wxt zip",
      24          "zip:firefox": "wxt zip -b firefox",
      25 +        "sign:firefox": "npx web-ext sign --api-key=${MOZILLA_JWT_ISSUER} --api-secret=${MOZILLA_JWT_SECRET} --c
         +hannel=unlisted --source-dir=.output/firefox-mv2",                                                              
      26          "check": "svelte-check --tsconfig ./tsconfig.json",
      27          "lint": "eslint .",
      28          "lint:fix": "eslint . --fix",

● Added. Run it with MOZILLA_JWT_ISSUER=... MOZILLA_JWT_SECRET=... pnpm sign:firefox — or set those env vars in a .env.local file
   (just make sure it's in .gitignore).

✻ Cogitated for 8s

❯ ❯ pnpm sign:firefox                                                                                                            
                                                                                                                                 
  > knowledger-token-updater@0.1.0 sign:firefox /home/guido/projects/browser_addon/knowledger-token-updater                      
  > npx web-ext sign --api-key=${MOZILLA_JWT_ISSUER} --api-secret=${MOZILLA_JWT_SECRET} --channel=unlisted                       
  --source-dir=.output/firefox-mv2                                                                                               
                                                                                                                                 
  npm warn Unknown env config "verify-deps-before-run". This will stop working in the next major version of npm.                 
  npm warn Unknown env config "_jsr-registry". This will stop working in the next major version of npm.                          
  npm error code EOVERRIDE                                                                                                       
  npm error Override for @sveltejs/vite-plugin-svelte@4.0.0-next.7 conflicts with direct dependency                              
  npm error A complete log of this run can be found in: /home/guido/.npm/_logs/2026-04-29T21_48_31_978Z-debug-0.log              
   ELIFECYCLE  Command failed with exit code 1.                                                                                  

● The issue is npx using npm, which chokes on the overrides in package.json. Use pnpm dlx instead:

● Update(package.json)
  ⎿  Added 1 line, removed 1 line
      22          "build:firefox": "wxt build -b firefox",
      23          "zip": "wxt zip",
      24          "zip:firefox": "wxt zip -b firefox",
      25 -        "sign:firefox": "npx web-ext sign --api-key=${MOZILLA_JWT_ISSUER} --api-secret=${MOZILLA_JWT_SECRET} --c
         -hannel=unlisted --source-dir=.output/firefox-mv2",                                                              
      25 +        "sign:firefox": "pnpm dlx web-ext sign --api-key=${MOZILLA_JWT_ISSUER} --api-secret=${MOZILLA_JWT_SECRET
         +} --channel=unlisted --source-dir=.output/firefox-mv2",                                                         
      26          "check": "svelte-check --tsconfig ./tsconfig.json",
      27          "lint": "eslint .",
      28          "lint:fix": "eslint . --fix",

● Try pnpm sign:firefox again now.

✻ Crunched for 6s

❯ ❯ pnpm sign:firefox                                                                                                            
                                                                                                                                 
  > knowledger-token-updater@0.1.0 sign:firefox /home/guido/projects/browser_addon/knowledger-token-updater                      
  > pnpm dlx web-ext sign --api-key=${MOZILLA_JWT_ISSUER} --api-secret=${MOZILLA_JWT_SECRET} --channel=unlisted                  
  --source-dir=.output/firefox-mv2                                                                                               
                                                                                                                                 
   WARN  2 deprecated subdependencies found: uuid@8.3.2, whatwg-encoding@3.1.1                                                   
  Packages: +325                                                                                                                 
  +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++  
  Progress: resolved 325, reused 265, downloaded 60, added 325, done                                                             
  Building web extension from .output/firefox-mv2                                                                                
                                                                                                                                 
  WebExtError: Upload failed: Unauthorized                                                                                       
  {                                                                                                                              
    "detail": "Unknown JWT iss (issuer)."                                                                                        
  }                                                                                                                              
      at file:///home/guido/.cache/pnpm/dlx/560225443598fa3cf245037c1eb8b2102d5c7f05110e146f1dfb949aad4f86ce/19ddb37e10f-2194f/n 
  ode_modules/.pnpm/web-ext@10.1.0/node_modules/web-ext/lib/cmd/sign.js:101:13                                                   
      at process.processTicksAndRejections (node:internal/process/task_queues:105:5)                                             
      at async Program.execute (file:///home/guido/.cache/pnpm/dlx/560225443598fa3cf245037c1eb8b2102d5c7f05110e146f1dfb949aad4f8 
  6ce/19ddb37e10f-2194f/node_modules/.pnpm/web-ext@10.1.0/node_modules/web-ext/lib/program.js:270:7)                             
      at async file:///home/guido/.cache/pnpm/dlx/560225443598fa3cf245037c1eb8b2102d5c7f05110e146f1dfb949aad4f86ce/19ddb37e10f-2 
  194f/node_modules/.pnpm/web-ext@10.1.0/node_modules/web-ext/bin/web-ext.js:13:1                                                
                                                                                                                                 
   ELIFECYCLE  Command failed with exit code 1.                                                                                  

● The script is working now — the error is just that the MOZILLA_JWT_ISSUER env var isn't set (or is empty), so the literal
  string ${MOZILLA_JWT_ISSUER} got passed to web-ext.

  Make sure you export the vars before running:

  export MOZILLA_JWT_ISSUER=user:12345:678
  export MOZILLA_JWT_SECRET=your-secret-here
  pnpm sign:firefox

  Get the values from https://addons.mozilla.org/en-US/developers/addon/api/key/ — the JWT issuer looks like user:12345:678 and
  the secret is a long string.

✻ Worked for 4s

❯ worked, i thougth the source .env was doing the same as an export                                                              

● source .env sets variables in the current shell but doesn't export them to child processes unless the .env file uses export
  VAR=value. Since pnpm spawns a subprocess to run the script, it only sees exported variables.

  Two fixes:

  Option 1 — use export in your .env file:
  export MOZILLA_JWT_ISSUER=user:12345:678
  export MOZILLA_JWT_SECRET=your-secret-here

  Option 2 — auto-export everything when sourcing:
  set -a; source .env; set +a

  set -a marks all subsequently defined variables for export automatically.

✻ Worked for 8s

❯ can we do that in the package.json command? load those env vars?                                                               

● Yes — using shell's set -a trick directly in the script. What's your .env file called (.env, .env.local, something else)?

  Once you tell me the filename I'll update the script to:
  set -a && . .env.local && set +a && pnpm dlx web-ext sign ...

  Also make sure that file is in .gitignore if it isn't already.