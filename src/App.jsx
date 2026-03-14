import { useState, useEffect, useCallback, useRef } from "react";

// ─── SOUND ENGINE ────────────────────────────────────────────────────────────
const SFX = {
  correct: () => { try { const ctx = new (window.AudioContext||window.webkitAudioContext)(); const t = ctx.currentTime; [523,659,784,1047].forEach((f,i) => { const o=ctx.createOscillator(),g=ctx.createGain(); o.connect(g);g.connect(ctx.destination); o.frequency.value=f;o.type="sine"; g.gain.setValueAtTime(0,t+i*0.08); g.gain.linearRampToValueAtTime(0.18,t+i*0.08+0.03); g.gain.exponentialRampToValueAtTime(0.001,t+i*0.08+0.25); o.start(t+i*0.08);o.stop(t+i*0.08+0.3); }); } catch {} },
  wrong:   () => { try { const ctx = new (window.AudioContext||window.webkitAudioContext)(); const t=ctx.currentTime; [220,180].forEach((f,i)=>{ const o=ctx.createOscillator(),g=ctx.createGain(); o.connect(g);g.connect(ctx.destination); o.frequency.value=f;o.type="sawtooth"; g.gain.setValueAtTime(0.15,t+i*0.15); g.gain.exponentialRampToValueAtTime(0.001,t+i*0.15+0.25); o.start(t+i*0.15);o.stop(t+i*0.15+0.3); }); } catch {} },
  tick:    () => { try { const ctx = new (window.AudioContext||window.webkitAudioContext)(); const o=ctx.createOscillator(),g=ctx.createGain(); o.connect(g);g.connect(ctx.destination); o.frequency.value=880;o.type="sine"; g.gain.setValueAtTime(0.06,ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.08); o.start(ctx.currentTime);o.stop(ctx.currentTime+0.1); } catch {} },
  hint:    () => { try { const ctx = new (window.AudioContext||window.webkitAudioContext)(); const o=ctx.createOscillator(),g=ctx.createGain(); o.connect(g);g.connect(ctx.destination); o.frequency.value=440;o.type="triangle"; g.gain.setValueAtTime(0.1,ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.3); o.start(ctx.currentTime);o.stop(ctx.currentTime+0.3); } catch {} },
};

