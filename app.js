/* =====================================================
   BoltType — app.js  v1.3
   ===================================================== */
'use strict';

// ─── Service Worker ───────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(r  => console.log('[SW] registered:', r.scope))
      .catch(e => console.warn('[SW] failed:', e));
  });
}

// ─── Word Bank (~2300 unique words) ──────────────────
const WORD_BANK = [
  // ── Core Common Words ──
  'the','be','to','of','and','a','in','that','have','it',
  'for','not','on','with','he','as','you','do','at','this',
  'but','his','by','from','they','we','say','her','she','or',
  'an','will','my','one','all','would','there','their','what',
  'so','up','out','if','about','who','get','which','go','me',
  'when','make','can','like','time','no','just','him','know',
  'take','people','into','year','your','good','some','could',
  'them','see','other','than','then','now','look','only','come',
  'its','over','think','also','back','after','use','two','how',
  'our','work','first','well','way','even','new','want','because',
  'any','these','give','day','most','us','great','between','need',
  'large','often','hand','high','place','hold','free','real','life',
  'few','north','open','seem','together','next','white','children',
  'begin','got','walk','example','ease','paper','group','always',
  'music','those','both','mark','book','letter','until','mile',
  'river','car','feet','care','second','enough','plain','girl',
  'usual','young','ready','above','ever','red','list','though',
  'feel','talk','bird','soon','body','dog','family','direct',
  'pose','leave','song','measure','door','product','black',
  'short','numeral','class','wind','question','happen','complete',
  'light','voice','power','earth','heat','ocean','four','five',
  'once','told','less','town','fine','drive','fall','kept',
  'mind','plan','form','area','half','edge','sign','pick',
  'hard','near','sure','late','night','still','turn','king',
  'move','city','play','small','show','every','part','round',
  'women','found','study','learn','plant','cover','food','side',
  'age','word','cold','gold','lead','rock','long','pull',
  'draw','cut','fast','stop','true','color','face','wood',
  'main','able','floor','whole','force','blue','object','decide',
  'surface','deep','moon','island','foot','system','busy','test',
  'record','boat','common','plane','dry','wonder','laugh','thousand',
  'ago','ran','check','game','shape','brought','snow','bring',
  'fill','east','paint','language','among','grand','ball','wave',
  'drop','heart','present','heavy','dance','engine','position','arm',
  'wide','sail','material','special','pair','road','map','rain',
  'rule','notice','unit','stone','middle','strange','visit','port',
  'amount','afraid','star','lay','thick','govern','front',
  'below','glass','grass','skin','strong','speak','spend','stand',
  'simple','table','teeth','total','trade','trust',

  // ── A ──
  'ability','able','about','above','accept','access','accident','account',
  'achieve','across','act','action','active','actual','adapt','add',
  'address','adjust','admit','adopt','adult','advance','advice','affair',
  'afraid','agree','ahead','aim','air','alarm','alike','alive',
  'allow','almost','alone','along','already','amaze','among','amount',
  'ancient','angle','announce','another','answer','apart','apply','approach',
  'argue','arise','arrange','arrive','art','article','ask','aspect',
  'attempt','attend','attract','available','average','avoid','awake',
  'abandon','abstract','abundant','academic','accelerate','accurate','acknowledge',
  'activate','admire','advantage','aggressive','agreement','alert','allocate',
  'alternate','ambition','amend','amplify','analyze','anchor','anticipate','appoint',
  'appreciate','approval','approximate','assess','assist','assume','assure',
  'atmosphere','attach','authority','automate',

  // ── B ──
  'back','ball','band','base','basic','battle','beach','bear',
  'beautiful','become','behind','believe','belong','benefit','beside',
  'best','better','beyond','birth','blame','blend','block','blow',
  'board','border','born','bottom','branch','break','bridge','bright',
  'broad','brother','brown','build',
  'balance','barrier','beneath','biology','borrow','boundary','brief','brilliant',
  'brutal','budget',
  'aboard','abolish','absent','absorb','absurd','acclaim','accord',
  'accuse','ache','acquire','adhere','adorn','advise','affirm',
  'agile','agony','album','alley','alloy','altar','amber',
  'ample','angel','ankle','annex','apron','ardent','arena',
  'aroma','arrow','aspen','assay','atlas','attic','audit','azure',
  'badge','bagel','barge','batch','beige','bench','berry','bevel',
  'bloom','blunt','brace','braid','brake','brand','brass','brawl',
  'brisk','broil','brood','brush','brute','bulge','bully','bunker',

  // ── C ──
  'call','calm','camera','capture','carbon','carry','cause','center',
  'certain','chair','challenge','change','chapter','character','charge','cheap',
  'check','choice','choose','claim','class','clean','clear','close',
  'cloud','collect','come','common','complete','concern','condition','connect',
  'consider','control','cook','cool','copy','corner','correct','cost',
  'country','course','cover','create','cross','current','curve','cycle',
  'cabinet','calculate','capable','capital','careful','category','cautious',
  'celebrate','chemistry','circuit','citizen','civil','clarity','classify',
  'climate','clinical','coach','column','combine','comfort','command','commit',
  'communicate','community','compare','compete','compile','complex','compress','compute',
  'concentrate','conclude','conduct','confirm','conflict','conquer','consistent','constant',
  'construct','contact','contain','content','continue','contrast','contribute','convert',
  'coordinate','courage','creative','critical','customer',
  'cabin','cadet','canal','candy','caste','cedar','chalk','champ',
  'chase','cheek','chess','chime','chunk','civic','clamp','clash',
  'clasp','cleft','clerk','cliff','cling','cloak','clump','coarse',
  'cobra','comet','coral','crane','crawl','crisp','crypt','cubic',

  // ── D ──
  'dark','data','debate','decide','deep','define','deliver','depend',
  'describe','design','detail','develop','device','differ','digital','direct',
  'discover','discuss','distance','divide','done','double','dream',
  'drink','drop','during',
  'declare','decrease','dedicate','defeat','definition','delegate','demand',
  'demonstrate','density','department','deposit','derive','detect','determine',
  'devote','distinct','document','domain','dominant','draft','dynamic',
  'daisy','decay','decoy','delta','dense','depot','depth','derby',
  'digit','ditch','dizzy','dodge','dowel','drift','drill','drone',
  'drown','dunes','dwarf',

  // ── E ──
  'each','earn','east','effort','either','element','else','empty',
  'enable','end','energy','engage','enjoy','enough','enter','entire',
  'equal','error','establish','event','exactly','example','exist','expect',
  'explain','extend','extra','extreme',
  'economy','education','effective','efficient','elaborate','electric','eliminate','emergency',
  'emphasize','encourage','enhance','enormous','enterprise','evaluate','evolve','examine',
  'execute','expand','experience','experiment','expert','express',
  'eager','earthy','eject','elbow','elder','ember','emote','empower',
  'encore','endure','envoy','epoch','erupt','essay','evoke','excel','exile',

  // ── F ──
  'face','fact','fail','fall','false','familiar','famous','final',
  'find','finish','fire','follow','force','forget','forward','four',
  'free','fruit','fuel','full','function',
  'factor','feature','feedback','field','filter','flexible','focus','formal',
  'format','formula','foundation','freedom','frequent','fundamental',
  'faint','flair','flank','flare','flask','fleet','flesh','flint',
  'flock','flood','flute','folly','foray','forge','forte','forum','fount',
  'frail','frame','frank','fraud','freak','fresh','fringe','frost',
  'froze','frugal','fugue','fumes','fungi','funky','furry',

  // ── G ──
  'gain','general','give','goal','good','great','green','grow',
  'guard','guess','guide',
  'generate','genuine','global','govern','gradient','grammar','graphic','gravity',
  'guarantee','guidance',
  'gavel','glyph','gorge','gouge','grace','grasp','gravel','graze','greed',
  'grief','groan','grove','gruel','grunt','guise','gulch','gust',

  // ── H ──
  'happen','happy','hard','health','heart','help','here','high',
  'history','hold','home','hope','huge','human',
  'handle','hardware','harmony','harvest','highlight','horizontal','hostile','hypothesis',
  'hasty','haven','hazel','heist','hence','herbs','hinge',
  'honor','hover','howl','huddle','hunch','husky',

  // ── I ──
  'idea','image','impact','include','increase','indicate','inside',
  'instead','interest','issue',
  'identify','implement','improve','impulse','integrate','intelligent','intense','interpret',
  'interval','introduce','investigate','involve','isolate',
  'imply','infer','ingot','inlet','inset','ivory',

  // ── J/K ──
  'join','judge','jump','keep','kind','know',
  'justify','kernel','knowledge',
  'jaunt','jetty','jewel','joust','knack','kneel','knot','kudos',

  // ── L ──
  'lack','large','last','later','lead','learn','leave','level',
  'limit','line','link','listen','local','long',
  'language','launch','layer','logical','loyalty',
  'laden','lance','lanky','lapel','lapse','larva','latch','laud',
  'ledge','liner','lingo','lodge','lofty','logic','lunge','lusty',

  // ── M ──
  'main','major','make','many','match','mean','meet','memory',
  'method','might','miss','model','moment','month','more','move','much',
  'manage','massive','measure','mechanism','moderate','modify','monitor','motivate','multiply',
  'magic','manor','maple','marsh','mason','maxim','merge','midst','mimic',
  'mirth','modal','mogul','moist','molar','morph','mourn','mural','murky','musty',

  // ── N ──
  'name','natural','near','never','next','night','note','notice','number',
  'negative','network','neutral',
  'nasal','naval','niche','nimble','noble','notch','novel','nudge','nymph',

  // ── O ──
  'occur','offer','often','once','only','open','order','other','outside','over','own',
  'observe','obtain','operate','optimize','organize','outcome','output','overall','overcome',
  'octet','odour','onset','optic','orate','orbit','outdo','ovoid','ozone',

  // ── P ──
  'part','pass','past','path','pattern','perhaps','period','person',
  'phone','plan','point','policy','poor','popular','possible','power',
  'practice','press','previous','price','problem','process','produce','program',
  'project','protect','prove','provide','public','purpose','push','put',
  'parameter','participate','perform','permit','persist','platform','positive','potential',
  'priority','profile','progress','promote','property','propose','protocol',
  'paddy','pearl','pedal','petal','phase','pivot','plank',
  'plume','plunge','polar','porch','pouch','prawn','preen','pride',
  'prime','prism','probe','prune','psalm','pulse','purge',

  // ── Q ──
  'question',
  'quality','query',
  'quartz','quick','quirk','quota','quote',

  // ── R ──
  'raise','range','reach','recent','reduce','refer','reflect',
  'relate','remain','replace','report','represent','require','respond','result',
  'return','reveal','right','rise','role','room','round',
  'random','realistic','reason','recover','release','reliable',
  'remove','research','resolve','resource','restrict','review','routine',
  'rabbi','radar','radii','raven','realm','rebel','recap','relic',
  'remix','repel','resin','retro','ridge','rivet','rodeo','rogue',
  'roost','rouge','rover','rustle',

  // ── S ──
  'same','scene','search','seem','sense','serve','share','should','show',
  'since','size','skill','slow','social','solve','some','sort',
  'sound','source','south','space','spread','start',
  'state','step','still','store','story','strong','structure','subject',
  'success','suggest','supply','support','sure',
  'sample','satellite','schedule','secure','segment','select','separate','sequence',
  'signal','simulate','software','specific','stable','standard','statement','strategy',
  'sufficient',
  'saber','satin','scalp','scant','score','scout','screw','sedan',
  'serum','setup','shaft','shale','shard','sheen','sheer','shelf',
  'siege','siren','skate','sketch','skull','slant','slash','slate',
  'sleet','slender','slime','slope','sloth','smash','smear','smelt',
  'smirk','snare','sneak','snout','sober','solar','sonar','spawn',
  'spear','speck','spire','splice','spoke','spore','spout','sprig',
  'spunk','squad','squat','stake','stale','stalk','stall','stamp',
  'stark','starve','stash','steep','steer','stern','stiff','sting',
  'stock','stomp','strap','straw','streak','strife','strip','strobe',
  'strut','stump','surge','swamp','swath','swear','sweep','swept',
  'swirl','swoop',

  // ── T ──
  'take','tend','term','than','their','them','then','there','think',
  'today','together','toward','treat','tree','true','try','type',
  'target','technical','technology','template','temporary','theory','threshold','transfer',
  'transform','trigger','typical',
  'tally','talon','taper','taunt','tempo','tense','tepid','thorn',
  'throb','thud','thump','tiara','tidal','tight','tinge','tipsy',
  'titan','toast','tonal','torso','toxic','trace','track','trait',
  'tramp','trench','trial','tribe','trick','troop','truck',
  'trunk','tulip','tuner','tunic','tutor','tweak','twist',

  // ── U ──
  'under','understand','until','upon',
  'uniform','unique','update','upgrade','useful',
  'ulcer','ultra','umbra','untie','upper','urban','usher',

  // ── V ──
  'value','various','very','view','visit','voice',
  'variable','version','virtual',
  'vague','valor','valve','vault','vigor','viper','visor','vista',
  'vital','vivid','venom','vocal','vogue','vortex',

  // ── W ──
  'wait','want','watch','water','west','where','while',
  'whole','wide','will','with','within','without','world','write',
  'website','workflow','worthy',
  'waltz','warden','waver','wedge','weedy','whirl','whisk','winch','wrist',

  // ── Y/Z ──
  'year','young','yourself','zero',
  'yacht','yearn','yeast','yield','zeal','zebra','zenith','zephyr',

  // ── Nature ──
  'rainfall','snowflake','iceberg','waterfall','canyon','prairie','tundra','savanna',
  'archipelago','peninsula','estuary','tributary','watershed','wetland','permafrost','altitude',
  'latitude','longitude','compass','terrain','topography','sediment','bedrock','aquifer',
  'monsoon','cyclone','hurricane','blizzard','avalanche','landslide','wildfire','drought',
  'eclipse','nebula','galaxy','cosmos','orbit','atmosphere',
  'glacier','valley','jungle','desert','forest','meadow','swamp','reef',
  'delta','creek','lagoon','plateau','pebble','boulder','fossil','mineral',
  'crystal','erosion','shoreline','tide','frost','breeze','storm',
  'season','winter','summer','autumn','spring','sunrise','sunset',
  'twilight','midnight','dawn','dusk','horizon',

  // ── Animals ──
  'eagle','falcon','sparrow','dolphin','whale','shark','salmon','turtle',
  'rabbit','squirrel','beaver','otter','buffalo','leopard','cheetah','jaguar',
  'gorilla','penguin','elephant','giraffe','zebra','rhino','camel','koala',
  'parrot','iguana','firefly','butterfly','dragonfly','beetle',
  'spider','scorpion','lobster','jellyfish','seahorse','starfish','octopus','crab',
  'flamingo','pelican','toucan','macaw','condor','vulture','heron','crane',
  'albatross','puffin','kiwi','cassowary','ostrich','peacock','pheasant',
  'moose','reindeer','caribou','antelope','wildebeest','baboon','mandrill','chimpanzee',
  'orangutan','lemur','platypus','wombat','wallaby','kangaroo','dingo','quokka',
  'piranha','barracuda','swordfish','tuna','anchovy','sardine','herring','trout',
  'sturgeon','catfish','crayfish','mussel','oyster','clam','squid','nautilus',

  // ── Food & Drink ──
  'bread','butter','cheese','yogurt','honey','sugar','pepper','garlic',
  'tomato','onion','potato','carrot','spinach','broccoli','mushroom','avocado',
  'lemon','orange','mango','grape','cherry','strawberry','blueberry','coconut',
  'almond','walnut','peanut','cashew','coffee','chocolate','vanilla','cinnamon',
  'ginger','saffron','vinegar','mustard','ketchup','salsa','noodles','pasta',
  'pizza','burger','sandwich','soup','stew','salad','dessert','cookie',
  'brownie','muffin','pancake','waffle','syrup','cream','pickle','olive',
  'artichoke','asparagus','celery','zucchini','eggplant','pumpkin','turnip','radish',
  'leek','chive','parsley','cilantro','basil','thyme','rosemary','oregano',
  'turmeric','cardamom','nutmeg','clove','anise','fennel','wasabi','tahini',
  'hummus','falafel','tortilla','burrito','quesadilla','enchilada','ramen','pho',
  'sushi','tempura','curry','biryani','paella','risotto','goulash','pierogi',
  'baklava','tiramisu','cheesecake','mousse','sorbet','gelato','custard','tart',

  // ── Technology ──
  'server','client','router','browser','firewall','database','cluster','backup',
  'deploy','script','syntax','compile','runtime','module','package','library',
  'framework','interface','request','response','payload','token','cache',
  'queue','thread','binary','boolean','integer','string','array','matrix',
  'tensor','vector','pixel','render','shader','texture','polygon','vertex',
  'buffer','socket','latency','bandwidth','throughput','encryption','decryption',
  'algorithm','recursive','iterate','inherit','override','import','export','async',
  'await','promise','callback','closure','lambda','stream','pipeline','container',
  'microchip','processor','transistor','resistor','capacitor','diode','antenna','sensor',
  'actuator','feedback','automation','robotics','firmware','wireless','ethernet','bluetooth',
  'satellite','packet','certificate','authentication','authorization','session','cookie',
  'repository','branch','commit','merge','kubernetes','docker','terraform','ansible',
  'jenkins','monitoring','logging','alert','dashboard','metric','threshold','anomaly',
  'prediction','forecast','regression','neural','training','inference','gradient',
  'optimizer','activation','embedding','transformer',

  // ── Science ──
  'atom','molecule','electron','neutron','proton','nucleus','photon','quantum',
  'gravity','velocity','momentum','friction','pressure','voltage','current','circuit',
  'magnet','spectrum','frequency','wavelength','amplitude','reaction','catalyst','enzyme',
  'protein','carbon','oxygen','nitrogen','hydrogen','plasma','laser','radiation',
  'mutation','genome','chromosome','bacteria','virus','vaccine','antibiotic','hormone',
  'neuron','synapse','cortex','tissue','organ','artery','vein','pulse',
  'hypothesis','observation','measurement','control','sample','population',
  'correlation','causation','deviation','variance','probability','distribution','median',
  'acceleration','deceleration','oscillation','resonance','diffraction','refraction',
  'reflection','absorption','conductance','resistance','capacitance','inductance',
  'impedance','potential','kinetic','thermal','enthalpy','entropy','equilibrium',
  'solubility','concentration','molarity','titration','precipitation','synthesis',
  'decomposition','oxidation','fermentation','distillation','chromatography','centrifuge',
  'microscope','telescope','spectroscope','oscilloscope','thermometer','barometer',
  'hygrometer','seismograph',

  // ── Society & Culture ──
  'culture','tradition','custom','heritage','community','society','democracy','justice',
  'equality','poverty','wealth','market','commerce','industry','labor','welfare',
  'charity','media','journal','broadcast','publish','archive','museum','gallery',
  'theater','cinema','festival','ceremony','ritual','election','campaign','policy',
  'reform','revolution','protest','movement','assembly','treaty','alliance','conflict',
  'opinion','belief','philosophy','ethics','moral','virtue','religion','faith',
  'prayer','temple','cathedral','parliament','senate','congress','legislation',
  'constitution','amendment','sovereignty','jurisdiction','municipality','metropolitan',
  'suburban','rural','urban','cosmopolitan','indigenous','diaspora',
  'immigration','emigration','refugee','asylum','citizenship','nationality','identity',
  'diversity','inclusion','equity','privilege','discrimination','prejudice','empathy',
  'solidarity','philanthropy','volunteer','nonprofit','corporation','entrepreneur',
  'innovation','startup','venture','capitalism','socialism','democracy','republic',
  'monarchy','aristocracy','oligarchy','taxation','subsidy','tariff','embargo',
  'sanction','diplomacy','negotiation','mediation',

  // ── Health ──
  'exercise','fitness','workout','muscle','flexible','endurance','strength','balance',
  'nutrition','vitamin','mineral','fiber','calorie','hydrate','recover',
  'diagnose','symptom','therapy','surgery','pharmacy','prescription','dosage','allergy',
  'immune','chronic','acute','mental','anxiety','stress','wellness','meditate',
  'cardiovascular','respiratory','digestive','nervous','skeletal','muscular','endocrine',
  'inflammation','infection','deficiency','overdose','withdrawal','rehabilitation',
  'palliative','preventive','screening','diagnosis','prognosis','remission','relapse',
  'pediatric','geriatric','obstetric','psychiatric','oncology','neurology','cardiology',
  'dermatology',

  // ── Home & Daily Life ──
  'kitchen','bedroom','bathroom','living','garden','basement','ceiling','window',
  'curtain','carpet','furniture','cabinet','drawer','shelf','pillow','blanket',
  'appliance','microwave','refrigerator','dishwasher','vacuum','laundry','detergent','towel',
  'schedule','routine','grocery','errand','commute','neighbor','landlord',

  // ── Travel & Places ──
  'airport','station','harbor','terminal','border','passport','luggage','ticket',
  'hotel','hostel','resort','cabin','campsite','trail','tourist','landmark',
  'monument','highway','tunnel','railway','subway','ferry','shuttle',
  'castle','palace','fortress','ruin','shrine','mosque','plaza',
  'stadium','arena',

  // ── Arts & Expression ──
  'painting','sculpture','drawing','sketch','portrait','landscape','canvas',
  'melody','rhythm','harmony','chord','lyric','verse','chorus',
  'fiction','poetry','essay','prose','narrative','dialogue',
  'director','performance','rehearsal','costume','scenery','audience','applause',
  'impressionism','expressionism','surrealism','cubism','realism','modernism','baroque',
  'renaissance','gothic','romantic','classical','contemporary','abstract','figurative',
  'watercolor','charcoal','pastel','gouache','fresco','mosaic','collage','installation',
  'biography','autobiography','memoir','anthology','encyclopedia','thesaurus','almanac',
  'metaphor','simile','hyperbole','alliteration','onomatopoeia','irony','sarcasm','satire',

  // ── Sports ──
  'athlete','champion','trophy','stadium','referee','penalty','tournament','league',
  'sprint','hurdle','marathon','cycling','swimming','rowing','climbing','archery',
  'quarterback','touchdown','dribble','rebound','pitcher','striker','goalkeeper','serve',
  'rally','volley','backhand','forehand','handicap','birdie','bogey','fairway',
  'gymnastics','fencing','wrestling','judo','karate','taekwondo','boxing','kickboxing',
  'surfing','skateboarding','snowboarding','skiing','bobsled','curling',
  'triathlon','decathlon','pentathlon','marathon','steeplechase','discus','javelin',
  'hammer','shotput','longjump','highjump','vaulting','equestrian','dressage','sailing',

  // ── Emotions & Psychology ──
  'compassion','gratitude','resilience','optimism','pessimism','ambivalence',
  'nostalgia','melancholy','euphoria','apathy','enthusiasm','frustration','jealousy','envy',
  'pride','shame','guilt','regret','longing','wonder','awe','disgust',
  'contempt','admiration','reverence','boredom','excitement','anticipation','relief',

  // ── Materials & Textures ──
  'cotton','linen','velvet','leather','denim','nylon','polyester','cashmere',
  'ceramic','porcelain','terracotta','marble','granite','limestone','sandstone','basalt',
  'copper','bronze','silver','platinum','titanium','steel','aluminum','tungsten',
  'rubber','plastic','resin','fiber','polymer','composite','laminate','veneer',

  // ── Professions ──
  'architect','engineer','surgeon','dentist','pharmacist','therapist','counselor','analyst',
  'accountant','auditor','economist','statistician','journalist','editor','curator','archivist',
  'diplomat','legislator','magistrate','prosecutor','detective','forensic','paramedic','veterinarian',
  'botanist','zoologist','geologist','astronomer','physicist','chemist','biologist','ecologist',

  // ── Descriptive / Adjectives ──
  'ancient','modern','classic','vintage','rustic','elegant','sleek','minimal',
  'vibrant','subtle','vivid','faded','crisp','blurry','narrow','spacious',
  'rough','smooth','hollow','solid','rigid','elastic','fragile','sturdy',
  'rapid','gentle','fierce','tender','honest','clever','brave','humble',
  'curious','patient','cheerful','gloomy','confident','stubborn','generous','greedy',
  'loyal','selfish',

  // ── Time & Sequence ──
  'previous','current','upcoming','recent','initial','ongoing','sudden',
  'gradual','instant','frequent','constant','temporary','permanent',
  'early','prompt','delayed','simultaneous','sequential','parallel','cyclic',

  // ── Quantity & Degree ──
  'multiple','single','several','numerous','abundant','scarce',
  'excess','moderate','maximum','minimum','roughly','exactly','nearly',
  'barely','entirely','partially','mainly','mostly','slightly','heavily','rapidly',

  // ── Connectors ──
  'although','because','therefore','however','moreover','furthermore','nevertheless','otherwise',
  'whereas','whether','unless','despite','through','against','across',
  'beside','throughout','alongside','regarding','concerning',

  // ── Extended Verbs ──
  'accelerate','accumulate','acknowledge','activate','affiliate','aggregate','anticipate','arbitrate',
  'articulate','benchmark','calibrate','categorize','certify','clarify','collaborate','compensate',
  'complement','consolidate','correlate','cultivate','dedicate','differentiate','duplicate','eliminate',
  'enumerate','facilitate','formulate','illustrate','incorporate','initiate','innovate',
  'leverage','minimize','negotiate','populate','quantify','regulate','reinforce','stimulate',
  'summarize','synchronize','translate','utilize','verify','visualize','withstand',
  'accelerate','accumulate','arbitrate','articulate','benchmark','calibrate','compensate',

  // ── Extra Mixed ──
  'drool','eager','earthy','eject','emote','envoy','epoch','erupt','evoke',
  'excel','exile','faint','flair','folly','foray','forge','forte','fount',
  'gavel','glyph','gorge','gouge','grace','grasp','grief','groan','grove',
  'guise','gulch','hasty','haven','hazel','heist','hence','herbs','hinge',
  'hover','howl','huddle','hunch','hurdle','husky','ingot','inlet','inset',
  'ivory','jaunt','jetty','jewel','joust','knack','kneel','laden','lance',
  'lanky','lapel','lapse','larva','latch','laud','ledge','liner','lingo',
  'lodge','lofty','lunge','lusty','manor','maple','marsh','mason','maxim',
  'midst','mimic','mirth','modal','mogul','moist','molar','morph','mourn',
  'mural','murky','musty','nasal','naval','niche','nimble','noble','notch',
  'nudge','nymph','octet','odour','onset','optic','orate','outdo','paddy',
  'pearl','pedal','petal','pivot','plank','plume','plunge','polar','porch',
  'pouch','prawn','preen','prism','prune','psalm','purge','rabbi','radar',
  'radii','raven','realm','rebel','recap','relic','remix','repel','resin',
  'retro','ridge','rivet','rodeo','rogue','roost','rouge','rover','rustle',
  'saber','satin','scalp','scant','scout','sedan','serum','setup','shaft',
  'shale','shard','sheen','sheer','shelf','siege','siren','skate','skull',
  'slant','slash','slate','sleet','slender','slime','slope','sloth','smash',
  'smear','smelt','smirk','snare','sneak','snout','sober','sonar','spawn',
  'spear','speck','spire','splice','spoke','spore','spout','sprig','spunk',
  'squad','squat','stake','stale','stalk','stall','stamp','stark','starve',
  'stash','steep','steer','stern','stiff','sting','stock','stomp','strap',
  'straw','strife','strip','strobe','strut','stump','swamp','swath','swear',
  'sweep','swirl','swoop','tally','talon','taper','taunt','tense','tepid',
  'thorn','throb','thud','thump','tiara','tidal','tight','tinge','tipsy',
  'titan','toast','tonal','torso','toxic','trait','tramp','trench','tribe',
  'trick','troop','trunk','tulip','tuner','tunic','tutor','tweak','twist',
  'udder','ulcer','ultra','umbra','untie','upper','usher','vague','valor',
  'valve','vault','vigor','viper','visor','vista','vital','venom','vortex',
  'waltz','warden','waver','wedge','weedy','whirl','whisk','winch','wrist',
  'yacht','yearn','yeast','yield','zeal','zenith','zephyr',
];

