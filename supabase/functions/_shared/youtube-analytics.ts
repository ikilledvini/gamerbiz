export type AnalyticsResponse = {
  columnHeaders?: Array<{ name?: string }>;
  rows?: Array<Array<number | string>>;
  error?: { message?: string };
};

export type YouTubeAnalytics = {
  period_days: number;
  start_date: string;
  end_date: string;
  views: number | null;
  estimated_minutes_watched: number | null;
  average_view_duration_seconds: number | null;
  subscribers_gained: number | null;
  likes: number | null;
  comments: number | null;
  average_views: number | null;
  analyzed_video_count: number;
  daily_views: Array<{ date: string; views: number }>;
  countries: Array<{ country: string; percentage: number }>;
  age: Array<{ age_group: string; percentage: number }>;
  gender: Array<{ gender: string; percentage: number }>;
  details_errors?: string[];
  source: "youtube_analytics_v2";
};

function utcDate(daysAgo = 0) {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function valueFromRow(payload: AnalyticsResponse, row: Array<number | string>, name: string) {
  const index = (payload.columnHeaders ?? []).findIndex((header) => header.name === name);
  return index >= 0 ? row[index] : undefined;
}

function numberFromRow(payload: AnalyticsResponse, row: Array<number | string>, name: string) {
  const value = Number(valueFromRow(payload, row, name));
  return Number.isFinite(value) ? value : null;
}

function roundPercentage(value: number) {
  return Math.round(value * 10) / 10;
}

async function queryAnalytics(
  accessToken: string,
  input: {
    startDate: string;
    endDate: string;
    metrics: string;
    dimensions?: string;
    sort?: string;
    maxResults?: number;
  },
) {
  const query = new URLSearchParams({
    ids: "channel==MINE",
    startDate: input.startDate,
    endDate: input.endDate,
    metrics: input.metrics,
  });
  if (input.dimensions) query.set("dimensions", input.dimensions);
  if (input.sort) query.set("sort", input.sort);
  if (input.maxResults) query.set("maxResults", String(input.maxResults));

  const response = await fetch(`https://youtubeanalytics.googleapis.com/v2/reports?${query}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const payload = (await response.json()) as AnalyticsResponse;
  if (!response.ok) {
    throw new Error(payload.error?.message || `YouTube Analytics API returned ${response.status}`);
  }
  return payload;
}

function settledPayload(result: PromiseSettledResult<AnalyticsResponse>) {
  return result.status === "fulfilled" ? result.value : null;
}

function settledError(result: PromiseSettledResult<AnalyticsResponse>) {
  if (result.status === "fulfilled") return null;
  return result.reason instanceof Error ? result.reason.message : "Detailed report unavailable";
}

export async function fetchYouTubeAnalytics(accessToken: string): Promise<YouTubeAnalytics> {
  // YouTube Analytics is delayed, so use the last 28 complete days.
  const endDate = utcDate(1);
  const startDate = utcDate(28);
  const aggregate = await queryAnalytics(accessToken, {
    startDate,
    endDate,
    metrics: "views,estimatedMinutesWatched,averageViewDuration,subscribersGained,likes,comments",
  });
  const aggregateRow = aggregate.rows?.[0] ?? [];
  const aggregateViews = numberFromRow(aggregate, aggregateRow, "views");

  const [dailyResult, videosResult, countriesResult, demographicsResult] = await Promise.allSettled(
    [
      queryAnalytics(accessToken, {
        startDate,
        endDate,
        metrics: "views",
        dimensions: "day",
        sort: "day",
      }),
      queryAnalytics(accessToken, {
        startDate,
        endDate,
        metrics: "views",
        dimensions: "video",
        sort: "-views",
        maxResults: 200,
      }),
      queryAnalytics(accessToken, {
        startDate,
        endDate,
        metrics: "views",
        dimensions: "country",
        sort: "-views",
        maxResults: 200,
      }),
      queryAnalytics(accessToken, {
        startDate,
        endDate,
        metrics: "viewerPercentage",
        dimensions: "ageGroup,gender",
      }),
    ],
  );

  const daily = settledPayload(dailyResult);
  const videos = settledPayload(videosResult);
  const countriesReport = settledPayload(countriesResult);
  const demographics = settledPayload(demographicsResult);

  const dailyViews = (daily?.rows ?? []).flatMap((row) => {
    const date = valueFromRow(daily!, row, "day");
    const views = numberFromRow(daily!, row, "views");
    return typeof date === "string" && views !== null ? [{ date, views }] : [];
  });

  const videoViews = (videos?.rows ?? []).flatMap((row) => {
    const views = numberFromRow(videos!, row, "views");
    return views === null ? [] : [views];
  });
  const averageViews =
    videoViews.length > 0
      ? videoViews.reduce((total, views) => total + views, 0) / videoViews.length
      : aggregateViews === 0
        ? 0
        : null;

  const countryDenominator = aggregateViews && aggregateViews > 0 ? aggregateViews : 0;
  const countries = (countriesReport?.rows ?? [])
    .flatMap((row) => {
      const country = valueFromRow(countriesReport!, row, "country");
      const views = numberFromRow(countriesReport!, row, "views");
      if (typeof country !== "string" || views === null || countryDenominator === 0) return [];
      return [{ country, percentage: roundPercentage((views / countryDenominator) * 100) }];
    })
    .slice(0, 10);

  const ageTotals = new Map<string, number>();
  const genderTotals = new Map<string, number>();
  for (const row of demographics?.rows ?? []) {
    const ageGroup = valueFromRow(demographics!, row, "ageGroup");
    const gender = valueFromRow(demographics!, row, "gender");
    const percentage = numberFromRow(demographics!, row, "viewerPercentage");
    if (percentage === null) continue;
    if (typeof ageGroup === "string") {
      ageTotals.set(ageGroup, (ageTotals.get(ageGroup) ?? 0) + percentage);
    }
    if (typeof gender === "string") {
      genderTotals.set(gender, (genderTotals.get(gender) ?? 0) + percentage);
    }
  }

  const detailsErrors = [dailyResult, videosResult, countriesResult, demographicsResult]
    .map(settledError)
    .filter((message): message is string => Boolean(message));

  return {
    period_days: 28,
    start_date: startDate,
    end_date: endDate,
    views: aggregateViews,
    estimated_minutes_watched: numberFromRow(aggregate, aggregateRow, "estimatedMinutesWatched"),
    average_view_duration_seconds: numberFromRow(aggregate, aggregateRow, "averageViewDuration"),
    subscribers_gained: numberFromRow(aggregate, aggregateRow, "subscribersGained"),
    likes: numberFromRow(aggregate, aggregateRow, "likes"),
    comments: numberFromRow(aggregate, aggregateRow, "comments"),
    average_views: averageViews,
    analyzed_video_count: videoViews.length,
    daily_views: dailyViews,
    countries,
    age: [...ageTotals].map(([age_group, percentage]) => ({
      age_group,
      percentage: roundPercentage(percentage),
    })),
    gender: [...genderTotals].map(([gender, percentage]) => ({
      gender,
      percentage: roundPercentage(percentage),
    })),
    ...(detailsErrors.length > 0 ? { details_errors: detailsErrors } : {}),
    source: "youtube_analytics_v2",
  };
}
