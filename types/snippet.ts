export interface Snippet {
  $id: string
  $schema: string
  title: string
  description: string
  definitions: Record<string, any>
  createdAt: string
  source: string
}
