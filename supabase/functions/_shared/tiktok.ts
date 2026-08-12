export const TIKTOK_SCOPES = [
  "user.info.basic",
  "user.info.profile",
  "user.info.stats",
  "video.list",
] as const;

export type TikTokTokenResponse = {
  access_token: string;
  expires_in: number;
  open_id: string;
  refresh_expires_in?: number;
  refresh_token: string;
  scope: string;
  token_type?: string;
};

type TikTokError = {
  code?: string;
  message?: string;
  log_id?: string;
};

type TikTokUser = {
  open_id: string;
  union_id?: string;
  avatar_url?: string;
  display_name?: string;
  bio_description?: string;
  profile_deep_link?: string;
  is_verified?: boolean;
  username?: string;
  follower_count?: number;
  following_count?: number;
  likes_count?: number;
  video_count?: number;
};

type TikTokVideo = {
  id: string;
  create_time?: number;
  share_url?: string;
  video_description?: string;
  title?: string;
  duration?: number;
  like_count?: number;
  comment_count?: number;
  share_count?: number;
  view_count?: number;
};

export type TikTokMetrics = {
  account_id: string;
  subscribers: number | null;
  total_views: number;
  video_count: number | null;
  average_views: number;
  profile_url: string;
  handle: string | null;
  analytics: {
    source: "tiktok_display_api";
    analyzed_video_count: number;
    average_views: number;
    total_views: number;
    likes: number;
    comments: number;
    shares: number;
    videos: Array<{
      id: string;
      created_at: string | null;
      views: number;
      likes: number;
      comments: number;
      shares: number;
    }>;
  };
  source: "tiktok_display_api";
};

function apiError(error: TikTokError | undefined, fallback: string) {
  if (!error || error.code === "ok") return null;
  return [error.message || error.code || fallback, error.log_id ? `log ${error.log_id}` : null]
    .filter(Boolean)
    .join(" - ");
}

async function readJson(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error(`TikTok API ${response.status}: ${text.slice(0, 240)}`);
  }
}

async function tokenRequest(params: URLSearchParams) {
  const response = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: {
      "cache-control": "no-cache",
      "content-type": "application/x-www-form-urlencoded",
    },
    body: params,
  });
  const payload = (await readJson(response)) as TikTokTokenResponse & {
    error?: string;
    error_description?: string;
    log_id?: string;
  };
  if (!response.ok || !payload.access_token || !payload.refresh_token) {
    const detail = payload.error_description || payload.error || `TikTok API ${response.status}`;
    throw new Error(payload.log_id ? `${detail} - log ${payload.log_id}` : detail);
  }
  return payload;
}

export function exchangeTikTokCode(
  code: string,
  clientKey: string,
  clientSecret: string,
  redirectUri: string,
) {
  return tokenRequest(
    new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  );
}

export function refreshTikTokAccessToken(
  refreshToken: string,
  clientKey: string,
  clientSecret: string,
) {
  return tokenRequest(
    new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  );
}

function profileUrl(user: TikTokUser) {
  if (user.profile_deep_link) return user.profile_deep_link;
  if (user.username) return `https://www.tiktok.com/@${user.username.replace(/^@/, "")}`;
  return "https://www.tiktok.com/";
}

async function fetchUser(accessToken: string) {
  const fields = [
    "open_id",
    "union_id",
    "avatar_url",
    "display_name",
    "bio_description",
    "profile_deep_link",
    "is_verified",
    "username",
    "follower_count",
    "following_count",
    "likes_count",
    "video_count",
  ].join(",");
  const response = await fetch(`https://open.tiktokapis.com/v2/user/info/?fields=${fields}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const payload = (await readJson(response)) as {
    data?: { user?: TikTokUser };
    error?: TikTokError;
  };
  const error = apiError(payload.error, `TikTok user API ${response.status}`);
  if (!response.ok || error) throw new Error(error || `TikTok user API ${response.status}`);
  if (!payload.data?.user?.open_id)
    throw new Error("A conta TikTok autorizada não foi encontrada.");
  return payload.data.user;
}

async function fetchVideos(accessToken: string) {
  const fields = [
    "id",
    "create_time",
    "share_url",
    "video_description",
    "title",
    "duration",
    "like_count",
    "comment_count",
    "share_count",
    "view_count",
  ].join(",");
  const response = await fetch(`https://open.tiktokapis.com/v2/video/list/?fields=${fields}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ max_count: 20 }),
  });
  const payload = (await readJson(response)) as {
    data?: { videos?: TikTokVideo[] };
    error?: TikTokError;
  };
  const error = apiError(payload.error, `TikTok video API ${response.status}`);
  if (!response.ok || error) throw new Error(error || `TikTok video API ${response.status}`);
  return payload.data?.videos ?? [];
}

function numeric(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export async function fetchTikTokMetrics(accessToken: string): Promise<TikTokMetrics> {
  const [user, videos] = await Promise.all([fetchUser(accessToken), fetchVideos(accessToken)]);
  const totals = videos.reduce(
    (sum, video) => ({
      views: sum.views + numeric(video.view_count),
      likes: sum.likes + numeric(video.like_count),
      comments: sum.comments + numeric(video.comment_count),
      shares: sum.shares + numeric(video.share_count),
    }),
    { views: 0, likes: 0, comments: 0, shares: 0 },
  );
  const averageViews = videos.length > 0 ? totals.views / videos.length : 0;

  return {
    account_id: user.open_id,
    subscribers: typeof user.follower_count === "number" ? user.follower_count : null,
    total_views: totals.views,
    video_count: typeof user.video_count === "number" ? user.video_count : null,
    average_views: averageViews,
    profile_url: profileUrl(user),
    handle: user.username ? `@${user.username.replace(/^@/, "")}` : null,
    analytics: {
      source: "tiktok_display_api",
      analyzed_video_count: videos.length,
      average_views: averageViews,
      total_views: totals.views,
      likes: totals.likes,
      comments: totals.comments,
      shares: totals.shares,
      videos: videos.map((video) => ({
        id: video.id,
        created_at:
          typeof video.create_time === "number"
            ? new Date(video.create_time * 1000).toISOString()
            : null,
        views: numeric(video.view_count),
        likes: numeric(video.like_count),
        comments: numeric(video.comment_count),
        shares: numeric(video.share_count),
      })),
    },
    source: "tiktok_display_api",
  };
}
