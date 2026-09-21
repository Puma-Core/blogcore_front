export const BLOG_API_BASE_URL = "https://admin-blog.pumacore.com";

export type SocialNetworks =
  | string
  | Record<string, string | null>
  | Array<string | Record<string, string | null>>
  | null;

export type AuthorProfile = {
  public_username: string;
  first_name: string;
  last_name: string;
  fullname: string;
  title: string;
  subtitle: string;
  specialty: string;
  short_description: string;
  photo_url?: string;
  social_networks: SocialNetworks;
};

export type PostListItem = {
  unique_name: string;
  title: string;
  content_preview: string;
  created_at: string;
  author_full_name: string;
};

export type PostDetail = {
  unique_name: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  public_username: string;
  author_full_name: string;
};

export type PaginatedPosts = {
  count: number;
  next: string | null;
  previous: string | null;
  results: PostListItem[];
};
