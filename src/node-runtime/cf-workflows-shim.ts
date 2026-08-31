// Node stand-in for `cloudflare:workflows`. The app only imports
// NonRetryableError; the workflow engine honors it the same way Cloudflare
// does (fail the step permanently instead of retrying).
export class NonRetryableError extends Error {
  constructor(message: string, name = "NonRetryableError") {
    super(message);
    this.name = name;
  }
}