// ─── DOM ──────────────────────────────────────────────
const timerDisplay     = document.getElementById('timer-display');
const wpmDisplay       = document.getElementById('wpm-display');
const highscoreDisplay = document.getElementById('highscore-display');
const textDisplay      = document.getElementById('text-display');
const hiddenInput      = document.getElementById('hidden-input');
const startBtn         = document.getElementById('start-btn');
const resetBtn         = document.getElementById('reset-btn');
const idleScreen       = document.getElementById('idle-screen');
const accuracyWrap     = document.getElementById('accuracy-wrap');
const accuracyBar      = document.getElementById('accuracy-bar');
const accuracyLabel    = document.getElementById('accuracy-label');
const modeBadge        = document.getElementById('mode-badge');
const resultsOverlay   = document.getElementById('results-overlay');
const resultWpm        = document.getElementById('result-wpm');
const resultAcc        = document.getElementById('result-acc');
const resultChars      = document.getElementById('result-chars');
const newBest          = document.getElementById('new-best');
const playAgainBtn     = document.getElementById('play-again-btn');

// ─── State ────────────────────────────────────────────
const GAME_DURATION = 60;
let words         = [];
let wordSpans     = [];
let currentIndex  = 0;
let correctCount  = 0;
let wrongCount    = 0;
let totalTyped    = 0;
let timerInterval = null;
let timeLeft      = GAME_DURATION;
let gameActive    = false;
let gameStarted   = false;
let highScore     = 0;
let activeLine    = 0;
let lineHeight    = 0;

