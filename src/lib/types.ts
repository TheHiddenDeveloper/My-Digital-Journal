export type Journal = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type JournalsResponse = {
  data: Journal[];
  totalPages: number;
  currentPage: number;
};

export type JournalResponse = {
  data: Journal;
}
