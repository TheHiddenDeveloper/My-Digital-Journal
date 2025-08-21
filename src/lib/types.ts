export type Journal = {
  Id: string;
  Title: string;
  Content: string;
  Tags: string[];
  IsPublished: boolean;
  CreatedAt: string;
  UpdatedAt: string;
};

export type JournalsResponse = {
  data: Journal[];
  totalPages: number;
};