// ─── High Score ───────────────────────────────────────
function loadHighScore() {
  highScore = parseInt(localStorage.getItem('bolttype_highscore') || '0', 10);
  highscoreDisplay.textContent = highScore;
}
function saveHighScore(s) {
  if (s > highScore) {
    highScore = s;
    localStorage.setItem('bolttype_highscore', highScore);
    highscoreDisplay.textContent = highScore;
    return true;
  }
  return false;
}

// ─── Generate words ───────────────────────────────────
function generateWords(n) {
  return Array.from({ length: n }, () =>
    WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)]);
}

// ─── Build text DOM ───────────────────────────────────
function buildTextDisplay() {
  textDisplay.innerHTML = '';
  wordSpans = [];

  words.forEach((word, wi) => {
    const wordEl = document.createElement('span');
    wordEl.className = 'word';
    [...word].forEach(ch => {
      const s = document.createElement('span');
      s.textContent = ch;
      wordEl.appendChild(s);
      wordSpans.push({ span: s, char: ch });
    });
    textDisplay.appendChild(wordEl);
    if (wi < words.length - 1) {
      const sp = document.createElement('span');
      sp.textContent = ' ';
      textDisplay.appendChild(sp);
      wordSpans.push({ span: sp, char: ' ' });
    }
  });

  if (wordSpans.length) wordSpans[0].span.classList.add('cursor');
}

