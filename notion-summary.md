# 🎯 3-Agent PPT Generation System - Design Document

## 📝 Project Overview
**Goal**: Improve PPT generation by breaking it into specialized agents for better modularity and control.

**Current State**: Single PPT artifact generator in existing system
**Target State**: 3-agent pipeline for structured, high-quality presentation generation

---

## 🤖 Agent Architecture

### Agent 1: Planning Agent
- **Purpose**: Analyze topic and create structured presentation plan
- **Input**: User prompt/topic (e.g., "Create PPT about AI Ethics")
- **Output**: Structured JSON plan
- **Status**: Ready to implement

**Output Schema**:
```json
{
  "title": "AI Ethics in Modern Society",
  "estimatedDuration": "15 minutes",
  "targetAudience": "General audience",
  "outline": [
    {
      "slideNumber": 1,
      "type": "title",
      "title": "AI Ethics in Modern Society",
      "subtitle": "Understanding the Moral Implications",
      "speakerNotes": "Introduction slide - set the tone"
    },
    {
      "slideNumber": 2,
      "type": "content",
      "title": "What is AI Ethics?",
      "bulletPoints": [
        "Definition and scope",
        "Key principles",
        "Why it matters today"
      ],
      "speakerNotes": "Define the concept clearly"
    }
  ],
  "visualSuggestions": [
    {
      "slideNumber": 2,
      "imageType": "infographic",
      "description": "Visual representation of AI ethics principles"
    }
  ]
}
```

### Agent 2: HTML/Jinja Agent
- **Purpose**: Convert structured plan to HTML slide content
- **Input**: JSON plan from Agent 1
- **Output**: HTML content with Jinja templating
- **Status**: Ready to implement

**Sample Output**:
```html
<div class="slide slide-title" data-slide="1">
  <div class="slide-content">
    <h1 class="main-title">{{title}}</h1>
    <h2 class="subtitle">{{subtitle}}</h2>
  </div>
</div>
```

### Agent 3: Visual Agent
- **Purpose**: Generate visual assets and styling
- **Input**: HTML content + visual suggestions
- **Output**: Complete styled presentation with generated images
- **Status**: Future implementation
- **Capabilities**: AI image generation (Kling/Flux), styling, charts

---

## 🏗️ Implementation Plan

### Phase 1: Foundation (Immediate)
- [ ] Implement Planning Agent (Agent 1)
- [ ] Create structured JSON schema
- [ ] Test with various topics
- [ ] Integrate with existing chat system

### Phase 2: HTML Generation
- [ ] Implement HTML/Jinja Agent (Agent 2)
- [ ] Create slide templates
- [ ] Add Jinja templating engine
- [ ] Connect Agent 1 → Agent 2 pipeline

### Phase 3: Visual Enhancement (Future)
- [ ] Implement Visual Agent (Agent 3)
- [ ] Integrate AI image generation APIs
- [ ] Add styling and branding options
- [ ] Complete Agent 2 → Agent 3 pipeline

---

## 🔧 Technical Integration

### Current System Hooks
- **AI SDK**: Use existing streaming infrastructure
- **Artifact System**: Extend current PPT artifact handler
- **Database**: Store agent outputs in document system
- **UI**: Build on existing chat interface

### New API Endpoints Needed
- `/api/ppt/plan` - Planning Agent endpoint
- `/api/ppt/html` - HTML Agent endpoint  
- `/api/ppt/visual` - Visual Agent endpoint (future)

### Database Schema Extensions
```sql
-- Store agent outputs separately for debugging/iteration
ALTER TABLE documents ADD COLUMN agent_stage VARCHAR(20);
ALTER TABLE documents ADD COLUMN agent_metadata JSONB;
```

---

## 💡 Key Benefits

### ✅ Advantages
- **Modularity**: Each agent has single responsibility
- **Testability**: Can test and debug each agent independently
- **Progressive**: Implement incrementally (Agent 1, then 2, then 3)
- **User Control**: Users can review/modify outputs between agents
- **Quality**: Specialized agents produce better results than monolithic approach

### 🎯 Success Metrics
- **Agent 1**: Produces well-structured, logical presentation outlines
- **Agent 2**: Generates clean, semantic HTML with proper templating
- **Agent 3**: Creates visually appealing presentations with relevant images

---

## 🚀 Next Steps

### Immediate Actions
1. **Review and approve** this agent design approach
2. **Start implementation** of Planning Agent (Agent 1)
3. **Define detailed JSON schema** for planning output
4. **Test planning agent** with various presentation topics

### Questions to Resolve
- Should we allow user editing between agent stages?
- What slide types should we support initially?
- How should we handle error cases in the agent pipeline?
- What's the priority for visual features in Agent 3?

---

## 📊 Current Codebase Context

### Existing Assets
- ✅ PPT artifact system (`artifacts/ppt/server.ts`)
- ✅ AI SDK streaming infrastructure
- ✅ Document storage system
- ✅ PPTX export functionality (`lib/pptx-generator.ts`)

### Files to Modify
- `artifacts/ppt/server.ts` - Extend for agent pipeline
- `lib/ai/prompts.ts` - Add agent-specific prompts
- Create new agent handlers in `lib/agents/`

---

*Generated: 2025-07-29*
*Status: Design Complete - Ready for Implementation*