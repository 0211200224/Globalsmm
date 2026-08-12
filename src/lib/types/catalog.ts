export type CatalogService = {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  badge: string | null;
  speedLabel: string;
  serviceType: string;
  pricePer1000: string;
  pricePer1000Raw: number;
  minQuantity: number;
  maxQuantity: number;
  categoryName: string;
};

export type CatalogCategory = {
  name: string;
  icon: string;
  services: CatalogService[];
};
