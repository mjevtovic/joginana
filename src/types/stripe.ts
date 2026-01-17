export interface CheckoutSessionRequest {
  priceId: string;
}

export interface PortalSessionRequest {
  returnUrl?: string;
}

export interface SubscriptionResponse {
  isSubscribed: boolean;
  status: string;
  currentPeriodEnd?: string;
}
