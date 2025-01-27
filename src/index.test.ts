// Uncomm sts
import { describe, it } from "bun:test";
import { MobileCommonsClient } from "./index";

describe("MobileCommonsClient", () => {
  it("should list campaigns", async () => {
    const client = new MobileCommonsClient({
      apiKey: "apiKeyHere",
    });
    // await client.listGroups().then(console.log);
    // await client.listGroupMembers("941735").then(console.log);
    // await client.listCampaigns().then(console.log);
    // await client.listCampaignSubscribers("235948").then(console.log);
    // await client.listProfiles().then(console.log);
    // await client.listBroadcasts().then(console.log);
    // await client.listClicks("4424682").then(console.log);
    // await client.listTinyUrls().then(console.log);

    // const result = await client.listGroupMembers("235591");
    // console.log("🚀 ~ it ~ result:", result);
    // console.log("🚀 ~ it ~ campaigns:", campaigns);
  });
});
