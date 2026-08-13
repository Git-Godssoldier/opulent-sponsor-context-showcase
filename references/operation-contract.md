# Context.dev known-person operation contract

Authority: the published Context.dev OpenAPI and documentation, checked 2026-08-05.

- Base URL: `https://api.context.dev/v1`
- Method/path: `POST /people/retrieve`
- Authentication: `Authorization: Bearer $CONTEXT_DEV_API_KEY`
- Content type: `application/json`
- Required identity: `identifiers.linkedinUrl`
- Optional controls used here: `timeoutMS`, `tags`
- Purpose: retrieve a person whose LinkedIn URL is already known; this is not a discovery endpoint.
- Access/cost note: the published specification marks this endpoint private alpha and currently documents a 50-credit operation. Treat access and price as provider-controlled, potentially changing facts.

Request shape:

```json
{
  "identifiers": {
    "linkedinUrl": "https://www.linkedin.com/in/example"
  },
  "timeoutMS": 30000,
  "tags": [
    "client:opulent",
    "app:linkedin-context-showcase",
    "run:<run-id>",
    "env:<environment>",
    "scope:list"
  ]
}
```

The provider response may include profile, experience, education, skills, analyzed URLs, source-attempt status, request metadata, and credit metadata. The public normalizer allowlists professional identity, current role, experience summaries, skills, source URLs, and provider status. It rejects contact and sensitive fields.

## Status and receipt contract

Every operation record must contain:

- natural-language job;
- method and full endpoint;
- exact body without secrets;
- expected response;
- Opulent route and write policy;
- status;
- started/completed timestamps and latency for attempted calls;
- safe HTTP and rate-limit metadata;
- provider request ID when returned;
- provider credit metadata when returned; and
- a local raw receipt path, kept under `.scratch/`.

Allowed statuses:

- `proposed`: request plan only;
- `blocked_missing_credentials`: no server-side API key;
- `blocked_endpoint_access`: authenticated account lacks endpoint access;
- `executed`: an HTTP response and saved receipt exist;
- `failed`: a request was attempted and failed for another classified reason.

No receipt means no executed claim.

## Retry policy

Retry only HTTP 408, 429, and 500, up to two retries. Honor `Retry-After`; otherwise use bounded exponential backoff with jitter. Never retry 401, 403, 404, 422, or malformed input. Keep failures isolated per profile.

## Sources

- <https://docs.context.dev/llms.txt>
- <https://app.stainless.com/api/spec/documented/context.dev/openapi.documented.yml>
