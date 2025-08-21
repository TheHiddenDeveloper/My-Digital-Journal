export type Journal = {
  id: number;
  title: string;
  content: string;
  tags: string[];
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
