# SpeakScore MVP - Blake Anderson Strategy Implementation

## App Concept: "SpeakScore"
**3-word description**: "Speaking score app"

## Core Problem Identified
Current public speaking apps like Amplivio ($12.99/month) have trust issues because they're:
- Over-engineered with complex features
- High price barriers for unproven results
- Don't provide instant gratification

## Blake Anderson's Solution Strategy

### 1. Extreme Simplification
- **One core action**: Record 30 seconds → Get instant score + 1 tip
- **Single button interface**: "Rate My Speaking"
- **Free core feature** with optional premium upgrades

### 2. Build Trust Through Transparency
- Show AI analysis process (don't hide behind black box)
- Instant results (no waiting, no complex onboarding)
- Social proof built-in (shareable scores create viral validation)

### 3. Target Specific Pain Points
- **Job interview anxiety** (highest motivation to pay)
- **Dating confidence** (overlaps with Rizz GPT audience)  
- **Social situations** (asking for raises, difficult conversations)

### 4. Viral Design Elements
- **Shareable rating system** (1-10 speaking score like Umax)
- **Before/after speaking scores** for transformation content
- **Challenge features** ("Rate your pickup line delivery")

## MVP Architecture

### Core Technologies (Blake's 2025 Stack)
- **React Native + Expo** (cross-platform development)
- **Cursor IDE** (AI-powered development)
- **Supabase** (database, auth, storage)
- **OpenAI/Anthropic API** (speech analysis)

### Essential Features (Launch with 20%)
1. **Audio Recording** (30-second limit)
2. **AI Speech Analysis** 
   - Pace/speed analysis
   - Filler word detection ("um", "uh", "like")
   - Clarity assessment
3. **Instant Scoring** (1-10 scale)
4. **One Improvement Tip** per recording
5. **Shareable Results** (screenshot with score)

### Premium Features (Future)
- Unlimited recordings (free = 3 per day)
- Detailed analysis breakdown
- Practice prompts for specific scenarios
- Progress tracking over time

### Blake Anderson Framework Validation ✅
- **Familiar Mental Model**: FIFA 1-100 scoring system
- **"Did You Hear About" Test**: "AI that rates your speaking" - passes
- **Single Core Action**: Record speech → Get score → Share result
- **Market Research**: 6M+ view viral teleprompter content validates demand

## Immediate Implementation Plan

### Phase 1: Figma Design (2-3 days, 8-12 hours)
**Day 1**: Figma basics + idea board + design system
**Day 2**: 3 core screens + interactions + viral results card  
**Day 3**: Polish + app icon + export for development

### Phase 2: MVP Development (1-2 weeks)
**Core Features Only:**
1. One-button onboarding
2. Teleprompter with viral scripts (Grammy speech, TED talk)
3. 30-second recording with OpenAI transcription
4. FIFA-style 1-100 scoring with tier names
5. Viral share cards for social media

### Phase 3: Launch Strategy
1. r/PublicSpeaking beta testing
2. TikTok content creation using viral scripts
3. Influencer outreach in public speaking niche

## Blake Anderson's 3 Core Design Principles Applied

### Principle 1: Minimize Cognitive Load ✅
- **One button per screen** (following Umax model)
- **5-Year-Old Test**: Simple enough for child to use
- **80/20 Rule**: Focus on core rating functionality only

### Principle 2: Do Not Reinvent the Wheel ✅
- **FIFA Rating System**: Leverage familiar 1-100 scale
- **Mobbin.com patterns**: Copy successful app layouts
- **Standard UI**: Don't innovate on basic interactions

### Principle 3: Think Like Your Customer ✅
- **Deep research done**: r/PublicSpeaking analysis complete
- **Viral content studied**: TikTok teleprompter challenges researched
- **User pain points identified**: Fear of public embarrassment

## Ready for Execution

### All Research Complete ✅
- Competitive analysis finished
- Market validation through viral content
- Technical feasibility confirmed (OpenAI API)
- Blake Anderson methodology applied
- User flow designed and documented

### Next Action Required
**Start Figma design immediately** - all planning and research phases complete.

## Key UX Design Points

### 1. Onboarding Hook (Blake Anderson Style)
```
"Most people think they're good speakers...
They're wrong 😬

Find out your REAL speaking score"

[Rate My Speaking] ← 1 BUTTON ONLY
```

**Blake Anderson Requirements:**
- **1 button maximum** (following Umax's "scan your face" model)
- **"Did you hear about" test**: Copy must be remarkable enough to tell friends
- **No explanations**: If it needs explaining, it's too complex
- **TikTok 3-second rule**: Must capture attention instantly

### 2. Challenge Selection Screen
```
🎤 Today's Challenge

"Could you give this Grammy 
acceptance speech confidently?"

[Practice Now] →

📊 2.1M people tried this challenge
🔥 Average score: 67/100
```

**Design Requirements:**
- One challenge at a time (no overwhelming choice)
- Social proof prominently displayed
- Clear difficulty/popularity indicators
- Viral content hooks (Grammy, TED, etc.)

### 3. Recording Interface (Teleprompter)
```
⏺️ Recording... 0:23

"Wow. Standing here right now...
 I'm just trying to take it all in.
 This stage. The Grammys..."

[Scrolling text at speaking pace]

🔴 Stop Recording
```

**Design Requirements:**
- Clean, distraction-free interface
- Large, readable text with optimal scroll speed
- Prominent timer to create urgency
- Simple stop/start controls
- No complex recording settings

### 4. Results Screen (The Viral Moment)
```
🎯 Your Speaking Rating: 73/100

"Professional Level Speaker"

💬 "You sounded confident but rushed 
    through emotional moments"

📊 You speak better than 68% of people
⚡ Only 12% score above 85

[Share Your Score] [Challenge Friends]
[Try Again] [New Challenge]
```

**Design Requirements:**
- Large, prominent score display
- FIFA-style tier descriptions (Professional, Elite, etc.)
- Specific, personalized feedback
- Social comparison stats
- Multiple viral sharing options
- Clear retry/continue flow

## Scoring System Design

### FIFA-Style Rating Scale (1-100)
- **90-100**: "Legendary Speaker" (Messi level)
- **80-89**: "Elite Speaker" (Premier League)
- **70-79**: "Professional Level" (Good player) 
- **60-69**: "Average Speaker" (Bench player)
- **50-59**: "Needs Training" (Amateur level)
- **0-49**: "Stage Fright" (Rookie mistakes)

### Score Display Rules
- Always show exact number (73/100, not "good")
- Include tier name for context
- Show percentile ranking for social comparison
- Display rarity stats ("Only 12% score above 85")

## Viral Mechanics Integration

### Social Sharing Design
- **Pre-composed viral hooks**: "I got 73/100 on my Grammy speech 😅"
- **Visual score cards**: Screenshot-ready results with branding
- **Challenge friends**: Direct invite mechanism
- **Progress tracking**: Before/after score comparisons

### Gamification Elements
- **Daily challenges**: New viral scenarios each day
- **Score history**: Track improvement over time
- **Leaderboards**: Friend rankings and global stats
- **Achievement badges**: "First 80+ score", "Tried 10 challenges"

## Technical UX Requirements

### Performance Standards
- **Instant feedback**: Score appears within 2 seconds of recording end
- **Smooth scrolling**: 60fps teleprompter text movement
- **Quick loading**: App launches to recording in <3 seconds
- **Offline capability**: Cache challenges for no-internet use

### Accessibility
- **Large text options**: Readable teleprompter for all users
- **Voice feedback**: Audio cues for visually impaired
- **Simple navigation**: Minimal taps to core functionality
- **Clear hierarchy**: Obvious next actions at each step

## Psychological Triggers in Design

### 1. Immediate Status Assessment
- Number score creates instant social hierarchy
- Clear tier system (like FIFA ratings)
- Immediate comparison to others

### 2. Specific Personal Feedback  
- "Rushed through emotional parts" feels targeted
- Not generic advice but specific observations
- Creates sense of AI "understanding" the user

### 3. Social Proof Everywhere
- "2.1M people tried this" on every challenge
- "68% of people" comparison stats
- Viral view counts and engagement numbers

### 4. Scarcity and Achievement
- "Only 12% score above 85" drives improvement
- Limited daily challenges create urgency
- Exclusive tier membership feeling

### 5. Challenge and Competition
- Friend challenges built into results
- Leaderboards for social competition
- "Beat your last score" motivation

## Design Don'ts (Common Mistakes to Avoid)

❌ **Complex onboarding**: No tutorials or feature explanations
❌ **Multiple options**: Don't overwhelm with choice paralysis  
❌ **Generic feedback**: Avoid "good job" or vague praise
❌ **Hidden social proof**: Always show popularity/usage stats
❌ **Slow gratification**: Score must appear immediately
❌ **Unclear next action**: Always have obvious next step
❌ **Text-heavy interfaces**: Visual hierarchy over explanations

## Success Metrics to Design For

### Primary Viral Metrics
- **Share rate**: % of users who share their score
- **Challenge completion**: % who finish 30-second recording
- **Return usage**: Daily active users returning
- **Friend invites**: Viral coefficient from challenges

### Engagement Metrics  
- **Session duration**: Time spent in app per visit
- **Challenge attempts**: Multiple tries per user
- **Score improvement**: Users retaking same challenges
- **Social interaction**: Comments and reactions on shared scores

## Implementation Priority

### Phase 1: Core Viral Loop
1. Simple onboarding hook
2. One challenge (Grammy speech)
3. Basic teleprompter interface
4. FIFA-style scoring with social comparison
5. Viral sharing mechanism

### Phase 2: Engagement Features
1. Multiple challenge types
2. Friend challenge system
3. Score history and improvement tracking
4. Basic leaderboards

### Phase 3: Retention Features
1. Daily challenge rotation
2. Achievement system
3. Advanced analytics and feedback
4. Community features