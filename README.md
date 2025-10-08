I'll use C++ to compress and scale it

it CAN help you squeeze more performance out of what you have!

Cloudflare CDN + aggressive caching can absolutely get you to 1,000+ concurrent users on 1 GB RAM by offloading 80-95% of requests.:

Design your app to be cache-friendly:
// ✅ GOOD - can cache (public)
GET /api/posts?page=1  // Same for everyone
GET /api/user/123/profile  // Cacheable by user ID

// Then add personalization client-side from:
GET /api/me  // Small, only user's data
