export const ATTRIBUTION_COOKIE = "presuly_attribution";

export type AttributionSource = "shared_link" | "referral" | "template_gallery";

export type AttributionPayload = {
  source: AttributionSource;
  ref?: string;
};
