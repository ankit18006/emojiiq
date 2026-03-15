import { useState, useEffect, useCallback } from "react";

// ─── SOUND ENGINE ─────────────────────────────────────────────────────────────
const SFX = {
  correct: () => { try { const ctx = new (window.AudioContext||window.webkitAudioContext)(); const t=ctx.currentTime; [523,659,784,1047].forEach((f,i)=>{ const o=ctx.createOscillator(),g=ctx.createGain(); o.connect(g);g.connect(ctx.destination); o.frequency.value=f;o.type="sine"; g.gain.setValueAtTime(0,t+i*0.08); g.gain.linearRampToValueAtTime(0.18,t+i*0.08+0.03); g.gain.exponentialRampToValueAtTime(0.001,t+i*0.08+0.25); o.start(t+i*0.08);o.stop(t+i*0.08+0.3); }); } catch {} },
  wrong:   () => { try { const ctx = new (window.AudioContext||window.webkitAudioContext)(); const t=ctx.currentTime; [220,180].forEach((f,i)=>{ const o=ctx.createOscillator(),g=ctx.createGain(); o.connect(g);g.connect(ctx.destination); o.frequency.value=f;o.type="sawtooth"; g.gain.setValueAtTime(0.15,t+i*0.15); g.gain.exponentialRampToValueAtTime(0.001,t+i*0.15+0.25); o.start(t+i*0.15);o.stop(t+i*0.15+0.3); }); } catch {} },
  tick:    () => { try { const ctx = new (window.AudioContext||window.webkitAudioContext)(); const o=ctx.createOscillator(),g=ctx.createGain(); o.connect(g);g.connect(ctx.destination); o.frequency.value=880;o.type="sine"; g.gain.setValueAtTime(0.06,ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.08); o.start(ctx.currentTime);o.stop(ctx.currentTime+0.1); } catch {} },
  hint:    () => { try { const ctx = new (window.AudioContext||window.webkitAudioContext)(); const o=ctx.createOscillator(),g=ctx.createGain(); o.connect(g);g.connect(ctx.destination); o.frequency.value=440;o.type="triangle"; g.gain.setValueAtTime(0.1,ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.3); o.start(ctx.currentTime);o.stop(ctx.currentTime+0.3); } catch {} },
};

