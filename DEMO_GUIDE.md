# 🏎️ F1 Space-Themed Dashboard - Demo Guide

## 🎨 New Visual Features

### ✨ Galaxy Background with Sparkling Stars
- **What to look for**: Animated starfield background throughout the entire app
- **Details**: Multiple layers of stars that drift slowly across the screen
- **Colors**: Deep space blues, cyans, and purples creating a cosmic atmosphere

### 🌠 Comet Border Animations
- **What to look for**: All dashboard tiles now have rotating comet-like borders
- **Effect**: Cyan and purple gradient that continuously rotates around each card
- **Speed**: Smooth 3-second rotation cycle
- **Where**: All cards on Central Console and Radio Comms pages

## 📡 Radio Communications Page

### How to Access
1. Look at the left sidebar
2. Click **"Radio Comms"** button (📡 icon)
3. You'll see the Radio Communications center

### What You'll See
- **Live Radio Feed**: Transcribed team radio messages appearing in real-time
- **Beautiful Cards**: Each message in a space-themed card with comet borders
- **Message Details**: Team name, timestamp, and driver ID
- **Statistics Panel**:
  - Total messages count
  - Active channels count
  - Last message timestamp

## 🎤 Voice Assistant Demo

### How to Use
1. Navigate to **Radio Comms** page
2. Find the **"AI Assistant Demo"** card on the right side
3. Click the **"START DEMO"** button (gradient cyan-to-purple)
4. A modal will pop up with a microphone icon

### Voice Demo Steps
1. **Click "Start Speaking"** button
2. The microphone will turn cyan/purple and start pulsing
3. **Speak your question** (e.g., "What should I do about fuel?")
4. **Watch the transcription** appear below the microphone
5. **Wait for AI response** (powered by Gemini API or fallback)
6. The response will be **spoken aloud** using text-to-speech
7. Click **"Try Again"** to ask another question

### Example Questions
- "What should I do about fuel?"
- "When should I pit?"
- "How's my tire wear?"
- "What's the race strategy?"
- "Should I overtake now?"

## 🏁 Lap Counter System

### Where to Find
- **Central Console** page (main dashboard)
- Look for the **"MOTOR TELEMETRY"** card
- Left side shows "CURRENT LAP"

### What Happens
- ⏱️ Lap counter increments every 15 seconds (for demo)
- 🔄 **Caps at lap 58** then resets to lap 1
- 💫 Watch the number animate when it changes
- 📊 Progress circle shows completion percentage

## ⛽ Fuel Management System

### Where to Find
- **Central Console** page
- Top row, rightmost card labeled **"FUEL LEVEL"**

### Fuel Behavior
- 🟢 **Starts at 100%**
- 📉 Decreases by 1.5% per second
- 🟢 Green color when above 20%
- 🔴 **Red color when at or below 20%**

### 20% Warning System
When fuel drops to 20%:
1. 🔴 **Fuel gauge turns red**
2. ⚠️ **"CRITICAL LEVEL" text flashes**
3. 🚨 **Pop-up warning appears** in top-right corner
4. The warning has:
   - Pulsing red glow effect
   - Current fuel percentage
   - **"GO TO PITSTOP" button**

### Pitstop Reset
Click **"GO TO PITSTOP"** to:
- ⛽ Fuel → 100%
- ⚡ ERS Energy → 100%
- 🔥 Brake Temp → 800°C
- 🛞 Tire Temp → 85°C
- ✅ Warning dismissed

## 📊 Varying Telemetry Data

### Where to Find
- **Central Console** page
- **"MOTOR TELEMETRY"** card (large card in middle)
- Right side shows various metrics

### Live Updating Values

#### ⚡ ERS Energy
- Range: 20-100%
- Updates every 2 seconds
- Green progress bar animates
- Watch the percentage change

#### 🔥 Brake Temperature
- Range: 800-1300°C
- Orange/red gradient bar
- Varies realistically during "race"

#### 🛞 Tire Temperature
- Range: 80-140°C
- Yellow/orange gradient bar
- Changes based on track conditions

#### 🏎️ Average Speed
- Base speed from telemetry ± 20 km/h
- Updates smoothly with animation
- Displayed in km/h

## 🎬 Complete Demo Flow

### 5-Minute Demo Script

1. **Start on Central Console** (0:00-1:30)
   - Point out the sparkling star background
   - Show comet borders rotating on all cards
   - Watch lap counter increment (wait for one change)
   - Observe fuel gauge at 100% (green)
   - Show varying telemetry (ERS, Brake, Tire temps)

2. **Navigate to Radio Comms** (1:30-3:00)
   - Click Radio Comms in sidebar
   - Show live radio messages scrolling
   - Point out message statistics
   - Highlight comet borders on radio cards

3. **Voice Assistant Demo** (3:00-4:30)
   - Click "START DEMO" button
   - Ask: "What should I do about fuel?"
   - Show transcription appearing
   - Hear AI response
   - Try another question if time allows

4. **Fuel Warning Demo** (4:30-5:00)
   - Return to Central Console
   - Wait for fuel to reach 20% (or adjust timer)
   - Show red warning popup
   - Click "GO TO PITSTOP"
   - Watch everything reset

## 🎨 Visual Highlights to Point Out

### Animations
- ✨ Stars drifting in background
- 🌀 Comet borders rotating continuously
- 💫 Lap counter scale animation
- 🔴 Fuel warning pulsing effect
- 📊 Telemetry bars animating smoothly
- 🎤 Microphone pulsing during listening

### Color Palette
- 🌌 **Background**: Deep space black (#000814)
- 💠 **Primary**: Cyan (#00bfff)
- 💜 **Secondary**: Purple (#8a2be2)
- 🔴 **Warning**: Red (#ef4444)
- 🟢 **Success**: Green (#10b981)

### Typography
- **Headers**: Orbitron (space-themed font)
- **Body**: Space Mono (monospace)
- **Data**: JetBrains Mono (technical)

## 🛠️ Technical Notes

### Browser Requirements
- ✅ Chrome (recommended)
- ✅ Edge
- ⚠️ Safari (limited Web Speech API support)
- ⚠️ Firefox (limited Web Speech API support)

### Gemini API Setup (Optional)
If you want real AI responses instead of fallbacks:
```bash
export GEMINI_API_KEY=your_api_key_here
```

### Quick Start
```bash
# Terminal 1 - Backend
cd backend
python main.py

# Terminal 2 - Frontend
cd frontend
npm start
```

## 📸 Screenshot Opportunities

1. **Main dashboard with comet borders visible**
2. **Radio Comms page with messages**
3. **Voice modal open with transcription**
4. **Fuel warning popup (red pulsing)**
5. **Lap counter at lap 58 → 1 transition**
6. **Telemetry values actively changing**

## 🎯 Key Demo Points

1. ✅ **Space theme is immersive** - stars, colors, fonts
2. ✅ **Comet borders add visual flair** - continuously animated
3. ✅ **Radio page shows live comms** - real-time data
4. ✅ **Voice assistant works end-to-end** - speech → AI → speech
5. ✅ **Lap counter caps at 58** - auto-resets
6. ✅ **Fuel system is realistic** - warning → pitstop → reset
7. ✅ **Telemetry varies realistically** - not static numbers

## 🐛 Known Limitations

- Voice recognition requires Chrome/Edge browser
- Gemini API requires environment variable (falls back gracefully)
- ElevenLabs integration uses browser TTS (can be upgraded)
- Lap timer is sped up for demo (15 seconds per lap)
- Fuel depletes quickly for demo purposes (1.5% per second)

## 🎉 Enjoy Your Space-Themed F1 Dashboard!
