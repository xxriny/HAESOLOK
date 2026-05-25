export interface PublicDataSource {
  id: string;
  name: string;
  provider: string;
  url: string;
  usedFields: string[];
  usage: string;
  mvpImplementation: string;
  futureUsage: string;
  status: "api_possible" | "download" | "example" | "internal_metric";
}