// ══════════════════════════════════════════════════════════════════════════════
// MASTER PUZZLE DATABASE  (200+ puzzles across all categories & difficulties)
// ══════════════════════════════════════════════════════════════════════════════
const PUZZLE_DB = [
  // ── TECH / APPS ──────────────────────────────────────────────────────────
  {e:["🔥","🦊"],       a:"firefox",         h1:"A popular web browser",       h2:"Mozilla makes it",              h3:"Red panda in the logo",        cat:"Tech",   diff:"easy"},
  {e:["🐦","🔵"],       a:"twitter",         h1:"Social media platform",        h2:"Now called X",                  h3:"Short posts = tweets",         cat:"App",    diff:"easy"},
  {e:["💧","📦"],       a:"dropbox",         h1:"Cloud storage app",            h2:"Box + water drop",              h3:"File syncing service",         cat:"Tech",   diff:"easy"},
  {e:["🐳","🐋"],       a:"docker",          h1:"Dev container platform",       h2:"Whale is its mascot",           h3:"Used in deployment",           cat:"Tech",   diff:"medium"},
  {e:["🍎","🎵"],       a:"apple music",     h1:"Streaming service",            h2:"Made by iPhone company",        h3:"Competes with Spotify",        cat:"App",    diff:"medium"},
  {e:["🔵","🔗"],       a:"linkedin",        h1:"Professional network",         h2:"Job hunting platform",          h3:"Microsoft owns it",            cat:"App",    diff:"easy"},
  {e:["📸","🌅"],       a:"instagram",       h1:"Photo sharing app",            h2:"Meta-owned",                    h3:"Stories and Reels",            cat:"App",    diff:"easy"},
  {e:["👻","👻"],       a:"snapchat",        h1:"Disappearing messages app",    h2:"Ghost logo",                    h3:"Yellow app with a ghost",      cat:"App",    diff:"easy"},
  {e:["🎵","🎵"],       a:"tiktok",          h1:"Short video platform",         h2:"ByteDance owns it",             h3:"For You Page / FYP",           cat:"App",    diff:"easy"},
  {e:["🔴","▶️"],       a:"youtube",         h1:"Video streaming platform",     h2:"Google owns it",                h3:"Subscribe and like!",          cat:"App",    diff:"easy"},
  {e:["🤖","🤖"],       a:"android",         h1:"Google mobile OS",             h2:"Green robot mascot",            h3:"Competes with iOS",            cat:"Tech",   diff:"easy"},
  {e:["🕸️","🕷️"],       a:"spider man",      h1:"Marvel superhero",             h2:"New York web-slinger",          h3:"Peter Parker",                 cat:"Movie",  diff:"easy"},
  {e:["💻","🍎"],       a:"macbook",         h1:"Apple laptop",                 h2:"Aluminum design",               h3:"macOS operating system",       cat:"Tech",   diff:"easy"},
  {e:["📡","🛰️"],       a:"starlink",        h1:"Elon Musk internet service",   h2:"Satellite internet",            h3:"SpaceX project",               cat:"Tech",   diff:"medium"},
  {e:["🧠","🤖"],       a:"artificial intelligence", h1:"Machine thinking", h2:"AI — two words",             h3:"ChatGPT uses this",            cat:"Tech",   diff:"medium"},
  {e:["🔐","🔑"],       a:"password",        h1:"Security credential",          h2:"Secret string of characters",   h3:"Don't share with anyone!",     cat:"Word",   diff:"easy"},
  {e:["📲","💸"],       a:"mobile payment",  h1:"Pay with your phone",          h2:"Tap to pay",                    h3:"Google Pay / Apple Pay",       cat:"Tech",   diff:"medium"},
  {e:["☁️","💾"],       a:"cloud storage",   h1:"Data saved online",            h2:"Access from anywhere",          h3:"Google Drive, iCloud",         cat:"Tech",   diff:"medium"},
  {e:["🌐","🔍"],       a:"google search",   h1:"World's most used search",     h2:"Larry Page founded it",         h3:"Just google it!",              cat:"Tech",   diff:"easy"},
  {e:["📧","✉️"],       a:"email",           h1:"Electronic mail",              h2:"@symbol required",              h3:"Gmail, Outlook, Yahoo",        cat:"Tech",   diff:"easy"},
  {e:["🎮","☁️"],       a:"cloud gaming",    h1:"Play without a console",       h2:"Stream games online",           h3:"Xbox Cloud, GeForce Now",      cat:"Tech",   diff:"medium"},
  {e:["🏠","🔒"],       a:"smart home",      h1:"Connected house devices",      h2:"Alexa controls everything",     h3:"IoT in your home",             cat:"Tech",   diff:"medium"},
  {e:["🔋","⚡"],       a:"electric vehicle",h1:"Car without petrol",          h2:"Tesla makes these",             h3:"EV",                           cat:"Tech",   diff:"easy"},
  {e:["🎧","🎵"],       a:"spotify",         h1:"Music streaming app",          h2:"Green circles logo",            h3:"Swedish company",              cat:"App",    diff:"easy"},
  {e:["💬","🔚"],       a:"whatsapp",        h1:"Messaging app",               h2:"Meta owns it",                  h3:"Green phone icon",             cat:"App",    diff:"easy"},
  {e:["🎤","🔵"],       a:"discord",         h1:"Gamer chat app",               h2:"Voice channels",                h3:"Purple/blue logo",             cat:"App",    diff:"easy"},
  {e:["📰","🐦"],       a:"twitter news",    h1:"Breaking news platform",       h2:"Real-time updates",             h3:"Journalists use it",           cat:"App",    diff:"hard"},
  {e:["🔵","📘"],       a:"facebook",        h1:"Social network",               h2:"Mark Zuckerberg made it",       h3:"Friends and family posts",     cat:"App",    diff:"easy"},
  {e:["📌","🖼️"],       a:"pinterest",       h1:"Image bookmarking",            h2:"Pin your favorite images",      h3:"DIY and recipe inspiration",   cat:"App",    diff:"medium"},
  {e:["🎬","🍿"],       a:"netflix",         h1:"Video streaming",              h2:"Binge-watch platform",          h3:"Original series like Squid Game",cat:"App", diff:"easy"},

  // ── MOVIES / TV ───────────────────────────────────────────────────────────
  {e:["🦁","👑"],       a:"lion king",       h1:"Disney classic movie",         h2:"Hakuna Matata!",                h3:"Simba's journey",              cat:"Movie",  diff:"easy"},
  {e:["🧊","👸"],       a:"frozen",          h1:"Disney animated film",         h2:"Let it go!",                    h3:"Elsa and Anna",                cat:"Movie",  diff:"easy"},
  {e:["🕰️","💡","🔬"], a:"back to the future",h1:"Time travel movie",          h2:"DeLorean car",                  h3:"Marty McFly and Doc Brown",    cat:"Movie",  diff:"hard"},
  {e:["💍","👁️","🌋"], a:"lord of the rings",h1:"Epic fantasy trilogy",        h2:"Tolkien novel",                 h3:"One ring to rule them all",    cat:"Movie",  diff:"hard"},
  {e:["🦸","🕷️"],       a:"avengers",        h1:"Marvel superhero team",        h2:"Assemble!",                     h3:"Iron Man, Thor, Cap",          cat:"Movie",  diff:"easy"},
  {e:["🚂","⚡"],       a:"harry potter",    h1:"Hogwarts Express",             h2:"Magic and wizards",             h3:"Platform 9¾",                  cat:"Movie",  diff:"easy"},
  {e:["🌊","🐠"],       a:"finding nemo",    h1:"Pixar ocean movie",            h2:"Father searches for his son",   h3:"P. Sherman 42 Wallaby Way",    cat:"Movie",  diff:"easy"},
  {e:["🔫","⭐","🚀"],  a:"star wars",       h1:"Space opera franchise",        h2:"May the force be with you",     h3:"Darth Vader is the villain",   cat:"Movie",  diff:"easy"},
  {e:["🦇","🌃"],       a:"batman",          h1:"DC Comics superhero",          h2:"Gotham City protector",         h3:"Bruce Wayne",                  cat:"Movie",  diff:"easy"},
  {e:["🧟","🌍"],       a:"world war z",     h1:"Zombie apocalypse movie",      h2:"Brad Pitt stars in it",         h3:"Global zombie outbreak",       cat:"Movie",  diff:"hard"},
  {e:["🐼","🥋"],       a:"kung fu panda",   h1:"Dreamworks animated movie",    h2:"Po the panda",                  h3:"Skadoosh!",                    cat:"Movie",  diff:"easy"},
  {e:["🤖","🚗"],       a:"transformers",    h1:"Robots in disguise",           h2:"Autobots vs Decepticons",       h3:"Optimus Prime",                cat:"Movie",  diff:"easy"},
  {e:["🌀","🦸"],       a:"doctor strange",  h1:"Marvel sorcerer superhero",    h2:"Multiverse of Madness",         h3:"Cumberbatch plays him",        cat:"Movie",  diff:"medium"},
  {e:["🐉","🐻"],       a:"brave",           h1:"Pixar princess movie",         h2:"Scottish highland setting",     h3:"Merida and the bear",          cat:"Movie",  diff:"medium"},
  {e:["🏎️","💨"],       a:"fast and furious",h1:"Action racing franchise",     h2:"Vin Diesel stars in it",        h3:"Family above all",             cat:"Movie",  diff:"medium"},
  {e:["🧁","🔪"],       a:"kill bill",       h1:"Quentin Tarantino film",       h2:"The Bride's revenge",           h3:"Uma Thurman yellow suit",      cat:"Movie",  diff:"hard"},
  {e:["👽","🌽"],       a:"signs",           h1:"M. Night Shyamalan film",      h2:"Crop circles appear",           h3:"Mel Gibson on a farm",         cat:"Movie",  diff:"hard"},
  {e:["🦈","🏖️"],       a:"jaws",            h1:"Steven Spielberg thriller",    h2:"Shark attacks a beach town",    h3:"We're gonna need a bigger boat",cat:"Movie", diff:"medium"},
  {e:["🐰","🌀"],       a:"alice in wonderland",h1:"Falling down a rabbit hole",h2:"Disney classic fantasy",       h3:"Off with their heads!",        cat:"Movie",  diff:"medium"},
  {e:["🌹","🕰️"],       a:"beauty and the beast",h1:"Disney enchanted castle", h2:"Belle and the cursed prince",   h3:"Tale as old as time",          cat:"Movie",  diff:"easy"},

  // ── BOLLYWOOD ─────────────────────────────────────────────────────────────
  {e:["🎵","👑","💃"],  a:"devdas",          h1:"Tragic love story",            h2:"Shah Rukh Khan classic",        h3:"Paro and Chandramukhi",        cat:"Bollywood",diff:"medium"},
  {e:["🤸","🎯","💥"],  a:"dangal",          h1:"Wrestling biopic",             h2:"Aamir Khan starrer",            h3:"Phogat sisters story",         cat:"Bollywood",diff:"easy"},
  {e:["💰","🎓","🏃"],  a:"3 idiots",        h1:"Engineering college comedy",   h2:"Aamir Khan + Rancho",           h3:"All Izz Well!",                cat:"Bollywood",diff:"easy"},
  {e:["🕵️","🎩","🔍"], a:"kahaani",         h1:"Mystery thriller",             h2:"Vidya Balan in Kolkata",        h3:"Pregnant woman detective",     cat:"Bollywood",diff:"medium"},
  {e:["🌙","⭐","🎸"],  a:"rockstar",        h1:"Ranbir Kapoor musician",       h2:"Janardhan becomes Jordan",      h3:"Sadda Haq song",               cat:"Bollywood",diff:"medium"},
  {e:["🔥","👊","🏘️"], a:"gangs of wasseypur",h1:"Gangster saga",              h2:"Anurag Kashyap film",           h3:"Coal mafia story",             cat:"Bollywood",diff:"hard"},
  {e:["🎭","👰","💔"],  a:"dil dhadakne do", h1:"Family drama on a cruise",     h2:"Priyanka, Ranveer, Anushka",    h3:"Mehra family vacation",        cat:"Bollywood",diff:"hard"},
  {e:["🌺","💃","🎵"],  a:"devdas",          h1:"Classic tragedy",              h2:"Madhuri Dixit dances",          h3:"Dola Re Dola song",            cat:"Bollywood",diff:"medium"},
  {e:["🚂","🎵","💑"],  a:"dilwale dulhania le jayenge",h1:"DDLJ",             h2:"Raj and Simran",                h3:"Mustard fields of Punjab",     cat:"Bollywood",diff:"hard"},
  {e:["🧠","💡","🏫"],  a:"taare zameen par", h1:"Child with dyslexia",         h2:"Aamir Khan as teacher",         h3:"Every child is special",       cat:"Bollywood",diff:"medium"},
  {e:["🤼","👊","🥇"],  a:"sultan",          h1:"Wrestler's comeback story",    h2:"Salman Khan starrer",           h3:"Haryana wrestling champion",   cat:"Bollywood",diff:"medium"},
  {e:["🎪","🎠","🌈"],  a:"barfi",           h1:"Deaf-mute character",          h2:"Ranbir Kapoor's performance",   h3:"Darjeeling setting",           cat:"Bollywood",diff:"medium"},
  {e:["🌍","🌈","❤️"],  a:"zindagi na milegi dobara",h1:"Three friends road trip",h2:"Spain adventure film",        h3:"Hrithik, Farhan, Abhay",       cat:"Bollywood",diff:"hard"},
  {e:["🔫","💼","🕵️"], a:"don",             h1:"Crime thriller",               h2:"SRK plays gangster",            h3:"Don ko pakadna mushkil hai",   cat:"Bollywood",diff:"medium"},
  {e:["🏠","👨‍👩‍👧","💕"],a:"hum aapke hain kaun",h1:"Family wedding drama",  h2:"Salman & Madhuri",              h3:"Pehla Pehla Pyar song",        cat:"Bollywood",diff:"hard"},

  // ── CRICKET ───────────────────────────────────────────────────────────────
  {e:["🏏","👑","🇮🇳"], a:"virat kohli",     h1:"Indian batting legend",        h2:"Run machine",                   h3:"King Kohli",                   cat:"Cricket",diff:"easy"},
  {e:["🌙","🏟️","⚡"],  a:"ipl",             h1:"T20 cricket league",           h2:"Franchise tournament",          h3:"Indian Premier League",        cat:"Cricket",diff:"easy"},
  {e:["🏆","2011","🎉"], a:"world cup",       h1:"Cricket's biggest trophy",     h2:"India won at home",             h3:"MS Dhoni's six",               cat:"Cricket",diff:"easy"},
  {e:["🧤","🚁","💥"],  a:"helicopter shot", h1:"Famous batting stroke",        h2:"MS Dhoni signature",            h3:"Ball goes over fine leg",      cat:"Cricket",diff:"medium"},
  {e:["👴","🏏","📖"],  a:"sachin tendulkar",h1:"God of cricket",               h2:"100 international centuries",   h3:"Master Blaster",               cat:"Cricket",diff:"easy"},
  {e:["🐅","🏏","🟡"],  a:"chennai super kings",h1:"IPL franchise",             h2:"Dhoni's team",                  h3:"Whistle Podu!",                cat:"Cricket",diff:"medium"},
  {e:["🔵","💜","🏆"],  a:"mumbai indians",  h1:"Most IPL titles",              h2:"Wankhede stadium",              h3:"MI paltan!",                   cat:"Cricket",diff:"medium"},
  {e:["🎯","6️⃣","🔔"],  a:"duckworth lewis", h1:"Rain rule in cricket",         h2:"Target calculation method",     h3:"D/L method",                   cat:"Cricket",diff:"hard"},
  {e:["🥊","⚡","🏏"],  a:"yorker",          h1:"Ball pitched at feet",         h2:"Hardest delivery to hit",       h3:"Waqar Younis master",          cat:"Cricket",diff:"medium"},
  {e:["🏃","🔄","🏏"],  a:"run out",         h1:"Dismissal in cricket",         h2:"Batsman out of crease",         h3:"Direct hit wicket",            cat:"Cricket",diff:"easy"},
  {e:["🏏","🇦🇺","🏆"], a:"ashes",           h1:"England vs Australia test series",h2:"Urn filled with ashes",      h3:"Oldest cricket rivalry",       cat:"Cricket",diff:"hard"},
  {e:["🖐️","🏏","🌀"],  a:"spin bowling",    h1:"Slow tricky delivery",         h2:"Ball rotates in air",           h3:"Warne and Murali mastered it", cat:"Cricket",diff:"medium"},

  // ── INDIAN BRANDS ─────────────────────────────────────────────────────────
  {e:["🦁","🥛","☕"],  a:"amul",            h1:"Dairy brand",                  h2:"Utterly Butterly Delicious",    h3:"Gujarat cooperative",          cat:"Indian Brand",diff:"easy"},
  {e:["🚗","🔵","♾️"],  a:"tata",            h1:"Conglomerate group",           h2:"Salt to software",              h3:"Ratan Tata's legacy",          cat:"Indian Brand",diff:"easy"},
  {e:["🛵","💚","🤝"],  a:"ola",             h1:"Ride sharing app",             h2:"Book a cab or scooter",         h3:"Indian Uber rival",            cat:"Indian Brand",diff:"easy"},
  {e:["📱","💙","🇮🇳"], a:"flipkart",        h1:"E-commerce giant",             h2:"Big Billion Days sale",         h3:"Sachin Bansal started it",     cat:"Indian Brand",diff:"medium"},
  {e:["💊","🌿","🇮🇳"], a:"patanjali",       h1:"Ayurvedic brand",              h2:"Baba Ramdev's company",         h3:"Yoga + FMCG products",         cat:"Indian Brand",diff:"easy"},
  {e:["🍕","🛵","⏱️"],  a:"swiggy",          h1:"Food delivery app",            h2:"Orange delivery bags",          h3:"Instamart for groceries",      cat:"Indian Brand",diff:"easy"},
  {e:["🏦","💸","📲"],  a:"paytm",           h1:"Digital payments",             h2:"One97 Communications",         h3:"Scan QR and pay",              cat:"Indian Brand",diff:"easy"},
  {e:["🟠","🛒","🚀"],  a:"amazon india",    h1:"E-commerce marketplace",       h2:"Prime membership",              h3:"Jeff Bezos started it",        cat:"Indian Brand",diff:"easy"},
  {e:["🏍️","🔶","⚡"],  a:"ola electric",    h1:"Electric scooter brand",       h2:"Ola's EV division",             h3:"S1 Pro scooter",               cat:"Indian Brand",diff:"medium"},
  {e:["🎓","📱","🔶"],  a:"byju's",          h1:"EdTech unicorn",               h2:"Learning app",                  h3:"Think and Learn",              cat:"Indian Brand",diff:"medium"},
  {e:["🏠","🔑","💻"],  a:"housing.com",     h1:"Real estate portal",           h2:"Find flats to rent/buy",        h3:"Indian property search",       cat:"Indian Brand",diff:"hard"},
  {e:["🚕","🟡","🏙️"],  a:"rapido",          h1:"Bike taxi app",                h2:"Two-wheeler rides",             h3:"Budget ride option India",     cat:"Indian Brand",diff:"medium"},
  {e:["🍔","🔴","⚡"],  a:"zomato",          h1:"Food delivery platform",       h2:"Red color branding",            h3:"Restaurant discovery app",     cat:"Indian Brand",diff:"easy"},
  {e:["🧴","🌿","🍃"],  a:"himalaya",        h1:"Herbal healthcare brand",      h2:"Neem face wash famous",         h3:"Since 1930 in India",          cat:"Indian Brand",diff:"medium"},
  {e:["✈️","🇮🇳","🔵"], a:"indigo airlines",  h1:"Budget airline India",         h2:"Blue and white planes",         h3:"On-time performance leader",   cat:"Indian Brand",diff:"medium"},

  // ── FOOD & DRINK ──────────────────────────────────────────────────────────
  {e:["🍣","🍱"],       a:"sushi",           h1:"Japanese cuisine",             h2:"Raw fish on rice",              h3:"Served with wasabi and ginger",cat:"Food",   diff:"easy"},
  {e:["🍕","🇮🇹"],      a:"pizza",           h1:"Italian dish",                 h2:"Round with toppings",           h3:"Mozzarella and tomato sauce",  cat:"Food",   diff:"easy"},
  {e:["🌮","🇲🇽"],      a:"taco",            h1:"Mexican street food",          h2:"Folded tortilla",               h3:"Salsa and guacamole",          cat:"Food",   diff:"easy"},
  {e:["🍜","🥢"],       a:"noodles",         h1:"Long pasta",                   h2:"Asia's favourite carb",         h3:"Ramen, Pad Thai, Hakka",       cat:"Food",   diff:"easy"},
  {e:["🫓","🧅","🧄"],  a:"garlic bread",    h1:"Buttery baked bread",          h2:"Italian restaurant staple",     h3:"Goes with pasta",              cat:"Food",   diff:"easy"},
  {e:["🥭","🇮🇳"],      a:"mango lassi",     h1:"Indian summer drink",          h2:"Mango blended with yoghurt",    h3:"Thick and sweet beverage",     cat:"Food",   diff:"medium"},
  {e:["🍛","🌶️","🇮🇳"], a:"biryani",         h1:"Layered rice dish",            h2:"Dum cooking method",            h3:"Hyderabadi is most famous",   cat:"Food",   diff:"easy"},
  {e:["🥐","☕"],       a:"croissant",       h1:"Flaky French pastry",          h2:"Crescent shape",                h3:"Butter-layered baked good",    cat:"Food",   diff:"medium"},
  {e:["🧇","🍯"],       a:"waffle",          h1:"Grid-patterned breakfast",     h2:"Cooked in a special iron",      h3:"With maple syrup",             cat:"Food",   diff:"easy"},
  {e:["🍦","🍦"],       a:"ice cream",       h1:"Frozen dessert",               h2:"Vanilla, chocolate, strawberry",h3:"Served in cone or cup",        cat:"Food",   diff:"easy"},
  {e:["☕","🥛","💨"],  a:"cappuccino",      h1:"Italian coffee drink",         h2:"Espresso + milk foam",          h3:"Served in small cup",          cat:"Food",   diff:"medium"},
  {e:["🌯","🥙"],       a:"wrap",            h1:"Rolled sandwich",              h2:"Tortilla filled with veggies",  h3:"Portable meal",                cat:"Food",   diff:"easy"},
  {e:["🍲","🇰🇷"],      a:"kimchi",          h1:"Korean fermented dish",        h2:"Spicy cabbage",                 h3:"K-cuisine staple",             cat:"Food",   diff:"medium"},
  {e:["🧆","🍞"],       a:"falafel",         h1:"Middle Eastern snack",         h2:"Deep fried chickpea balls",     h3:"Served in pita bread",         cat:"Food",   diff:"medium"},

  // ── SCIENCE & NATURE ──────────────────────────────────────────────────────
  {e:["🌍","🔄","🌡️"],  a:"climate change",  h1:"Global warming issue",         h2:"CO2 emissions cause it",        h3:"Paris Agreement topic",        cat:"Science", diff:"medium"},
  {e:["⚛️","💥"],       a:"nuclear energy",  h1:"Power from atoms",             h2:"Uranium and plutonium",         h3:"Chernobyl and Fukushima",      cat:"Science", diff:"medium"},
  {e:["🌕","🚀","👨‍🚀"], a:"moon landing",    h1:"Apollo 11 mission",            h2:"1969 achievement",              h3:"Neil Armstrong first steps",   cat:"Science", diff:"medium"},
  {e:["🧬","🔬"],       a:"dna",             h1:"Genetic code",                 h2:"Double helix structure",        h3:"Found in every cell",          cat:"Science", diff:"medium"},
  {e:["⚡","🌩️"],       a:"lightning",       h1:"Electrical discharge",         h2:"Thunderstorm phenomenon",       h3:"Benjamin Franklin researched it",cat:"Science",diff:"easy"},
  {e:["🌑","🌒","🌕"],  a:"moon phases",     h1:"Monthly lunar cycle",          h2:"New moon to full moon",         h3:"28 day cycle",                 cat:"Science", diff:"medium"},
  {e:["🌊","🔄","🌧️"],  a:"water cycle",     h1:"Evaporation and rainfall",     h2:"Clouds form and precipitate",   h3:"Hydrological cycle",           cat:"Science", diff:"easy"},
  {e:["🐛","🦋"],       a:"metamorphosis",   h1:"Complete transformation",      h2:"Caterpillar to butterfly",      h3:"4 stages: egg larva pupa adult",cat:"Science",diff:"medium"},
  {e:["🌋","💨"],       a:"volcano",         h1:"Mountain that erupts",         h2:"Lava and ash",                  h3:"Krakatoa and Vesuvius",        cat:"Science", diff:"easy"},
  {e:["⭐","💥","⚫"],  a:"black hole",      h1:"Extreme space object",         h2:"Nothing can escape its gravity",h3:"Event horizon",                cat:"Science", diff:"medium"},
  {e:["🔭","⭐","🌌"],  a:"astronomy",       h1:"Study of stars",               h2:"Telescope is the tool",         h3:"Galileo was famous for it",    cat:"Science", diff:"medium"},
  {e:["🧲","⬆️"],       a:"gravity",         h1:"Force pulling objects down",   h2:"Newton's apple discovery",     h3:"9.8 m/s² on Earth",            cat:"Science", diff:"easy"},

  // ── WORDS / PHRASES ───────────────────────────────────────────────────────
  {e:["📚","🐛"],       a:"bookworm",        h1:"Someone who loves reading",    h2:"A tiny creature",               h3:"Lives in books!",              cat:"Word",    diff:"easy"},
  {e:["🌧️","☀️"],       a:"rainbow",         h1:"Colourful arc after rain",     h2:"7 colours ROYGBIV",             h3:"Pot of gold at the end!",      cat:"Word",    diff:"easy"},
  {e:["🔥","💧"],       a:"firefighter",     h1:"Emergency service person",     h2:"Uses hose and ladder",          h3:"Puts out fires",               cat:"Word",    diff:"easy"},
  {e:["🌙","😴"],       a:"midnight",        h1:"12 AM exactly",                h2:"Middle of the night",           h3:"Cinderella's deadline",        cat:"Word",    diff:"easy"},
  {e:["🌊","🏄"],       a:"surfing",         h1:"Beach water sport",            h2:"Ride the wave",                 h3:"Hawaii is famous for it",      cat:"Word",    diff:"easy"},
  {e:["🎯","🏹"],       a:"archery",         h1:"Olympic sport",                h2:"Bow and arrow",                 h3:"Hit the bullseye",             cat:"Word",    diff:"easy"},
  {e:["💡","🧠"],       a:"brainwave",       h1:"Sudden smart idea",            h2:"Lightbulb moment",              h3:"Flash of inspiration",         cat:"Word",    diff:"medium"},
  {e:["🏔️","🌊"],       a:"mountain wave",   h1:"Atmospheric phenomenon",       h2:"Air flowing over peaks",        h3:"Pilots know this",             cat:"Word",    diff:"hard"},
  {e:["⏰","🏃"],       a:"deadline",        h1:"Last moment for work",         h2:"Submit before it passes",       h3:"Office nightmare",             cat:"Word",    diff:"easy"},
  {e:["🌱","💪"],       a:"growth",          h1:"Process of becoming bigger",   h2:"Plants and companies do this",  h3:"Progress over time",           cat:"Word",    diff:"easy"},
  {e:["🎭","😂","😢"],  a:"drama",           h1:"Theatre and emotions",         h2:"Overreacting situation",        h3:"Comedy and tragedy masks",     cat:"Word",    diff:"easy"},
  {e:["🗝️","🔓"],       a:"unlock",          h1:"Opening a locked thing",       h2:"Key turns the mechanism",       h3:"Opposite of lock",             cat:"Word",    diff:"easy"},
  {e:["🌅","🌄"],       a:"sunrise",         h1:"Start of a new day",           h2:"Sun appearing on horizon",      h3:"Golden hour in morning",       cat:"Word",    diff:"easy"},
  {e:["🌠","💫"],       a:"shooting star",   h1:"Meteor entering atmosphere",   h2:"Make a wish!",                  h3:"Streak across night sky",      cat:"Word",    diff:"easy"},
  {e:["🎲","🎯"],       a:"bullseye",        h1:"Perfect hit in target",        h2:"Dead center of the target",     h3:"Dart board center",            cat:"Word",    diff:"easy"},
  {e:["🏋️","💪"],       a:"workout",         h1:"Exercise session",             h2:"Gym or home",                   h3:"Builds strength and fitness",  cat:"Word",    diff:"easy"},
  {e:["🔁","🔄"],       a:"loop",            h1:"Repeating sequence",           h2:"Goes around and around",        h3:"Coding construct",             cat:"Word",    diff:"easy"},
  {e:["🧩","💡"],       a:"puzzle",          h1:"Mental challenge",             h2:"Pieces fit together",           h3:"Crossword and jigsaw",         cat:"Word",    diff:"easy"},
  {e:["🌈","💛"],       a:"optimism",        h1:"Positive outlook",             h2:"Seeing the bright side",        h3:"Glass half full mindset",      cat:"Word",    diff:"medium"},
  {e:["🕊️","🌿"],       a:"peace",           h1:"Absence of war",               h2:"Harmony and calm",              h3:"Dove is its symbol",           cat:"Word",    diff:"easy"},

  // ── BRANDS / GLOBAL ───────────────────────────────────────────────────────
  {e:["🌙","☕"],       a:"starbucks",       h1:"Famous coffee chain",          h2:"Mermaid logo",                  h3:"Frappuccino is their drink",   cat:"Brand",   diff:"easy"},
  {e:["🍔","🍟","🟡"],  a:"mcdonalds",       h1:"Fast food chain",              h2:"Golden arches logo",            h3:"Big Mac and Happy Meal",       cat:"Brand",   diff:"easy"},
  {e:["🅽","🟥"],       a:"netflix",         h1:"Streaming giant",              h2:"Are you still watching?",       h3:"Red N logo",                   cat:"Brand",   diff:"easy"},
  {e:["🍎","🖥️"],       a:"apple",           h1:"Tech company",                 h2:"Steve Jobs founded it",         h3:"iPhone and MacBook maker",     cat:"Brand",   diff:"easy"},
  {e:["🛍️","🟠"],       a:"amazon",          h1:"E-commerce giant",             h2:"Smile logo",                    h3:"Jeff Bezos founded it",        cat:"Brand",   diff:"easy"},
  {e:["🔍","🌐"],       a:"google",          h1:"Search engine",                h2:"GOOG on stock market",          h3:"Sundar Pichai is CEO",         cat:"Brand",   diff:"easy"},
  {e:["👟","✅"],       a:"nike",            h1:"Sports brand",                 h2:"Just Do It!",                   h3:"Swoosh logo",                  cat:"Brand",   diff:"easy"},
  {e:["🐊","👕"],       a:"lacoste",         h1:"French fashion brand",         h2:"Crocodile logo",                h3:"Tennis heritage",              cat:"Brand",   diff:"medium"},
  {e:["☕","🟤"],       a:"nescafe",         h1:"Instant coffee brand",         h2:"Nestle product",                h3:"Red mug logo",                 cat:"Brand",   diff:"easy"},
  {e:["🧴","🌊"],       a:"surf excel",      h1:"Detergent brand India",        h2:"Daag achhe hain!",              h3:"Laundry washing powder",       cat:"Brand",   diff:"medium"},
  {e:["🚙","⚡","🔴"],  a:"tesla",           h1:"Electric car company",         h2:"Elon Musk company",             h3:"Model S, X, 3, Y",             cat:"Brand",   diff:"easy"},
  {e:["🍫","🟣"],       a:"cadbury",         h1:"Chocolate brand",              h2:"Purple packaging",              h3:"Dairy Milk",                   cat:"Brand",   diff:"easy"},
  {e:["🐎","👟"],       a:"mustang",         h1:"Ford's iconic sports car",     h2:"Horse logo",                    h3:"American muscle car",          cat:"Brand",   diff:"medium"},
  {e:["🌍","🤝"],       a:"united nations",  h1:"International organisation",   h2:"193 member countries",          h3:"Peacekeeping global body",     cat:"Brand",   diff:"medium"},

  // ── GEOGRAPHY / PLACES ────────────────────────────────────────────────────
  {e:["🗼","🥐"],       a:"paris",           h1:"City of Love",                 h2:"Eiffel Tower location",         h3:"Capital of France",            cat:"Place",   diff:"easy"},
  {e:["🗽","🍎"],       a:"new york",        h1:"The Big Apple",                h2:"Times Square",                  h3:"Empire State Building",        cat:"Place",   diff:"easy"},
  {e:["🍵","🌸","🗻"],  a:"japan",           h1:"Land of the Rising Sun",       h2:"Mount Fuji country",            h3:"Tokyo is its capital",         cat:"Place",   diff:"easy"},
  {e:["🦁","🌍"],       a:"africa",          h1:"Largest continent by land",    h2:"Sahara desert location",        h3:"Safari and wildlife",          cat:"Place",   diff:"easy"},
  {e:["🛕","🧘","🐘"],  a:"india",           h1:"Billion+ population",          h2:"Namaste and spices",            h3:"Taj Mahal country",            cat:"Place",   diff:"easy"},
  {e:["🦘","🤿","🌞"],  a:"australia",       h1:"Land Down Under",              h2:"Kangaroos and koalas",          h3:"Sydney Opera House",           cat:"Place",   diff:"easy"},
  {e:["🏰","🍺"],       a:"germany",         h1:"Beer and castles country",     h2:"Oktoberfest",                   h3:"Berlin is the capital",        cat:"Place",   diff:"easy"},
  {e:["⛩️","🐉","🥢"],  a:"china",           h1:"Great Wall country",           h2:"Dragon culture",                h3:"Beijing is the capital",       cat:"Place",   diff:"easy"},
  {e:["🎻","🏔️","🧀"],  a:"switzerland",     h1:"Neutral European country",     h2:"Alps and cheese famous",        h3:"Swiss watches",                cat:"Place",   diff:"medium"},
  {e:["🌮","⚽","🌵"],  a:"mexico",          h1:"North American country",       h2:"Tacos and tequila",             h3:"Chichen Itza pyramids",        cat:"Place",   diff:"easy"},
  {e:["🌺","🏄","🌋"],  a:"hawaii",          h1:"US island state",              h2:"Aloha culture",                 h3:"Pineapple and surfing",        cat:"Place",   diff:"easy"},
  {e:["🦁","🌴","🏔️"],  a:"kenya",           h1:"East African country",         h2:"Maasai Mara safari",            h3:"Nairobi capital",              cat:"Place",   diff:"medium"},
];