// ─── Append more words ────────────────────────────────
function appendWords(n) {
  const extra = generateWords(n);
  extra.forEach(word => {
    const sp = document.createElement('span');
    sp.textContent = ' ';
    textDisplay.appendChild(sp);
    wordSpans.push({ span: sp, char: ' ' });

    const wordEl = document.createElement('span');
    wordEl.className = 'word';
    [...word].forEach(ch => {
      const s = document.createElement('span');
      s.textContent = ch;
      wordEl.appendChild(s);
      wordSpans.push({ span: s, char: ch });
    });
    textDisplay.appendChild(wordEl);
  });
}

// ─── Measure line height ──────────────────────────────
function measureLineHeight() {
  if (!wordSpans.length) return;
  lineHeight = wordSpans[0].span.getBoundingClientRect().height * 1.9;
}

// ─── Scroll to keep cursor visible ───────────────────
function scrollToCursor() {
  if (!lineHeight || currentIndex >= wordSpans.length) return;
  const containerTop = textDisplay.getBoundingClientRect().top;
  const cursorTop    = wordSpans[currentIndex].span.getBoundingClientRect().top;
  const linesBelow   = Math.round((cursorTop - containerTop) / lineHeight);
  if (linesBelow > 2) {
    activeLine++;
    textDisplay.scrollTop = activeLine * lineHeight;
  }
  if (linesBelow < 1 && activeLine > 0) {
    activeLine--;
    textDisplay.scrollTop = activeLine * lineHeight;
  }
}

