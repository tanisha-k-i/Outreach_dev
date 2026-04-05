// In-memory store for demo mode (when no database is connected)
// This keeps uploaded resources in RAM so they appear in search results and profile

export type DemoResource = {
  id: string;
  title: string;
  subject: string;
  description: string;
  type: string;
  uploader_id: string;
  file_url: string | null;
  external_url: string | null;
  created_at: string;
  tags: { tag: { name: string } }[];
};

const demoResources: DemoResource[] = [];

export function addDemoResource(resource: DemoResource) {
  demoResources.unshift(resource); // newest first
}

export function getDemoResources(): DemoResource[] {
  return demoResources;
}

export function getDemoResourcesByUser(userId: string): DemoResource[] {
  return demoResources.filter(r => r.uploader_id === userId);
}

export function getDemoResourceById(id: string): DemoResource | undefined {
  return demoResources.find(r => r.id === id);
}