// ─── PUZZLE ENGINE ────────────────────────────────────────────────────────────
class PuzzleEngine {
  constructor() { this.usedIds = new Set(); this.db = PUZZLE_DB; }

  getByDifficulty(diff) { return this.db.filter(p => p.diff === diff); }
  getByCategory(cat)    { return this.db.filter(p => p.cat === cat); }

  getRandom(diff = "medium", cat = null) {
    let pool = cat ? this.getByCategory(cat) : this.getByDifficulty(diff);
    const unused = pool.filter(p => !this.usedIds.has(p.a));
    const src = unused.length ? unused : pool; // reset when all used
    if (!unused.length) this.usedIds.clear();
    const pick = src[Math.floor(Math.random() * src.length)];
    this.usedIds.add(pick.a);
    return { emojis: pick.e, answer: pick.a, hint1: pick.h1, hint2: pick.h2, hint3: pick.h3, category: pick.cat, difficulty: pick.diff };
  }

  getDaily() {
    // Deterministic daily puzzle based on date seed
    const dayNum = Math.floor(Date.now() / 86400000);
    const idx = dayNum % this.db.length;
    const p = this.db[idx];
    return { emojis: p.e, answer: p.a, hint1: p.h1, hint2: p.h2, hint3: p.h3, category: p.cat, difficulty: p.diff };
  }

