require('dotenv'.config());
async function testSlack() {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: "Hello from FlowForge!" })
  });
  
  console.log("Status:", response.status);
  const text = await response.text();
  console.log("Response:", text);
}

testSlack();