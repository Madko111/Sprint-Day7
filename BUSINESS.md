# AI Chat MVP - Business Analysis

## Model Selection

**Chosen Model:** OpenAI GPT-4o-mini

**Rationale:**
- Cost-effective for MVP ($0.150/1M input tokens, $0.600/1M output tokens)
- Fast response times suitable for streaming
- Good quality for general chat applications
- Reliable API with excellent uptime

---

## Current Pricing (as of June 2026)

### GPT-4o-mini Pricing
- **Input tokens:** $0.150 per 1M tokens
- **Output tokens:** $0.600 per 1M tokens

---

## Estimated Average Message Sizes

### Assumptions (based on typical chat usage):

**User Messages:**
- Average length: 50 words (~200 characters)
- Tokens: ~50 tokens

**Assistant Responses:**
- Average length: 150 words (~600 characters)
- Tokens: ~150 tokens

**System Prompt:**
- Default: "You are a helpful assistant." (~7 tokens)
- Per conversation overhead (included in every API call)

**Sliding Window Context:**
- Last 10 messages sent to API
- Reduces token usage significantly for long conversations

**Defense of Assumptions:**
- Based on ChatGPT usage patterns (median message ~40-60 words)
- Assistant responses typically 2-3x longer than user queries
- Conservative estimates to account for code snippets and longer exchanges

---

## Cost Per Session

### 5-Turn Session (5 user messages + 5 assistant responses)

**Token Usage:**
- User messages: 5 × 50 = 250 tokens
- Assistant responses: 5 × 150 = 750 tokens
- System prompt overhead: 7 × 5 = 35 tokens
- Context tokens (sliding window): ~200 tokens (previous messages)
- **Total Input:** 485 tokens
- **Total Output:** 750 tokens

**Cost Calculation:**
- Input: 485 × $0.150 / 1,000,000 = $0.000073
- Output: 750 × $0.600 / 1,000,000 = $0.000450
- **Total per 5-turn session: $0.000523** (~$0.0005)

---

### 20-Turn Session (20 user messages + 20 assistant responses)

**Token Usage:**
- User messages: 20 × 50 = 1,000 tokens
- Assistant responses: 20 × 150 = 3,000 tokens
- System prompt overhead: 7 × 20 = 140 tokens
- Context tokens (sliding window keeps last 10): ~1,500 tokens (reused context)
- **Total Input:** 2,640 tokens
- **Total Output:** 3,000 tokens

**Cost Calculation:**
- Input: 2,640 × $0.150 / 1,000,000 = $0.000396
- Output: 3,000 × $0.600 / 1,000,000 = $0.001800
- **Total per 20-turn session: $0.002196** (~$0.0022)

**Note:** Sliding window prevents context from growing linearly, saving ~60% on token costs for long conversations.

---

## Monthly Cost Projections

### User Profiles

**Light User:**
- 10 sessions per month
- Average 5 turns per session
- **Monthly cost:** 10 × $0.0005 = **$0.005**

**Medium User:**
- 30 sessions per month
- Average 10 turns per session
- **Monthly cost:** 30 × $0.0011 = **$0.033**

**Heavy User:**
- 100 sessions per month
- Average 15 turns per session
- **Monthly cost:** 100 × $0.0017 = **$0.17**

---

## Pricing Recommendation

### Target: 70%+ Gross Margin

**Cost Structure Per User/Month:**

| User Type | AI Cost | Infrastructure | Total COGS | Revenue Target (70% margin) | Suggested Price |
|-----------|---------|----------------|------------|------------------------------|-----------------|
| Light     | $0.005  | $0.50          | $0.505     | $1.68                        | **$2/mo**       |
| Medium    | $0.033  | $0.50          | $0.533     | $1.78                        | **$5/mo**       |
| Heavy     | $0.17   | $0.50          | $0.67      | $2.23                        | **$10/mo**      |

**Infrastructure costs include:** Supabase hosting, Vercel hosting, monitoring, CDN.

### Recommended Pricing Tiers

**Free Tier:**
- 10 messages per day (~3 sessions)
- Freemium model for acquisition
- Cost: $0.015/user/month
- Conversion target: 5% to paid

**Starter - $4.99/month:**
- Unlimited messages
- Standard response time
- Target: Medium users
- Margin: 89%

