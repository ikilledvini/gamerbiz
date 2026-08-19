export type LangCode = "pt-BR" | "en" | "es" | "zh-CN";

export type LangOption = { code: LangCode; label: string };

export const LANGUAGES: LangOption[] = [
  { code: "pt-BR", label: "PT" },
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
  { code: "zh-CN", label: "官话" },
];

export type Dict = {
  meta: { title: string; description: string };
  a11y: {
    skipToContent: string;
    openMenu: string;
    closeMenu: string;
    languageSwitcher: string;
    prevSlide: string;
    nextSlide: string;
    goToSlide: string;
    slideStatus: string;
    info: string;
  };
  nav: {
    about: string;
    brands: string;
    teams: string;
    clients: string;
    talents: string;
    cases: string;
  };
  actions: {
    brand: string;
    creator: string;
    close: string;
    back: string;
    learnMore: string;
    viewCase: string;
    viewMediaKit: string;
    mediaKitSoon: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary: string;
    scroll: string;
    videoPlaceholder: string;
  };
  marquee: string[];
  stats: {
    eyebrow: string;
    title: string;
    items: { value: number; prefix: string; label: string }[];
  };
  about: {
    title: string;
    text: string;
    mediaPlaceholder: string;
    pillars: { key: string; title: string; text: string }[];
    button: string;
  };
  brands: {
    eyebrow: string;
    title: string;
    description: string;
    phrase: { top: string; mid: string; bottom: string };
    video: string;
    services: { key: string; title: string; text: string }[];
  };
  teams: {
    eyebrow: string;
    title: string;
    titleLead?: string;
    titleBrand?: string;
    titleAccent?: string;
    description: string;
    services: { key: string; title: string; text: string }[];
    button: string;
    subject: string;
  };
  clients: {
    eyebrow: string;
    title: string;
    groupBrands: string;
    groupTeams: string;
  };
  talents: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    description: string;
    card: string;
    allButton: string;
    badgeTalent: string;
    tooltipTalent: string;
    badgePartner: string;
    tooltipPartner: string;
    unavailable: string;
    photoPlaceholder: string;
  };
  cases: {
    eyebrow: string;
    title: string;
    description: string;
    action: string;
    result: string;
    items: Record<string, { title: string; resultLabel: string; tags: string[] }>;
  };
  finalCta: { eyebrow: string; title: string; button: string };
  footer: {
    phrase: string;
    navigation: string;
    services: string;
    social: string;
    rights: string;
    privacy: string;
    terms: string;
    legalUnavailable: string;
  };
  brandModal: {
    eyebrow: string;
    title: string;
    titleHighlight: string;
    description: string;
    name: string;
    namePlaceholder: string;
    company: string;
    companyPlaceholder: string;
    email: string;
    emailPlaceholder: string;
    whatsapp: string;
    whatsappPlaceholder: string;
    help: string;
    helpPlaceholder: string;
    submit: string;
    success: string;
    optional: string;
  };
  creatorModal: {
    eyebrow: string;
    title: string;
    titleHighlight: string;
    description: string;
    name: string;
    namePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    whatsapp: string;
    whatsappPlaceholder: string;
    platforms: string;
    other: string;
    type: string;
    typePlaceholder: string;
    profiles: string;
    profilesPlaceholder: string;
    submit: string;
    success: string;
    optional: string;
  };
  validation: {
    required: string;
    email: string;
    platform: string;
    profiles: string;
    generic: string;
  };
  mediakit: {
    nav: string;
    eyebrow: string;
    title: string;
    description: string;
    breadcrumbHome: string;
    breadcrumbCurrent: string;
    countOne: string;
    countMany: string;
    searchPlaceholder: string;
    searchLabel: string;
    clearSearch: string;
    filters: string;
    category: string;
    allCategories: string;
    clearFilters: string;
    resultsOne: string;
    resultsMany: string;
    open: string;
    empty: string;
    emptyAll: string;
    loadError: string;
    loadErrorText: string;
    tryAgain: string;
    notFoundTitle: string;
    notFoundText: string;
    backToDirectory: string;
    about: string;
    aboutEmpty: string;
    analytics: string;
    analyticsEmpty: string;
    highlights: string;
    brands: string;
    formats: string;
    requestProposal: string;
    proposalSoon: string;
    workWith: string;
    workWithText: string;
    lastUpdate: string;
    share: string;
    viewList: string;
    viewGrid: string;
    viewLabel: string;
    ctaHome: string;
    oauthExplainer: {
      eyebrow: string;
      title: string;
      titleAccent: string;
      description: string;
      steps: Array<{ title: string; text: string }>;
      note: string;
      legalLabel: string;
      privacy: string;
      terms: string;
    };
    socials: string;
    followers: string;
    avgViews: string;
    engagement: string;
    audience: string;
    achievements: string;
    contact: string;
    sendProposal: string;
    contactSubject: string;
    analyticsUi: {
      summary: string;
      reach: string;
      media: string;
      age: string;
      gender: string;
      countries: string;
      languages: string;
      viewsLast28Days: string;
      viewsByVideo: string;
      engagementByVideo: string;
      totalViews: string;
      watchTime: string;
      avgViewDuration: string;
      subscribersGained: string;
      likes: string;
      comments: string;
      shares: string;
      female: string;
      male: string;
      userSpecified: string;
    };
    platforms: {
      instagram: string;
      tiktok: string;
      youtube: string;
      twitch: string;
      twitter: string;
    };
  };
  links: {
    tagline: string;
    talentsLink: string;
    websiteLink: string;
    linkedinLink: string;
    primaryNav: string;
    backToWebsite: string;
    sharePage: string;
    linkCopied: string;
    copyError: string;
    eyebrow: string;
    talentsTitle: string;
    talentsDescription: string;
    rights: string;
    meta: { title: string; description: string };
    social: {
      instagram: string;
      youtube: string;
      tiktok: string;
      x: string;
      linkedin: string;
    };
    soon: string;
  };
};
