export interface BlogTag {
  id: string;
  name: string;
  createdAt: string;
}

export interface BlogItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  thumbnailUrl?: string | null;
  authorId: string;
  authorName: string;
  viewCount: number;
  readingTime: number;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  comments?: any[];
  tags?: BlogTag[];
}

export interface BlogListResponse {
  message?: string;
  data: {
    size: number;
    page: number;
    total: number;
    totalPages: number;
    items: BlogItem[];
  };
}

export interface BlogCreateRequest {
  title: string;
  content: string;
  thumbnailUrl?: string;
  tagIds: string[];
}

export interface BlogUpdateRequest {
  title?: string;
  content?: string;
  thumbnailUrl?: string;
  tagIds?: string[];
}
