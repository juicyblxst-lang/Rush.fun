import {defineConfig,devices} from "@playwright/test";
export default defineConfig({
 testDir:"./tests/e2e",fullyParallel:false,retries:process.env.CI?2:0,workers:process.env.CI?1:undefined,
 reporter:"html",use:{baseURL:process.env.E2E_BASE_URL||"http://127.0.0.1:3000",trace:"retain-on-failure",...process.env.E2E_STORAGE_STATE_PATH?{storageState:process.env.E2E_STORAGE_STATE}:{}},
 projects:[{name:"chromium",use:{...devices["Desktop Chrome"]}}]
});