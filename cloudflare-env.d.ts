type CloudflareBindingFetcher = {
  fetch(request: RequestInfo | URL, init?: RequestInit): Promise<Response>;
};

interface CloudflareEnv {
  ASSETS: CloudflareBindingFetcher;
  WORKER_SELF_REFERENCE: CloudflareBindingFetcher;
}
