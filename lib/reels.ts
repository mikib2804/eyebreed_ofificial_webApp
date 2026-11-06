export interface ReelItem {
  id: string;
  type: "video";
  src: string;
  poster?: string;
  title?: string;
  link: string;
  account?: string;
  publishedAt?: string;
}
