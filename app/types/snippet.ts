export interface Snippet {
  $id: string;
  $schema: string;
  title: string;
  description: string;
  $defs: Record<string, any>;
  createdAt: string;
  source: string;
  highlight?: {
    title?: string;
    description?: string;
  };
}