// ─── Timer ────────────────────────────────────────────
function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;
    if (timeLeft <= 10) timerDisplay.style.color = 'var(--wrong)';
    if (timeLeft <= 0)  endGame();
  }, 1000);
}

// ─── Stats ────────────────────────────────────────────
function calcWPM() {
  const m = (GAME_DURATION - timeLeft) / 60;
  return m === 0 ? 0 : Math.round((correctCount / 5) / m);
}
function calcAccuracy() {
  return totalTyped === 0 ? 100 : Math.round((correctCount / totalTyped) * 100);
}
function updateStats() {
  wpmDisplay.textContent = calcWPM();
  const acc = calcAccuracy();
  accuracyBar.style.width   = acc + '%';
  accuracyLabel.textContent = acc + '%';
  accuracyBar.style.background = acc < 70
    ? 'linear-gradient(90deg, var(--wrong), #ff8a00)'
    : 'linear-gradient(90deg, var(--cyan), var(--violet))';
}

// ─── Game Flow ────────────────────────────────────────
function initGame() {
  clearInterval(timerInterval);
  currentIndex = correctCount = wrongCount = totalTyped = 0;
  timeLeft     = GAME_DURATION;
  gameActive   = gameStarted = false;
  activeLine   = 0;
  lineHeight   = 0;

  timerDisplay.textContent   = GAME_DURATION;
  timerDisplay.style.color   = '';
  wpmDisplay.textContent     = '0';
  idleScreen.style.display   = 'none';
  textDisplay.style.display  = 'block';
  textDisplay.scrollTop      = 0;
  accuracyWrap.style.display = 'flex';
  accuracyBar.style.width    = '100%';
  accuracyLabel.textContent  = '100%';
  resultsOverlay.style.display = 'none';
  startBtn.style.display       = 'none';
  resetBtn.style.display       = 'inline-flex';
  modeBadge.textContent = 'TYPE!';
  modeBadge.className   = 'badge active';

  words = generateWords(120);
  buildTextDisplay();
  requestAnimationFrame(() => measureLineHeight());

  hiddenInput.value = '';
  hiddenInput.focus();
  gameActive = true;
}

