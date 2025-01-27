import axios, { type AxiosInstance } from "axios";
import { XMLParser } from "fast-xml-parser";

const paginateUntilUndefined = async <T>(
  fn: (page: number) => Promise<T[]>
): Promise<T[]> => {
  const allResults = [];
  let page = 1;
  while (true) {
    const results = await fn(page);
    if (results === undefined || results.length === 0) {
      break;
    }
    if (Array.isArray(results)) {
      allResults.push(...results);
    } else {
      allResults.push(results);
    }
    page++;
  }
  return allResults;
};

export class MobileCommonsClient {
  auth: { username: string; password: string } | { apiKey: string };
  axios: AxiosInstance;

  constructor(
    auth: { username: string; password: string } | { apiKey: string }
  ) {
    this.auth = auth;

    this.axios = axios.create({
      timeout: 10 * 1000,
      baseURL: "https://secure.mcommons.com/api",
      ...("apiKey" in auth
        ? { headers: { Authorization: `Bearer ${auth.apiKey}` } }
        : {
            auth: {
              username: auth.username,
              password: auth.password,
            },
          }),

      transformResponse: [
        (data) => {
          const parsed = new XMLParser({
            ignoreAttributes: false,
            allowBooleanAttributes: true,
            attributeNamePrefix: "",
          }).parse(data);
          return parsed.response;
        },
      ],
    });
  }

  async listCampaigns(): Promise<
    {
      name: string;
      description: string;
      id: string;
      active: "true" | "false";
    }[]
  > {
    const response = await this.axios.get("/campaigns", {});
    return response.data.campaigns.campaign;
  }

  async listGroups(): Promise<
    {
      name: string;
      size: number;
      hint: string;
      id: string;
      type: "UploadedGroup";
      status: "active";
    }[]
  > {
    return await paginateUntilUndefined(async (page) => {
      const response = await this.axios.get("/groups", {
        params: { page },
      });
      return response.data.groups.group;
    });
  }

  async listGroupMembers(
    groupId: string,
    updatedSince?: Date
  ): Promise<
    {
      first_name: string;
      last_name: string;
      phone_number: string;
      email: string;
      status: string;
      created_at: string;
      updated_at: string;
      opted_out_at: string;
      opted_out_source: string;
      source: {
        type: string;
        name: string;
        id: string;
      };
      address: {
        street1: string;
        street2: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
      };
      last_saved_location: {
        latitude: number;
        longitude: number;
        precision: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
      };
      last_saved_districts: {
        congressional_district: string;
        state_upper_district: string;
        state_lower_district: string;
        split_district: string;
      };
      custom_columns: {
        custom_column: any[];
      };
      clicks: string;
      id: string;
    }[]
  > {
    return await paginateUntilUndefined(async (page) => {
      const response = await this.axios.get("/group_members", {
        params: {
          from: updatedSince?.toISOString(),
          group_id: groupId,
          limit: 100,
          page,
        },
      });
      return response.data.group.profile;
    });
  }

  async listCampaignSubscribers(campaignId: string): Promise<
    {
      id: string;
      profile_id: string;
      phone_number: string;
      activated_at: string;
      opted_out_at: string;
    }[]
  > {
    return await paginateUntilUndefined(async (page) => {
      const response = await this.axios.get("/campaign_subscribers", {
        params: {
          campaign_id: campaignId,
          page,
        },
      });
      return response.data.subscriptions.sub;
    });
  }

  async addGroupMembers(groupId: string, phoneNumbers: string[]) {
    const response = await this.axios.post("/group_members", {
      group_id: groupId,
      phone_numbers: phoneNumbers,
    });
    return response.data.group_members.member;
  }

  async profileUpdate(
    optInPathId: string,
    phoneNumber: string,
    other: {
      first_name?: string;
      last_name?: string;
      postal_code?: string;
    }
  ) {
    const response = await this.axios.post("/profile_update", {
      opt_in_path_id: optInPathId,
      phone_number: phoneNumber,
      ...other,
    });
    return response.data;
  }

  async listProfiles() {
    const response = await this.axios.get("/profiles", {
      params: { limit: 5 },
    });
    return response.data.profiles.profile;
  }

  async sendSMS(campaignId: string, phoneNumber: string, body: string) {
    const response = await this.axios.post("/send_sms", {
      campaign_id: campaignId,
      phone_number: phoneNumber,
      body,
    });
    return response.data;
  }

  async sendMMS(
    campaignId: string,
    phoneNumber: string,
    body: string,
    mediaUrl: string
  ) {
    const response = await this.axios.post("/send_mms", {
      campaign_id: campaignId,
      phone_number: phoneNumber,
      body,
      media_url: mediaUrl,
    });
    return response.data;
  }

  async scheduleBroadcast(campaignId: string, body: string, time: string) {
    const response = await this.axios.post("/schedule_broadcast", {
      campaign_id: campaignId,
      body,
      time,
    });
    return response.data;
  }

  async listBroadcasts(campaignId?: string): Promise<
    {
      name: string;
      body: string;
      campaign: {
        name: string;
        id: string;
        active: string;
      };
      delivery_time: string;
      include_subscribers: boolean;
      throttled: boolean;
      localtime: boolean;
      automated: boolean;
      estimated_recipients_count: number;
      replies_count: number;
      opt_outs_count: number;
      included_groups: {
        group: any;
      };
      excluded_groups: string;
      tags: {
        tag: string;
      };
      id: string;
      status: string;
    }[]
  > {
    return await paginateUntilUndefined(async (page) => {
      const response = await this.axios.get("/broadcasts", {
        params: campaignId ? { page, campaign_id: campaignId } : { page },
      });
      return response.data.broadcasts.broadcast;
    });
  }

  async listTinyUrls(): Promise<
    {
      created_at: string;
      name: string;
      mode: string;
      url: string;
      host: string;
      description: string;
      key: string;
      id: string;
    }[]
  > {
    const response = await this.axios.get("/tinyurls");
    return response.data.tinyurls.tinyurl;
  }

  async listClicks(urlIdOrUrl: { url_id: string } | { url: string }): Promise<
    {
      created_at: string;
      url: string;
      clicked_url: string;
      remote_addr: string;
      http_referer: string;
      user_agent: string;
      profile_id: number;
      id: string;
    }[]
  > {
    const response = await this.axios.get("/clicks", {
      params:
        "url_id" in urlIdOrUrl
          ? { url_id: urlIdOrUrl.url_id }
          : { url: urlIdOrUrl.url },
    });
    return response.data.clicks.click;
  }
}