  getTheme(cat, idx) {
    const pool = this.getByCategory(cat);
    return pool.length ? { ...pool[idx % pool.length], emojis: pool[idx % pool.length].e, answer: pool[idx % pool.length].a, hint1: pool[idx % pool.length].h1, hint2: pool[idx % pool.length].h2, hint3: pool[idx % pool.length].h3, category: pool[idx % pool.length].cat, difficulty: pool[idx % pool.length].diff } : null;
  }

  getForMP(diff) { return this.getRandom(diff); }

  getStats() {
    const total = this.db.length;
    const cats = [...new Set(this.db.map(p => p.cat))];
    return { total, cats: cats.length, easy: this.db.filter(p=>p.diff==="easy").length, medium: this.db.filter(p=>p.diff==="medium").length, hard: this.db.filter(p=>p.diff==="hard").length };
  }
}

const engine = new PuzzleEngine();

// ─── THEME CONFIG ─────────────────────────────────────────────────────────────
const THEMES = {
  Bollywood:    { icon:"🎬", color:"#ff6b35", gradient:"linear-gradient(135deg,#ff6b35,#f7c59f)", cat:"Bollywood" },
  Cricket:      { icon:"🏏", color:"#00a651", gradient:"linear-gradient(135deg,#00a651,#a8e063)", cat:"Cricket" },
  "Indian Brand":{ icon:"🇮🇳", color:"#ff9933", gradient:"linear-gradient(135deg,#ff9933,#138808)", cat:"Indian Brand" },
  Food:         { icon:"🍛", color:"#ef8c8c", gradient:"linear-gradient(135deg,#ef8c8c,#f7c59f)", cat:"Food" },
  Science:      { icon:"🔬", color:"#60a5fa", gradient:"linear-gradient(135deg,#60a5fa,#a78bfa)", cat:"Science" },
  Place:        { icon:"🌍", color:"#34d399", gradient:"linear-gradient(135deg,#34d399,#60a5fa)", cat:"Place" },
};

