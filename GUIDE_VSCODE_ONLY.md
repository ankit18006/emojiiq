# EmojiIQ — VS Code se APK Banao (Android Studio NAHI chahiye!)
## Sirf 3 cheezein install karni hain + GitHub account

---

## PEHLE YE INSTALL KARO (Sirf 3 lightweight tools)

### 1. Node.js (Sirf ~30MB)
- Jao: https://nodejs.org
- "LTS" wala download karo (v18 ya v20)
- Install karo — next next finish

### 2. Git (Sirf ~50MB)
- Jao: https://git-scm.com/download/win
- Download → Install (sab default rehne do)

### 3. VS Code (Already hai tumhare paas probably)
- Jao: https://code.visualstudio.com (agar nahi hai)

### 4. GitHub Account (Free)
- Jao: https://github.com
- Sign up karo (free hai)

---

## STEPS — APK BANAO

### STEP 1 — Project GitHub pe upload karo

VS Code open karo, terminal open karo (Ctrl + ` backtick):

```bash
# Ye commands ek ek karke chalaao

# Git configure karo (sirf pehli baar)
git config --global user.email "tumharamail@gmail.com"
git config --global user.name "Ankit"

# Project folder mein jaao
cd path/to/emojiiq   
# Example: cd C:\Users\Ankit\Downloads\emojiiq

# Git initialize karo
git init
git add .
git commit -m "EmojiIQ first commit"
```

### STEP 2 — GitHub pe new repository banao

1. GitHub.com pe jao → Login karo
2. Right top corner pe "+" icon → "New repository"
3. Name: `emojiiq`
4. Private ya Public (dono kaam karega)
5. "Create repository" click karo
6. GitHub tumhe kuch commands dikhayega, ye run karo:

```bash
git remote add origin https://github.com/TUMHARA-USERNAME/emojiiq.git
git branch -M main
git push -u origin main
```

### STEP 3 — APK Build Dekho (Magic!)

1. GitHub.com pe apna `emojiiq` repo kholo
2. Top mein **"Actions"** tab click karo
3. "Build EmojiIQ APK" workflow dikhega
4. Agar already run ho raha hai — wait karo (~5-8 minutes)
5. Agar nahi run hua — "Run workflow" button dabao

### STEP 4 — APK Download Karo

1. Actions tab mein green checkmark aaye = build success ✅
2. Workflow pe click karo
3. Neeche **"Artifacts"** section mein jaao
4. **"EmojiIQ-debug-apk"** download karo
5. ZIP extract karo → `app-debug.apk` milega!

### STEP 5 — Phone pe Install Karo

1. APK file WhatsApp ya USB se phone pe bhejo
2. Phone mein: Settings → Security → "Unknown Sources" ON karo
3. APK file pe tap karo → Install
4. **EmojiIQ launch karo!** 🎉

---

## Code Edit Karna Chahte Ho?

VS Code mein `src/App.jsx` edit karo, phir:

```bash
git add .
git commit -m "updated puzzles"
git push
```

GitHub automatically naya APK build kar dega! Fir se download karo.

---

## PROBLEM AAYE TO

**"git not found"** → Git install karo (Step 1)

**"npm not found"** → Node.js install karo (Step 1)

**Build failed on GitHub:**
1. Actions tab mein red X click karo
2. Error logs dekho
3. Ya mujhe pooch lena 😄

**Phone pe "App not installed":**
→ Unknown sources allow karo (Settings → Security)

---

## Play Store Pe Daalna Hai?

Debug APK test ke liye hai. Play Store ke liye:

1. **Google Play Console**: https://play.google.com/console
2. **$25 one-time developer fee** dena hoga
3. Signed APK chahiye — iske liye mujhse poochho, 
   main GitHub Actions mein signing bhi add kar dunga!

---

## Summary — Sirf Ye 3 Software:
| Software | Size | Kaam |
|----------|------|------|
| Node.js  | ~30MB | npm commands |
| Git      | ~50MB | code GitHub pe push karna |
| VS Code  | ~80MB | code edit karna |

**Total: ~160MB** — Android Studio = 8GB+ 😅

---
EmojiIQ v1.0 — Zero API, 200+ Puzzles, No Internet Needed!
