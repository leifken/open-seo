// Node stand-in for `cloudflare:email`. The agents SDK imports EmailMessage
// at module level; the app never sends email through it, so a construct-time
// error is the honest behavior.
export class EmailMessage {
  constructor() {
    throw new Error("cloudflare:email is not supported in the Node runtime");
  }
}