// ─── LANGUAGES ────────────────────────────────────────────────────────────────
const LANGUAGES = [
  {code:"en",name:"English",    flag:"🇬🇧",region:"International"},
  {code:"hi",name:"हिंदी",      flag:"🇮🇳",region:"Indian"},
  {code:"mr",name:"मराठी",      flag:"🇮🇳",region:"Indian"},
  {code:"bn",name:"বাংলা",      flag:"🇮🇳",region:"Indian"},
  {code:"te",name:"తెలుగు",     flag:"🇮🇳",region:"Indian"},
  {code:"ta",name:"தமிழ்",      flag:"🇮🇳",region:"Indian"},
  {code:"gu",name:"ગુજરાતી",    flag:"🇮🇳",region:"Indian"},
  {code:"kn",name:"ಕನ್ನಡ",      flag:"🇮🇳",region:"Indian"},
  {code:"ml",name:"മലയാളം",     flag:"🇮🇳",region:"Indian"},
  {code:"pa",name:"ਪੰਜਾਬੀ",     flag:"🇮🇳",region:"Indian"},
  {code:"or",name:"ଓଡ଼ିଆ",      flag:"🇮🇳",region:"Indian"},
  {code:"as",name:"অসমীয়া",    flag:"🇮🇳",region:"Indian"},
  {code:"ur",name:"اردو",       flag:"🇮🇳",region:"Indian"},
  {code:"ne",name:"नेपाली",     flag:"🇮🇳",region:"Indian"},
  {code:"sa",name:"संस्कृत",    flag:"🇮🇳",region:"Indian"},
  {code:"bho",name:"भोजपुरी",   flag:"🇮🇳",region:"Indian"},
  {code:"mai",name:"मैथिली",    flag:"🇮🇳",region:"Indian"},
  {code:"raj",name:"राजस्थानी", flag:"🇮🇳",region:"Indian"},
  {code:"kok",name:"कोंकणी",    flag:"🇮🇳",region:"Indian"},
  {code:"doi",name:"डोगरी",     flag:"🇮🇳",region:"Indian"},
  {code:"sat",name:"ᱥᱟᱱᱛᱟᱲᱤ",  flag:"🇮🇳",region:"Indian"},
  {code:"brx",name:"बड़ो",       flag:"🇮🇳",region:"Indian"},
  {code:"mni",name:"মৈতৈলোন্",  flag:"🇮🇳",region:"Indian"},
  {code:"sd", name:"سنڌي",     flag:"🇮🇳",region:"Indian"},
  {code:"ks", name:"كٲشُر",    flag:"🇮🇳",region:"Indian"},
  {code:"es",name:"Español",    flag:"🇪🇸",region:"International"},
  {code:"fr",name:"Français",   flag:"🇫🇷",region:"International"},
  {code:"de",name:"Deutsch",    flag:"🇩🇪",region:"International"},
  {code:"pt",name:"Português",  flag:"🇧🇷",region:"International"},
  {code:"ru",name:"Русский",    flag:"🇷🇺",region:"International"},
  {code:"ja",name:"日本語",      flag:"🇯🇵",region:"International"},
  {code:"ko",name:"한국어",      flag:"🇰🇷",region:"International"},
  {code:"zh",name:"中文",        flag:"🇨🇳",region:"International"},
  {code:"ar",name:"العربية",    flag:"🇸🇦",region:"International"},
  {code:"tr",name:"Türkçe",     flag:"🇹🇷",region:"International"},
  {code:"it",name:"Italiano",   flag:"🇮🇹",region:"International"},
  {code:"nl",name:"Nederlands", flag:"🇳🇱",region:"International"},
  {code:"pl",name:"Polski",     flag:"🇵🇱",region:"International"},
  {code:"sv",name:"Svenska",    flag:"🇸🇪",region:"International"},
  {code:"id",name:"Bahasa Indonesia",flag:"🇮🇩",region:"International"},
  {code:"vi",name:"Tiếng Việt", flag:"🇻🇳",region:"International"},
  {code:"th",name:"ภาษาไทย",    flag:"🇹🇭",region:"International"},
  {code:"ms",name:"Bahasa Melayu",flag:"🇲🇾",region:"International"},
  {code:"sw",name:"Kiswahili",  flag:"🇰🇪",region:"International"},
  {code:"uk",name:"Українська", flag:"🇺🇦",region:"International"},
  {code:"he",name:"עברית",      flag:"🇮🇱",region:"International"},
  {code:"el",name:"Ελληνικά",   flag:"🇬🇷",region:"International"},
  {code:"fi",name:"Suomi",      flag:"🇫🇮",region:"International"},
  {code:"da",name:"Dansk",      flag:"🇩🇰",region:"International"},
  {code:"no",name:"Norsk",      flag:"🇳🇴",region:"International"},
  {code:"cs",name:"Čeština",    flag:"🇨🇿",region:"International"},
  {code:"ro",name:"Română",     flag:"🇷🇴",region:"International"},
  {code:"hu",name:"Magyar",     flag:"🇭🇺",region:"International"},
  {code:"fil",name:"Filipino",  flag:"🇵🇭",region:"International"},
  {code:"my",name:"မြန်မာ",     flag:"🇲🇲",region:"International"},
  {code:"af",name:"Afrikaans",  flag:"🇿🇦",region:"International"},
];