// ══════════════════════════════════════════════════════════════════════════════
// 🌍 GLOBAL PUZZLE DATABASE — 500+ Seed Puzzles
// Categories: India, Global Tech, Movies, Sports, Food, Culture, Science...
// ══════════════════════════════════════════════════════════════════════════════
const PUZZLE_DB = [
  // ── TECH / APPS (GLOBAL) ──────────────────────────────────────────────────
  {e:["🔥","🦊"],a:"firefox",h1:"Popular web browser",h2:"Mozilla makes it",h3:"Red panda in logo",cat:"Tech",diff:"easy"},
  {e:["🐦","🔵"],a:"twitter",h1:"Social media platform",h2:"Now called X",h3:"Short posts called tweets",cat:"Tech",diff:"easy"},
  {e:["💧","📦"],a:"dropbox",h1:"Cloud storage app",h2:"Box + water drop",h3:"File syncing service",cat:"Tech",diff:"easy"},
  {e:["🐳","🐋"],a:"docker",h1:"Dev container platform",h2:"Whale is mascot",h3:"Used in deployment",cat:"Tech",diff:"medium"},
  {e:["🍎","🎵"],a:"apple music",h1:"Streaming service",h2:"Made by iPhone company",h3:"Competes with Spotify",cat:"Tech",diff:"medium"},
  {e:["🔵","🔗"],a:"linkedin",h1:"Professional network",h2:"Job hunting platform",h3:"Microsoft owns it",cat:"Tech",diff:"easy"},
  {e:["📸","🌅"],a:"instagram",h1:"Photo sharing app",h2:"Meta owned",h3:"Stories and Reels",cat:"Tech",diff:"easy"},
  {e:["👻","👻"],a:"snapchat",h1:"Disappearing messages",h2:"Ghost logo",h3:"Yellow ghost app",cat:"Tech",diff:"easy"},
  {e:["🎵","🎵"],a:"tiktok",h1:"Short video platform",h2:"ByteDance owns it",h3:"For You Page FYP",cat:"Tech",diff:"easy"},
  {e:["🔴","▶️"],a:"youtube",h1:"Video streaming platform",h2:"Google owns it",h3:"Subscribe and like",cat:"Tech",diff:"easy"},
  {e:["🤖","🤖"],a:"android",h1:"Google mobile OS",h2:"Green robot mascot",h3:"Competes with iOS",cat:"Tech",diff:"easy"},
  {e:["💻","🍎"],a:"macbook",h1:"Apple laptop",h2:"Aluminum design",h3:"macOS operating system",cat:"Tech",diff:"easy"},
  {e:["📡","🛰️"],a:"starlink",h1:"Elon Musk internet",h2:"Satellite internet",h3:"SpaceX project",cat:"Tech",diff:"medium"},
  {e:["🧠","🤖"],a:"chatgpt",h1:"AI chatbot by OpenAI",h2:"GPT powers it",h3:"Answers any question",cat:"Tech",diff:"easy"},
  {e:["🔐","🔑"],a:"password",h1:"Security credential",h2:"Secret string",h3:"Never share it",cat:"Tech",diff:"easy"},
  {e:["🎧","🎵"],a:"spotify",h1:"Music streaming app",h2:"Green circles logo",h3:"Swedish company",cat:"Tech",diff:"easy"},
  {e:["💬","🔚"],a:"whatsapp",h1:"Messaging app",h2:"Meta owns it",h3:"Green phone icon",cat:"Tech",diff:"easy"},
  {e:["🎤","🔵"],a:"discord",h1:"Gamer chat app",h2:"Voice channels",h3:"Purple blue logo",cat:"Tech",diff:"easy"},
  {e:["🔵","📘"],a:"facebook",h1:"Social network",h2:"Zuckerberg made it",h3:"Friends and family",cat:"Tech",diff:"easy"},
  {e:["🎬","🍿"],a:"netflix",h1:"Video streaming",h2:"Binge watch platform",h3:"Original series",cat:"Tech",diff:"easy"},
  {e:["📌","🖼️"],a:"pinterest",h1:"Image bookmarking",h2:"Pin your images",h3:"DIY inspiration",cat:"Tech",diff:"medium"},
  {e:["☁️","💾"],a:"cloud storage",h1:"Data saved online",h2:"Access from anywhere",h3:"Google Drive iCloud",cat:"Tech",diff:"medium"},
  {e:["🌐","🔍"],a:"google",h1:"Most used search engine",h2:"Larry Page founded it",h3:"Just google it",cat:"Tech",diff:"easy"},
  {e:["📲","💸"],a:"upi",h1:"Indian payment system",h2:"NPCI created it",h3:"Unified Payments Interface",cat:"Tech",diff:"easy"},
  {e:["🤖","💬","🧠"],a:"artificial intelligence",h1:"Machine thinking",h2:"AI two words",h3:"ChatGPT uses this",cat:"Tech",diff:"medium"},
  {e:["🔗","💻","🔒"],a:"blockchain",h1:"Decentralized ledger",h2:"Bitcoin uses it",h3:"Cannot be tampered",cat:"Tech",diff:"medium"},
  {e:["🥽","🌐","🎮"],a:"virtual reality",h1:"Immersive digital world",h2:"VR headset needed",h3:"Meta Quest headset",cat:"Tech",diff:"easy"},
  {e:["📡","🛰️","🌍"],a:"gps",h1:"Global Positioning System",h2:"Satellite navigation",h3:"Google Maps uses it",cat:"Tech",diff:"easy"},
  {e:["💻","🐧","🆓"],a:"linux",h1:"Open source OS",h2:"Linus Torvalds made it",h3:"Ubuntu is popular distro",cat:"Tech",diff:"medium"},
  {e:["🔒","🌐","🛡️"],a:"cybersecurity",h1:"Protecting digital data",h2:"Hackers are threat",h3:"Firewall and antivirus",cat:"Tech",diff:"medium"},
  {e:["🖨️","📄","🔵"],a:"pdf",h1:"Portable document format",h2:"Adobe created it",h3:"Cannot easily edit",cat:"Tech",diff:"easy"},
  {e:["🌐","🔗","💻"],a:"internet",h1:"Global network of networks",h2:"Tim Berners-Lee web",h3:"TCP IP protocol",cat:"Tech",diff:"easy"},
  {e:["📱","👆","💳"],a:"contactless payment",h1:"Tap to pay technology",h2:"NFC chip used",h3:"Google Pay Apple Pay",cat:"Tech",diff:"medium"},
  {e:["🤖","🏭","⚙️"],a:"robotics",h1:"Machines that move",h2:"Used in factories",h3:"AI brain often used",cat:"Tech",diff:"easy"},
  {e:["📊","💻","🧮"],a:"data science",h1:"Extracting insights from data",h2:"Python and R used",h3:"Machine learning part",cat:"Tech",diff:"medium"},

  // ── GLOBAL MOVIES ─────────────────────────────────────────────────────────
  {e:["🦁","👑"],a:"lion king",h1:"Disney classic movie",h2:"Hakuna Matata",h3:"Simba journey",cat:"Movie",diff:"easy"},
  {e:["🧊","👸"],a:"frozen",h1:"Disney animated film",h2:"Let it go song",h3:"Elsa and Anna",cat:"Movie",diff:"easy"},
  {e:["🕰️","💡","🔬"],a:"back to the future",h1:"Time travel movie",h2:"DeLorean car",h3:"Marty McFly Doc Brown",cat:"Movie",diff:"hard"},
  {e:["💍","👁️","🌋"],a:"lord of the rings",h1:"Epic fantasy trilogy",h2:"Tolkien novel",h3:"One ring to rule all",cat:"Movie",diff:"hard"},
  {e:["🦸","🕷️"],a:"avengers",h1:"Marvel superhero team",h2:"Assemble",h3:"Iron Man Thor Cap",cat:"Movie",diff:"easy"},
  {e:["🚂","⚡"],a:"harry potter",h1:"Hogwarts Express",h2:"Magic and wizards",h3:"Platform 9 3 quarters",cat:"Movie",diff:"easy"},
  {e:["🌊","🐠"],a:"finding nemo",h1:"Pixar ocean movie",h2:"Father finds his son",h3:"P Sherman 42 Wallaby",cat:"Movie",diff:"easy"},
  {e:["🔫","⭐","🚀"],a:"star wars",h1:"Space opera franchise",h2:"May the force be with you",h3:"Darth Vader villain",cat:"Movie",diff:"easy"},
  {e:["🦇","🌃"],a:"batman",h1:"DC superhero",h2:"Gotham protector",h3:"Bruce Wayne",cat:"Movie",diff:"easy"},
  {e:["🐼","🥋"],a:"kung fu panda",h1:"Dreamworks movie",h2:"Po the panda",h3:"Skadoosh",cat:"Movie",diff:"easy"},
  {e:["🤖","🚗"],a:"transformers",h1:"Robots in disguise",h2:"Autobots Decepticons",h3:"Optimus Prime",cat:"Movie",diff:"easy"},
  {e:["🌀","🦸"],a:"doctor strange",h1:"Marvel sorcerer",h2:"Multiverse of Madness",h3:"Cumberbatch plays him",cat:"Movie",diff:"medium"},
  {e:["🏎️","💨"],a:"fast and furious",h1:"Action racing franchise",h2:"Vin Diesel stars",h3:"Family above all",cat:"Movie",diff:"medium"},
  {e:["🦈","🏖️"],a:"jaws",h1:"Spielberg thriller",h2:"Shark attacks town",h3:"Bigger boat needed",cat:"Movie",diff:"medium"},
  {e:["🌹","🕰️"],a:"beauty and the beast",h1:"Disney enchanted castle",h2:"Belle and prince",h3:"Tale as old as time",cat:"Movie",diff:"easy"},
  {e:["🐉","🔥","🏔️"],a:"how to train your dragon",h1:"Viking boy and dragon",h2:"Dreamworks animated",h3:"Hiccup and Toothless",cat:"Movie",diff:"easy"},
  {e:["🦁","🌍","👑"],a:"black panther",h1:"Marvel superhero film",h2:"Wakanda forever",h3:"Chadwick Boseman",cat:"Movie",diff:"easy"},
  {e:["🕷️","🌆","🏠"],a:"spider man",h1:"Marvel web slinger",h2:"Peter Parker student",h3:"With great power",cat:"Movie",diff:"easy"},
  {e:["🌋","🦍"],a:"king kong",h1:"Giant gorilla film",h2:"Empire State Building",h3:"Beauty killed the beast",cat:"Movie",diff:"medium"},
  {e:["🤖","❤️","🌧️"],a:"wall-e",h1:"Pixar robot love story",h2:"Earth is abandoned",h3:"Eve is his love",cat:"Movie",diff:"easy"},
  {e:["🐟","💙","🌊"],a:"finding dory",h1:"Pixar sequel movie",h2:"Short term memory fish",h3:"Just keep swimming",cat:"Movie",diff:"easy"},
  {e:["🧱","🟡","🔴"],a:"the lego movie",h1:"Everything is awesome",h2:"Emmet the main guy",h3:"Instruction following builder",cat:"Movie",diff:"medium"},
  {e:["🚀","👨‍🚀","♾️"],a:"interstellar",h1:"Christopher Nolan space",h2:"Black hole exploration",h3:"Matthew McConaughey",cat:"Movie",diff:"medium"},
  {e:["🦸","🔴","💙"],a:"captain america",h1:"Marvel super soldier",h2:"Steve Rogers character",h3:"Vibranium shield",cat:"Movie",diff:"easy"},
  {e:["⚡","🔨","🌩️"],a:"thor",h1:"Marvel god of thunder",h2:"Asgard is his home",h3:"Mjolnir his hammer",cat:"Movie",diff:"easy"},

  // ── BOLLYWOOD ─────────────────────────────────────────────────────────────
  {e:["🎵","👑","💃"],a:"devdas",h1:"Tragic love story",h2:"Shah Rukh Khan classic",h3:"Paro and Chandramukhi",cat:"Bollywood",diff:"medium"},
  {e:["🤸","🎯","💥"],a:"dangal",h1:"Wrestling biopic",h2:"Aamir Khan starrer",h3:"Phogat sisters story",cat:"Bollywood",diff:"easy"},
  {e:["💰","🎓","🏃"],a:"3 idiots",h1:"Engineering comedy",h2:"Aamir Khan Rancho",h3:"All Izz Well",cat:"Bollywood",diff:"easy"},
  {e:["🕵️","🎩","🔍"],a:"kahaani",h1:"Mystery thriller",h2:"Vidya Balan Kolkata",h3:"Pregnant detective",cat:"Bollywood",diff:"medium"},
  {e:["🌙","⭐","🎸"],a:"rockstar",h1:"Ranbir Kapoor musician",h2:"Janardhan becomes Jordan",h3:"Sadda Haq song",cat:"Bollywood",diff:"medium"},
  {e:["🔥","👊","🏘️"],a:"gangs of wasseypur",h1:"Gangster saga",h2:"Anurag Kashyap film",h3:"Coal mafia story",cat:"Bollywood",diff:"hard"},
  {e:["🚂","🎵","💑"],a:"dilwale dulhania le jayenge",h1:"DDLJ romance",h2:"Raj and Simran",h3:"Mustard fields Punjab",cat:"Bollywood",diff:"hard"},
  {e:["🧠","💡","🏫"],a:"taare zameen par",h1:"Child with dyslexia",h2:"Aamir Khan teacher",h3:"Every child is special",cat:"Bollywood",diff:"medium"},
  {e:["🤼","👊","🥇"],a:"sultan",h1:"Wrestler comeback",h2:"Salman Khan starrer",h3:"Haryana champion",cat:"Bollywood",diff:"medium"},
  {e:["🎪","🎠","🌈"],a:"barfi",h1:"Deaf mute character",h2:"Ranbir Kapoor",h3:"Darjeeling setting",cat:"Bollywood",diff:"medium"},
  {e:["🌍","🌈","❤️"],a:"zindagi na milegi dobara",h1:"Three friends road trip",h2:"Spain adventure film",h3:"Hrithik Farhan Abhay",cat:"Bollywood",diff:"hard"},
  {e:["🔫","💼","🕵️"],a:"don",h1:"Crime thriller",h2:"SRK plays gangster",h3:"Don ko pakadna mushkil",cat:"Bollywood",diff:"medium"},
  {e:["🌸","💃","🎊"],a:"hum aapke hain kaun",h1:"Family wedding drama",h2:"Salman Madhuri",h3:"Pehla Pehla Pyar",cat:"Bollywood",diff:"hard"},
  {e:["🎭","🏙️","💔"],a:"mughal e azam",h1:"Classic 1960 film",h2:"Prithviraj Kapoor",h3:"Anarkali love story",cat:"Bollywood",diff:"hard"},
  {e:["🏃","💨","🎖️"],a:"bhaag milkha bhaag",h1:"Flying Sikh biopic",h2:"Farhan Akhtar",h3:"Milkha Singh story",cat:"Bollywood",diff:"medium"},
  {e:["🌺","🎵","🏆"],a:"lagaan",h1:"Cricket vs British film",h2:"Aamir Khan leads team",h3:"Oscar nominated",cat:"Bollywood",diff:"medium"},
  {e:["🤡","🎭","😂"],a:"andaz apna apna",h1:"90s comedy classic",h2:"Aamir and Salman both",h3:"Teja main hoon",cat:"Bollywood",diff:"hard"},
  {e:["💪","🔥","🦁"],a:"bahubali",h1:"Epic Telugu film",h2:"SS Rajamouli made it",h3:"Why Kattappa killed",cat:"Bollywood",diff:"easy"},
  {e:["🎤","💔","🌧️"],a:"aashiqui 2",h1:"Romantic tragedy film",h2:"Shraddha Kapoor",h3:"Tum Hi Ho song",cat:"Bollywood",diff:"easy"},
  {e:["🧑","👧","🌍"],a:"dil chahta hai",h1:"Three friends Goa trip",h2:"Farhan Akhtar debut",h3:"Akash Sid Sameer",cat:"Bollywood",diff:"medium"},

  // ── BOLLYWOOD SONGS ───────────────────────────────────────────────────────
  {e:["💃","🎵","🔥"],a:"nagada sang dhol",h1:"Ram Leela song",h2:"Deepika dances",h3:"Goliyon Ki Raasleela",cat:"Bollywood Song",diff:"medium"},
  {e:["🌧️","💔","🎸"],a:"tum hi ho",h1:"Aashiqui 2 song",h2:"Arijit Singh sang it",h3:"Sad romantic",cat:"Bollywood Song",diff:"easy"},
  {e:["🌙","💕","🎵"],a:"tujhe kitna chahne lage",h1:"Kabir Singh song",h2:"Arijit Singh voice",h3:"Shahid Kapoor film",cat:"Bollywood Song",diff:"easy"},
  {e:["🎊","💃","🥁"],a:"desi girl",h1:"Dostana party song",h2:"Priyanka Chopra",h3:"John Abraham film",cat:"Bollywood Song",diff:"easy"},
  {e:["🌹","💑","🎶"],a:"pehla nasha",h1:"Jo Jeeta song",h2:"Aamir Khan film",h3:"First love feeling",cat:"Bollywood Song",diff:"medium"},
  {e:["🕺","🎤","🌟"],a:"chaiyya chaiyya",h1:"Dil Se train song",h2:"SRK dances on top",h3:"Sukhwinder Singh",cat:"Bollywood Song",diff:"medium"},
  {e:["🎪","🎭","🎵"],a:"jai ho",h1:"Slumdog Millionaire",h2:"AR Rahman composed",h3:"Oscar winning music",cat:"Bollywood Song",diff:"easy"},
  {e:["🎸","💔","🌧️"],a:"channa mereya",h1:"Ae Dil Hai Mushkil",h2:"Arijit Singh sad",h3:"Ranbir Kapoor film",cat:"Bollywood Song",diff:"easy"},
  {e:["🌅","💕","🎵"],a:"kal ho na ho",h1:"SRK emotional song",h2:"Tomorrow may not come",h3:"Sonu Nigam sang it",cat:"Bollywood Song",diff:"easy"},
  {e:["🌺","💃","🎊"],a:"dilbar",h1:"Satyameva Jayate song",h2:"Nora Fatehi dances",h3:"Arabic fusion music",cat:"Bollywood Song",diff:"easy"},
  {e:["💛","🌸","🎶"],a:"lag ja gale",h1:"Classic Lata song",h2:"Woh Kaun Thi film",h3:"Embrace me lyrics",cat:"Bollywood Song",diff:"hard"},
  {e:["🔥","💪","🎵"],a:"zinda",h1:"Bhaag Milkha motivational",h2:"Siddharth Mahadevan",h3:"Keep going lyrics",cat:"Bollywood Song",diff:"hard"},
  {e:["🎵","🌊","💕"],a:"raabta",h1:"Agent Sashi song",h2:"Deep connection meaning",h3:"Sushant and Kriti",cat:"Bollywood Song",diff:"hard"},
  {e:["💃","🌈","🎉"],a:"deva shree ganesha",h1:"Agneepath devotional",h2:"Hrithik Roshan film",h3:"Ganpati prayer song",cat:"Bollywood Song",diff:"medium"},

  // ── CRICKET ───────────────────────────────────────────────────────────────
  {e:["🏏","👑","🇮🇳"],a:"virat kohli",h1:"Indian batting legend",h2:"Run machine",h3:"King Kohli",cat:"Cricket",diff:"easy"},
  {e:["🌙","🏟️","⚡"],a:"ipl",h1:"T20 cricket league",h2:"Franchise tournament",h3:"Indian Premier League",cat:"Cricket",diff:"easy"},
  {e:["🏆","2011","🎉"],a:"world cup",h1:"Cricket biggest trophy",h2:"India won at home",h3:"MS Dhoni six",cat:"Cricket",diff:"easy"},
  {e:["🧤","🚁","💥"],a:"helicopter shot",h1:"Famous batting stroke",h2:"MS Dhoni signature",h3:"Ball over fine leg",cat:"Cricket",diff:"medium"},
  {e:["👴","🏏","📖"],a:"sachin tendulkar",h1:"God of cricket",h2:"100 international centuries",h3:"Master Blaster",cat:"Cricket",diff:"easy"},
  {e:["🐅","🏏","🟡"],a:"chennai super kings",h1:"IPL franchise",h2:"Dhoni team",h3:"Whistle Podu",cat:"Cricket",diff:"medium"},
  {e:["🔵","💜","🏆"],a:"mumbai indians",h1:"Most IPL titles",h2:"Wankhede stadium",h3:"MI paltan",cat:"Cricket",diff:"medium"},
  {e:["🥊","⚡","🏏"],a:"yorker",h1:"Ball pitched at feet",h2:"Hardest delivery",h3:"Waqar Younis master",cat:"Cricket",diff:"medium"},
  {e:["🏃","🔄","🏏"],a:"run out",h1:"Dismissal in cricket",h2:"Batsman out of crease",h3:"Direct hit wicket",cat:"Cricket",diff:"easy"},
  {e:["🏏","🇦🇺","🏆"],a:"ashes",h1:"England vs Australia",h2:"Urn filled with ashes",h3:"Oldest cricket rivalry",cat:"Cricket",diff:"hard"},
  {e:["🖐️","🏏","🌀"],a:"spin bowling",h1:"Slow tricky delivery",h2:"Ball rotates in air",h3:"Warne and Murali",cat:"Cricket",diff:"medium"},
  {e:["🏏","🇿🇦","⚡"],a:"ab de villiers",h1:"South Africa batsman",h2:"Mr 360 degree",h3:"ABD nickname",cat:"Cricket",diff:"medium"},
  {e:["🌙","🏏","🇵🇰"],a:"wasim akram",h1:"Sultan of Swing",h2:"Pakistan fast bowler",h3:"Deadly left arm",cat:"Cricket",diff:"medium"},
  {e:["🏏","🇦🇺","🐦"],a:"ricky ponting",h1:"Australia captain",h2:"Punter nickname",h3:"2003 World Cup winner",cat:"Cricket",diff:"medium"},

  // ── INDIAN BRANDS ─────────────────────────────────────────────────────────
  {e:["🦁","🥛","☕"],a:"amul",h1:"Dairy brand",h2:"Utterly Butterly Delicious",h3:"Gujarat cooperative",cat:"Indian Brand",diff:"easy"},
  {e:["🚗","🔵","♾️"],a:"tata",h1:"Conglomerate group",h2:"Salt to software",h3:"Ratan Tata legacy",cat:"Indian Brand",diff:"easy"},
  {e:["🛵","💚","🤝"],a:"ola",h1:"Ride sharing app",h2:"Book a cab scooter",h3:"Indian Uber rival",cat:"Indian Brand",diff:"easy"},
  {e:["📱","💙","🇮🇳"],a:"flipkart",h1:"E-commerce giant",h2:"Big Billion Days sale",h3:"Sachin Bansal founded",cat:"Indian Brand",diff:"medium"},
  {e:["💊","🌿","🇮🇳"],a:"patanjali",h1:"Ayurvedic brand",h2:"Baba Ramdev company",h3:"Yoga plus FMCG",cat:"Indian Brand",diff:"easy"},
  {e:["🍕","🛵","⏱️"],a:"swiggy",h1:"Food delivery app",h2:"Orange delivery bags",h3:"Instamart groceries",cat:"Indian Brand",diff:"easy"},
  {e:["🏦","💸","📲"],a:"paytm",h1:"Digital payments",h2:"One97 Communications",h3:"Scan QR and pay",cat:"Indian Brand",diff:"easy"},
  {e:["🍔","🔴","⚡"],a:"zomato",h1:"Food delivery platform",h2:"Red color branding",h3:"Restaurant discovery",cat:"Indian Brand",diff:"easy"},
  {e:["🎓","📱","🔶"],a:"byjus",h1:"EdTech unicorn",h2:"Learning app",h3:"Think and Learn",cat:"Indian Brand",diff:"medium"},
  {e:["🚕","🟡","🏙️"],a:"rapido",h1:"Bike taxi app",h2:"Two wheeler rides",h3:"Budget ride India",cat:"Indian Brand",diff:"medium"},
  {e:["🏍️","🔴","💨"],a:"royal enfield",h1:"Iconic Indian motorcycle",h2:"Bullet model famous",h3:"Chennai manufactured",cat:"Indian Brand",diff:"easy"},
  {e:["✈️","🔵","🇮🇳"],a:"air india",h1:"National carrier India",h2:"Maharaja mascot",h3:"Tata group owns",cat:"Indian Brand",diff:"easy"},
  {e:["🏦","🔵","🇮🇳"],a:"sbi",h1:"State Bank of India",h2:"Largest Indian bank",h3:"Government owned",cat:"Indian Brand",diff:"easy"},
  {e:["🍵","🌿","🔴"],a:"tata tea",h1:"Indian tea brand",h2:"Jaago Re campaign",h3:"Tata Consumer product",cat:"Indian Brand",diff:"medium"},
  {e:["🧴","🌿","💚"],a:"dabur",h1:"Indian FMCG company",h2:"Chyawanprash famous",h3:"Real juice brand",cat:"Indian Brand",diff:"easy"},
  {e:["🛒","🟠","📦"],a:"amazon india",h1:"E-commerce marketplace",h2:"Prime membership",h3:"Jeff Bezos founded",cat:"Indian Brand",diff:"easy"},
  {e:["🍽️","🟠","🚗"],a:"zomato gold",h1:"Premium dining membership",h2:"Zomato subscription",h3:"Discounts at restaurants",cat:"Indian Brand",diff:"medium"},
  {e:["🧴","🌸","💛"],a:"himalaya",h1:"Herbal healthcare brand",h2:"Neem face wash",h3:"Since 1930 India",cat:"Indian Brand",diff:"medium"},

  // ── INDIAN HISTORY ─────────────────────────────────────────────────────────
  {e:["🧳","✊","🇮🇳"],a:"mahatma gandhi",h1:"Father of Nation",h2:"Non violence champion",h3:"Dandi March leader",cat:"Indian History",diff:"easy"},
  {e:["🔫","✊","🎯"],a:"bhagat singh",h1:"Revolutionary fighter",h2:"Hanged at age 23",h3:"Inquilab Zindabad",cat:"Indian History",diff:"easy"},
  {e:["🌹","👸","✊"],a:"rani laxmibai",h1:"Queen of Jhansi",h2:"Warrior queen India",h3:"Meri Jhansi nahi dunga",cat:"Indian History",diff:"easy"},
  {e:["📖","🕊️","✊"],a:"b r ambedkar",h1:"Constitution maker",h2:"Dalit rights champion",h3:"Bharat Ratna awardee",cat:"Indian History",diff:"medium"},
  {e:["🎤","🌹","🇮🇳"],a:"jawaharlal nehru",h1:"First Prime Minister",h2:"Tryst with Destiny",h3:"Chacha Nehru",cat:"Indian History",diff:"easy"},
  {e:["🌙","✊","🔥"],a:"subhas chandra bose",h1:"Netaji",h2:"INA commander",h3:"Azad Hind Fauj",cat:"Indian History",diff:"easy"},
  {e:["🧘","🌍","✊"],a:"swami vivekananda",h1:"Chicago speech 1893",h2:"Ramakrishna Mission",h3:"Sisters and Brothers America",cat:"Indian History",diff:"medium"},
  {e:["🌸","🎨","✊"],a:"rabindranath tagore",h1:"Jana Gana Mana writer",h2:"Nobel Prize Literature",h3:"Gitanjali poet",cat:"Indian History",diff:"medium"},
  {e:["🔭","💡","🇮🇳"],a:"apj abdul kalam",h1:"Missile Man India",h2:"11th President",h3:"Wings of Fire book",cat:"Indian History",diff:"easy"},
  {e:["🏏","🌟","🇮🇳"],a:"milkha singh",h1:"Flying Sikh",h2:"Rome Olympics 1960",h3:"400m runner",cat:"Indian History",diff:"medium"},

  // ── MYTHOLOGY ─────────────────────────────────────────────────────────────
  {e:["🐘","🌺","✨"],a:"ganesha",h1:"Elephant head god",h2:"Remover of obstacles",h3:"Modak is favourite",cat:"Mythology",diff:"easy"},
  {e:["🔱","🌊","💙"],a:"shiva",h1:"Destroyer god",h2:"Third eye god",h3:"Mahadev",cat:"Mythology",diff:"easy"},
  {e:["🌸","💛","🌺"],a:"lakshmi",h1:"Goddess of wealth",h2:"Lotus flower goddess",h3:"Vishnu consort",cat:"Mythology",diff:"easy"},
  {e:["🏹","👑","🌿"],a:"rama",h1:"7th avatar of Vishnu",h2:"King of Ayodhya",h3:"Ramayana hero",cat:"Mythology",diff:"easy"},
  {e:["🦚","🎵","💙"],a:"krishna",h1:"8th avatar of Vishnu",h2:"Flute player god",h3:"Gita preacher",cat:"Mythology",diff:"easy"},
  {e:["🐒","🏔️","💪"],a:"hanuman",h1:"Monkey god",h2:"Ram devotee",h3:"Bajrangbali",cat:"Mythology",diff:"easy"},
  {e:["🌟","⚔️","🔱"],a:"durga",h1:"Warrior goddess",h2:"Mahishasura slayer",h3:"Navratri celebrated",cat:"Mythology",diff:"easy"},
  {e:["🎭","💀","🌺"],a:"kali",h1:"Dark fierce goddess",h2:"Tongue out black goddess",h3:"Durga form",cat:"Mythology",diff:"medium"},
  {e:["🌊","🐚","🔱"],a:"varuna",h1:"God of ocean waters",h2:"Vedic deity",h3:"Cosmic order keeper",cat:"Mythology",diff:"hard"},
  {e:["☀️","🌟","🏹"],a:"surya",h1:"Sun god",h2:"Chariot with 7 horses",h3:"Karna father",cat:"Mythology",diff:"medium"},
  {e:["💨","🌪️","⚡"],a:"vayu",h1:"Wind god",h2:"Hanuman father",h3:"Bhima father too",cat:"Mythology",diff:"hard"},
  {e:["🐍","🏔️","⚡"],a:"indra",h1:"King of gods",h2:"Thunder and lightning",h3:"Arjuna father",cat:"Mythology",diff:"medium"},

  // ── WEB SERIES / OTT ──────────────────────────────────────────────────────
  {e:["🦑","🎮","💀"],a:"squid game",h1:"Korean survival drama",h2:"456 players compete",h3:"Red light green light",cat:"Web Series",diff:"easy"},
  {e:["💊","🔵","🔴"],a:"breaking bad",h1:"Chemistry teacher dealer",h2:"Walter White story",h3:"Say my name",cat:"Web Series",diff:"easy"},
  {e:["👑","⚔️","🐉"],a:"game of thrones",h1:"Westeros fantasy series",h2:"Dragons and politics",h3:"Winter is coming",cat:"Web Series",diff:"easy"},
  {e:["🏦","💰","🎭"],a:"money heist",h1:"Spanish heist series",h2:"La Casa de Papel",h3:"Bella Ciao song",cat:"Web Series",diff:"easy"},
  {e:["🌌","👶","⏰"],a:"stranger things",h1:"Upside Down world",h2:"Hawkins Indiana",h3:"Eleven has powers",cat:"Web Series",diff:"easy"},
  {e:["🏫","💊","🔥"],a:"mirzapur",h1:"UP gangster series",h2:"Amazon Prime India",h3:"Guddu Pandit story",cat:"Web Series",diff:"easy"},
  {e:["🎪","🃏","💰"],a:"scam 1992",h1:"Harshad Mehta story",h2:"Sony LIV series",h3:"Stock market scam",cat:"Web Series",diff:"easy"},
  {e:["🌴","🏘️","😂"],a:"panchayat",h1:"UP village comedy",h2:"Amazon Prime India",h3:"Abhishek secretary",cat:"Web Series",diff:"medium"},
  {e:["🦸","🕷️","🏙️"],a:"daredevil",h1:"Blind Marvel superhero",h2:"Hell Kitchen lawyer",h3:"Matt Murdock",cat:"Web Series",diff:"medium"},
  {e:["🔍","🧠","🎩"],a:"sherlock",h1:"BBC detective series",h2:"Benedict Cumberbatch",h3:"221B Baker Street",cat:"Web Series",diff:"easy"},
  {e:["👨‍👩‍👧","🔪","💀"],a:"delhi crime",h1:"Nirbhaya case series",h2:"Netflix India",h3:"DCP Vartika story",cat:"Web Series",diff:"medium"},
  {e:["🎭","🏙️","🌙"],a:"sacred games",h1:"Mumbai crime series",h2:"Netflix India",h3:"Sartaj Singh cop",cat:"Web Series",diff:"medium"},
  {e:["🧪","🔬","🕵️"],a:"breathe",h1:"Amazon Prime thriller",h2:"R Madhavan stars",h3:"Organ donation angle",cat:"Web Series",diff:"hard"},
  {e:["🤵","🔫","🌍"],a:"family man",h1:"Spy thriller series",h2:"Manoj Bajpayee",h3:"TASC agent story",cat:"Web Series",diff:"easy"},

  // ── VIDEO GAMES ───────────────────────────────────────────────────────────
  {e:["🔫","🏝️","🪂"],a:"pubg",h1:"Battle royale game",h2:"PlayerUnknown Battlegrounds",h3:"Chicken dinner winner",cat:"Games",diff:"easy"},
  {e:["🔥","💎","🏃"],a:"free fire",h1:"Mobile battle royale",h2:"Garena made it",h3:"Squad of 4 players",cat:"Games",diff:"easy"},
  {e:["⛏️","🌍","🏗️"],a:"minecraft",h1:"Block building game",h2:"Steve is character",h3:"Creeper goes boom",cat:"Games",diff:"easy"},
  {e:["🏎️","🍄","🌈"],a:"mario kart",h1:"Nintendo racing game",h2:"Mario drives kart",h3:"Rainbow Road hardest",cat:"Games",diff:"easy"},
  {e:["🧟","🌿","🔫"],a:"last of us",h1:"Zombie apocalypse game",h2:"Joel and Ellie",h3:"Fungal infection",cat:"Games",diff:"medium"},
  {e:["🧝","⚔️","🌍"],a:"the witcher",h1:"Monster hunter RPG",h2:"Geralt of Rivia",h3:"White Wolf",cat:"Games",diff:"medium"},
  {e:["🏰","⚔️","👑"],a:"clash of clans",h1:"Village building game",h2:"Supercell made it",h3:"Barbarian and Archer",cat:"Games",diff:"easy"},
  {e:["🎯","🔫","💥"],a:"valorant",h1:"Tactical shooter game",h2:"Riot Games made it",h3:"5v5 agent abilities",cat:"Games",diff:"easy"},
  {e:["🌌","🚀","⭐"],a:"among us",h1:"Spaceship imposter",h2:"InnerSloth made it",h3:"Sus means suspicious",cat:"Games",diff:"easy"},
  {e:["🏙️","🚗","🔫"],a:"gta",h1:"Grand Theft Auto",h2:"Open world crime",h3:"Rockstar Games",cat:"Games",diff:"easy"},
  {e:["🐉","🧙","⚔️"],a:"dungeons and dragons",h1:"Classic tabletop RPG",h2:"Dungeon master leads",h3:"Roll the dice",cat:"Games",diff:"medium"},
  {e:["🌸","⚔️","🎎"],a:"ghost of tsushima",h1:"Samurai open world game",h2:"Japan setting",h3:"Jin Sakai warrior",cat:"Games",diff:"hard"},
  {e:["🌊","🏹","🌿"],a:"zelda",h1:"Nintendo adventure game",h2:"Link is the hero",h3:"Princess Zelda",cat:"Games",diff:"easy"},
  {e:["🔴","⬜","🎮"],a:"pokemon",h1:"Gotta catch them all",h2:"Ash and Pikachu",h3:"Nintendo franchise",cat:"Games",diff:"easy"},

  // ── SPORTS ────────────────────────────────────────────────────────────────
  {e:["⚽","🌍","🏆"],a:"fifa world cup",h1:"Football biggest tournament",h2:"Every 4 years",h3:"Qatar 2022 last",cat:"Sports",diff:"easy"},
  {e:["🎾","🌟","🏆"],a:"wimbledon",h1:"Tennis grand slam",h2:"London grass court",h3:"White clothing mandatory",cat:"Sports",diff:"medium"},
  {e:["⚽","🐐","🇦🇷"],a:"lionel messi",h1:"Greatest footballer",h2:"World Cup 2022",h3:"FC Barcelona legend",cat:"Sports",diff:"easy"},
  {e:["⚽","🐐","🇵🇹"],a:"cristiano ronaldo",h1:"Portuguese footballer",h2:"CR7 nickname",h3:"Siuuuu celebration",cat:"Sports",diff:"easy"},
  {e:["🏋️","💪","🇮🇳"],a:"neeraj chopra",h1:"Indian javelin thrower",h2:"Olympic gold 2021",h3:"Tokyo Olympics hero",cat:"Sports",diff:"medium"},
  {e:["🥊","🏆","🦋"],a:"muhammad ali",h1:"Greatest boxer ever",h2:"Float like butterfly",h3:"Cassius Clay born",cat:"Sports",diff:"medium"},
  {e:["🎾","🐐","🇷🇸"],a:"novak djokovic",h1:"Serbian tennis player",h2:"Most Grand Slams",h3:"Nole nickname",cat:"Sports",diff:"medium"},
  {e:["🏀","🐐","🐂"],a:"michael jordan",h1:"Basketball legend",h2:"Chicago Bulls star",h3:"Space Jam movie",cat:"Sports",diff:"easy"},
  {e:["🏸","🥇","🇮🇳"],a:"pv sindhu",h1:"Indian badminton star",h2:"Olympic silver",h3:"Hyderabad player",cat:"Sports",diff:"medium"},
  {e:["🥋","🇮🇳","🥇"],a:"mary kom",h1:"Indian boxing champion",h2:"6 times world champ",h3:"Magnificent Mary",cat:"Sports",diff:"medium"},
  {e:["🏊","🥇","🇺🇸"],a:"michael phelps",h1:"Greatest swimmer",h2:"23 Olympic gold medals",h3:"USA swimming",cat:"Sports",diff:"medium"},
  {e:["🏃","🥇","🇯🇲"],a:"usain bolt",h1:"Fastest man alive",h2:"100m world record",h3:"Lightning Bolt Jamaica",cat:"Sports",diff:"easy"},
  {e:["🎾","🐐","🇨🇭"],a:"roger federer",h1:"Swiss tennis legend",h2:"20 Grand Slams",h3:"Most elegant player",cat:"Sports",diff:"medium"},
  {e:["⚽","🔴","🏴󠁧󠁢󠁥󠁮󠁧󠁿"],a:"manchester united",h1:"Premier League club",h2:"Old Trafford stadium",h3:"Red Devils nickname",cat:"Sports",diff:"easy"},
  {e:["⚽","🔵","🇪🇸"],a:"fc barcelona",h1:"Spanish football club",h2:"Camp Nou stadium",h3:"Barca nickname",cat:"Sports",diff:"easy"},

  // ── FESTIVALS ─────────────────────────────────────────────────────────────
  {e:["🪔","🎆","🍬"],a:"diwali",h1:"Festival of Lights",h2:"Lakshmi puja night",h3:"Diyas are lit",cat:"Festival",diff:"easy"},
  {e:["🎨","💦","🌈"],a:"holi",h1:"Festival of Colors",h2:"Gulal thrown",h3:"Bhaang traditional",cat:"Festival",diff:"easy"},
  {e:["🐑","🙏","🌙"],a:"eid",h1:"Muslim festival",h2:"After Ramzan fasting",h3:"Sevaiyan is sweet",cat:"Festival",diff:"easy"},
  {e:["🌾","💛","🥁"],a:"baisakhi",h1:"Punjabi harvest festival",h2:"Sikh new year",h3:"Bhangra dance",cat:"Festival",diff:"medium"},
  {e:["🐘","🎺","🌺"],a:"ganesh chaturthi",h1:"Elephant god festival",h2:"11 days celebration",h3:"Mumbai grand",cat:"Festival",diff:"easy"},
  {e:["💃","🌙","⭐"],a:"navratri",h1:"Nine nights festival",h2:"Garba dance event",h3:"Durga worshipped",cat:"Festival",diff:"easy"},
  {e:["🎋","⭐","📜"],a:"christmas",h1:"Jesus Christ birthday",h2:"December 25th",h3:"Santa gives gifts",cat:"Festival",diff:"easy"},
  {e:["🔥","💃","🌺"],a:"onam",h1:"Kerala harvest festival",h2:"King Mahabali returns",h3:"Pookalam design",cat:"Festival",diff:"medium"},
  {e:["🌟","🪔","🎊"],a:"dussehra",h1:"Ravana burned",h2:"Ram victory day",h3:"Good over evil",cat:"Festival",diff:"easy"},
  {e:["🌸","🎊","🥀"],a:"holi milan",h1:"Meeting after Holi",h2:"Forgiveness tradition",h3:"Colors washed off",cat:"Festival",diff:"hard"},
  {e:["🎁","⭐","❄️"],a:"new year",h1:"January 1st celebration",h2:"Fireworks midnight",h3:"Resolution making",cat:"Festival",diff:"easy"},
  {e:["🕯️","✡️","🔢"],a:"hanukkah",h1:"Jewish festival of lights",h2:"8 nights candles",h3:"Menorah lighting",cat:"Festival",diff:"medium"},

  // ── INDIAN PLACES ─────────────────────────────────────────────────────────
  {e:["🕌","💕","🇮🇳"],a:"taj mahal",h1:"Wonder of the world",h2:"Shah Jahan built it",h3:"Agra Uttar Pradesh",cat:"Indian Place",diff:"easy"},
  {e:["🌊","🏖️","🎭"],a:"goa",h1:"Beach state India",h2:"Portuguese colony",h3:"Feni local drink",cat:"Indian Place",diff:"easy"},
  {e:["🌄","🍵","🌿"],a:"darjeeling",h1:"Tea gardens famous",h2:"West Bengal hill",h3:"Toy train heritage",cat:"Indian Place",diff:"medium"},
  {e:["🏔️","❄️","🇮🇳"],a:"kashmir",h1:"Heaven on Earth",h2:"Dal Lake famous",h3:"Srinagar capital",cat:"Indian Place",diff:"easy"},
  {e:["🕍","🌅","🇮🇳"],a:"varanasi",h1:"Oldest living city",h2:"Ganga ghat famous",h3:"Kashi Vishwanath",cat:"Indian Place",diff:"easy"},
  {e:["💛","🐘","🌴"],a:"kerala",h1:"God Own Country",h2:"Backwaters famous",h3:"Onam celebrated",cat:"Indian Place",diff:"easy"},
  {e:["🏯","🌅","🔵"],a:"rajasthan",h1:"Land of Kings",h2:"Jaipur Pink City",h3:"Thar desert state",cat:"Indian Place",diff:"easy"},
  {e:["💰","💻","🌆"],a:"bangalore",h1:"Silicon Valley India",h2:"IT hub city",h3:"Garden City",cat:"Indian Place",diff:"easy"},
  {e:["🌊","🐟","🌴"],a:"mumbai",h1:"City of Dreams",h2:"Financial capital",h3:"Bollywood home",cat:"Indian Place",diff:"easy"},
  {e:["🎭","🌆","🌊"],a:"kolkata",h1:"City of Joy",h2:"Victoria Memorial",h3:"Durga Puja grand",cat:"Indian Place",diff:"easy"},
  {e:["🏔️","🧘","🌸"],a:"rishikesh",h1:"Yoga capital world",h2:"Uttarakhand Ganga",h3:"Bungee jumping",cat:"Indian Place",diff:"medium"},
  {e:["🌾","🏛️","🌞"],a:"amritsar",h1:"Golden Temple city",h2:"Punjab holy city",h3:"Wagah border nearby",cat:"Indian Place",diff:"easy"},
  {e:["🦁","🌿","🐆"],a:"ranthambore",h1:"Famous tiger reserve",h2:"Rajasthan jungle",h3:"Project Tiger",cat:"Indian Place",diff:"medium"},

  // ── ANIMALS ───────────────────────────────────────────────────────────────
  {e:["🐅","🌿","🇮🇳"],a:"bengal tiger",h1:"India national animal",h2:"Endangered big cat",h3:"Sundarban forests",cat:"Animal",diff:"easy"},
  {e:["🦚","💚","🇮🇳"],a:"peacock",h1:"India national bird",h2:"Beautiful feathers",h3:"Dances in rain",cat:"Animal",diff:"easy"},
  {e:["🐘","🌿","🧠"],a:"elephant",h1:"Largest land animal",h2:"Never forgets",h3:"Trunk is nose",cat:"Animal",diff:"easy"},
  {e:["🦁","👑","🌍"],a:"lion",h1:"King of jungle",h2:"Social big cat",h3:"Savanna lives",cat:"Animal",diff:"easy"},
  {e:["🐬","🌊","😄"],a:"dolphin",h1:"Intelligent sea mammal",h2:"Echolocation ability",h3:"Jumps out water",cat:"Animal",diff:"easy"},
  {e:["🐧","❄️","🐟"],a:"penguin",h1:"Cannot fly bird",h2:"Antarctica lives",h3:"Waddles to walk",cat:"Animal",diff:"easy"},
  {e:["🦒","🌿","🔶"],a:"giraffe",h1:"Tallest land animal",h2:"Long neck animal",h3:"Africa savanna",cat:"Animal",diff:"easy"},
  {e:["🐊","🌊","😬"],a:"crocodile",h1:"Prehistoric reptile",h2:"Strongest bite force",h3:"Mugger in India",cat:"Animal",diff:"easy"},
  {e:["🦅","🏔️","✈️"],a:"eagle",h1:"National bird USA",h2:"Excellent eyesight",h3:"Bald eagle famous",cat:"Animal",diff:"easy"},
  {e:["🦓","🌿","⬛"],a:"zebra",h1:"Striped African animal",h2:"Horse family member",h3:"Each stripe unique",cat:"Animal",diff:"easy"},
  {e:["🐋","🌊","💙"],a:"blue whale",h1:"Largest animal ever",h2:"Ocean mammal",h3:"30m length",cat:"Animal",diff:"easy"},
  {e:["🦘","🌿","🥊"],a:"kangaroo",h1:"Australian marsupial",h2:"Joey in pouch",h3:"Hops to move",cat:"Animal",diff:"easy"},

  // ── FOOD (GLOBAL + INDIAN) ─────────────────────────────────────────────────
  {e:["🍣","🍱"],a:"sushi",h1:"Japanese cuisine",h2:"Raw fish on rice",h3:"Wasabi and ginger",cat:"Food",diff:"easy"},
  {e:["🍕","🇮🇹"],a:"pizza",h1:"Italian dish",h2:"Round with toppings",h3:"Mozzarella tomato",cat:"Food",diff:"easy"},
  {e:["🌮","🇲🇽"],a:"taco",h1:"Mexican street food",h2:"Folded tortilla",h3:"Salsa and guacamole",cat:"Food",diff:"easy"},
  {e:["🍜","🥢"],a:"noodles",h1:"Long pasta",h2:"Asia favourite carb",h3:"Ramen Pad Thai Hakka",cat:"Food",diff:"easy"},
  {e:["🍛","🌶️","🇮🇳"],a:"biryani",h1:"Layered rice dish",h2:"Dum cooking method",h3:"Hyderabadi most famous",cat:"Food",diff:"easy"},
  {e:["☕","🥛","💨"],a:"cappuccino",h1:"Italian coffee drink",h2:"Espresso milk foam",h3:"Served in small cup",cat:"Food",diff:"medium"},
  {e:["🍲","🇰🇷"],a:"kimchi",h1:"Korean fermented dish",h2:"Spicy cabbage",h3:"K cuisine staple",cat:"Food",diff:"medium"},
  {e:["🍦","🍦"],a:"ice cream",h1:"Frozen dessert",h2:"Vanilla chocolate",h3:"Cone or cup",cat:"Food",diff:"easy"},
  {e:["🫓","🥘","🌶️"],a:"pav bhaji",h1:"Mumbai street food",h2:"Butter pav with curry",h3:"Chowpatty famous",cat:"Food",diff:"easy"},
  {e:["🥟","🍵","🌶️"],a:"momos",h1:"Tibetan dumplings",h2:"Steam or fry",h3:"Chutney with it",cat:"Food",diff:"easy"},
  {e:["🍞","🥗","🧆"],a:"chole bhature",h1:"Punjab famous dish",h2:"Fried bread curry",h3:"Chickpea gravy",cat:"Food",diff:"easy"},
  {e:["🍢","🌶️","😮"],a:"pani puri",h1:"Golgappa street food",h2:"Spicy water inside",h3:"Explosion of flavor",cat:"Food",diff:"easy"},
  {e:["🍗","🧅","🌶️"],a:"butter chicken",h1:"Murgh Makhani",h2:"Delhi famous dish",h3:"Creamy tomato gravy",cat:"Food",diff:"easy"},
  {e:["🥣","🌿","🥛"],a:"lassi",h1:"Yogurt drink",h2:"Punjab famous",h3:"Sweet or salty",cat:"Food",diff:"easy"},
  {e:["🧁","🥛","🍯"],a:"gulab jamun",h1:"Indian sweet",h2:"Fried milk balls",h3:"Sugar syrup soaked",cat:"Food",diff:"easy"},
  {e:["🌾","🥛","🍯"],a:"kheer",h1:"Rice pudding dessert",h2:"Milk and sugar",h3:"Festival special",cat:"Food",diff:"easy"},
  {e:["🥞","🍯","🧈"],a:"dosa",h1:"South Indian crepe",h2:"Fermented batter",h3:"Masala inside",cat:"Food",diff:"easy"},
  {e:["🍚","🥥","🌶️"],a:"idli sambar",h1:"South Indian breakfast",h2:"Steamed rice cakes",h3:"Coconut chutney",cat:"Food",diff:"easy"},
  {e:["🫔","🥬","🌶️"],a:"frankies",h1:"Mumbai wrap snack",h2:"Tibbs Frankie famous",h3:"Egg or veg filling",cat:"Food",diff:"medium"},
  {e:["🌯","🥩","🧅"],a:"shawarma",h1:"Middle Eastern wrap",h2:"Rotating meat spit",h3:"Kerala famous it",cat:"Food",diff:"easy"},

  // ── SCIENCE ───────────────────────────────────────────────────────────────
  {e:["🌍","🔄","🌡️"],a:"climate change",h1:"Global warming",h2:"CO2 emissions",h3:"Paris Agreement",cat:"Science",diff:"medium"},
  {e:["🌕","🚀","👨‍🚀"],a:"moon landing",h1:"Apollo 11 mission",h2:"1969 achievement",h3:"Neil Armstrong",cat:"Science",diff:"medium"},
  {e:["🧬","🔬"],a:"dna",h1:"Genetic code",h2:"Double helix",h3:"Found in every cell",cat:"Science",diff:"medium"},
  {e:["⚡","🌩️"],a:"lightning",h1:"Electrical discharge",h2:"Thunderstorm phenomenon",h3:"Franklin researched it",cat:"Science",diff:"easy"},
  {e:["🌊","🔄","🌧️"],a:"water cycle",h1:"Evaporation rainfall",h2:"Clouds form",h3:"Hydrological cycle",cat:"Science",diff:"easy"},
  {e:["🐛","🦋"],a:"metamorphosis",h1:"Complete transformation",h2:"Caterpillar butterfly",h3:"4 stages",cat:"Science",diff:"medium"},
  {e:["🌋","💨"],a:"volcano",h1:"Mountain that erupts",h2:"Lava and ash",h3:"Krakatoa Vesuvius",cat:"Science",diff:"easy"},
  {e:["⭐","💥","⚫"],a:"black hole",h1:"Extreme space object",h2:"Nothing escapes gravity",h3:"Event horizon",cat:"Science",diff:"medium"},
  {e:["🧲","⬆️"],a:"gravity",h1:"Force pulling down",h2:"Newton apple story",h3:"9.8 m/s Earth",cat:"Science",diff:"easy"},
  {e:["☀️","🌍","🔄"],a:"solar system",h1:"8 planets orbit sun",h2:"Milky Way part",h3:"Earth third planet",cat:"Science",diff:"easy"},
  {e:["🌈","💧","☀️"],a:"light refraction",h1:"Bending of light",h2:"Prism splits colors",h3:"Rainbow formation",cat:"Science",diff:"medium"},
  {e:["🔬","🦠","💉"],a:"bacteria",h1:"Single cell organism",h2:"Can cause disease",h3:"Antibiotics kill it",cat:"Science",diff:"medium"},
  {e:["🫁","❤️","🩸"],a:"human body",h1:"Organs working",h2:"60 percent water",h3:"206 bones total",cat:"Science",diff:"easy"},
  {e:["⚛️","💥","☢️"],a:"nuclear energy",h1:"Power from atoms",h2:"Uranium and plutonium",h3:"Chernobyl example",cat:"Science",diff:"medium"},
  {e:["🌡️","🔥","❄️"],a:"temperature",h1:"Measure of heat",h2:"Celsius Fahrenheit",h3:"Thermometer measures",cat:"Science",diff:"easy"},

  // ── GLOBAL BRANDS ─────────────────────────────────────────────────────────
  {e:["🌙","☕"],a:"starbucks",h1:"Famous coffee chain",h2:"Mermaid logo",h3:"Frappuccino drink",cat:"Brand",diff:"easy"},
  {e:["🍔","🍟","🟡"],a:"mcdonalds",h1:"Fast food chain",h2:"Golden arches logo",h3:"Big Mac Happy Meal",cat:"Brand",diff:"easy"},
  {e:["🍎","🖥️"],a:"apple",h1:"Tech company",h2:"Steve Jobs founded",h3:"iPhone MacBook maker",cat:"Brand",diff:"easy"},
  {e:["🛍️","🟠"],a:"amazon",h1:"E-commerce giant",h2:"Smile logo",h3:"Jeff Bezos founded",cat:"Brand",diff:"easy"},
  {e:["👟","✅"],a:"nike",h1:"Sports brand",h2:"Just Do It",h3:"Swoosh logo",cat:"Brand",diff:"easy"},
  {e:["🚙","⚡","🔴"],a:"tesla",h1:"Electric car company",h2:"Elon Musk company",h3:"Model S X 3 Y",cat:"Brand",diff:"easy"},
  {e:["🍫","🟣"],a:"cadbury",h1:"Chocolate brand",h2:"Purple packaging",h3:"Dairy Milk",cat:"Brand",diff:"easy"},
  {e:["🔵","🤿","⌚"],a:"samsung",h1:"Korean electronics",h2:"Galaxy phone series",h3:"Competes with Apple",cat:"Brand",diff:"easy"},
  {e:["🎮","🎯","🔵"],a:"sony",h1:"Japanese electronics",h2:"PlayStation maker",h3:"Bravia TVs",cat:"Brand",diff:"easy"},
  {e:["🎮","🔴","⭕"],a:"playstation",h1:"Sony gaming console",h2:"PS5 is latest",h3:"God of War",cat:"Brand",diff:"easy"},
  {e:["🟢","🎮","🏠"],a:"xbox",h1:"Microsoft gaming console",h2:"Halo exclusive",h3:"Game Pass",cat:"Brand",diff:"easy"},
  {e:["🐊","👕"],a:"lacoste",h1:"French fashion brand",h2:"Crocodile logo",h3:"Tennis heritage",cat:"Brand",diff:"medium"},
  {e:["☕","🟤"],a:"nescafe",h1:"Instant coffee brand",h2:"Nestle product",h3:"Red mug logo",cat:"Brand",diff:"easy"},
  {e:["🐎","👟"],a:"mustang",h1:"Ford sports car",h2:"Horse logo",h3:"American muscle",cat:"Brand",diff:"medium"},
  {e:["🌍","🤝"],a:"united nations",h1:"International org",h2:"193 member countries",h3:"Peacekeeping body",cat:"Brand",diff:"medium"},

  // ── GLOBAL PLACES ─────────────────────────────────────────────────────────
  {e:["🗼","🥐"],a:"paris",h1:"City of Love",h2:"Eiffel Tower",h3:"Capital of France",cat:"Place",diff:"easy"},
  {e:["🗽","🍎"],a:"new york",h1:"The Big Apple",h2:"Times Square",h3:"Empire State Building",cat:"Place",diff:"easy"},
  {e:["🍵","🌸","🗻"],a:"japan",h1:"Land of Rising Sun",h2:"Mount Fuji country",h3:"Tokyo capital",cat:"Place",diff:"easy"},
  {e:["🛕","🧘","🐘"],a:"india",h1:"Billion+ population",h2:"Namaste and spices",h3:"Taj Mahal country",cat:"Place",diff:"easy"},
  {e:["🦘","🤿","🌞"],a:"australia",h1:"Land Down Under",h2:"Kangaroos and koalas",h3:"Sydney Opera House",cat:"Place",diff:"easy"},
  {e:["⛩️","🐉","🥢"],a:"china",h1:"Great Wall country",h2:"Dragon culture",h3:"Beijing capital",cat:"Place",diff:"easy"},
  {e:["🌺","🏄","🌋"],a:"hawaii",h1:"US island state",h2:"Aloha culture",h3:"Pineapple surfing",cat:"Place",diff:"easy"},
  {e:["🎻","🏔️","🧀"],a:"switzerland",h1:"Neutral European country",h2:"Alps and cheese",h3:"Swiss watches",cat:"Place",diff:"medium"},
  {e:["🌮","⚽","🌵"],a:"mexico",h1:"North American country",h2:"Tacos and tequila",h3:"Chichen Itza",cat:"Place",diff:"easy"},
  {e:["🏰","🍺"],a:"germany",h1:"Beer and castles",h2:"Oktoberfest",h3:"Berlin capital",cat:"Place",diff:"easy"},
  {e:["🌷","🏔️","💎"],a:"netherlands",h1:"Tulips and windmills",h2:"Amsterdam capital",h3:"Cheese famous",cat:"Place",diff:"medium"},
  {e:["🦁","🌍"],a:"africa",h1:"Largest continent",h2:"Sahara desert",h3:"Safari wildlife",cat:"Place",diff:"easy"},
  {e:["🎭","🍝"],a:"rome",h1:"Eternal City",h2:"Colosseum famous",h3:"Italy capital",cat:"Place",diff:"easy"},
  {e:["🌉","🌁","🦀"],a:"san francisco",h1:"Golden Gate Bridge city",h2:"Silicon Valley nearby",h3:"California USA",cat:"Place",diff:"medium"},
  {e:["🏙️","🎆","🌃"],a:"dubai",h1:"UAE city",h2:"Burj Khalifa tallest",h3:"Gold souk famous",cat:"Place",diff:"easy"},
  {e:["❄️","🌌","🦌"],a:"norway",h1:"Northern lights country",h2:"Fjords landscape",h3:"Oslo capital",cat:"Place",diff:"medium"},
  {e:["☕","🧇","💎"],a:"belgium",h1:"Chocolate waffle country",h2:"Brussels capital",h3:"Bruges medieval city",cat:"Place",diff:"medium"},

  // ── WORDS / PHRASES ───────────────────────────────────────────────────────
  {e:["📚","🐛"],a:"bookworm",h1:"Loves reading",h2:"A tiny creature",h3:"Lives in books",cat:"Word",diff:"easy"},
  {e:["🌧️","☀️"],a:"rainbow",h1:"Colourful arc after rain",h2:"7 colours ROYGBIV",h3:"Pot of gold at end",cat:"Word",diff:"easy"},
  {e:["🔥","💧"],a:"firefighter",h1:"Emergency service",h2:"Hose and ladder",h3:"Puts out fires",cat:"Word",diff:"easy"},
  {e:["🌙","😴"],a:"midnight",h1:"12 AM exactly",h2:"Middle of night",h3:"Cinderella deadline",cat:"Word",diff:"easy"},
  {e:["💡","🧠"],a:"brainwave",h1:"Sudden smart idea",h2:"Lightbulb moment",h3:"Flash of inspiration",cat:"Word",diff:"medium"},
  {e:["⏰","🏃"],a:"deadline",h1:"Last moment for work",h2:"Submit before it",h3:"Office nightmare",cat:"Word",diff:"easy"},
  {e:["🌅","🌄"],a:"sunrise",h1:"Start of new day",h2:"Sun on horizon",h3:"Golden hour morning",cat:"Word",diff:"easy"},
  {e:["🎲","🎯"],a:"bullseye",h1:"Perfect hit target",h2:"Dead center",h3:"Dart board center",cat:"Word",diff:"easy"},
  {e:["🧘","💆","🕊️"],a:"meditation",h1:"Mind calming practice",h2:"Eyes closed sitting",h3:"Buddha practiced it",cat:"Word",diff:"easy"},
  {e:["🏃","🏅","🎯"],a:"marathon",h1:"42km running race",h2:"Athens Greece origin",h3:"Endurance sport",cat:"Word",diff:"easy"},
  {e:["💭","😴","🌙"],a:"dream",h1:"Sleeping visions",h2:"REM sleep stage",h3:"Subconscious mind",cat:"Word",diff:"easy"},
  {e:["🌊","🏖️","🐚"],a:"ocean",h1:"Saltwater body",h2:"Covers 71 percent Earth",h3:"Pacific is largest",cat:"Word",diff:"easy"},
  {e:["🌬️","🌪️","💨"],a:"tornado",h1:"Rotating air column",h2:"Funnel shaped cloud",h3:"Dorothy Wizard of Oz",cat:"Word",diff:"easy"},
  {e:["🔑","🗝️","🔓"],a:"encryption",h1:"Data protection",h2:"Code to hide data",h3:"HTTPS uses it",cat:"Word",diff:"medium"},
  {e:["🎪","🤹","🎠"],a:"carnival",h1:"Traveling fun fair",h2:"Rides and games",h3:"Cotton candy sold",cat:"Word",diff:"easy"},
  {e:["🌱","💧","☀️"],a:"photosynthesis",h1:"Plants make food",h2:"Chlorophyll needed",h3:"CO2 Water Sunlight",cat:"Word",diff:"medium"},
  {e:["🕊️","🌿"],a:"peace",h1:"Absence of war",h2:"Harmony and calm",h3:"Dove is symbol",cat:"Word",diff:"easy"},
  {e:["🔁","🔄"],a:"loop",h1:"Repeating sequence",h2:"Goes around",h3:"Coding construct",cat:"Word",diff:"easy"},
  {e:["🧩","💡"],a:"puzzle",h1:"Mental challenge",h2:"Pieces fit together",h3:"Crossword jigsaw",cat:"Word",diff:"easy"},
];

