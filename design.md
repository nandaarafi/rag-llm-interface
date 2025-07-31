# Speaking AI - UX Design Guide

## Blake Anderson's 3 Core Design Principles Applied

### Principle 1: Minimize Cognitive Load
**"Every tap, decision, and moment of confusion hinders your app's growth"**
- **Target**: 1 button (like Umax's "scan your face")
- **5-Year-Old Test**: Must be simple enough for a child to use
- **80/20 Rule**: Launch with the 20% of features that provide 80% of value

### Principle 2: Do Not Reinvent the Wheel  
**"Save your innovation for solving the core problem"**
- **FIFA Rating System**: Users already understand 1-100 player ratings
- **Standard UI Patterns**: Settings in top-right, familiar navigation
- **Leverage Existing Mental Models**: Don't create new interaction patterns

### Principle 3: Think Like Your Customer
**"Apps that go viral are designed by people who understand users obsessively"**
- **Become the customer**: Use r/PublicSpeaking, practice speeches yourself
- **Deep user research**: What specific problems do they have?
- **Build for real needs**: Not imaginary feature requests

## Blake Anderson's Design Objective
**"Viral app design seeks to minimize friction from design to millions of users"**

### Blake Anderson's 3 Methods Applied

#### Method 1: Figma-First Design
- **Learn Figma**: All successful apps start in Figma
- **UX over UI**: Focus on what components do, not corner radius
- **Quick iteration**: Turn ideas into tangible designs fast

#### Method 2: Create Idea Board (Screenshots)
- **Mobbin.com**: Study existing app patterns
- **FIFA/Madden**: Rating system inspiration
- **AI Avatar Apps**: Upload image flow patterns
- **Great designers screenshot**: Don't reinvent successful patterns

#### Method 3: Study Viral Content First
- **Work backwards**: Study viral TikTok content, then design screens to fit
- **Content integration**: Design specifically for social media sharing
- **Tens of hours**: Deep research into viral speech/rating content

### Core Psychology (Blake Anderson Validated)
- **Familiar Mental Model**: FIFA-style 1-100 scoring (users already understand)
- **"Did You Hear About" Test**: "AI that rates your speaking" passes party test
- **Social Media Native**: Designed for TikTok virality first
- **Single Core Action**: One button, one result (like all Blake's apps)

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