// ─── UTILS ────────────────────────────────────────────────────────────────────
const getTodayKey = () => new Date().toISOString().split("T")[0];
const genCode = () => { const c="ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let s=""; for(let i=0;i<6;i++) s+=c[Math.floor(Math.random()*c.length)]; return s; };
const getLast70Days = () => { const d=[]; for(let i=69;i>=0;i--){ const x=new Date(); x.setDate(x.getDate()-i); d.push(x.toISOString().split("T")[0]); } return d; };

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function EmojiIQ() {
  const [lang, setLang]             = useState("en");
  const [screen, setScreen]         = useState("home");
  const [soundOn, setSoundOn]       = useState(true);
  const [difficulty, setDifficulty] = useState("medium");

  const [puzzle, setPuzzle]         = useState(null);
  const [guess, setGuess]           = useState("");
  const [hintsUsed, setHintsUsed]   = useState(0);
  const [feedback, setFeedback]     = useState(null);
  const [showAns, setShowAns]       = useState(false);
  const [themeIdx, setThemeIdx]     = useState(0);
  const [activeTheme, setActiveTheme] = useState(null);

  const [score, setScore]           = useState(0);
  const [streak, setStreak]         = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  const [dailyDone, setDailyDone]   = useState(false);
  const [dailyHintsUsed, setDailyHintsUsed] = useState(0);

  const [players, setPlayers]       = useState([
    {name:"Rahul",score:0,avatar:"🧑"},{name:"Priya",score:0,avatar:"👩"},{name:"You",score:0,avatar:"🎮",isYou:true}
  ]);
  const [mpRound, setMpRound]       = useState(1);
  const [mpTimer, setMpTimer]       = useState(30);
  const [mpActive, setMpActive]     = useState(false);

  const [leaderboard, setLeaderboard] = useState([]);
  const [playerName, setPlayerName]   = useState("");
  const [nameInput, setNameInput]     = useState("");
  const [showNameModal, setShowNameModal] = useState(false);
  const [lbLoading, setLbLoading]    = useState(false);

  const [creatorEmojis, setCreatorEmojis] = useState(["","",""]);
  const [creatorAnswer, setCreatorAnswer] = useState("");
  const [creatorHint1, setCreatorHint1]   = useState("");
  const [creatorHint2, setCreatorHint2]   = useState("");
  const [creatorCategory, setCreatorCategory] = useState("Custom");
  const [createdCode, setCreatedCode]     = useState("");
  const [loadCode, setLoadCode]           = useState("");
  const [creatorStep, setCreatorStep]     = useState("create");
  const [loadedPuzzle, setLoadedPuzzle]   = useState(null);
  const [loadError, setLoadError]         = useState("");

  const [streakDates, setStreakDates]     = useState([]);
  const [streakCount, setStreakCount]     = useState(0);
  const [calLoading, setCalLoading]       = useState(true);

  const [shake, setShake]           = useState(false);
  const [confetti, setConfetti]     = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [langSearch, setLangSearch] = useState("");

  const [dbStats] = useState(() => engine.getStats());

  const play = useCallback((s) => { if (soundOn) SFX[s]?.(); }, [soundOn]);
  const boom = () => { setConfetti(true); setTimeout(()=>setConfetti(false),2200); };
  const trigShake = () => { setShake(true); setTimeout(()=>setShake(false),500); play("wrong"); };
  const resetPS = () => { setGuess(""); setHintsUsed(0); setFeedback(null); setShowAns(false); };

  const currentLang = LANGUAGES.find(l=>l.code===lang)||LANGUAGES[0];
  const filtered    = LANGUAGES.filter(l=>l.name.toLowerCase().includes(langSearch.toLowerCase()));

  // MP timer
  useEffect(()=>{
    let t;
    if (mpActive&&mpTimer>0) { t=setTimeout(()=>{setMpTimer(x=>x-1); if(mpTimer<=10) play("tick");},1000); }
    else if (mpActive&&mpTimer===0) endMp(false);
    return ()=>clearTimeout(t);
  },[mpActive,mpTimer]);

  // Screen init
  useEffect(()=>{
    if (screen==="classic") { setPuzzle(engine.getRandom(difficulty)); resetPS(); }
    if (screen==="daily")   { setPuzzle(engine.getDaily()); resetPS(); }
    if (screen==="leaderboard") loadLeaderboard();
    if (screen==="calendar")    loadStreak();
  },[screen]);

  // Leaderboard
  const loadLeaderboard = async () => {
    setLbLoading(true);
    try {
      const res = await window.storage.list("lb:", true);
      const entries = await Promise.all(
        (res?.keys||[]).map(async k=>{ try{ const r=await window.storage.get(k,true); return r?JSON.parse(r.value):null; }catch{return null;} })
      );
      setLeaderboard(entries.filter(Boolean).sort((a,b)=>b.score-a.score).slice(0,20));
    } catch { setLeaderboard([]); }
    setLbLoading(false);
  };

  const saveToLB = async (name,sc,st) => {
    try {
      const key=`lb:${name.toLowerCase().replace(/\s+/g,"")}`;
      const ex=await(async()=>{ try{const r=await window.storage.get(key,true);return r?JSON.parse(r.value):null;}catch{return null;} })();
      if (!ex||sc>ex.score) await window.storage.set(key,JSON.stringify({name,score:sc,streak:st,date:getTodayKey()}),true);
    } catch {}
  };

  // Streak
  const loadStreak = async () => {
    setCalLoading(true);
    try {
      const r=await window.storage.get("streak-dates");
      const dates=r?JSON.parse(r.value):[];
      setStreakDates(dates);
      let cs=0;
      for(let i=0;i<999;i++){ const d=new Date(); d.setDate(d.getDate()-i); if(dates.includes(d.toISOString().split("T")[0])) cs++; else break; }
      setStreakCount(cs);
    } catch { setStreakDates([]); setStreakCount(0); }
    setCalLoading(false);
  };

  const addStreakDate = async () => {
    const today=getTodayKey();
    try {
      const r=await(async()=>{ try{const x=await window.storage.get("streak-dates");return x?JSON.parse(x.value):[];}catch{return[];} })();
      if(!r.includes(today)){ const u=[...r,today]; await window.storage.set("streak-dates",JSON.stringify(u)); setStreakDates(u); }
    } catch {}
  };

  const handleCorrect = async (pts) => {
    setScore(s=>s+pts); setStreak(s=>s+1); setSolvedCount(c=>c+1);
    setFeedback({type:"ok",msg:`+${pts} pts! 🎉`});
    play("correct"); boom(); addStreakDate();
    if(playerName) saveToLB(playerName,score+pts,streak+1);
  };

  const checkGuess = (p) => {
    if(!guess.trim()||!p) return;
    if(guess.trim().toLowerCase()===p.answer.toLowerCase()) handleCorrect(Math.max(100-hintsUsed*20,40));
    else { setStreak(0); setFeedback({type:"err",msg:"Not quite! Try again 🤔"}); trigShake(); }
  };

  const endMp = (won) => {
    setMpActive(false);
    setPlayers(prev=>prev.map(p=>p.isYou?{...p,score:p.score+(won?100:0)}:{...p,score:p.score+(Math.random()>.5?(won?35:85):(won?15:50))}));
  };

  const saveCustomPuzzle = async () => {
    if(!creatorEmojis.filter(e=>e.trim()).length||!creatorAnswer.trim()) return;
    const code=genCode();
    const data={emojis:creatorEmojis.filter(e=>e.trim()),answer:creatorAnswer.trim().toLowerCase(),hint1:creatorHint1||"Think carefully!",hint2:creatorHint2||"Almost there!",hint3:"The answer is: "+creatorAnswer,category:creatorCategory||"Custom",createdBy:playerName||"Anonymous",date:getTodayKey()};
    try{ await window.storage.set(`puzzle:${code}`,JSON.stringify(data),true); setCreatedCode(code); setCreatorStep("success"); play("correct"); boom(); }
    catch{ setCreatedCode("ERROR"); setCreatorStep("success"); }
  };

  const loadCustomPuzzle = async () => {
    setLoadError("");
    const code=loadCode.trim().toUpperCase();
    if(code.length<4){setLoadError("Enter a valid code!");return;}
    try{
      const r=await window.storage.get(`puzzle:${code}`,true);
      if(!r){setLoadError("Puzzle not found. Check the code!");return;}
      setLoadedPuzzle(JSON.parse(r.value)); setCreatorStep("playing"); resetPS();
    }catch{setLoadError("Puzzle not found. Check the code!");}
  };

  const shareWA = (msg) => window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,"_blank");

  // ─── COLORS ────────────────────────────────────────────────────────────────
  const C = {
    bg:"linear-gradient(160deg,#080818 0%,#16082a 45%,#0b1828 100%)",
    purple:"#c879ff", purpleDim:"rgba(200,121,255,0.18)", purpleBorder:"rgba(200,121,255,0.3)",
    card:"rgba(255,255,255,0.055)", cardBorder:"rgba(255,255,255,0.1)",
    ok:"#34d399",okBg:"rgba(52,211,153,0.12)",okBorder:"rgba(52,211,153,0.25)",
    err:"#f87171",errBg:"rgba(239,68,68,0.12)",errBorder:"rgba(239,68,68,0.25)",
    hint:"#f8c55f",hintBg:"rgba(248,180,0,0.09)",hintBorder:"rgba(248,180,0,0.25)",
    muted:"rgba(255,255,255,0.38)",
  };

  const S = {
    wrap:{fontFamily:"'Segoe UI',system-ui,sans-serif",minHeight:"100vh",background:C.bg,color:"#fff",position:"relative",overflowX:"hidden"},
    topBar:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 13px",background:"rgba(255,255,255,0.04)",borderBottom:"1px solid rgba(255,255,255,0.07)",gap:6},
    logo:{fontSize:17,fontWeight:800,background:"linear-gradient(90deg,#f7c59f,#ef8c8c,#c879ff)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",whiteSpace:"nowrap",flexShrink:0},
    chip:{background:"rgba(255,255,255,0.08)",borderRadius:20,padding:"4px 10px",fontSize:11,fontWeight:600,display:"flex",gap:6,alignItems:"center",flexShrink:0},
    langBtn:{background:C.purpleDim,border:`1px solid ${C.purpleBorder}`,borderRadius:20,padding:"4px 9px",fontSize:11,color:"#e0b4ff",cursor:"pointer",display:"flex",alignItems:"center",gap:4,flexShrink:0,fontWeight:600},
    inner:{maxWidth:520,margin:"0 auto",padding:"13px 13px 52px"},
    card:{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:20,padding:"16px 14px",marginBottom:10},
    emojiDisp:{fontSize:50,textAlign:"center",letterSpacing:8,margin:"12px 0",filter:"drop-shadow(0 4px 14px rgba(200,120,255,0.45))"},
    input:{width:"100%",boxSizing:"border-box",padding:"12px 14px",background:"rgba(255,255,255,0.08)",border:"2px solid rgba(255,255,255,0.15)",borderRadius:14,color:"#fff",fontSize:16,fontWeight:600,outline:"none",textAlign:"center",animation:shake?"shake 0.4s":"none",fontFamily:"inherit"},
    btnMain:{width:"100%",padding:"12px 0",borderRadius:14,border:"none",background:`linear-gradient(135deg,${C.purple},#8b5cf6)`,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",marginTop:9,fontFamily:"inherit"},
    btnSec:{flex:1,padding:"10px 0",borderRadius:12,border:"1.5px solid rgba(255,255,255,0.18)",background:"transparent",color:"rgba(255,255,255,0.8)",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"},
    badge:{display:"inline-block",padding:"2px 10px",borderRadius:20,fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,background:C.purpleDim,color:C.purple,marginBottom:3},
    homeBtn:{display:"flex",flexDirection:"column",alignItems:"center",padding:"14px 8px",background:C.card,border:`1.5px solid ${C.cardBorder}`,borderRadius:18,cursor:"pointer",gap:4,flex:1},
    okBox:{background:C.okBg,border:`1px solid ${C.okBorder}`,borderRadius:12,padding:"10px 13px",textAlign:"center",color:C.ok,fontWeight:700,fontSize:13,marginTop:9},
    errBox:{background:C.errBg,border:`1px solid ${C.errBorder}`,borderRadius:12,padding:"10px 13px",textAlign:"center",color:C.err,fontWeight:700,fontSize:13,marginTop:9},
    hintBox:{background:C.hintBg,border:`1px solid ${C.hintBorder}`,borderRadius:12,padding:"8px 12px",fontSize:12,color:C.hint,marginTop:6},
    overlay:{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center"},
    sheet:{width:"100%",maxWidth:520,background:"#0f0d1d",borderRadius:"22px 22px 0 0",maxHeight:"80vh",display:"flex",flexDirection:"column",overflow:"hidden",border:"1px solid rgba(255,255,255,0.1)",borderBottom:"none"},
    modal:{width:"100%",maxWidth:520,background:"#0f0d1d",borderRadius:"22px 22px 0 0",padding:"20px 16px 32px",border:"1px solid rgba(255,255,255,0.1)",borderBottom:"none"},
  };

  // ── CONFETTI ────────────────────────────────────────────────────────────────
  const Confetti = () => confetti?(
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:999,overflow:"hidden"}}>
      {[...Array(22)].map((_,i)=>(
        <div key={i} style={{position:"absolute",top:"-20px",left:`${Math.random()*100}%`,fontSize:15,animation:`cffall ${0.7+Math.random()*0.9}s ease-in forwards`,animationDelay:`${Math.random()*0.5}s`}}>
          {["🎉","✨","🌟","🎊","💫","⭐"][Math.floor(Math.random()*6)]}
        </div>
      ))}
    </div>
  ):null;

  // ── LANGUAGE PICKER ─────────────────────────────────────────────────────────
  const LangPicker = () => (
    <div style={S.overlay} onClick={()=>setShowLangPicker(false)}>
      <div style={S.sheet} onClick={e=>e.stopPropagation()}>
        <div style={{padding:"14px 14px 8px",flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontWeight:700,fontSize:15}}>🌐 Select Language</span>
            <button onClick={()=>setShowLangPicker(false)} style={{background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer"}}>✕</button>
          </div>
          <div style={{fontSize:10,color:C.muted,marginTop:1}}>{LANGUAGES.length} languages available</div>
          <input style={{...S.input,textAlign:"left",padding:"9px 12px",fontSize:13,marginTop:7}} placeholder="Search language..." value={langSearch} onChange={e=>setLangSearch(e.target.value)} autoFocus/>
        </div>
        <div style={{overflowY:"auto",flex:1,padding:"0 10px 20px"}}>
          {["Indian","International"].map(region=>{
            const langs=filtered.filter(l=>l.region===region);
            if(!langs.length) return null;
            return (
              <div key={region}>
                <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.3)",letterSpacing:1,textTransform:"uppercase",padding:"11px 6px 5px"}}>{region==="Indian"?"🇮🇳":"🌍"} {region} ({langs.length})</div>
                {langs.map(l=>(
                  <div key={l.code} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 9px",borderRadius:11,cursor:"pointer",background:lang===l.code?C.purpleDim:"transparent"}} onClick={()=>{setLang(l.code);setShowLangPicker(false);setLangSearch("");}}>
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

  // ── NAME MODAL ──────────────────────────────────────────────────────────────
  const NameModal = () => (
    <div style={S.overlay}>
      <div style={S.modal}>
        <p style={{fontWeight:700,fontSize:16,marginBottom:4}}>🏆 Join the Leaderboard!</p>
        <p style={{color:C.muted,fontSize:12,marginBottom:14}}>Enter your name to save your score globally.</p>
        <input style={{...S.input,textAlign:"left",padding:"11px 13px"}} placeholder="Your name..." value={nameInput} onChange={e=>setNameInput(e.target.value)} autoFocus onKeyDown={e=>{if(e.key==="Enter"&&nameInput.trim()){setPlayerName(nameInput.trim());setShowNameModal(false);}}}/>
        <button style={S.btnMain} onClick={()=>{if(nameInput.trim()){setPlayerName(nameInput.trim());setShowNameModal(false);}}}>Save Name ✓</button>
        <button style={{...S.btnSec,width:"100%",marginTop:8}} onClick={()=>setShowNameModal(false)}>Skip</button>
      </div>
    </div>
  );

  // ── TOP BAR ─────────────────────────────────────────────────────────────────
  const TopBar = ({title,back}) => (
    <div style={S.topBar}>
      {back?<button onClick={()=>setScreen(back)} style={{background:"none",border:"none",color:"#fff",cursor:"pointer",fontSize:18,padding:"0 2px",flexShrink:0}}>←</button>
           :<span style={S.logo}>EmojiIQ 🧩</span>}
      <span style={{fontWeight:700,fontSize:13,flex:1,textAlign:back?"center":"left",paddingLeft:back?0:6,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{title}</span>
      <div style={{display:"flex",gap:5,alignItems:"center"}}>
        <div style={S.chip}><span>🏆{score}</span><span>🔥{streak}</span></div>
        <button style={{...S.langBtn,padding:"4px 7px"}} onClick={()=>setSoundOn(v=>!v)}>{soundOn?"🔊":"🔇"}</button>
        <button style={S.langBtn} onClick={()=>setShowLangPicker(true)}>
          <span style={{fontSize:12}}>{currentLang.flag}</span>
          <span>{currentLang.code.toUpperCase()}</span><span style={{opacity:.5,fontSize:9}}>▾</span>
        </button>
      </div>
    </div>
  );

  const DiffBadge = ({d}) => { const m={easy:{c:C.ok,bg:"rgba(52,211,153,0.12)"},medium:{c:"#f7c759",bg:"rgba(247,199,89,0.12)"},hard:{c:C.err,bg:"rgba(248,113,113,0.12)"}}; const s=m[d]||m.medium; return <span style={{display:"inline-block",padding:"2px 8px",borderRadius:20,fontSize:9,fontWeight:700,textTransform:"uppercase",background:s.bg,color:s.c,marginLeft:5}}>{d}</span>; };

  // ── PUZZLE CARD ─────────────────────────────────────────────────────────────
  const PCard = ({p, onSubmit, children}) => (
    <div style={S.card}>
      <div style={{display:"flex",alignItems:"center",marginBottom:3}}>
        <span style={S.badge}>{p?.category}</span>
        {p?.difficulty&&<DiffBadge d={p.difficulty}/>}
      </div>
      <p style={{color:C.muted,fontSize:11,margin:"2px 0 0"}}>What do these emojis represent?</p>
      <div style={S.emojiDisp}>{(p?.emojis||[]).join(" ")}</div>
      {feedback?.type!=="ok"&&<>
        <input style={S.input} placeholder="Type your guess..." value={guess} onChange={e=>setGuess(e.target.value)} onKeyDown={e=>e.key==="Enter"&&onSubmit()} autoComplete="off"/>
        {hintsUsed>=1&&<div style={S.hintBox}>💡 {p?.hint1}</div>}
        {hintsUsed>=2&&<div style={{...S.hintBox,marginTop:5}}>💡 {p?.hint2}</div>}
        {hintsUsed>=3&&<div style={{...S.hintBox,marginTop:5}}>💡 {p?.hint3}</div>}
        {showAns&&<div style={{...S.hintBox,color:"#fff",marginTop:5}}>📖 <strong>{p?.answer}</strong></div>}
        {feedback&&<div style={S.errBox}>{feedback.msg}</div>}
        {children}
      </>}
      {feedback?.type==="ok"&&<div style={S.okBox}>{feedback.msg}</div>}
    </div>
  );

  const HintRow = ({onSubmit}) => (
    <>
      <div style={{display:"flex",gap:8}}>
        <button style={S.btnSec} onClick={()=>{if(hintsUsed<3){setHintsUsed(h=>h+1);setScore(s=>Math.max(0,s-5));play("hint");}}}>💡 Hint {hintsUsed>=3?"(max)":"(-5)"}</button>
        <button style={S.btnSec} onClick={()=>setShowAns(!showAns)}>🏳️ {showAns?"Hide":"Reveal"}</button>
      </div>
      <button style={S.btnMain} onClick={onSubmit}>Submit ✓</button>
    </>
  );

  const CSS = `@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}} @keyframes cffall{to{transform:translateY(110vh) rotate(720deg);opacity:0;}} button:active{opacity:.85;transform:scale(.97)} *{box-sizing:border-box}`;
  const SpinCSS = CSS + `@keyframes spin{to{transform:rotate(360deg)}}`;

  // ════════════════════════════════════════════════════════════════════════════
  // HOME
  // ════════════════════════════════════════════════════════════════════════════
  if (screen==="home") return (
    <div style={S.wrap}>
      <style>{CSS}</style>
      <Confetti/>{showLangPicker&&<LangPicker/>}{showNameModal&&<NameModal/>}
      <TopBar/>
      <div style={S.inner}>
        <div style={{textAlign:"center",marginBottom:18,paddingTop:8}}>
          <div style={{fontSize:48,marginBottom:5}}>🍎📱🧠</div>
          <h1 style={{margin:0,fontSize:22,fontWeight:800,background:"linear-gradient(90deg,#f7c59f,#c879ff)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>EmojiIQ</h1>
          <p style={{color:C.muted,margin:"3px 0 0",fontSize:11}}>{dbStats.total} puzzles · {dbStats.cats} categories · {LANGUAGES.length} languages · No internet needed</p>
        </div>

        {/* Difficulty */}
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

        {/* Main modes */}
        <div style={{display:"flex",gap:9,marginBottom:9}}>
          <div style={S.homeBtn} onClick={()=>setScreen("classic")}><span style={{fontSize:25}}>🎯</span><span style={{fontWeight:700,fontSize:13}}>Classic</span><span style={{color:C.muted,fontSize:10}}>{dbStats[difficulty]} puzzles</span></div>
          <div style={{...S.homeBtn,background:dailyDone?"rgba(52,211,153,0.07)":S.homeBtn.background,borderColor:dailyDone?"rgba(52,211,153,0.25)":S.homeBtn.borderColor}} onClick={()=>setScreen("daily")}><span style={{fontSize:25}}>📅</span><span style={{fontWeight:700,fontSize:13}}>Daily</span><span style={{color:dailyDone?C.ok:C.muted,fontSize:10}}>{dailyDone?"✓ Solved!":"New every day"}</span></div>
        </div>
        <div style={{display:"flex",gap:9,marginBottom:9}}>
          <div style={S.homeBtn} onClick={()=>setScreen("practice")}><span style={{fontSize:25}}>⚡</span><span style={{fontWeight:700,fontSize:13}}>Practice</span><span style={{color:C.muted,fontSize:10}}>Non-stop mode</span></div>
          <div style={S.homeBtn} onClick={()=>{const p=engine.getForMP(difficulty);setPuzzle(p);resetPS();setPlayers([{name:"Rahul",score:0,avatar:"🧑"},{name:"Priya",score:0,avatar:"👩"},{name:"You",score:0,avatar:"🎮",isYou:true}]);setMpRound(1);setMpTimer(30);setMpActive(true);setScreen("multiplayer");}}><span style={{fontSize:25}}>⚔️</span><span style={{fontWeight:700,fontSize:13}}>Multiplayer</span><span style={{color:C.muted,fontSize:10}}>Race friends</span></div>
        </div>

        {/* Theme Packs */}
        <div style={{...S.card,padding:"11px 13px",marginBottom:9}}>
          <p style={{margin:"0 0 8px",color:C.muted,fontSize:10,textTransform:"uppercase",letterSpacing:.8,fontWeight:700}}>🎨 Theme Packs</p>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {Object.entries(THEMES).map(([name,t])=>{
              const count=PUZZLE_DB.filter(p=>p.cat===t.cat).length;
              return (
                <button key={name} onClick={()=>{setActiveTheme(name);setThemeIdx(0);setPuzzle(engine.getTheme(t.cat,0));resetPS();setScreen("themes");}} style={{flex:"1 1 80px",padding:"9px 5px",borderRadius:13,border:"1.5px solid rgba(255,255,255,0.11)",background:"rgba(255,255,255,0.04)",cursor:"pointer",color:"#fff",textAlign:"center"}}>
                  <div style={{fontSize:20}}>{t.icon}</div>
                  <div style={{fontSize:10,fontWeight:700,marginTop:2,color:"rgba(255,255,255,0.75)"}}>{name}</div>
                  <div style={{fontSize:9,color:C.muted}}>{count} puzzles</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feature row */}
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

  // ════════════════════════════════════════════════════════════════════════════
  // CLASSIC
  // ════════════════════════════════════════════════════════════════════════════
  if (screen==="classic") return (
    <div style={S.wrap}><style>{CSS}</style><Confetti/>{showLangPicker&&<LangPicker/>}
      <TopBar title="🎯 Classic Mode" back="home"/>
      <div style={S.inner}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
          <span style={{color:C.muted,fontSize:11}}>Solved this session: {solvedCount}</span>
          <DiffBadge d={difficulty}/>
        </div>
        <PCard p={puzzle} onSubmit={()=>checkGuess(puzzle)}><HintRow onSubmit={()=>checkGuess(puzzle)}/></PCard>
        {feedback?.type==="ok"&&<>
          <button style={{...S.btnMain,background:"linear-gradient(135deg,#34d399,#059669)"}} onClick={()=>{setPuzzle(engine.getRandom(difficulty));resetPS();}}>Next Puzzle →</button>
          <button style={{...S.btnSec,width:"100%",marginTop:8}} onClick={()=>shareWA(`🧩 I solved an EmojiIQ puzzle!\n${puzzle.emojis.join(" ")} = ${puzzle.answer.toUpperCase()}\nCan you guess it faster?`)}>📤 WhatsApp Share</button>
        </>}
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // PRACTICE (non-stop)
  // ════════════════════════════════════════════════════════════════════════════
  if (screen==="practice") return (
    <div style={S.wrap}><style>{CSS}</style><Confetti/>{showLangPicker&&<LangPicker/>}
      <TopBar title="⚡ Practice Mode" back="home"/>
      <div style={S.inner}>
        <div style={{...S.card,padding:"10px 13px",marginBottom:8,background:"rgba(200,121,255,0.06)",border:`1px solid ${C.purpleBorder}`}}>
          <div style={{display:"flex",justifyContent:"space-around",textAlign:"center"}}>
            <div><div style={{fontWeight:800,fontSize:17,color:"#f7c759"}}>🏆 {score}</div><div style={{fontSize:10,color:C.muted}}>Score</div></div>
            <div><div style={{fontWeight:800,fontSize:17,color:C.ok}}>🔥 {streak}</div><div style={{fontSize:10,color:C.muted}}>Streak</div></div>
            <div><div style={{fontWeight:800,fontSize:17,color:C.purple}}>✅ {solvedCount}</div><div style={{fontSize:10,color:C.muted}}>Solved</div></div>
          </div>
        </div>
        <PCard p={puzzle} onSubmit={()=>checkGuess(puzzle)}><HintRow onSubmit={()=>checkGuess(puzzle)}/></PCard>
        {feedback?.type==="ok"&&<button style={{...S.btnMain,background:"linear-gradient(135deg,#34d399,#059669)"}} onClick={()=>{setPuzzle(engine.getRandom(difficulty));resetPS();}}>Next →</button>}
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // DAILY
  // ════════════════════════════════════════════════════════════════════════════
  if (screen==="daily") return (
    <div style={S.wrap}><style>{CSS+`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style><Confetti/>{showLangPicker&&<LangPicker/>}
      <TopBar title="📅 Daily Puzzle" back="home"/>
      <div style={S.inner}>
        <div style={{textAlign:"center",marginBottom:7}}><span style={S.badge}>Today · {getTodayKey()}</span></div>
        <div style={S.card}>
          <div style={S.emojiDisp}>{puzzle?.emojis?.join(" ")}</div>
          {!dailyDone?(
            <>
              <input style={S.input} placeholder="Type your answer..." value={guess} onChange={e=>setGuess(e.target.value)} onKeyDown={e=>e.key==="Enter"&&checkGuess(puzzle)}/>
              {hintsUsed>=1&&<div style={S.hintBox}>💡 {puzzle?.hint1}</div>}
              {hintsUsed>=2&&<div style={{...S.hintBox,marginTop:5}}>💡 {puzzle?.hint2}</div>}
              {hintsUsed>=3&&<div style={{...S.hintBox,marginTop:5}}>💡 {puzzle?.hint3}</div>}
              {feedback&&<div style={S.errBox}>{feedback.msg}</div>}
              <div style={{display:"flex",gap:8,marginTop:9}}>
                <button style={S.btnSec} onClick={()=>{if(hintsUsed<3){setHintsUsed(h=>h+1);setScore(s=>Math.max(0,s-5));play("hint");}}}>💡 Hint</button>
                <button style={{...S.btnMain,flex:1,marginTop:0}} onClick={()=>{if(guess.trim().toLowerCase()===puzzle?.answer){handleCorrect(Math.max(100-hintsUsed*20,40));setDailyDone(true);setDailyHintsUsed(hintsUsed);}else{setStreak(0);setFeedback({type:"err",msg:"Not quite! Try again 🤔"});trigShake();}}}>Submit ✓</button>
              </div>
            </>
          ):(
            <div style={{textAlign:"center"}}>
              <div style={S.okBox}>🎊 Correct! — {puzzle?.answer?.toUpperCase()}</div>
              <div style={{...S.card,marginTop:10,padding:"10px 13px",background:"rgba(200,121,255,0.06)"}}>
                <div style={{fontSize:10,color:C.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:.8}}>Today's Stats</div>
                <div style={{display:"flex",justifyContent:"center",gap:20}}>
                  <div><div style={{fontWeight:800,fontSize:17}}>{dailyHintsUsed}</div><div style={{fontSize:10,color:C.muted}}>Hints used</div></div>
                  <div><div style={{fontWeight:800,fontSize:17,color:C.ok}}>+{Math.max(100-dailyHintsUsed*20,40)}</div><div style={{fontSize:10,color:C.muted}}>Points</div></div>
                  <div><div style={{fontWeight:800,fontSize:17,color:"#f7c759"}}>{streakCount}🔥</div><div style={{fontSize:10,color:C.muted}}>Day streak</div></div>
                </div>
              </div>
              <p style={{color:C.muted,fontSize:11,marginTop:11}}>Come back tomorrow for a new puzzle!</p>
              <button style={{...S.btnMain,background:"linear-gradient(135deg,#25D366,#128C7E)"}} onClick={()=>shareWA(`📅 I solved today's EmojiIQ Daily!\n${puzzle.emojis.join(" ")} = ${puzzle.answer.toUpperCase()}\nSolved in ${dailyHintsUsed} hints 🧩\nCan you beat me?`)}>📤 Share on WhatsApp</button>
              <button style={S.btnMain} onClick={()=>setScreen("home")}>Back to Home</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // THEMES
  // ════════════════════════════════════════════════════════════════════════════
  if (screen==="themes"&&activeTheme) {
    const thm=THEMES[activeTheme];
    const pool=PUZZLE_DB.filter(p=>p.cat===thm.cat);
    return (
      <div style={S.wrap}><style>{CSS}</style><Confetti/>{showLangPicker&&<LangPicker/>}
        <div style={{...S.topBar,background:"rgba(0,0,0,0.4)"}}>
          <button onClick={()=>setScreen("home")} style={{background:"none",border:"none",color:"#fff",cursor:"pointer",fontSize:18,flexShrink:0}}>←</button>
          <span style={{fontWeight:700,fontSize:14,flex:1,textAlign:"center"}}>{thm.icon} {activeTheme}</span>
          <span style={{color:C.muted,fontSize:11}}>{themeIdx%pool.length+1}/{pool.length}</span>
        </div>
        <div style={{height:4,background:thm.gradient,width:`${((themeIdx%pool.length+1)/pool.length)*100}%`,transition:"width 0.5s"}}/>
        <div style={S.inner}>
          <PCard p={puzzle} onSubmit={()=>checkGuess(puzzle)}><HintRow onSubmit={()=>checkGuess(puzzle)}/></PCard>
          {feedback?.type==="ok"&&<>
            <button style={{...S.btnMain,background:thm.gradient}} onClick={()=>{const ni=themeIdx+1;setThemeIdx(ni);setPuzzle(engine.getTheme(thm.cat,ni));resetPS();}}>Next {thm.icon} →</button>
            <button style={{...S.btnSec,width:"100%",marginTop:8}} onClick={()=>shareWA(`${thm.icon} I solved an EmojiIQ ${activeTheme} puzzle!\n${puzzle.emojis.join(" ")} = ${puzzle.answer.toUpperCase()}\nTry it!`)}>📤 Share</button>
          </>}
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // MULTIPLAYER
  // ════════════════════════════════════════════════════════════════════════════
  if (screen==="multiplayer"&&puzzle) return (
    <div style={S.wrap}><style>{CSS}</style><Confetti/>{showLangPicker&&<LangPicker/>}
      <TopBar title="⚔️ Multiplayer" back="home"/>
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
              <button style={{...S.btnMain,marginTop:10}} onClick={()=>{setMpRound(r=>r+1);setPuzzle(engine.getForMP(difficulty));setMpTimer(30);setMpActive(true);resetPS();}}>Next Round →</button>
            </div>
          ):(
            <>
              <input style={S.input} placeholder="Fastest wins! Type & Enter..." value={guess} onChange={e=>setGuess(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){checkGuess(puzzle);endMp(guess.trim().toLowerCase()===puzzle.answer.toLowerCase());}}} autoFocus/>
              {feedback&&<div style={S.errBox}>{feedback.msg}</div>}
              <button style={S.btnMain} onClick={()=>{checkGuess(puzzle);if(guess.trim().toLowerCase()===puzzle.answer.toLowerCase())endMp(true);}}>Submit ✓</button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // LEADERBOARD
  // ════════════════════════════════════════════════════════════════════════════
  if (screen==="leaderboard") return (
    <div style={S.wrap}><style>{CSS}</style>
      <TopBar title="🏆 Leaderboard" back="home"/>
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
          <button style={{...S.btnMain,marginTop:9,fontSize:12,padding:"9px 0"}} onClick={async()=>{await saveToLB(playerName,score,streak);loadLeaderboard();}}>⬆️ Submit My Score</button>
        </div>}
        {lbLoading?<div style={{textAlign:"center",padding:"28px 0",color:C.muted}}>Loading rankings...</div>
        :leaderboard.length===0?<div style={{...S.card,textAlign:"center",padding:"28px 20px"}}><div style={{fontSize:36,marginBottom:8}}>🏆</div><p style={{color:C.muted,fontSize:12}}>No scores yet! Be the first to submit.</p></div>
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
      {showNameModal&&<NameModal/>}
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // CREATOR
  // ════════════════════════════════════════════════════════════════════════════
  if (screen==="creator") return (
    <div style={S.wrap}><style>{CSS}</style><Confetti/>
      <TopBar title="🛠️ Puzzle Creator" back="home"/>
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
          <PCard p={loadedPuzzle} onSubmit={()=>checkGuess(loadedPuzzle)}><HintRow onSubmit={()=>checkGuess(loadedPuzzle)}/></PCard>
          {feedback?.type==="ok"&&<button style={{...S.btnMain,background:"linear-gradient(135deg,#25D366,#128C7E)"}} onClick={()=>shareWA(`🧩 I solved a friend's EmojiIQ puzzle!\n${loadedPuzzle.emojis.join(" ")} = ${loadedPuzzle.answer.toUpperCase()}\nCreate your own!`)}>📤 Share</button>}
        </>}
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // STREAK CALENDAR
  // ════════════════════════════════════════════════════════════════════════════
  if (screen==="calendar") {
    const days=getLast70Days();
    const weeks=[];
    for(let i=0;i<days.length;i+=7) weeks.push(days.slice(i,i+7));
    return (
      <div style={S.wrap}><style>{CSS}</style>
        <TopBar title="📆 Streak Calendar" back="home"/>
        <div style={S.inner}>
          <div style={{...S.card,textAlign:"center",padding:"15px",marginBottom:9}}>
            <div style={{fontSize:38,marginBottom:3}}>🔥</div>
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
          <button style={{...S.btnMain,background:"linear-gradient(135deg,#25D366,#128C7E)"}} onClick={()=>shareWA(`🔥 My EmojiIQ Streak: ${streakCount} days!\nSolving emoji puzzles every day 🧩\nJoin me!`)}>📤 Share Streak on WhatsApp</button>
        </div>
      </div>
    );
  }

  return <div style={{color:"#fff",padding:20,background:C.bg,minHeight:"100vh"}}>Loading...</div>;
}