**Pro - $9.99/month:**
- Unlimited messages
- Priority response time
- Custom system prompts
- Target: Heavy users
- Margin: 93%

**Enterprise - $49/month:**
- All Pro features
- API access
- Higher rate limits
- Target: Business users
- Margin: 95%

---

## Abuse Vectors

### Potential Attack Scenarios

**1. Automated Scraping / Bot Farms**
- **Risk:** Users create scripts to send thousands of requests
- **Impact:** $10-100+ per abusive user per day
- **Detection:** Abnormal request patterns (>100 messages/hour)

**2. Prompt Spam**
- **Risk:** Extremely long user messages to inflate token usage
- **Impact:** 10x normal costs if messages average 500 tokens instead of 50
- **Detection:** Messages >1000 tokens

**3. Token Farming**
- **Risk:** Deliberately prompting for very long responses
- **Impact:** 5x normal costs if responses average 750 tokens instead of 150
- **Detection:** Consistent responses >2000 tokens

**4. Account Sharing**
- **Risk:** Multiple users sharing one paid account
- **Impact:** Revenue loss, not direct cost increase
- **Detection:** Multiple concurrent sessions, different IP patterns

**5. Context Window Exploitation**
- **Risk:** Disabling sliding window (if exposed) to maximize context
- **Impact:** Already mitigated by server-side enforcement
- **Detection:** N/A (controlled server-side)

**6. Free Tier Abuse**
- **Risk:** Creating multiple accounts to bypass daily limits
- **Impact:** $0.015 × number of accounts
- **Detection:** Same IP/device fingerprint, similar usage patterns

---

## Rate Limiting Strategy

### Implementation Layers

**1. Per-User Rate Limits**
```
Free Tier:
- 10 messages per day
- 3 messages per minute
- 20 messages per hour (safety buffer)

Starter ($4.99/mo):
- Unlimited daily messages
- 10 messages per minute
- 300 messages per hour

Pro ($9.99/mo):
- Unlimited daily messages
- 20 messages per minute
- 600 messages per hour

Enterprise ($49/mo):
- Unlimited daily messages
- 50 messages per minute
- Custom hourly limits
```

**2. IP-Based Rate Limits**
- 100 requests per hour per IP (prevents account farming)
- Temporary ban after 3 violations in 24 hours

**3. Content-Based Limits**
- Maximum 2000 tokens per user message (reject if exceeded)
- Maximum 4000 tokens per assistant response (truncate if exceeded)
- Block messages with excessive repetition

**4. Token Budget Enforcement**
```
Free Tier: 10,000 tokens/day (~20 messages)
Starter: 500,000 tokens/month (~1000 messages)
Pro: 2,000,000 tokens/month (~4000 messages)
Enterprise: Custom
```

**5. Anomaly Detection**
- Flag accounts with >80% long messages (>500 tokens)
- Flag accounts with >50 messages in 1 hour
- Automatic temporary suspension for investigation

**6. Financial Kill Switch**
- Hard monthly spend cap per user: $5 (Free), $20 (Starter), $50 (Pro)
- Automatic suspension when cap reached
- Requires manual review to resume

**7. Authentication & Verification**
- Email verification required for Free tier
- Payment method required for paid tiers (even $0 auth charge)
- Cloudflare Turnstile on signup to prevent bot registration

### Monitoring & Alerts

**Real-time Dashboard:**
- Cost per user (last hour, day, month)
- Top 10 users by token usage
- Average response time
- Error rate by endpoint

**Automated Alerts:**
- Alert if any user exceeds $10/day
- Alert if total daily spend >$100
- Alert if error rate >5%

---

## Summary

**Break-even analysis:**
- Need ~100 Starter users to cover $500/mo infrastructure
- Need ~50 Pro users to cover infrastructure
- AI costs are negligible compared to infrastructure at current scale

**Key Risks:**
- Abuse vectors could 10x costs if unmitigated
- Rate limiting is essential from day 1
- Free tier must be carefully monitored

**Profitability Path:**
- Target 1000 users: 50 paid (5% conversion)
- Revenue: $250-500/month
- Costs: $75/month (infrastructure + AI)
- **Margin: 70-85%** ✅

**Scaling Considerations:**
- At 10,000 users with 5% paid conversion (500 paid users):
  - Revenue: $2,500-5,000/month
  - Costs: $350/month
  - **Margin: 86-93%** ✅