function endGame() {
  clearInterval(timerInterval);
  gameActive = false;
  hiddenInput.blur();
  const wpm   = calcWPM();
  const acc   = calcAccuracy();
  const isNew = saveHighScore(wpm);
  resultWpm.textContent   = wpm;
  resultAcc.textContent   = acc + '%';
  resultChars.textContent = correctCount;
  newBest.style.display   = isNew ? 'block' : 'none';
  modeBadge.textContent   = 'DONE';
  modeBadge.className     = 'badge done';
  resultsOverlay.style.display = 'flex';
}

function resetGame() {
  clearInterval(timerInterval);
  gameActive = false;
  hiddenInput.value          = '';
  startBtn.style.display     = 'block';
  resetBtn.style.display     = 'none';
  idleScreen.style.display   = 'flex';
  textDisplay.style.display  = 'none';
  textDisplay.scrollTop      = 0;
  accuracyWrap.style.display = 'none';
  resultsOverlay.style.display = 'none';
  timerDisplay.textContent   = GAME_DURATION;
  timerDisplay.style.color   = '';
  wpmDisplay.textContent     = '0';
  modeBadge.textContent      = 'READY';
  modeBadge.className        = 'badge';
}

// ─── Input handler ────────────────────────────────────
hiddenInput.addEventListener('input', () => {
  if (!gameActive) return;
  if (!gameStarted) { gameStarted = true; startTimer(); }

  const val = hiddenInput.value;
  if (!val.length) return;
  const typedChar   = val[val.length - 1];
  hiddenInput.value = '';

  if (currentIndex >= wordSpans.length) return;

  const { span, char } = wordSpans[currentIndex];
  span.classList.remove('cursor');
  totalTyped++;

  if (typedChar === char) { span.classList.add('correct'); correctCount++; }
  else                    { span.classList.add('wrong');   wrongCount++;   }

  currentIndex++;

  // Append more words when nearing the end
  if (wordSpans.length - currentIndex < 50) appendWords(80);

  if (currentIndex < wordSpans.length) {
    wordSpans[currentIndex].span.classList.add('cursor');
    scrollToCursor();
  }

  updateStats();
});

