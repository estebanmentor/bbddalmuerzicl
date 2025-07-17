
export interface ApiLog {
  id: number;
  timestamp: string;
  method: string;
  url: string;
  status: number;
  statusText: string;
  type: 'real' | 'simulated';
  ipAddress?: string;
  userAgent?: string;
}

export interface Location {
  lat: number;
  lon: number;
}

export interface MenuItem {
  name: string;
  description: string;
  regularPrice: number;
  salePrice?: number;
  rating: number;
  imageUrl?: string;
}

export interface Discount {
  sponsor: string;
  type: '$' | '%';
  amount: number;
  validFrom: string;
  validTo: string;
  daysOfWeek: string[];
  appliesTo: string;
}

export interface Event {
  title: string;
  description: string;
}

export interface Restaurant {
  name: string;
  description: string;
  address: string;
  imageUrl: string;
  location: Location;
  menu: MenuItem[];
  paymentMethods: string[];
  discounts: Discount[];
  event?: Event;
}

export interface RestaurantMetrics {
  restaurantId: string;
  pageViews: number;
  detailViews: number;
  shares: number;
  simulatedSales: number;
  viewsOverTime: { date: string; views: number }[];
  salesOverTime: { date: string; sales: number }[];
}

export interface CustomerData {
  totalSessions: number;
  mostUsedFilters: { filter: string; count: number }[];
  commonPaths: { path: string; count: number }[];
  deviceBreakdown: { device: string; count: number }[];
}
