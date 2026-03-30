import { verifyMissionContent } from "../src/app/actions/mission";

async function test() {
    const testUrls = [
        "https://blog.naver.com/tourlive/223385746210", // Sample Tourlive blog post
    ];

    for (const url of testUrls) {
        console.log(`Testing URL: ${url}`);
        const result = await verifyMissionContent(url);
        console.log("Result:", JSON.stringify(result, null, 2));
    }
}

// test(); 
// Note: This requires environment variables and Supabase client context.
// In this environment, I'll focus on checking the code structure and running simple scrapes if possible.
