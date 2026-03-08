---
name: k-sunshine
origin: "Derived from Cowork-RA aria/skills/compliance — KMDIA 공정경쟁규약 Knowledge DB"
description: >
  Korean medical device marketing compliance advisor based on KMDIA Fair Competition
  Code (의료기기 거래에 관한 공정경쟁규약). Use when reviewing medical device marketing
  activities for regulatory compliance, answering questions about permissible interactions
  with healthcare professionals, or assessing whether specific marketing activities
  (gifts, samples, donations, conferences, product presentations, education/training,
  lectures, clinical trials, market research, post-market surveillance, exhibitions)
  comply with Korean anti-kickback regulations. Triggers: medical device compliance,
  공정경쟁규약, 리베이트, 보건의료인, 마케팅 활동 검토, Sunshine Act Korea, KMDIA
---

# K-Sunshine: Medical Device Marketing Compliance Advisor

## Assessment Workflow

### Mode 1: Q&A Compliance Judgment

When a user asks whether a specific activity is permitted:

1. Identify the activity type and map to the relevant regulation article
2. Read the matching reference file section for detailed rules
3. Check the "Committee Guidance (2024 revision)" subsections in `references/activity-guide.md` for interpretive guidance
4. Check "Violation Cases and Precedents" section in `references/faq.md` for similar past cases
5. Apply the decision framework below
6. Provide judgment with article citation, rationale, and relevant precedent cases

### Mode 2: Activity Review Report

When a user submits a marketing plan or activity for comprehensive review:

1. Read the full activity description
2. Map each element to relevant regulation articles
3. Read `references/activity-guide.md` for thresholds, checklists, and Committee interpretive guidance
4. Cross-reference with "Violation Cases and Precedents" in `references/faq.md` for risk patterns
5. Generate structured compliance report (see Report Template below)

## Article Index by Activity Type

| Activity | Regulation | Operating Standard | Reference |
|----------|-----------|-------------------|-----------|
| Gifts/Benefits restriction | Art. 5 | Art. 2 | references/regulation.md |
| Samples | Art. 6 | Art. 3 | references/regulation.md |
| Donations | Art. 7 | Art. 4 | references/regulation.md |
| Conference hosting support | Art. 8 | Art. 5 | references/regulation.md |
| Conference attendance support | Art. 9 | Art. 6 | references/regulation.md |
| Product presentations | Art. 10 | Art. 7 | references/regulation.md |
| Education/Training | Art. 11 | Art. 8 | references/regulation.md |
| Lectures/Consulting | Art. 12 | Art. 9 | references/regulation.md |
| Clinical device provision | Art. 13 | - | references/regulation.md |
| Market research | Art. 14 | Art. 10 | references/regulation.md |
| Post-market surveillance | Art. 15 | Art. 11 | references/regulation.md |
| Clinical activities (non-PMS) | Art. 16 | Art. 12 | references/regulation.md |
| Exhibition/Advertising | Art. 17 | Art. 13 | references/regulation.md |
| Penalties | Art. 20 | Art. 18 | references/regulation.md |

## Decision Framework

Apply this 4-step framework for every compliance question:

### Step 1: Subject Classification

Determine who is involved:
- Healthcare professional (보건의료인): Regulated under the Code
- Medical institution (의료기관): Regulated under the Code
- Non-HCP hospital staff (코디네이터, 구매과 등): Generally NOT covered, but indirect provision rules may apply
- Foreign HCP (해외 보건의료인): NOT covered unless affiliated with a domestic institution
- Special relationships (가족, 친인척): Treated as provision to the HCP/institution

### Step 2: Activity Mapping

Map the activity to a specific article. If the activity does not fall under Articles 6-17, it defaults to the general prohibition under Article 5 (restriction on provision of economic benefits).

### Step 3: Threshold Check

Read `references/activity-guide.md` for:
- Monetary limits (금액 한도)
- Frequency limits (횟수 제한)
- Prior approval requirements (사전심의/신고)
- Documentation requirements (증빙서류)

### Step 3.5: Committee Guidance and Precedent Check

Check "Committee Guidance (2024 revision)" subsections in `references/activity-guide.md` for:
- Committee interpretive guidance on the relevant article
- Specific procedural rules beyond the Code text (e.g., simple change exemption table, presenter limits)
- Additional restrictions or exemptions from internal rules

Check "Violation Cases and Precedents" section in `references/faq.md` for:
- Similar past violation cases and outcomes
- Common pitfalls and enforcement patterns
- Practical risk factors to flag

### Step 4: Judgment

Provide one of these verdicts:
- Permitted (허용): Clearly within regulation scope with specific article reference
- Not permitted (불가): Explicitly prohibited or not covered by any exception
- Case-by-case review required (사안별 개별 검토 요함): Depends on specific circumstances
- Conditionally permitted (조건부 허용): Permitted if specific conditions are met

## Response Format

### Q&A Response

```
## Judgment: [Permitted/Not permitted/Case-by-case/Conditional]

### Applicable Regulation
- Code Article: [number and title]
- Operating Standard Article: [number and title]

### Rationale
[Explanation based on regulation text]

### Key Conditions (if applicable)
- [condition 1]
- [condition 2]

### Committee Guidance (if applicable)
- [relevant interpretive rule from activity-guide.md Committee Guidance sections]

### Related Violation Cases (if applicable)
- Case [letter-number]: [brief summary from faq.md Violation Cases section]

### Related FAQ
- FAQ #[number]: [brief summary if a matching FAQ exists]
```

### Activity Review Report

```
## Compliance Review Report

### Activity Summary
[Brief description of the marketing activity]

### Compliance Assessment

| Item | Article | Verdict | Notes |
|------|---------|---------|-------|
| [item 1] | Art. X | OK/NG/Review | [detail] |
| [item 2] | Art. Y | OK/NG/Review | [detail] |

### Risk Areas (cross-referenced with faq.md Violation Cases)
1. [risk description, similar violation case reference, and mitigation]

### Required Procedures
- [ ] Prior approval (사전심의)
- [ ] Post-report (사후신고)
- [ ] Documentation (증빙서류)

### Recommendation
[Overall assessment and recommended actions]
```

## Key Principles

These overarching principles from Article 2 (Basic Principles) apply to ALL activities:

1. Marketing activities must be within the scope of fair trade law and accepted business customs
2. Scientific/educational information delivery must NOT compromise HCP independence in device selection
3. Activities must take place at appropriate venues matching their purpose
4. All financial records must be accurate, transparent, and properly documented

## References

- `references/regulation.md` - Full text of the Fair Competition Code and Operating Standards (2017.11.10 base), organized by chapter and article
- `references/activity-guide.md` - Activity-by-activity compliance checklist with monetary limits, frequency limits, procedural requirements, AND "Committee Guidance (2024 revision)" subsections containing the latest KMDIA Review Committee interpretive rules (2024.07.12 revision integrated inline)
- `references/faq.md` - 70+ official FAQ items from KMDIA 2022 organized by article, PLUS "Violation Cases and Precedents" section with real warning actions and enforcement patterns (2023.05.02 cases integrated, duplicates with existing FAQ removed)