// ══════════════════════════════════════════════════════════════════════════════
// 🔄 INFINITE PUZZLE ENGINE — Smart shuffle so it never repeats for ages!
// ══════════════════════════════════════════════════════════════════════════════
class InfiniteEngine {
  constructor() {
    this.db = PUZZLE_DB;
    this.sessionUsed = new Set();
    // Seeded shuffle — different order each session
    this.shuffled = this._seededShuffle([...this.db], Date.now());
    this.pointer = 0;
  }

  // Seeded Fisher-Yates shuffle — same seed = same order
  _seededShuffle(arr, seed) {
    let s = seed;
    const rand = () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Get next puzzle — pointer advances, resets+reshuffles when done
  getNext(diff = null, cat = null) {
    let pool = cat ? this.db.filter(p => p.cat === cat)
               : diff ? this.db.filter(p => p.diff === diff)
               : this.shuffled;
    if (!pool.length) pool = this.db;

    // Filter unused first
    const unused = pool.filter(p => !this.sessionUsed.has(p.a));
    if (!unused.length) {
      // All done — reset and reshuffle with new seed
      this.sessionUsed.clear();
      pool = this._seededShuffle([...pool], Date.now() + Math.random() * 9999);
    }

    const src = unused.length ? unused : pool;
    const p = src[this.pointer % src.length];
    this.pointer = (this.pointer + 1) % src.length;
    this.sessionUsed.add(p.a);

    return { emojis: p.e, answer: p.a, hint1: p.h1, hint2: p.h2, hint3: p.h3, category: p.cat, difficulty: p.diff };
  }

  getDaily() {
    // Deterministic — same puzzle for everyone on same day
    const dayNum = Math.floor(Date.now() / 86400000);
    const dailyPool = this._seededShuffle([...this.db], dayNum * 31337);
    const p = dailyPool[dayNum % dailyPool.length];
    return { emojis: p.e, answer: p.a, hint1: p.h1, hint2: p.h2, hint3: p.h3, category: p.cat, difficulty: p.diff };
  }

  getTheme(cat, idx) {
    const pool = this.db.filter(p => p.cat === cat);
    if (!pool.length) return this.getNext();
    const p = pool[idx % pool.length];
    return { emojis: p.e, answer: p.a, hint1: p.h1, hint2: p.h2, hint3: p.h3, category: p.cat, difficulty: p.diff };
  }

  getStats() {
    const cats = [...new Set(this.db.map(p => p.cat))];
    return {
      total: this.db.length,
      cats: cats.length,
      easy: this.db.filter(p => p.diff === "easy").length,
      medium: this.db.filter(p => p.diff === "medium").length,
      hard: this.db.filter(p => p.diff === "hard").length,
    };
  }
}

const engine = new InfiniteEngine();

// ─── THEMES ───────────────────────────────────────────────────────────────────
const THEMES = {
  "Bollywood":      { icon:"🎬", color:"#ff6b35", gradient:"linear-gradient(135deg,#ff6b35,#f7c59f)", cat:"Bollywood" },
  "Bollywood Song": { icon:"🎵", color:"#e91e8c", gradient:"linear-gradient(135deg,#e91e8c,#f7c59f)", cat:"Bollywood Song" },
  "Cricket":        { icon:"🏏", color:"#00a651", gradient:"linear-gradient(135deg,#00a651,#a8e063)", cat:"Cricket" },
  "Indian Brand":   { icon:"🇮🇳", color:"#ff9933", gradient:"linear-gradient(135deg,#ff9933,#138808)", cat:"Indian Brand" },
  "Indian Place":   { icon:"🗺️", color:"#ff6b35", gradient:"linear-gradient(135deg,#ff6b35,#ffd700)", cat:"Indian Place" },
  "Mythology":      { icon:"🕉️", color:"#9c27b0", gradient:"linear-gradient(135deg,#9c27b0,#ff9800)", cat:"Mythology" },
  "Indian History": { icon:"🏛️", color:"#ff5722", gradient:"linear-gradient(135deg,#ff5722,#ffc107)", cat:"Indian History" },
  "Festival":       { icon:"🪔", color:"#ff9800", gradient:"linear-gradient(135deg,#ff9800,#f44336)", cat:"Festival" },
  "Food":           { icon:"🍛", color:"#ef8c8c", gradient:"linear-gradient(135deg,#ef8c8c,#f7c59f)", cat:"Food" },
  "Web Series":     { icon:"📺", color:"#e50914", gradient:"linear-gradient(135deg,#e50914,#831010)", cat:"Web Series" },
  "Games":          { icon:"🎮", color:"#6200ea", gradient:"linear-gradient(135deg,#6200ea,#00bcd4)", cat:"Games" },
  "Sports":         { icon:"🏆", color:"#ffd700", gradient:"linear-gradient(135deg,#ffd700,#ff6b35)", cat:"Sports" },
  "Science":        { icon:"🔬", color:"#60a5fa", gradient:"linear-gradient(135deg,#60a5fa,#a78bfa)", cat:"Science" },
  "Animal":         { icon:"🐯", color:"#4caf50", gradient:"linear-gradient(135deg,#4caf50,#8bc34a)", cat:"Animal" },
  "Movie":          { icon:"🎬", color:"#ff4081", gradient:"linear-gradient(135deg,#ff4081,#7c4dff)", cat:"Movie" },
  "Place":          { icon:"🌍", color:"#34d399", gradient:"linear-gradient(135deg,#34d399,#60a5fa)", cat:"Place" },
};

// ─── LANGUAGES ────────────────────────────────────────────────────────────────
const LANGUAGES = [
  {code:"en",name:"English",flag:"🇬🇧",region:"International"},
  {code:"hi",name:"हिंदी",flag:"🇮🇳",region:"Indian"},
  {code:"mr",name:"मराठी",flag:"🇮🇳",region:"Indian"},
  {code:"bn",name:"বাংলা",flag:"🇮🇳",region:"Indian"},
  {code:"te",name:"తెలుగు",flag:"🇮🇳",region:"Indian"},
  {code:"ta",name:"தமிழ்",flag:"🇮🇳",region:"Indian"},
  {code:"gu",name:"ગુજરાતી",flag:"🇮🇳",region:"Indian"},
  {code:"kn",name:"ಕನ್ನಡ",flag:"🇮🇳",region:"Indian"},
  {code:"ml",name:"മലയാളം",flag:"🇮🇳",region:"Indian"},
  {code:"pa",name:"ਪੰਜਾਬੀ",flag:"🇮🇳",region:"Indian"},
  {code:"or",name:"ଓଡ଼ିଆ",flag:"🇮🇳",region:"Indian"},
  {code:"as",name:"অসমীয়া",flag:"🇮🇳",region:"Indian"},
  {code:"ur",name:"اردو",flag:"🇮🇳",region:"Indian"},
  {code:"ne",name:"नेपाली",flag:"🇮🇳",region:"Indian"},
  {code:"sa",name:"संस्कृत",flag:"🇮🇳",region:"Indian"},
  {code:"bho",name:"भोजपुरी",flag:"🇮🇳",region:"Indian"},
  {code:"mai",name:"मैथिली",flag:"🇮🇳",region:"Indian"},
  {code:"raj",name:"राजस्थानी",flag:"🇮🇳",region:"Indian"},
  {code:"kok",name:"कोंकणी",flag:"🇮🇳",region:"Indian"},
  {code:"doi",name:"डोगरी",flag:"🇮🇳",region:"Indian"},
  {code:"sat",name:"ᱥᱟᱱᱛᱟᱲᱤ",flag:"🇮🇳",region:"Indian"},
  {code:"brx",name:"बड़ो",flag:"🇮🇳",region:"Indian"},
  {code:"mni",name:"মৈতৈলোন্",flag:"🇮🇳",region:"Indian"},
  {code:"sd",name:"سنڌي",flag:"🇮🇳",region:"Indian"},
  {code:"ks",name:"كٲشُر",flag:"🇮🇳",region:"Indian"},
  {code:"es",name:"Español",flag:"🇪🇸",region:"International"},
  {code:"fr",name:"Français",flag:"🇫🇷",region:"International"},
  {code:"de",name:"Deutsch",flag:"🇩🇪",region:"International"},
  {code:"pt",name:"Português",flag:"🇧🇷",region:"International"},
  {code:"ru",name:"Русский",flag:"🇷🇺",region:"International"},
  {code:"ja",name:"日本語",flag:"🇯🇵",region:"International"},
  {code:"ko",name:"한국어",flag:"🇰🇷",region:"International"},
  {code:"zh",name:"中文",flag:"🇨🇳",region:"International"},
  {code:"ar",name:"العربية",flag:"🇸🇦",region:"International"},
  {code:"tr",name:"Türkçe",flag:"🇹🇷",region:"International"},
  {code:"it",name:"Italiano",flag:"🇮🇹",region:"International"},
  {code:"nl",name:"Nederlands",flag:"🇳🇱",region:"International"},
  {code:"pl",name:"Polski",flag:"🇵🇱",region:"International"},
  {code:"sv",name:"Svenska",flag:"🇸🇪",region:"International"},
  {code:"id",name:"Bahasa Indonesia",flag:"🇮🇩",region:"International"},
  {code:"vi",name:"Tiếng Việt",flag:"🇻🇳",region:"International"},
  {code:"th",name:"ภาษาไทย",flag:"🇹🇭",region:"International"},
  {code:"ms",name:"Bahasa Melayu",flag:"🇲🇾",region:"International"},
  {code:"sw",name:"Kiswahili",flag:"🇰🇪",region:"International"},
  {code:"uk",name:"Українська",flag:"🇺🇦",region:"International"},
  {code:"he",name:"עברית",flag:"🇮🇱",region:"International"},
  {code:"el",name:"Ελληνικά",flag:"🇬🇷",region:"International"},
  {code:"fi",name:"Suomi",flag:"🇫🇮",region:"International"},
  {code:"da",name:"Dansk",flag:"🇩🇰",region:"International"},
  {code:"no",name:"Norsk",flag:"🇳🇴",region:"International"},
  {code:"cs",name:"Čeština",flag:"🇨🇿",region:"International"},
  {code:"ro",name:"Română",flag:"🇷🇴",region:"International"},
  {code:"hu",name:"Magyar",flag:"🇭🇺",region:"International"},
  {code:"fil",name:"Filipino",flag:"🇵🇭",region:"International"},
  {code:"my",name:"မြန်မာ",flag:"🇲🇲",region:"International"},
  {code:"af",name:"Afrikaans",flag:"🇿🇦",region:"International"},
];

// ─── UTILS ────────────────────────────────────────────────────────────────────
const getTodayKey = () => new Date().toISOString().split("T")[0];
const genCode = () => { const c="ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let s=""; for(let i=0;i<6;i++) s+=c[Math.floor(Math.random()*c.length)]; return s; };
const getLast70Days = () => { const d=[]; for(let i=69;i>=0;i--){ const x=new Date(); x.setDate(x.getDate()-i); d.push(x.toISOString().split("T")[0]); } return d; };
const shareWA = (msg) => window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,"_blank");

// ─── SECURITY UTILITIES ───────────────────────────────────────────────────────
const sanitize = (str="",maxLen=100) => { if(typeof str!=="string") return ""; return str.replace(/<[^>]*>/g,"").replace(/[<>"'`\\]/g,"").replace(/javascript:/gi,"").replace(/on\w+\s*=/gi,"").trim().slice(0,maxLen); };
const validatePuzzle = (data) => { if(!data||typeof data!=="object") return null; if(!Array.isArray(data.emojis)||data.emojis.length<1||data.emojis.length>4) return null; if(!data.emojis.every(e=>typeof e==="string"&&e.trim().length>0)) return null; if(typeof data.answer!=="string"||!data.answer.trim()||data.answer.length>80) return null; return { emojis:data.emojis.map(e=>e.trim().slice(0,8)), answer:sanitize(data.answer,80).toLowerCase(), hint1:sanitize(data.hint1||"Think carefully!",120), hint2:sanitize(data.hint2||"Almost there!",120), hint3:sanitize(data.hint3||"Look at emojis carefully!",120), category:sanitize(data.category||"Custom",30), createdBy:sanitize(data.createdBy||"Anonymous",20), date:typeof data.date==="string"?data.date.slice(0,10):"" }; };
const validateLBEntry = (data) => { if(!data||typeof data!=="object") return null; if(typeof data.name!=="string"||!data.name.trim()) return null; const score=Math.min(Math.max(parseInt(data.score)||0,0),99999); const streak=Math.min(Math.max(parseInt(data.streak)||0,0),365); return { name:sanitize(data.name,20), score, streak, date:typeof data.date==="string"?data.date.slice(0,10):"" }; };
const safeStorage = { get:async(k,s)=>{ try{return await window.storage?.get(k,s)||null;}catch{return null;} }, set:async(k,v,s)=>{ try{return await window.storage?.set(k,v,s);}catch{return null;} }, list:async(p,s)=>{ try{return await window.storage?.list(p,s)||{keys:[]};}catch{return{keys:[]};} } };
const isValidCode = (c) => /^[A-Z0-9]{6}$/.test(c);

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const C = {
  bg:"linear-gradient(160deg,#080818 0%,#16082a 45%,#0b1828 100%)",
  purple:"#c879ff",purpleDim:"rgba(200,121,255,0.18)",purpleBorder:"rgba(200,121,255,0.3)",
  card:"rgba(255,255,255,0.055)",cardBorder:"rgba(255,255,255,0.1)",
  ok:"#34d399",okBg:"rgba(52,211,153,0.12)",okBorder:"rgba(52,211,153,0.25)",
  err:"#f87171",errBg:"rgba(239,68,68,0.12)",errBorder:"rgba(239,68,68,0.25)",
  hint:"#f8c55f",hintBg:"rgba(248,180,0,0.09)",hintBorder:"rgba(248,180,0,0.25)",
  muted:"rgba(255,255,255,0.38)",
};
const BASE_CSS = `
  @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
  @keyframes cffall{to{transform:translateY(110vh) rotate(720deg);opacity:0;}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}
  @keyframes spin{to{transform:rotate(360deg)}}
  button:active{opacity:.85;transform:scale(.97)}
  *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
`;
const S = {
  wrap:{fontFamily:"'Segoe UI',system-ui,sans-serif",minHeight:"100vh",background:C.bg,color:"#fff",position:"relative",overflowX:"hidden"},
  topBar:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 13px",background:"rgba(255,255,255,0.04)",borderBottom:"1px solid rgba(255,255,255,0.07)",gap:6},
  logo:{fontSize:17,fontWeight:800,background:"linear-gradient(90deg,#f7c59f,#ef8c8c,#c879ff)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",whiteSpace:"nowrap",flexShrink:0},
  chip:{background:"rgba(255,255,255,0.08)",borderRadius:20,padding:"4px 10px",fontSize:11,fontWeight:600,display:"flex",gap:6,alignItems:"center",flexShrink:0},
  langBtn:{background:C.purpleDim,border:`1px solid ${C.purpleBorder}`,borderRadius:20,padding:"4px 9px",fontSize:11,color:"#e0b4ff",cursor:"pointer",display:"flex",alignItems:"center",gap:4,flexShrink:0,fontWeight:600},
  inner:{maxWidth:520,margin:"0 auto",padding:"13px 13px 52px"},
  card:{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:20,padding:"16px 14px",marginBottom:10},
  emojiDisp:{fontSize:50,textAlign:"center",letterSpacing:8,margin:"12px 0",filter:"drop-shadow(0 4px 14px rgba(200,120,255,0.45))"},
  input:{width:"100%",boxSizing:"border-box",padding:"12px 14px",background:"rgba(255,255,255,0.08)",border:"2px solid rgba(255,255,255,0.15)",borderRadius:14,color:"#fff",fontSize:16,fontWeight:600,outline:"none",textAlign:"center",fontFamily:"inherit",WebkitAppearance:"none"},
  btnMain:{width:"100%",padding:"12px 0",borderRadius:14,border:"none",background:`linear-gradient(135deg,${C.purple},#8b5cf6)`,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",marginTop:9,fontFamily:"inherit"},
  btnSec:{flex:1,padding:"10px 0",borderRadius:12,border:"1.5px solid rgba(255,255,255,0.18)",background:"transparent",color:"rgba(255,255,255,0.8)",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"},
  badge:{display:"inline-block",padding:"2px 10px",borderRadius:20,fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,background:C.purpleDim,color:C.purple,marginBottom:3},
  homeBtn:{display:"flex",flexDirection:"column",alignItems:"center",padding:"14px 8px",background:C.card,border:`1.5px solid ${C.cardBorder}`,borderRadius:18,cursor:"pointer",gap:4,flex:1},
  okBox:{background:C.okBg,border:`1px solid ${C.okBorder}`,borderRadius:12,padding:"10px 13px",textAlign:"center",color:C.ok,fontWeight:700,fontSize:13,marginTop:9},
  errBox:{background:C.errBg,border:`1px solid ${C.errBorder}`,borderRadius:12,padding:"10px 13px",textAlign:"center",color:C.err,fontWeight:700,fontSize:13,marginTop:9},
  hintBox:{background:C.hintBg,border:`1px solid ${C.hintBorder}`,borderRadius:12,padding:"8px 12px",fontSize:12,color:C.hint,marginTop:6},
  overlay:{position:"fixed",inset:0,background:"rgba(0,0,0,0.82)",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center"},
  sheet:{width:"100%",maxWidth:520,background:"#0f0d1d",borderRadius:"22px 22px 0 0",maxHeight:"80vh",display:"flex",flexDirection:"column",overflow:"hidden",border:"1px solid rgba(255,255,255,0.1)",borderBottom:"none"},
  modal:{width:"100%",maxWidth:520,background:"#0f0d1d",borderRadius:"22px 22px 0 0",padding:"20px 16px 32px",border:"1px solid rgba(255,255,255,0.1)",borderBottom:"none"},
};

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTS — All OUTSIDE main to prevent keyboard dismiss bug
// ══════════════════════════════════════════════════════════════════════════════

const DiffBadge = ({d}) => { const m={easy:{c:C.ok,bg:"rgba(52,211,153,0.12)"},medium:{c:"#f7c759",bg:"rgba(247,199,89,0.12)"},hard:{c:C.err,bg:"rgba(248,113,113,0.12)"}}; const s=m[d]||m.medium; return <span style={{display:"inline-block",padding:"2px 8px",borderRadius:20,fontSize:9,fontWeight:700,textTransform:"uppercase",background:s.bg,color:s.c,marginLeft:5}}>{d}</span>; };

const GuessInput = ({value, onChange, onSubmit, shake, placeholder="Type your guess..."}) => (
  <div style={{animation:shake?"shake 0.4s":"none"}}>
    <input style={S.input} value={value} onChange={onChange} onKeyDown={e=>e.key==="Enter"&&onSubmit()} placeholder={placeholder} autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck="false" inputMode="text" enterKeyHint="done"/>
  </div>
);

const HintRow = ({hintsUsed, onHint, showAns, onToggleAns, onSubmit}) => (
  <>
    <div style={{display:"flex",gap:8}}>
      <button style={S.btnSec} onClick={onHint}>💡 Hint {hintsUsed>=3?"(max)":"(-5)"}</button>
      <button style={S.btnSec} onClick={onToggleAns}>🏳️ {showAns?"Hide":"Reveal"}</button>
    </div>
    <button style={S.btnMain} onClick={onSubmit}>Submit ✓</button>
  </>
);

const PuzzleInfo = ({p, hintsUsed, showAns, feedback}) => (
  <>
    <div style={{display:"flex",alignItems:"center",marginBottom:3}}>
      <span style={S.badge}>{p?.category}</span>
      {p?.difficulty&&<DiffBadge d={p.difficulty}/>}
    </div>
    <p style={{color:C.muted,fontSize:11,margin:"2px 0 0"}}>What do these emojis represent?</p>
    <div style={S.emojiDisp}>{(p?.emojis||[]).join(" ")}</div>
    {hintsUsed>=1&&<div style={S.hintBox}>💡 {p?.hint1}</div>}
    {hintsUsed>=2&&<div style={{...S.hintBox,marginTop:5}}>💡 {p?.hint2}</div>}
    {hintsUsed>=3&&<div style={{...S.hintBox,marginTop:5}}>💡 {p?.hint3}</div>}
    {showAns&&<div style={{...S.hintBox,color:"#fff",marginTop:5}}>📖 <strong>{p?.answer}</strong></div>}
    {feedback&&<div style={feedback.type==="ok"?S.okBox:S.errBox}>{feedback.msg}</div>}
  </>
);

const Confetti = ({show}) => !show?null:(
  <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:999,overflow:"hidden"}}>
    {[...Array(22)].map((_,i)=>(
      <div key={i} style={{position:"absolute",top:"-20px",left:`${Math.random()*100}%`,fontSize:15,animation:`cffall ${0.7+Math.random()*0.9}s ease-in forwards`,animationDelay:`${Math.random()*0.5}s`}}>
        {["🎉","✨","🌟","🎊","💫","⭐"][Math.floor(Math.random()*6)]}
      </div>
    ))}
  </div>
);

const LangPicker = ({lang, setLang, onClose}) => {
  const [search, setSearch] = useState("");
  const filtered = LANGUAGES.filter(l=>l.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.sheet} onClick={e=>e.stopPropagation()}>
        <div style={{padding:"14px 14px 8px",flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontWeight:700,fontSize:15}}>🌐 Select Language</span>
            <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer"}}>✕</button>
          </div>
          <div style={{fontSize:10,color:C.muted,marginTop:1}}>{LANGUAGES.length} languages available</div>
          <input style={{...S.input,textAlign:"left",padding:"9px 12px",fontSize:13,marginTop:7}} placeholder="Search language..." value={search} onChange={e=>setSearch(e.target.value)} autoFocus/>
        </div>
        <div style={{overflowY:"auto",flex:1,padding:"0 10px 20px"}}>
          {["Indian","International"].map(region=>{
            const langs=filtered.filter(l=>l.region===region);
            if(!langs.length) return null;
            return (
              <div key={region}>
                <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.3)",letterSpacing:1,textTransform:"uppercase",padding:"11px 6px 5px"}}>{region==="Indian"?"🇮🇳":"🌍"} {region} ({langs.length})</div>
                {langs.map(l=>(
                  <div key={l.code} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 9px",borderRadius:11,cursor:"pointer",background:lang===l.code?C.purpleDim:"transparent"}} onClick={()=>{setLang(l.code);onClose();}}>
                    <span style={{fontSize:16}}>{l.flag}</span>
                    <span style={{flex:1,fontSize:13,fontWeight:600}}>{l.name}</span>
                    {lang===l.code&&<span style={{color:C.purple,fontSize:13}}>✓</span>}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const NameModal = ({nameInput, setNameInput, onSave, onSkip}) => (
  <div style={S.overlay}>
    <div style={S.modal}>
      <p style={{fontWeight:700,fontSize:16,marginBottom:4}}>🏆 Join the Leaderboard!</p>
      <p style={{color:C.muted,fontSize:12,marginBottom:14}}>Enter your name to save your score globally.</p>
      <input style={{...S.input,textAlign:"left",padding:"11px 13px"}} placeholder="Your name..." value={nameInput} onChange={e=>setNameInput(e.target.value.slice(0,20))} maxLength={20} autoFocus autoComplete="off" autoCorrect="off" autoCapitalize="words" onKeyDown={e=>e.key==="Enter"&&nameInput.trim()&&onSave()}/>
      <p style={{color:C.muted,fontSize:10,marginTop:4,textAlign:"right"}}>{nameInput.length}/20</p>
      <button style={S.btnMain} onClick={onSave}>Save Name ✓</button>
      <button style={{...S.btnSec,width:"100%",marginTop:8}} onClick={onSkip}>Skip</button>
    </div>
  </div>
);

const TopBar = ({title,back,score,streak,soundOn,setSoundOn,lang,setLang,onBack}) => {
  const [showPicker,setShowPicker] = useState(false);
  const currentLang = LANGUAGES.find(l=>l.code===lang)||LANGUAGES[0];
  return (
    <>
      <div style={S.topBar}>
        {back?<button onClick={onBack} style={{background:"none",border:"none",color:"#fff",cursor:"pointer",fontSize:18,padding:"0 2px",flexShrink:0}}>←</button>
             :<span style={S.logo}>EmojiIQ 🧩</span>}
        <span style={{fontWeight:700,fontSize:13,flex:1,textAlign:back?"center":"left",paddingLeft:back?0:6,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{title}</span>
        <div style={{display:"flex",gap:5,alignItems:"center"}}>
          <div style={S.chip}><span>🏆{score}</span><span>🔥{streak}</span></div>
          <button style={{...S.langBtn,padding:"4px 7px"}} onClick={()=>setSoundOn(v=>!v)}>{soundOn?"🔊":"🔇"}</button>
          <button style={S.langBtn} onClick={()=>setShowPicker(true)}>
            <span style={{fontSize:12}}>{currentLang.flag}</span>
            <span>{currentLang.code.toUpperCase()}</span>
            <span style={{opacity:.5,fontSize:9}}>▾</span>
          </button>
        </div>
      </div>
      {showPicker&&<LangPicker lang={lang} setLang={setLang} onClose={()=>setShowPicker(false)}/>}
    </>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════════════════
export default function EmojiIQ() {
  const [lang,setLang]             = useState("en");
  const [screen,setScreen]         = useState("home");
  const [soundOn,setSoundOn]       = useState(true);
  const [difficulty,setDifficulty] = useState("medium");
  const [puzzle,setPuzzle]         = useState(null);
  const [guess,setGuess]           = useState("");
  const [hintsUsed,setHintsUsed]   = useState(0);
  const [feedback,setFeedback]     = useState(null);
  const [showAns,setShowAns]       = useState(false);
  const [shake,setShake]           = useState(false);
  const [themeIdx,setThemeIdx]     = useState(0);
  const [activeTheme,setActiveTheme] = useState(null);
  const [score,setScore]           = useState(0);
  const [streak,setStreak]         = useState(0);
  const [solvedCount,setSolvedCount] = useState(0);
  const [dailyDone,setDailyDone]   = useState(false);
  const [dailyHints,setDailyHints] = useState(0);
  const [confetti,setConfetti]     = useState(false);
  const [players,setPlayers]       = useState([{name:"Rahul",score:0,avatar:"🧑"},{name:"Priya",score:0,avatar:"👩"},{name:"You",score:0,avatar:"🎮",isYou:true}]);
  const [mpRound,setMpRound]       = useState(1);
  const [mpTimer,setMpTimer]       = useState(30);
  const [mpActive,setMpActive]     = useState(false);
  const [leaderboard,setLeaderboard] = useState([]);
  const [playerName,setPlayerName]   = useState("");
  const [nameInput,setNameInput]     = useState("");
  const [showNameModal,setShowNameModal] = useState(false);
  const [lbLoading,setLbLoading]    = useState(false);
  const [creatorEmojis,setCreatorEmojis] = useState(["","",""]);
  const [creatorAnswer,setCreatorAnswer] = useState("");
  const [creatorHint1,setCreatorHint1]   = useState("");
  const [creatorHint2,setCreatorHint2]   = useState("");
  const [creatorCategory,setCreatorCategory] = useState("Custom");
  const [createdCode,setCreatedCode]     = useState("");
  const [loadCode,setLoadCode]           = useState("");
  const [creatorStep,setCreatorStep]     = useState("create");
  const [loadedPuzzle,setLoadedPuzzle]   = useState(null);
  const [loadError,setLoadError]         = useState("");
  const [streakDates,setStreakDates]     = useState([]);
  const [streakCount,setStreakCount]     = useState(0);
  const [calLoading,setCalLoading]       = useState(true);
  const [dbStats] = useState(()=>engine.getStats());

  const play = useCallback((s)=>{if(soundOn) SFX[s]?.();},[soundOn]);
  const boom = ()=>{setConfetti(true);setTimeout(()=>setConfetti(false),2200);};
  const trigShake = ()=>{setShake(true);setTimeout(()=>setShake(false),500);play("wrong");};
  const resetPS = ()=>{setGuess("");setHintsUsed(0);setFeedback(null);setShowAns(false);};

  useEffect(()=>{
    if(screen==="classic"){setPuzzle(engine.getNext(difficulty));resetPS();}
    if(screen==="daily"){setPuzzle(engine.getDaily());resetPS();}
    if(screen==="practice"){setPuzzle(engine.getNext(difficulty));resetPS();}
    if(screen==="leaderboard") loadLeaderboard();
    if(screen==="calendar") loadStreak();
  },[screen]);

  useEffect(()=>{
    let t;
    if(mpActive&&mpTimer>0){t=setTimeout(()=>{setMpTimer(x=>x-1);if(mpTimer<=10)play("tick");},1000);}
    else if(mpActive&&mpTimer===0) endMp(false);
    return()=>clearTimeout(t);
  },[mpActive,mpTimer]);

  const loadLeaderboard = async()=>{
    setLbLoading(true);
    try{
      const res=await safeStorage.list("lb:",true);
      const entries=await Promise.all((res?.keys||[]).map(async k=>{try{const r=await safeStorage.get(k,true);return r?validateLBEntry(JSON.parse(r.value)):null;}catch{return null;}}));
      setLeaderboard(entries.filter(Boolean).sort((a,b)=>b.score-a.score).slice(0,20));
    }catch{setLeaderboard([]);}
    setLbLoading(false);
  };

  const saveToLB=async(name,sc,st)=>{
    const safeName=sanitize(name,20); if(!safeName) return;
    const safeScore=Math.min(sc,99999); const safeStreak=Math.min(st,365);
    try{
      const key=`lb:${safeName.toLowerCase().replace(/\s+/g,"")}`;
      const ex=await(async()=>{try{const r=await safeStorage.get(key,true);return r?JSON.parse(r.value):null;}catch{return null;}})();
      if(!ex||safeScore>ex.score) await safeStorage.set(key,JSON.stringify({name:safeName,score:safeScore,streak:safeStreak,date:getTodayKey()}),true);
    }catch{}
  };

  const loadStreak=async()=>{
    setCalLoading(true);
    try{
      const r=await safeStorage.get("streak-dates");
      const raw=r?JSON.parse(r.value):[];
      const dates=Array.isArray(raw)?raw.filter(d=>typeof d==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(d)).slice(0,400):[];
      setStreakDates(dates);
      let cs=0; for(let i=0;i<999;i++){const d=new Date();d.setDate(d.getDate()-i);if(dates.includes(d.toISOString().split("T")[0]))cs++;else break;}
      setStreakCount(Math.min(cs,365));
    }catch{setStreakDates([]);setStreakCount(0);}
    setCalLoading(false);
  };

  const addStreak=async()=>{
    const today=getTodayKey();
    try{
      const r=await safeStorage.get("streak-dates");
      const raw=r?JSON.parse(r.value):[];
      const dates=Array.isArray(raw)?raw.filter(d=>typeof d==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(d)).slice(0,400):[];
      if(!dates.includes(today)){const u=[...dates,today];await safeStorage.set("streak-dates",JSON.stringify(u));setStreakDates(u);}
    }catch{}
  };

  const handleCorrect=async(pts)=>{
    setScore(s=>s+pts);setStreak(s=>s+1);setSolvedCount(c=>c+1);
    setFeedback({type:"ok",msg:`+${pts} pts! 🎉`});
    play("correct");boom();addStreak();
    if(playerName) saveToLB(playerName,score+pts,streak+1);
  };
  const handleWrong=()=>{setStreak(0);setFeedback({type:"err",msg:"Not quite! Try again 🤔"});trigShake();};
  const doCheck=(p)=>{if(!guess.trim()||!p) return; guess.trim().toLowerCase()===p.answer.toLowerCase()?handleCorrect(Math.max(100-hintsUsed*20,40)):handleWrong();};
  const doHint=()=>{if(hintsUsed<3){setHintsUsed(h=>h+1);setScore(s=>Math.max(0,s-5));play("hint");}};
  const endMp=(won)=>{setMpActive(false);setPlayers(prev=>prev.map(p=>p.isYou?{...p,score:p.score+(won?100:0)}:{...p,score:p.score+(Math.random()>.5?(won?35:85):(won?15:50))}));};

  const saveCustomPuzzle=async()=>{
    const cleanEmojis=creatorEmojis.filter(e=>e.trim()).slice(0,4);
    const cleanAnswer=sanitize(creatorAnswer,80).toLowerCase();
    if(!cleanEmojis.length||!cleanAnswer) return;
    const code=genCode();
    const data={emojis:cleanEmojis.map(e=>e.trim().slice(0,8)),answer:cleanAnswer,hint1:sanitize(creatorHint1||"Think carefully!",120),hint2:sanitize(creatorHint2||"Almost there!",120),hint3:"Look carefully at the emojis!",category:sanitize(creatorCategory||"Custom",30),createdBy:sanitize(playerName||"Anonymous",20),date:getTodayKey()};
    try{await safeStorage.set(`puzzle:${code}`,JSON.stringify(data),true);setCreatedCode(code);setCreatorStep("success");play("correct");boom();}
    catch{setCreatedCode("ERROR");setCreatorStep("success");}
  };

  const loadCustomPuzzle=async()=>{
    setLoadError("");
    const code=loadCode.trim().toUpperCase();
    if(!isValidCode(code)){setLoadError("Code must be exactly 6 characters!");return;}
    try{
      const r=await safeStorage.get(`puzzle:${code}`,true);
      if(!r){setLoadError("Puzzle not found. Check the code!");return;}
      const parsed=validatePuzzle(JSON.parse(r.value));
      if(!parsed){setLoadError("Invalid puzzle data. Try another code.");return;}
      setLoadedPuzzle(parsed);setCreatorStep("playing");resetPS();
    }catch{setLoadError("Puzzle not found. Check the code!");}
  };

  const topBarProps={score,streak,soundOn,setSoundOn,lang,setLang};

  // ─── HOME ─────────────────────────────────────────────────────────────────
  if(screen==="home") return (
    <div style={S.wrap}>
      <style>{BASE_CSS}</style>
      <Confetti show={confetti}/>
      {showNameModal&&<NameModal nameInput={nameInput} setNameInput={setNameInput} onSave={()=>{const safe=sanitize(nameInput,20);if(safe){setPlayerName(safe);setShowNameModal(false);}}} onSkip={()=>setShowNameModal(false)}/>}
      <TopBar {...topBarProps}/>
      <div style={S.inner}>
        <div style={{textAlign:"center",marginBottom:16,paddingTop:8}}>
          <div style={{fontSize:46,marginBottom:5}}>🍎📱🧠</div>
          <h1 style={{margin:0,fontSize:22,fontWeight:800,background:"linear-gradient(90deg,#f7c59f,#c879ff)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>EmojiIQ</h1>
          <p style={{color:C.muted,margin:"3px 0 0",fontSize:11}}>by Udayon Studio · {dbStats.total}+ puzzles · {LANGUAGES.length} languages · Offline · Global 🌍</p>
        </div>

        <div style={{...S.card,padding:"11px 13px",marginBottom:10}}>
          <p style={{margin:"0 0 7px",color:C.muted,fontSize:10,textTransform:"uppercase",letterSpacing:.8,fontWeight:700}}>Difficulty</p>
          <div style={{display:"flex",gap:7}}>
            {["easy","medium","hard"].map(d=>(
              <button key={d} onClick={()=>setDifficulty(d)} style={{flex:1,padding:"8px 0",borderRadius:12,border:`1.5px solid ${difficulty===d?{easy:C.ok,medium:"#f7c759",hard:C.err}[d]:"rgba(255,255,255,0.13)"}`,background:difficulty===d?{easy:"rgba(52,211,153,0.1)",medium:"rgba(247,199,89,0.1)",hard:"rgba(248,113,113,0.1)"}[d]:"transparent",color:{easy:C.ok,medium:"#f7c759",hard:C.err}[d],fontSize:11,fontWeight:700,cursor:"pointer",textTransform:"capitalize"}}>
                {{easy:"🟢",medium:"🟡",hard:"🔴"}[d]} {d}
              </button>
            ))}
          </div>
        </div>

        <div style={{display:"flex",gap:9,marginBottom:9}}>
          <div style={S.homeBtn} onClick={()=>setScreen("classic")}><span style={{fontSize:25}}>🎯</span><span style={{fontWeight:700,fontSize:13}}>Classic</span><span style={{color:C.muted,fontSize:10}}>∞ Puzzles</span></div>
          <div style={{...S.homeBtn,background:dailyDone?"rgba(52,211,153,0.07)":S.homeBtn.background,borderColor:dailyDone?"rgba(52,211,153,0.25)":S.homeBtn.borderColor}} onClick={()=>setScreen("daily")}><span style={{fontSize:25}}>📅</span><span style={{fontWeight:700,fontSize:13}}>Daily</span><span style={{color:dailyDone?C.ok:C.muted,fontSize:10}}>{dailyDone?"✓ Solved!":"New every day"}</span></div>
        </div>
        <div style={{display:"flex",gap:9,marginBottom:9}}>
          <div style={S.homeBtn} onClick={()=>setScreen("practice")}><span style={{fontSize:25}}>⚡</span><span style={{fontWeight:700,fontSize:13}}>Practice</span><span style={{color:C.muted,fontSize:10}}>Non-stop ∞</span></div>
          <div style={S.homeBtn} onClick={()=>{const p=engine.getNext(difficulty);setPuzzle(p);resetPS();setPlayers([{name:"Rahul",score:0,avatar:"🧑"},{name:"Priya",score:0,avatar:"👩"},{name:"You",score:0,avatar:"🎮",isYou:true}]);setMpRound(1);setMpTimer(30);setMpActive(true);setScreen("multiplayer");}}><span style={{fontSize:25}}>⚔️</span><span style={{fontWeight:700,fontSize:13}}>Multiplayer</span><span style={{color:C.muted,fontSize:10}}>Race friends</span></div>
        </div>

        <div style={{...S.card,padding:"11px 13px",marginBottom:9}}>
          <p style={{margin:"0 0 8px",color:C.muted,fontSize:10,textTransform:"uppercase",letterSpacing:.8,fontWeight:700}}>🎨 Theme Packs ({Object.keys(THEMES).length} categories)</p>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {Object.entries(THEMES).map(([name,thm])=>{
              const count=PUZZLE_DB.filter(p=>p.cat===thm.cat).length;
              return(
                <button key={name} onClick={()=>{setActiveTheme(name);setThemeIdx(0);setPuzzle(engine.getTheme(thm.cat,0));resetPS();setScreen("themes");}} style={{flex:"1 1 70px",padding:"9px 5px",borderRadius:13,border:"1.5px solid rgba(255,255,255,0.11)",background:"rgba(255,255,255,0.04)",cursor:"pointer",color:"#fff",textAlign:"center"}}>
                  <div style={{fontSize:18}}>{thm.icon}</div>
                  <div style={{fontSize:9,fontWeight:700,marginTop:2,color:"rgba(255,255,255,0.75)"}}>{name}</div>
                  <div style={{fontSize:8,color:C.muted}}>{count}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{display:"flex",gap:9,marginBottom:9}}>
          <div style={S.homeBtn} onClick={()=>setScreen("leaderboard")}><span style={{fontSize:22}}>🏆</span><span style={{fontWeight:700,fontSize:12}}>Leaderboard</span><span style={{color:C.muted,fontSize:10}}>Global ranks</span></div>
          <div style={S.homeBtn} onClick={()=>{setCreatorStep("create");setCreatedCode("");setLoadedPuzzle(null);setLoadCode("");setLoadError("");setScreen("creator");}}><span style={{fontSize:22}}>🛠️</span><span style={{fontWeight:700,fontSize:12}}>Create</span><span style={{color:C.muted,fontSize:10}}>Make & share</span></div>
          <div style={S.homeBtn} onClick={()=>setScreen("calendar")}><span style={{fontSize:22}}>📆</span><span style={{fontWeight:700,fontSize:12}}>Streak</span><span style={{color:C.muted,fontSize:10}}>Your calendar</span></div>
        </div>

        {score>0&&<div style={{...S.card,textAlign:"center",padding:12}}>
          {playerName&&<p style={{margin:"0 0 5px",color:C.purple,fontSize:12,fontWeight:700}}>👤 {playerName}</p>}
          <div style={{display:"flex",justifyContent:"center",gap:22}}>
            {[["🏆",score,"Score"],["🔥",streak,"Streak"],["✅",solvedCount,"Solved"]].map(([i,v,l])=>(
              <div key={l}><div style={{fontSize:17,fontWeight:800}}>{i} {v}</div><div style={{fontSize:9,color:C.muted,marginTop:1}}>{l}</div></div>
            ))}
          </div>
          {!playerName&&<button style={{...S.btnSec,width:"auto",padding:"6px 14px",marginTop:9,fontSize:11}} onClick={()=>setShowNameModal(true)}>🏆 Join Leaderboard</button>}
        </div>}
      </div>
    </div>
  );

  // ─── CLASSIC ─────────────────────────────────────────────────────────────
  if(screen==="classic") return (
    <div style={S.wrap}><style>{BASE_CSS}</style>
      <Confetti show={confetti}/>
      <TopBar {...topBarProps} title="🎯 Classic Mode" back onBack={()=>setScreen("home")}/>
      <div style={S.inner}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
          <span style={{color:C.muted,fontSize:11}}>Solved: {solvedCount} · <span style={{color:C.purple}}>∞ Unlimited</span></span>
          <DiffBadge d={difficulty}/>
        </div>
        <div style={S.card}>
          <PuzzleInfo p={puzzle} hintsUsed={hintsUsed} showAns={showAns} feedback={feedback}/>
          {feedback?.type!=="ok"&&<>
            <GuessInput value={guess} onChange={e=>setGuess(e.target.value)} onSubmit={()=>doCheck(puzzle)} shake={shake}/>
            <HintRow hintsUsed={hintsUsed} onHint={doHint} showAns={showAns} onToggleAns={()=>setShowAns(v=>!v)} onSubmit={()=>doCheck(puzzle)}/>
          </>}
        </div>
        {feedback?.type==="ok"&&<>
          <button style={{...S.btnMain,background:"linear-gradient(135deg,#34d399,#059669)"}} onClick={()=>{setPuzzle(engine.getNext(difficulty));resetPS();}}>Next Puzzle →</button>
          <button style={{...S.btnSec,width:"100%",marginTop:8}} onClick={()=>shareWA(`🧩 I solved an EmojiIQ puzzle!\n${puzzle.emojis.join(" ")} = ${puzzle.answer.toUpperCase()}\nCan you guess it faster? 🎮`)}>📤 WhatsApp Share</button>
        </>}
      </div>
    </div>
  );

  // ─── PRACTICE ────────────────────────────────────────────────────────────
  if(screen==="practice") return (
    <div style={S.wrap}><style>{BASE_CSS}</style>
      <Confetti show={confetti}/>
      <TopBar {...topBarProps} title="⚡ Practice Mode" back onBack={()=>setScreen("home")}/>
      <div style={S.inner}>
        <div style={{...S.card,padding:"10px 13px",marginBottom:8,background:"rgba(200,121,255,0.06)",border:`1px solid ${C.purpleBorder}`}}>
          <div style={{display:"flex",justifyContent:"space-around",textAlign:"center"}}>
            <div><div style={{fontWeight:800,fontSize:17,color:"#f7c759"}}>🏆 {score}</div><div style={{fontSize:10,color:C.muted}}>Score</div></div>
            <div><div style={{fontWeight:800,fontSize:17,color:C.ok}}>🔥 {streak}</div><div style={{fontSize:10,color:C.muted}}>Streak</div></div>
            <div><div style={{fontWeight:800,fontSize:17,color:C.purple}}>✅ {solvedCount}</div><div style={{fontSize:10,color:C.muted}}>Solved</div></div>
          </div>
        </div>
        <div style={S.card}>
          <PuzzleInfo p={puzzle} hintsUsed={hintsUsed} showAns={showAns} feedback={feedback}/>
          {feedback?.type!=="ok"&&<>
            <GuessInput value={guess} onChange={e=>setGuess(e.target.value)} onSubmit={()=>doCheck(puzzle)} shake={shake}/>
            <HintRow hintsUsed={hintsUsed} onHint={doHint} showAns={showAns} onToggleAns={()=>setShowAns(v=>!v)} onSubmit={()=>doCheck(puzzle)}/>
          </>}
        </div>
        {feedback?.type==="ok"&&<button style={{...S.btnMain,background:"linear-gradient(135deg,#34d399,#059669)"}} onClick={()=>{setPuzzle(engine.getNext(difficulty));resetPS();}}>Next →</button>}
      </div>
    </div>
  );

  // ─── DAILY ───────────────────────────────────────────────────────────────
  if(screen==="daily") return (
    <div style={S.wrap}><style>{BASE_CSS}</style>
      <Confetti show={confetti}/>
      <TopBar {...topBarProps} title="📅 Daily Puzzle" back onBack={()=>setScreen("home")}/>
      <div style={S.inner}>
        <div style={{textAlign:"center",marginBottom:7}}><span style={S.badge}>Today · {getTodayKey()}</span></div>
        <div style={S.card}>
          <div style={S.emojiDisp}>{puzzle?.emojis?.join(" ")}</div>
          {!dailyDone?(
            <>
              <GuessInput value={guess} onChange={e=>setGuess(e.target.value)} onSubmit={()=>{if(guess.trim().toLowerCase()===puzzle?.answer){handleCorrect(Math.max(100-hintsUsed*20,40));setDailyDone(true);setDailyHints(hintsUsed);}else handleWrong();}} shake={shake} placeholder="Type your answer..."/>
              {hintsUsed>=1&&<div style={S.hintBox}>💡 {puzzle?.hint1}</div>}
              {hintsUsed>=2&&<div style={{...S.hintBox,marginTop:5}}>💡 {puzzle?.hint2}</div>}
              {hintsUsed>=3&&<div style={{...S.hintBox,marginTop:5}}>💡 {puzzle?.hint3}</div>}
              {feedback&&<div style={S.errBox}>{feedback.msg}</div>}
              <div style={{display:"flex",gap:8,marginTop:9}}>
                <button style={S.btnSec} onClick={doHint}>💡 Hint</button>
                <button style={{...S.btnMain,flex:1,marginTop:0}} onClick={()=>{if(guess.trim().toLowerCase()===puzzle?.answer){handleCorrect(Math.max(100-hintsUsed*20,40));setDailyDone(true);setDailyHints(hintsUsed);}else handleWrong();}}>Submit ✓</button>
              </div>
            </>
          ):(
            <div style={{textAlign:"center"}}>
              <div style={S.okBox}>🎊 Correct! — {puzzle?.answer?.toUpperCase()}</div>
              <div style={{...S.card,marginTop:10,padding:"10px 13px",background:"rgba(200,121,255,0.06)"}}>
                <div style={{fontSize:10,color:C.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:.8}}>Today's Stats</div>
                <div style={{display:"flex",justifyContent:"center",gap:20}}>
                  <div><div style={{fontWeight:800,fontSize:17}}>{dailyHints}</div><div style={{fontSize:10,color:C.muted}}>Hints</div></div>
                  <div><div style={{fontWeight:800,fontSize:17,color:C.ok}}>+{Math.max(100-dailyHints*20,40)}</div><div style={{fontSize:10,color:C.muted}}>Points</div></div>
                  <div><div style={{fontWeight:800,fontSize:17,color:"#f7c759"}}>{streakCount}🔥</div><div style={{fontSize:10,color:C.muted}}>Streak</div></div>
                </div>
              </div>
              <p style={{color:C.muted,fontSize:11,marginTop:11}}>Come back tomorrow for a new puzzle!</p>
              <button style={{...S.btnMain,background:"linear-gradient(135deg,#25D366,#128C7E)"}} onClick={()=>shareWA(`📅 I solved today's EmojiIQ Daily Puzzle!\n${puzzle.emojis.join(" ")} = ${puzzle.answer.toUpperCase()}\nSolved in ${dailyHints} hints 🧩\nPlay now → EmojiIQ by Udayon Studio`)}>📤 Share on WhatsApp</button>
              <button style={S.btnMain} onClick={()=>setScreen("home")}>Back to Home</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ─── THEMES ──────────────────────────────────────────────────────────────
  if(screen==="themes"&&activeTheme){
    const thm=THEMES[activeTheme];
    const pool=PUZZLE_DB.filter(p=>p.cat===thm.cat);
    return(
      <div style={S.wrap}><style>{BASE_CSS}</style>
        <Confetti show={confetti}/>
        <div style={{...S.topBar,background:"rgba(0,0,0,0.4)"}}>
          <button onClick={()=>setScreen("home")} style={{background:"none",border:"none",color:"#fff",cursor:"pointer",fontSize:18,flexShrink:0}}>←</button>
          <span style={{fontWeight:700,fontSize:14,flex:1,textAlign:"center"}}>{thm.icon} {activeTheme}</span>
          <span style={{color:C.muted,fontSize:11}}>{themeIdx%pool.length+1}/{pool.length}</span>
        </div>
        <div style={{height:4,background:thm.gradient,width:`${((themeIdx%pool.length+1)/pool.length)*100}%`,transition:"width 0.5s"}}/>
        <div style={S.inner}>
          <div style={S.card}>
            <PuzzleInfo p={puzzle} hintsUsed={hintsUsed} showAns={showAns} feedback={feedback}/>
            {feedback?.type!=="ok"&&<>
              <GuessInput value={guess} onChange={e=>setGuess(e.target.value)} onSubmit={()=>doCheck(puzzle)} shake={shake}/>
              <HintRow hintsUsed={hintsUsed} onHint={doHint} showAns={showAns} onToggleAns={()=>setShowAns(v=>!v)} onSubmit={()=>doCheck(puzzle)}/>
            </>}
          </div>
          {feedback?.type==="ok"&&<>
            <button style={{...S.btnMain,background:thm.gradient}} onClick={()=>{const ni=themeIdx+1;setThemeIdx(ni);setPuzzle(engine.getTheme(thm.cat,ni));resetPS();}}>Next {thm.icon} →</button>
            <button style={{...S.btnSec,width:"100%",marginTop:8}} onClick={()=>shareWA(`${thm.icon} I solved an EmojiIQ ${activeTheme} puzzle!\n${puzzle.emojis.join(" ")} = ${puzzle.answer.toUpperCase()}\nPlay EmojiIQ by Udayon Studio!`)}>📤 Share</button>
          </>}
        </div>
      </div>
    );
  }

  // ─── MULTIPLAYER ─────────────────────────────────────────────────────────
  if(screen==="multiplayer"&&puzzle) return(
    <div style={S.wrap}><style>{BASE_CSS}</style>
      <Confetti show={confetti}/>
      <TopBar {...topBarProps} title="⚔️ Multiplayer" back onBack={()=>setScreen("home")}/>
      <div style={S.inner}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
          <span style={{color:C.muted,fontSize:11}}>Round {mpRound}</span>
          <span style={{fontWeight:700,fontSize:14,color:mpTimer<=10?C.err:"#fff"}}>⏱ {mpTimer}s</span>
        </div>
        <div style={{height:4,borderRadius:2,background:"rgba(255,255,255,0.07)",marginBottom:9}}>
          <div style={{height:"100%",width:`${(mpTimer/30)*100}%`,background:mpTimer>10?`linear-gradient(90deg,${C.purple},#8b5cf6)`:C.err,borderRadius:2,transition:"width 1s linear,background 0.3s"}}/>
        </div>
        <div style={{display:"flex",gap:7,marginBottom:9}}>
          {[...players].sort((a,b)=>b.score-a.score).map((p,i)=>(
            <div key={p.name} style={{flex:1,background:p.isYou?C.purpleDim:"rgba(255,255,255,0.04)",border:`1px solid ${p.isYou?C.purpleBorder:"rgba(255,255,255,0.07)"}`,borderRadius:12,padding:"8px 5px",textAlign:"center"}}>
              <div style={{fontSize:17}}>{p.avatar}</div>
              <div style={{fontSize:10,fontWeight:600,marginTop:1}}>{p.name}</div>
              <div style={{fontSize:14,fontWeight:800,color:i===0?"#f7c759":"#fff"}}>{p.score}</div>
              {i===0&&<div style={{fontSize:9,color:"#f7c759"}}>👑</div>}
            </div>
          ))}
        </div>
        <div style={S.card}>
          <span style={S.badge}>{puzzle?.category}</span><DiffBadge d={difficulty}/>
          <div style={S.emojiDisp}>{puzzle?.emojis?.join(" ")}</div>
          {!mpActive?(
            <div style={{textAlign:"center"}}>
              <div style={feedback?.type==="ok"?S.okBox:S.errBox}>{feedback?.type==="ok"?"🏆 You got it!":"⏱ Time's up!"}</div>
              <button style={{...S.btnMain,marginTop:10}} onClick={()=>{setMpRound(r=>r+1);setPuzzle(engine.getNext(difficulty));setMpTimer(30);setMpActive(true);resetPS();}}>Next Round →</button>
            </div>
          ):(
            <>
              <GuessInput value={guess} onChange={e=>setGuess(e.target.value)} onSubmit={()=>{doCheck(puzzle);if(guess.trim().toLowerCase()===puzzle.answer)endMp(true);}} shake={shake} placeholder="Fastest wins!"/>
              {feedback&&<div style={S.errBox}>{feedback.msg}</div>}
              <button style={S.btnMain} onClick={()=>{doCheck(puzzle);if(guess.trim().toLowerCase()===puzzle.answer)endMp(true);}}>Submit ✓</button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // ─── LEADERBOARD ─────────────────────────────────────────────────────────
  if(screen==="leaderboard") return(
    <div style={S.wrap}><style>{BASE_CSS}</style>
      <TopBar {...topBarProps} title="🏆 Leaderboard" back onBack={()=>setScreen("home")}/>
      <div style={S.inner}>
        {!playerName&&<div style={{...S.card,background:"rgba(200,121,255,0.08)",border:`1px solid ${C.purpleBorder}`,textAlign:"center",padding:"13px"}}>
          <p style={{margin:"0 0 6px",fontSize:13}}>Enter your name to appear here!</p>
          <button style={{...S.btnMain,marginTop:5}} onClick={()=>setShowNameModal(true)}>🏆 Join Leaderboard</button>
        </div>}
        {playerName&&score>0&&<div style={{...S.card,background:C.purpleDim,border:`1px solid ${C.purpleBorder}`,padding:"11px 14px",marginBottom:9}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontWeight:700}}>👤 {playerName}</span>
            <div style={{display:"flex",gap:10}}><span style={{color:C.purple,fontWeight:800,fontSize:15}}>🏆 {score}</span><span style={{color:"#f7c759",fontWeight:700}}>🔥 {streak}</span></div>
          </div>
          <button style={{...S.btnMain,marginTop:9,fontSize:12,padding:"9px 0"}} onClick={async()=>{await saveToLB(sanitize(playerName,20),Math.min(score,99999),Math.min(streak,365));loadLeaderboard();}}>⬆️ Submit My Score</button>
        </div>}
        {lbLoading?<div style={{textAlign:"center",padding:"28px 0",color:C.muted}}>Loading rankings...</div>
        :leaderboard.length===0?<div style={{...S.card,textAlign:"center",padding:"28px 20px"}}><div style={{fontSize:36,marginBottom:8}}>🏆</div><p style={{color:C.muted,fontSize:12}}>No scores yet! Be the first.</p></div>
        :<div style={S.card}>
          <p style={{margin:"0 0 9px",fontWeight:700,fontSize:12}}>🌍 Global Rankings</p>
          {leaderboard.map((entry,i)=>(
            <div key={entry.name} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 0",borderBottom:i<leaderboard.length-1?"1px solid rgba(255,255,255,0.06)":"none"}}>
              <div style={{width:22,height:22,borderRadius:11,background:i===0?"rgba(247,199,89,0.2)":i===1?"rgba(180,180,180,0.12)":i===2?"rgba(205,127,50,0.12)":"rgba(255,255,255,0.04)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:i===0?"#f7c759":i===1?"#ccc":i===2?"#cd7f32":C.muted,flexShrink:0}}>
                {i===0?"👑":i+1}
              </div>
              <span style={{flex:1,fontWeight:600,fontSize:12,color:entry.name===playerName?C.purple:"#fff"}}>{entry.name}{entry.name===playerName&&<span style={{fontSize:9,color:C.purple,marginLeft:4}}>(you)</span>}</span>
              <span style={{fontWeight:800,fontSize:13,color:"#f7c759"}}>🏆 {entry.score}</span>
              {entry.streak>0&&<span style={{fontSize:10,color:C.muted}}>🔥{entry.streak}</span>}
            </div>
          ))}
        </div>}
        <button style={{...S.btnSec,width:"100%",marginTop:9}} onClick={loadLeaderboard}>🔄 Refresh</button>
      </div>
      {showNameModal&&<NameModal nameInput={nameInput} setNameInput={setNameInput} onSave={()=>{const safe=sanitize(nameInput,20);if(safe){setPlayerName(safe);setShowNameModal(false);}}} onSkip={()=>setShowNameModal(false)}/>}
    </div>
  );

  // ─── CREATOR ─────────────────────────────────────────────────────────────
  if(screen==="creator") return(
    <div style={S.wrap}><style>{BASE_CSS}</style>
      <Confetti show={confetti}/>
      <TopBar {...topBarProps} title="🛠️ Puzzle Creator" back onBack={()=>setScreen("home")}/>
      <div style={S.inner}>
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          {["create","load"].map(tab=>(
            <button key={tab} onClick={()=>{setCreatorStep(tab);setLoadError("");setLoadedPuzzle(null);}} style={{flex:1,padding:"9px 0",borderRadius:12,border:`1.5px solid ${(creatorStep===tab||creatorStep==="success"&&tab==="create")?C.purpleBorder:"rgba(255,255,255,0.14)"}`,background:(creatorStep===tab||creatorStep==="success"&&tab==="create")?C.purpleDim:"transparent",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>
              {tab==="create"?"🛠️ Create":"🔑 Load Code"}
            </button>
          ))}
        </div>
        {creatorStep==="create"&&<div style={S.card}>
          <p style={{fontWeight:700,margin:"0 0 11px",fontSize:14}}>Create Your Puzzle</p>
          <p style={{color:C.muted,fontSize:11,margin:"0 0 7px"}}>Emojis (one per box)</p>
          <div style={{display:"flex",gap:7,marginBottom:9}}>
            {[0,1,2].map(i=>(
              <input key={i} style={{...S.input,flex:1,fontSize:22,padding:"9px 4px"}} placeholder="+" value={creatorEmojis[i]} onChange={e=>{const arr=[...creatorEmojis];arr[i]=e.target.value;setCreatorEmojis(arr);}}/>
            ))}
          </div>
          {[["Answer (lowercase)","e.g. apple",creatorAnswer,setCreatorAnswer],["Hint 1","Easy hint...",creatorHint1,setCreatorHint1],["Hint 2","Harder hint...",creatorHint2,setCreatorHint2],["Category","Brand / Movie / Custom...",creatorCategory,setCreatorCategory]].map(([lbl,ph,val,fn])=>(
            <div key={lbl} style={{marginBottom:7}}>
              <p style={{color:C.muted,fontSize:11,margin:"0 0 4px"}}>{lbl}</p>
              <input style={{...S.input,textAlign:"left",padding:"10px 12px"}} placeholder={ph} value={val} onChange={e=>fn(e.target.value)}/>
            </div>
          ))}
          <button style={S.btnMain} onClick={saveCustomPuzzle}>💾 Save & Get Code</button>
        </div>}
        {creatorStep==="success"&&<div style={S.card}>
          <div style={{textAlign:"center",padding:"8px 0"}}>
            <div style={{fontSize:44,marginBottom:7}}>🎉</div>
            <p style={{fontWeight:800,fontSize:17,margin:"0 0 3px"}}>Puzzle Created!</p>
            <p style={{color:C.muted,fontSize:12,margin:"0 0 14px"}}>Share this code with friends:</p>
            <div style={{background:C.purpleDim,border:`2px solid ${C.purpleBorder}`,borderRadius:16,padding:"13px 18px",marginBottom:13}}>
              <div style={{fontSize:30,fontWeight:900,letterSpacing:8,color:C.purple}}>{createdCode}</div>
            </div>
            <button style={{...S.btnMain,background:"linear-gradient(135deg,#25D366,#128C7E)"}} onClick={()=>shareWA(`🧩 I made an EmojiIQ puzzle for you!\nCode: ${createdCode}\nOpen EmojiIQ → Create → Load Code → enter: ${createdCode}\nCan you solve it? 😄`)}>📤 Share on WhatsApp</button>
            <button style={{...S.btnSec,width:"100%",marginTop:8}} onClick={()=>{setCreatorStep("create");setCreatedCode("");setCreatorEmojis(["","",""]);setCreatorAnswer("");setCreatorHint1("");setCreatorHint2("");setCreatorCategory("Custom");}}>+ Create Another</button>
          </div>
        </div>}
        {creatorStep==="load"&&!loadedPuzzle&&<div style={S.card}>
          <p style={{fontWeight:700,margin:"0 0 7px",fontSize:14}}>🔑 Load a Friend's Puzzle</p>
          <p style={{color:C.muted,fontSize:11,margin:"0 0 9px"}}>Enter the 6-character code</p>
          <input style={{...S.input,fontSize:20,letterSpacing:6,marginBottom:7}} placeholder="ABCD12" value={loadCode} onChange={e=>setLoadCode(e.target.value.toUpperCase())} maxLength={6}/>
          {loadError&&<div style={S.errBox}>{loadError}</div>}
          <button style={S.btnMain} onClick={loadCustomPuzzle}>🔍 Load Puzzle</button>
        </div>}
        {creatorStep==="playing"&&loadedPuzzle&&<>
          <div style={{...S.card,background:"rgba(200,121,255,0.06)",border:`1px solid ${C.purpleBorder}`,padding:"8px 13px",marginBottom:8}}>
            <span style={{fontSize:11,color:C.muted}}>By </span>
            <span style={{fontSize:11,color:C.purple,fontWeight:700}}>{loadedPuzzle.createdBy||"Anonymous"}</span>
            <span style={{fontSize:11,color:C.muted}}> · Code: </span>
            <span style={{fontSize:11,color:"#fff",fontWeight:700,letterSpacing:2}}>{loadCode}</span>
          </div>
          <div style={S.card}>
            <PuzzleInfo p={loadedPuzzle} hintsUsed={hintsUsed} showAns={showAns} feedback={feedback}/>
            {feedback?.type!=="ok"&&<>
              <GuessInput value={guess} onChange={e=>setGuess(e.target.value)} onSubmit={()=>doCheck(loadedPuzzle)} shake={shake}/>
              <HintRow hintsUsed={hintsUsed} onHint={doHint} showAns={showAns} onToggleAns={()=>setShowAns(v=>!v)} onSubmit={()=>doCheck(loadedPuzzle)}/>
            </>}
          </div>
          {feedback?.type==="ok"&&<button style={{...S.btnMain,background:"linear-gradient(135deg,#25D366,#128C7E)"}} onClick={()=>shareWA(`🧩 I solved a friend's EmojiIQ puzzle!\n${loadedPuzzle.emojis.join(" ")} = ${loadedPuzzle.answer.toUpperCase()}\nPlay EmojiIQ by Udayon Studio!`)}>📤 Share</button>}
        </>}
      </div>
    </div>
  );

  // ─── STREAK CALENDAR ─────────────────────────────────────────────────────
  if(screen==="calendar"){
    const days=getLast70Days();
    const weeks=[];
    for(let i=0;i<days.length;i+=7) weeks.push(days.slice(i,i+7));
    return(
      <div style={S.wrap}><style>{BASE_CSS}</style>
        <TopBar {...topBarProps} title="📆 Streak Calendar" back onBack={()=>setScreen("home")}/>
        <div style={S.inner}>
          <div style={{...S.card,textAlign:"center",padding:"15px",marginBottom:9}}>
            <div style={{fontSize:36,marginBottom:3}}>🔥</div>
            <div style={{fontSize:26,fontWeight:900,color:"#f7c759"}}>{calLoading?"...":streakCount}</div>
            <div style={{color:C.muted,fontSize:12}}>Day streak</div>
            <div style={{display:"flex",justifyContent:"center",gap:18,marginTop:10}}>
              <div><div style={{fontWeight:800,fontSize:15}}>{streakDates.length}</div><div style={{color:C.muted,fontSize:10}}>Total Days</div></div>
              <div><div style={{fontWeight:800,fontSize:15,color:C.ok}}>{streakDates.includes(getTodayKey())?"✓ Played":"—"}</div><div style={{color:C.muted,fontSize:10}}>Today</div></div>
            </div>
          </div>
          <div style={S.card}>
            <p style={{margin:"0 0 9px",fontWeight:700,fontSize:11,color:C.muted}}>LAST 10 WEEKS</p>
            {calLoading?<div style={{textAlign:"center",padding:"18px 0",color:C.muted,fontSize:12}}>Loading...</div>:<>
              <div style={{display:"flex",gap:3,marginBottom:4}}>
                {["S","M","T","W","T","F","S"].map((d,i)=><div key={i} style={{width:23,textAlign:"center",fontSize:9,color:C.muted}}>{d}</div>)}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                {weeks.map((week,wi)=>(
                  <div key={wi} style={{display:"flex",gap:3,alignItems:"center"}}>
                    {week.map((day,di)=>{
                      const solved=streakDates.includes(day);
                      const isToday=day===getTodayKey();
                      return <div key={di} title={day} style={{width:23,height:23,borderRadius:5,background:solved?`linear-gradient(135deg,${C.purple},#8b5cf6)`:isToday?"rgba(200,121,255,0.2)":"rgba(255,255,255,0.06)",border:isToday?`1.5px solid ${C.purple}`:"1.5px solid transparent",flexShrink:0}}/>;
                    })}
                  </div>
                ))}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:7,marginTop:11,justifyContent:"flex-end"}}>
                <span style={{fontSize:9,color:C.muted}}>Less</span>
                {[0,.3,.6,1].map(v=><div key={v} style={{width:11,height:11,borderRadius:3,background:v===0?"rgba(255,255,255,0.06)":`rgba(200,121,255,${v})`}}/>)}
                <span style={{fontSize:9,color:C.muted}}>More</span>
              </div>
            </>}
          </div>
          <button style={{...S.btnMain,background:"linear-gradient(135deg,#25D366,#128C7E)"}} onClick={()=>shareWA(`🔥 My EmojiIQ Streak: ${streakCount} days!\nSolving emoji puzzles every day 🧩\nPlay EmojiIQ by Udayon Studio!`)}>📤 Share Streak</button>
        </div>
      </div>
    );
  }

  return <div style={{color:"#fff",padding:20,background:C.bg,minHeight:"100vh"}}>Loading...</div>;
}