// ─── Backspace handler ────────────────────────────────
hiddenInput.addEventListener('keydown', e => {
  if (!gameActive || e.key !== 'Backspace' || currentIndex <= 0) return;
  currentIndex--;
  const { span } = wordSpans[currentIndex];
  if (currentIndex + 1 < wordSpans.length)
    wordSpans[currentIndex + 1].span.classList.remove('cursor');
  if (span.classList.contains('correct'))    correctCount--;
  else if (span.classList.contains('wrong')) wrongCount--;
  totalTyped = Math.max(0, totalTyped - 1);
  span.classList.remove('correct', 'wrong');
  span.classList.add('cursor');
  scrollToCursor();
  updateStats();
});

// Keep keyboard open on card tap
document.getElementById('typing-card').addEventListener('click', () => {
  if (gameActive) hiddenInput.focus();
});

// ─── Buttons ──────────────────────────────────────────
startBtn.addEventListener('click',    initGame);
resetBtn.addEventListener('click',    resetGame);
playAgainBtn.addEventListener('click', initGame);

// ─── Background particles ─────────────────────────────
(function () {
  const canvas = document.getElementById('bg-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, P;
  const C = ['rgba(77,240,212,', 'rgba(131,111,255,', 'rgba(255,111,186,'];
  const resize = () => { W = canvas.width = innerWidth; H = canvas.height = innerHeight; };
  const make   = () => {
    P = Array.from({ length: 55 }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      r:  Math.random() * 1.8 + 0.4,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      c:  C[Math.floor(Math.random() * C.length)],
      a:  Math.random() * 0.5 + 0.1
    }));
  };
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    P.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.c + p.a + ')';
      ctx.fill();
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0 || p.x > W) p.dx *= -1;
      if (p.y < 0 || p.y > H) p.dy *= -1;
    });
    requestAnimationFrame(draw);
  };
  resize(); make(); draw();
  window.addEventListener('resize', () => { resize(); make(); });
})();

// ─── Init ─────────────────────────────────────────────
loadHighScore();
