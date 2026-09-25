/**
 * AfiyaSauti Translations — Pan-African Multi-Language Support
 * Supports 9 languages: English, Kiswahili, Kikuyu, Dholuo, Luluhya,
 * Kalenjin, Kikamba, Ekegusii, Kimeru
 *
 * Usage: const { t } = useLanguage(); t('nav.patient')
 * Falls back to English if a key is missing for the selected language.
 *
 * SUPABASE MIGRATION:
 *   CREATE TABLE translations (
 *     key TEXT NOT NULL, language TEXT NOT NULL, value TEXT NOT NULL,
 *     PRIMARY KEY (key, language)
 *   );
 *   -- Load translations from DB: SELECT key, value FROM translations WHERE language = $1
 */
export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'sw', label: 'Kiswahili', flag: '🇰🇪' },
  { code: 'ki', label: 'Kikuyu', flag: '🇰🇪' },
  { code: 'luo', label: 'Dholuo', flag: '🇰🇪' },
  { code: 'luy', label: 'Luluhya', flag: '🇰🇪' },
  { code: 'kal', label: 'Kalenjin', flag: '🇰🇪' },
  { code: 'kam', label: 'Kikamba', flag: '🇰🇪' },
  { code: 'gus', label: 'Ekegusii', flag: '🇰🇪' },
  { code: 'mer', label: 'Kimeru', flag: '🇰🇪' },
];

export const translations = {
  // ─── Navigation ─────────────────────────────────────────
  'nav.health': { en: 'Health', sw: 'Afya', ki: 'Ũgima', luo: 'Ngima', luy: 'Obulame', kal: 'Tiy', kam: 'Uima', gus: 'Oborwaire', mer: 'Ũgima' },
  'nav.appointments': { en: 'Appointments', sw: 'Miadi', ki: 'Mĩataro', luo: 'Misedo', luy: 'Tsing\'ama', kal: 'Kagirgin', kam: 'Mĩthigithia', gus: 'Ebisare', mer: 'Mĩataro' },
  'nav.medications': { en: 'Medications', sw: 'Dawa', ki: 'Mĩdawa', luo: 'Yiende', luy: 'Tsiamalwa', kal: 'Mset', kam: 'Mĩdawa', gus: 'Ebiang\'wansi', mer: 'Mĩdawa' },
  'nav.messages': { en: 'Messages', sw: 'Ujumbe', ki: 'Mĩbarũ', luo: 'Nend', luy: 'Tsinyukha', kal: 'Kaswamit', kam: 'Mĩumbe', gus: 'Ebitere', mer: 'Mĩbarũ' },
  'nav.consent': { en: 'Consent & Privacy', sw: 'Ridhaa na Faragha', ki: 'Mĩatĩrĩra na Gĩtheru', luo: 'Miyiyo ni Krijo', luy: 'Eshilaho nende Obwifisi', kal: 'Keetab Ng\'alek ak Kipang\'', kam: 'Ũyalianĩ na Ũtethyo', gus: 'Egetabeng\'eri n\'Egensoseri', mer: 'Mĩatĩrĩra na Gĩtheru' },
  'nav.triage': { en: 'Symptom Check', sw: 'Ukaguzi wa Dalili', ki: 'Kũrorwa kwa Mĩmera', luo: 'Peko mag Yiede', luy: 'Okhulondolola oburweire', kal: 'Kegamirirwe che Yitat', kam: 'Kũũria Mĩmera', gus: 'Okogera ebiyabe', mer: 'Kũroria Mĩmera' },
  'nav.tasks': { en: 'Tasks', sw: 'Kazi', ki: 'Mĩtugo', luo: 'Tich', luy: 'Tsinyakhwo', kal: 'Kagaiy', kam: 'Mĩtugo', gus: 'Emigweri', mer: 'Mĩtugo' },
  'nav.visits': { en: 'Field Visits', sw: 'Matembezi ya Nyumbani', ki: 'Mĩgũthĩre kĩa Nyũmba', luo: 'Weyi e Dala', luy: 'Tsindimba tsinzu', kal: 'Kagaiyab Kony', kam: 'Mĩtũrĩre wa Nyũmba', gus: 'Ebirere bwa Riani', mer: 'Mĩgũthĩre kĩa Nyũmba' },
  'nav.guidance': { en: 'Guidance', sw: 'Mwongozo', ki: 'Mĩarĩrĩro', luo: 'Timo', luy: 'Omulamwa', kal: 'Kagaiy', kam: 'Mũlayo', gus: 'Egetabera', mer: 'Mĩarĩrĩro' },
  'nav.map': { en: 'Map', sw: 'Ramani', ki: 'Mũratĩre', luo: 'Machie', luy: 'Efuli', kal: 'Kaptagor', kam: 'Mũratĩre', gus: 'Egensi', mer: 'Mũratĩre' },
  'nav.dashboard': { en: 'Dashboard', sw: 'Dashibodi', ki: 'Dashibodi', luo: 'Dasibodi', luy: 'Dashibodi', kal: 'Dasibodi', kam: 'Dashibodi', gus: 'Dasibodi', mer: 'Dashibodi' },
  'nav.analytics': { en: 'Analytics', sw: 'Changanuzi', ki: 'Mĩathani', luo: 'Nyaluo', luy: 'Okhuchunya', kal: 'Kegulal', kam: 'Mĩathani', gus: 'Egokonya', mer: 'Mĩathani' },
  'nav.overview': { en: 'Overview', sw: 'Muhtasari', ki: 'Mũigana', luo: 'Neno Makwaro', luy: 'Omwandu', kal: 'Kagaiy', kam: 'Mũigana', gus: 'Egoterera', mer: 'Mũigana' },
  'nav.liveMonitor': { en: 'Live Monitor', sw: 'Kufuatilia Mubashashi', ki: 'Mũrata Mũraihu', luo: 'Ngi Ma Orie', luy: 'Okhulola', kal: 'Kagaiy', kam: 'Mũrathi', gus: 'Egokonya', mer: 'Mũrata Mũraihu' },
  'nav.history': { en: 'History', sw: 'Historia', ki: 'Mĩhĩrĩga', luo: 'Tamdwe', luy: 'Tsinyuma', kal: 'Kagaiy', kam: 'Mĩhĩrĩga', gus: 'Ebibere', mer: 'Mĩhĩrĩga' },

  // ─── Common Actions ─────────────────────────────────────
  'common.save': { en: 'Save', sw: 'Hifadhi', ki: 'Hinga', luo: 'Gwoko', luy: 'Tsilile', kal: 'Kogaiy', kam: 'Ũingĩ', gus: 'Egetaire', mer: 'Hinga' },
  'common.cancel': { en: 'Cancel', sw: 'Ghairi', ki: 'Hinga ũgĩa', luo: 'Rwak', luy: 'Reedede', kal: 'Kogaiy', kam: 'Ũgĩa', gus: 'Egeta', mer: 'Hinga ũgĩa' },
  'common.send': { en: 'Send', sw: 'Tuma', ki: 'Tũma', luo: 'Or', luy: 'Rumia', kal: 'Kogaiy', kam: 'Tũma', gus: 'Egota', mer: 'Tũma' },
  'common.loading': { en: 'Loading...', sw: 'Inapakia...', ki: 'Kũrahĩra...', luo: 'Tuch...', luy: 'Kwitsa...', kal: 'Kagaiy...', kam: 'Kũrahĩra...', gus: 'Egetaire...', mer: 'Kũrahĩra...' },
  'common.add': { en: 'Add', sw: 'Ongeza', ki: 'Geria', luo: 'Med', luy: 'Lengera', kal: 'Kogaiy', kam: 'Geria', gus: 'Egeta', mer: 'Geria' },
  'common.new': { en: 'New', sw: 'Mpya', ki: 'Mpya', luo: 'Machiel', luy: 'Nsinu', kal: 'Kagaiy', kam: 'Mpya', gus: 'Egeta', mer: 'Mpya' },
  'common.search': { en: 'Search', sw: 'Tafuta', ki: 'Rũria', luo: 'Nyi', luy: 'Fwenula', kal: 'Kagaiy', kam: 'Rũria', gus: 'Egota', mer: 'Rũria' },
  'common.refresh': { en: 'Refresh', sw: 'Onesha', ki: 'Hingũra', luo: 'Nwo', luy: 'Nwasya', kal: 'Kogaiy', kam: 'Hingũra', gus: 'Egeta', mer: 'Hingũra' },
  'common.export': { en: 'Export', sw: 'Hamisha', ki: 'Hinga', luo: 'Or', luy: 'Rumia', kal: 'Kogaiy', kam: 'Hinga', gus: 'Egota', mer: 'Hinga' },
  'common.close': { en: 'Close', sw: 'Funga', ki: 'Gũthima', luo: 'Lor', luy: 'Kwala', kal: 'Kogaiy', kam: 'Gũthima', gus: 'Egeta', mer: 'Gũthima' },
  'common.back': { en: 'Back', sw: 'Rudi', ki: 'Coka', luo: 'Dok', luy: 'Sya', kal: 'Kogaiy', kam: 'Coka', gus: 'Egeta', mer: 'Coka' },
  'common.yes': { en: 'Yes', sw: 'Ndiyo', ki: 'Ĩĩ', luo: 'Ee', luy: 'Eee', kal: 'Kagaiy', kam: 'Ĩĩa', gus: 'Ee', mer: 'Ĩĩ' },
  'common.no': { en: 'No', sw: 'Hapana', ki: 'Aca', luo: 'Da', luy: 'Tawe', kal: 'Kagaiy', kam: 'Aca', gus: 'Tatari', mer: 'Aca' },

  // ─── Home / Landing Page ────────────────────────────────
  'home.badge': { en: 'Trusted Healthcare AI for Kenya', sw: 'AI ya Afya Iaminikayo kwa Kenya', ki: 'AI ya Ũgima Ithiinagia Kenya', luo: 'AI mar Ngima ma Tiend Kende pi Kenya', luy: 'AI y\'Obulame yitsa khu Kenya', kal: 'AI ab Tiy amu Kenya', kam: 'AI ya Uima wĩĩ Kwa Kenya', gus: 'AI ya Oborwaire y\'ogende Kenya', mer: 'AI ya Ũgima Ithiinagia Kenya' },
  'home.tagline': { en: 'A clinically safe, privacy-first healthcare assistant providing symptom triage, in-home ambient monitoring, and national public health intelligence.', sw: 'Msaidizi wa afya anayejali usalama wa kliniki na faragha, anatoa ukaguzi wa dalili, ufuatiliaji wa nyumbani, na taarifa za afya ya kitaifa.', ki: 'Mũteithia wa ũgima ũrĩa ũrĩ na igũa rĩa kliniki na gĩtheru, ũtaara mĩmera, kũrora nyũmba, na mahũthĩro ma ũgima wa bũrũri.', luo: 'Konyo mar ngima ma tiyo ni e klini ni krijo, peko mag yiede, neno e dala, ni weche mag ngima ma pach.', luy: 'Omulamwa w\'obulame uli nende tsitswa tsia klini ni obwifisi, okhulondolola oburweire, okhulola sinzu, ni amakhuwa ga obulame ga shirari.', kal: 'Konyo ab tiy ako klini ak kipang\' ako iyemit ab obo kony, kegamirirwe che yitat, neno e kony, ni wechek ab tiy amu Kenya.', kam: 'Mũteithia wa uima ũrĩa ũrĩ na igũa rĩa kliniki na ũtethyo, ũũria mĩmera, kũrora nyũmba, na mahũthĩro ma uima wa bũrũri.', gus: 'Omogokeri bwa oborwaire owo ogende e klini ni egensoseri, okogera ebiyabe, neno e riani, ni amakhuwa ga oborwaire ga egosi.', mer: 'Mũteithia wa ũgima ũrĩa ũrĩ na igũa rĩa kliniki na gĩtheru, ũtaara mĩmera, kũrora nyũmba, na mahũthĩro ma ũgima wa bũrũri.' },
  'home.enterPortal': { en: 'Enter Portal', sw: 'Ingia kwenye Portal', ki: 'Ĩkia Portal', luo: 'Dhi e Portal', luy: 'Injila khu Portal', kal: 'Kitab Portal', kam: 'Ĩkia Portal', gus: 'Egota Portal', mer: 'Ĩkia Portal' },
  'home.selectPortal': { en: 'Select Your Portal', sw: 'Chagua Portal Yako', ki: 'Gũthuria Portal Waku', luo: 'Yier Portal Ni', luy: 'Londe Portal Yenu', kal: 'Kagir Portal Anyi', kam: 'Gũthuria Portal Waku', gus: 'Rora Portal Yenu', mer: 'Gũthuria Portal Waku' },
  'home.selectPortalDesc': { en: 'Multi-channel triage, ambient monitoring, and national health intelligence. Every portal is assisted by grounded AI — humans remain in control.', sw: 'Ukaguzi wa njia nyingi, ufuatiliaji wa nyumbani, na taarifa za afya ya kitaifa. Kila portal inasaidiwa na AI — binadamu anabaki kwenye udhibiti.', ki: 'Ũtaara wa njia nyingi, kũrora nyũmba, na mahũthĩro ma ũgima wa bũrũri. Portal ilĩ ũteithĩtwo ni AI — andũ arĩkũgĩa na bũrũri.', luo: 'Peko mag yiede machiel machiel, neno e dala, ni wechek mag ngima ma pach. Portal kende konyo ni AI — jombe obedo kuo.', luy: 'Okhulondolola oburweire khunjila tsingi, okhulola sinzu, ni amakhuwa ga obulame ga shirari. Portal ilondi khulisidwa ni AI — abandu baliamilikhwo.', kal: 'Kegamirirwe che yitat achamach, neno e kony, ni wechek ab tiy amu Kenya. Portal kende konyo ni AI — jombe obedo kuo.', kam: 'Ũũria mĩmera wa njia nyingi, kũrora nyũmba, na mahũthĩro ma uima wa bũrũri. Portal ilĩ ũteithĩtwo ni AI — andũ arĩkũgĩa na bũrũri.', gus: 'Okogera ebiyabe chengi, neno e riani, ni amakhuwa ga oborwaire ga egosi. Portal yango ekonywa ni AI — abantu bagera obwanchi.', mer: 'Ũtaara wa njia nyingi, kũrora nyũmba, na mahũthĩro ma ũgima wa bũrũri. Portal ilĩ ũteithĩtwo ni AI — andũ arĩkũgĩa na bũrũri.' },
  'home.features': { en: 'Built for Kenya\'s Health System', sw: 'Iliyoundwa kwa Mfumo wa Afya wa Kenya', ki: 'Ekorĩtwo nĩ Mĩgũnda ya Ũgima ya Kenya', luo: 'Otud gi Weche mag Ngima mag Kenya', luy: 'Elondikhwo khwa Mfumo wa Obulame wa Kenya', kal: 'Okokotab Mfumo ab Tiy amu Kenya', kam: 'Ekorĩtwo nĩ Mĩgũnda ya Uima wa Kenya', gus: 'Ekoragwo e Mfumo bwa Oborwaire bwa Kenya', mer: 'Ekorĩtwo nĩ Mĩgũnda ya Ũgima ya Kenya' },

  // ─── Patient Portal ────────────────────────────────────
  'patient.healthRecord': { en: 'Patient Health Record', sw: 'Rekodi ya Afya ya Mgonjwa', ki: 'Rekodi ya Ũgima wa Mũrarũrũ', luo: 'Rekodi mag Ngima mar Wed', luy: 'Rekodi ya Obulame wa Murwale', kal: 'Rekodi ab Tiy amu Konda', kam: 'Rekodi ya Uima wa Mũrarũrũ', gus: 'Erekodi ya Oborwaire bwa Omogochi', mer: 'Rekodi ya Ũgima wa Mũrarũrũ' },
  'patient.timeline': { en: 'Health Timeline', sw: 'Historia ya Afya', ki: 'Mĩhĩrĩga ya Ũgima', luo: 'Tamdwe mag Ngima', luy: 'Tsinyuma tsia Obulame', kal: 'Kagaiyab Tiy', kam: 'Mĩhĩrĩga ya Uima', gus: 'Ebibere bwa Oborwaire', mer: 'Mĩhĩrĩga ya Ũgima' },
  'patient.upcomingAppointments': { en: 'Upcoming Appointments', sw: 'Miadi Ijayo', ki: 'Mĩataro Ĩkũraihu', luo: 'Misedo Ma Orie', luy: 'Tsing\'ama tsilikwitsa', kal: 'Kagirgin ak Orie', kam: 'Mĩthigithia Ĩkũraihu', gus: 'Ebisare bikwenda', mer: 'Mĩataro Ĩkũraihu' },
  'patient.careTeam': { en: 'Your Care Team', sw: 'Timu Yako ya Afya', ki: 'Mũgũnda Waku wa Ũgima', luo: 'Jombe mag Ngima Ni', luy: 'Timu yenu y\'Obulame', kal: 'Kagaiyab Tiy', kam: 'Mũgũnda Waku wa Uima', gus: 'Ogoterera bwa Oborwaire', mer: 'Mũgũnda Waku wa Ũgima' },
  'patient.connectedServices': { en: 'Connected Services', sw: 'Huduma Zilizounganishwa', ki: 'Mĩtugo Ĩgĩathĩtwo', luo: 'Weche Makiyo', luy: 'Tsindonya tsiliyokhana', kal: 'Kagaiy', kam: 'Mĩtugo Ĩgĩathĩtwo', gus: 'Emigweri yegokaherere', mer: 'Mĩtugo Ĩgĩathĩtwo' },
  'patient.quickTriage': { en: 'Quick Symptom Check', sw: 'Ukaguzi wa Haraka wa Dalili', ki: 'Ũtaara wa Hĩũ wa Mĩmera', luo: 'Peko mag Yiede Machiep', luy: 'Okhulondolola oburweire bwahanga', kal: 'Kegamirirwe che Yitat', kam: 'Ũũria wa Hĩũ wa Mĩmera', gus: 'Okogera ebiyabe', mer: 'Ũtaara wa Hĩũ wa Mĩmera' },
  'patient.consentManagement': { en: 'Consent & Privacy (Kenya DPA 2019)', sw: 'Ridhaa na Faragha (Kenya DPA 2019)', ki: 'Mĩatĩrĩra na Gĩtheru (Kenya DPA 2019)', luo: 'Miyiyo ni Krijo (Kenya DPA 2019)', luy: 'Eshilaho nende Obwifisi (Kenya DPA 2019)', kal: 'Keetab Ng\'alek ak Kipang\' (Kenya DPA 2019)', kam: 'Ũyalianĩ na Ũtethyo (Kenya DPA 2019)', gus: 'Egetabeng\'eri n\'Egensoseri (Kenya DPA 2019)', mer: 'Mĩatĩrĩra na Gĩtheru (Kenya DPA 2019)' },
  'patient.medicationsAdherence': { en: 'Medications & Adherence', sw: 'Dawa na Uzingatiaji', ki: 'Mĩdawa na Gũkũrania', luo: 'Yiende ni Tuch', luy: 'Tsiamalwa ni Okhukhola', kal: 'Mset ak Kogaiy', kam: 'Mĩdawa na Gũkũrania', gus: 'Ebiang\'wansi n\'Egokonya', mer: 'Mĩdawa na Gũkũrania' },
  'patient.markTaken': { en: 'Mark as Taken', sw: 'Alama kama Umechukua', ki: 'Tũma Taaguo Ũnyuĩte', luo: 'Yier Kaka Ichiwe', luy: 'Tia aka Omwatsakhwo', kal: 'Kagaiy', kam: 'Tũma Taaguo Ũnyuĩte', gus: 'Egeta', mer: 'Tũma Taaguo Ũnyuĩte' },
  'patient.taken': { en: 'Taken', sw: 'Umechukua', ki: 'Ũnyuĩte', luo: 'Ochiwe', luy: 'Omwatsakhwo', kal: 'Kagaiy', kam: 'Ũnyuĩte', gus: 'Egeta', mer: 'Ũnyuĩte' },
  'patient.adherence': { en: 'Adherence', sw: 'Uzingatiaji', ki: 'Gũkũrania', luo: 'Tuch', luy: 'Okhukhola', kal: 'Kogaiy', kam: 'Gũkũrania', gus: 'Egokonya', mer: 'Gũkũrania' },
  'patient.refillIn': { en: 'Refill in', sw: 'Jaza tena ndani ya', ki: 'Rũgĩrĩra ndani ya', luo: 'Nwo e', luy: 'Lengera e', kal: 'Kogaiy', kam: 'Rũgĩrĩra ndani ya', gus: 'Egeta', mer: 'Rũgĩrĩra ndani ya' },
  'patient.grant': { en: 'Grant', sw: 'Ruhusa', ki: 'Hĩtĩhĩria', luo: 'Miyo', luy: 'Laha', kal: 'Kagaiy', kam: 'Hĩtĩhĩria', gus: 'Egeta', mer: 'Hĩtĩhĩria' },
  'patient.revoke': { en: 'Revoke', sw: 'Futa', ki: 'Hinga', luo: 'Rwak', luy: 'Reede', kal: 'Kogaiy', kam: 'Hinga', gus: 'Egeta', mer: 'Hinga' },
  'patient.active': { en: 'ACTIVE', sw: 'INAFANYA KAZI', ki: 'ĨKORAGWO', luo: 'OTUD', luy: 'ELI', kal: 'KAGAIY', kam: 'ĨKORAGWO', gus: 'EKORA', mer: 'ĨKORAGWO' },
  'patient.notGranted': { en: 'NOT GRANTED', sw: 'HAIJARUHUSIWA', ki: 'TIŨHĨTĨHĨTWO', luo: 'ONDIYOMA', luy: 'TSILAHIBWE', kal: 'KAGAIY', kam: 'TIŨHĨTĨHĨTWO', gus: 'TIGETARI', mer: 'TIŨHĨTĨHĨTWO' },

  // ─── Safety ─────────────────────────────────────────────
  'safety.notice': { en: 'Clinical Safety Notice', sw: 'Notisi ya Usalama wa Kliniki', ki: 'Notisi ya Igũa rĩa Kliniki', luo: 'Neno mag Tijuw gi Klini', luy: 'Esilaho ya Tsitswa tsia Klini', kal: 'Kagaiy', kam: 'Notisi ya Igũa rĩa Kliniki', gus: 'Egetabeng\'eri bwa Egetabera', mer: 'Notisi ya Igũa rĩa Kliniki' },
  'safety.noticeText': { en: 'AfiyaSauti never issues a diagnosis or prescription. All AI suggestions are recommendations requiring human review. In emergencies, call 999 or visit the nearest health facility immediately.', sw: 'AfiyaSauti haitoi utambuzi wagonjwa au dawa. Mapendekezo yote ya AI ni pendekezo yanahitaji ukaguzi wa binadamu. Kwa dharura, piga 999 au nenda kituo cha afya cha karibu mara moja.', ki: 'AfiyaSauti ndĩratang\'ĩra utambuzi kana dawa. Mĩarĩrĩro yose ya AI nĩ mĩarĩrĩro ĩrenda kũrora andũ. Kĩega-inĩ, hũra 999 kana ũrute gĩthiinĩ kĩa ũgima kĩa karibu.', luo: 'AfiyaSauti ok neno tich mag wed kendo ok neno yiende. Weche mag AI kende gi rendo neno gi jombe. E peko, go 999 kana dhi e ot ma ngima machiep.', luy: 'AfiyaSauti okhulanga oburweire kana tsiamalwa. Amakhuwa ga AI kende ni amakhuwa gokhukhola khwa abandu. E bukha, hola 999 kana inzile eshifumbi eshikhongo.', kal: 'AfiyaSauti ok neno tich ab konda kape mset. Weche mag AI kende ni weche okwongo jombe. E peko, go 999 kana kitab kony machiep.', kam: 'AfiyaSauti ndĩratang\'ĩra utambuzi kana dawa. Mĩarĩrĩro yose ya AI nĩ mĩarĩrĩro ĩrenda kũrora andũ. Kĩega-inĩ, hũra 999 kana ũrute gĩthiinĩ kĩa uima kĩa karibu.', gus: 'AfiyaSauti togwana okogera kana ebiang\'wansi. Egetabera goti AI n\'egetabera ekorera abantu. E biara, gog 999 kana erora ebiaro bikwenda.', mer: 'AfiyaSauti ndĩratang\'ĩra utambuzi kana dawa. Mĩarĩrĩro yose ya AI nĩ mĩarĩrĩro ĩrenda kũrora andũ. Kĩega-inĩ, hũra 999 kana ũrute gĩthiinĩ kĩa ũgima kĩa karibu.' },

  // ─── Portal Names ───────────────────────────────────────
  'portal.patient': { en: 'Patient Portal', sw: 'Portal ya Mgonjwa', ki: 'Portal ya Mũrarũrũ', luo: 'Portal mar Wed', luy: 'Portal ya Murwale', kal: 'Portal ab Konda', kam: 'Portal ya Mũrarũrũ', gus: 'Portal bwa Omogochi', mer: 'Portal ya Mũrarũrũ' },
  'portal.family': { en: 'Family / Caregiver', sw: 'Familia / Mlezi', ki: 'Mũciĩ / Mũteithia', luo: 'Wag Maka / Konyo', luy: 'Lukwe / Omulindi', kal: 'Kagaiy', kam: 'Mũciĩ / Mũteithia', gus: 'Omosa / Omogokeri', mer: 'Mũciĩ / Mũteithia' },
  'portal.chp': { en: 'CHP Field Portal', sw: 'Portal ya CHP', ki: 'Portal ya CHP', luo: 'Portal mar CHP', luy: 'Portal ya CHP', kal: 'Portal ab CHP', kam: 'Portal ya CHP', gus: 'Portal bwa CHP', mer: 'Portal ya CHP' },
  'portal.clinician': { en: 'Hospital / Clinic', sw: 'Hospitali / Kliniki', ki: 'Hospitari / Kliniki', luo: 'Ot / Klini', luy: 'Esibitale / Klini', kal: 'Kony / Klini', kam: 'Hospitari / Kliniki', gus: 'Ebiaro / Egetabera', mer: 'Hospitari / Kliniki' },
  'portal.moh': { en: 'Ministry of Health', sw: 'Wizara ya Afya', ki: 'Wĩra wa Ũgima', luo: 'Ministry mar Ngima', luy: 'Ministry wa Obulame', kal: 'Kagaiyab Tiy', kam: 'Wĩra wa Uima', gus: 'Ministry bwa Oborwaire', mer: 'Wĩra wa Ũgima' },
  'portal.ambient': { en: 'In-Home Ambient Node', sw: 'Nodi ya Nyumbani', ki: 'Nodi ya Nyũmba', luo: 'Nod e Dala', luy: 'Nod ya Sinzu', kal: 'Kagaiy', kam: 'Nodi ya Nyũmba', gus: 'Nod ya Riani', mer: 'Nodi ya Nyũmba' },

  // ─── Triage ─────────────────────────────────────────────
  'triage.describeSymptoms': { en: 'Describe your symptoms', sw: 'Eleza dalili zako', ki: 'Thiurania mĩmera yaku', luo: 'Pek yiede ni', luy: 'Tsinjisia oburweire bwenyu', kal: 'Kagaiy', kam: 'Thiurania mĩmera yaku', gus: 'Tara ebiyabe', mer: 'Thiurania mĩmera yaku' },
  'triage.getTriage': { en: 'Get Triage', sw: 'Pata Ukaguzi', ki: 'Ũre Ũtaara', luo: 'Nyi Peko', luy: 'Okhulondolola', kal: 'Kagaiy', kam: 'Ũre Ũtaara', gus: 'Egota', mer: 'Ũre Ũtaara' },
  'triage.urgency': { en: 'Urgency', sw: 'Umuhi', ki: 'Ũhũrũ', luo: 'Peko', luy: 'Obukha', kal: 'Kagaiy', kam: 'Ũhũrũ', gus: 'Egeta', mer: 'Ũhũrũ' },
  'triage.language': { en: 'Language', sw: 'Lugha', ki: 'Mĩgũnda', luo: 'Dholuo', luy: 'Luluhya', kal: 'Kalenjin', kam: 'Kikamba', gus: 'Ekegusii', mer: 'Kimeru' },
  'triage.concernArea': { en: 'Concern area', sw: 'Eneo la wasiwasi', ki: 'Erea ya gũtetha', luo: 'Ere mag peko', luy: 'Efuli oburweire', kal: 'Kagaiy', kam: 'Erea ya gũtetha', gus: 'Erea bwa ebiyabe', mer: 'Erea ya gũtetha' },

  // ─── Ambient ────────────────────────────────────────────
  'ambient.startMonitoring': { en: 'Start Monitoring', sw: 'Anza Kufuatilia', ki: 'Thĩra Kũrora', luo: 'Chak Neno', luy: 'Ondolola', kal: 'Kagaiy', kam: 'Thĩra Kũrora', gus: 'Egota', mer: 'Thĩra Kũrora' },
  'ambient.stopMonitoring': { en: 'Stop Monitoring', sw: 'Simamisha Kufuatilia', ki: 'Hinga Kũrora', luo: 'Rwak Neno', luy: 'Yala Okhulola', kal: 'Kagaiy', kam: 'Hinga Kũrora', gus: 'Egeta', mer: 'Hinga Kũrora' },
  'ambient.micOn': { en: 'MIC ON', sw: 'MIKROFONO WASHA', ki: 'MIKROFONO THĨRA', luo: 'MIC OSE', luy: 'MIC OYO', kal: 'KAGAIY', kam: 'MIKROFONO THĨRA', gus: 'MIC EKORA', mer: 'MIKROFONO THĨRA' },
  'ambient.muted': { en: 'MUTED', sw: 'IMEZIMWA', ki: 'ĨGĨTHIMĨTE', luo: 'RUODHO', luy: 'TSIFUNIFUNI', kal: 'KAGAIY', kam: 'ĨGĨTHIMĨTE', gus: 'TIGETARI', mer: 'ĨGĨTHIMĨTE' },
  'ambient.privacyNote': { en: 'All processing on-device. Only anonymized FHIR observations are synced. No raw audio leaves the node.', sw: 'Usindikaji wote unafanyika kwenye kifaa. Tu data isiyo na jina inatumishwa. Sauti haiachi kifaa.', ki: 'Ũgĩa wũndũire ũkoragwo kĩgĩna-inĩ. Data ĩgĩa na gĩtina ndĩrĩhĩtĩkũra. Mĩgambo ndĩuuma kĩgĩna.', luo: 'Weche wengi ose e nod. Data ma nigiye kende giyo. Sauti ok or e nod.', luy: 'Okhukhola kosie khunzu e nod. Data yayo yahalala yitsa. Sauti tsiyoka khu nod.', kal: 'Kagaiy', kam: 'Ũgĩa wũndũire ũkoragwo kĩgĩna-inĩ. Data ĩgĩa na gĩtina ndĩrĩhĩtĩkũra. Mĩgambo ndĩuuma kĩgĩna.', gus: 'Egokonya kosie e nod. Data y\'ogende yagendererwa. Ogoro tigwenda e nod.', mer: 'Ũgĩa wũndũire ũkoragwo kĩgĩna-inĩ. Data ĩgĩa na gĩtina ndĩrĩhĩtĩkũra. Mĩgambo ndĩuuma kĩgĩna.' },
  'ambient.openPortal': { en: 'Open Ambient Portal', sw: 'Fungua Portal ya Ambient', ki: 'Hĩrĩria Portal ya Ambient', luo: 'Yier Portal mar Ambient', luy: 'Tula Portal ya Ambient', kal: 'Kagaiy', kam: 'Hĩrĩria Portal ya Ambient', gus: 'Egota Portal bwa Ambient', mer: 'Hĩrĩria Portal ya Ambient' },
};

/**
 * Translate a key for the given language. Falls back to English.
 * @param {string} key - Translation key (e.g. 'nav.patient')
 * @param {string} lang - Language code (e.g. 'sw')
 * @returns {string} Translated text
 */
export function translate(key, lang) {
  const entry = translations[key];
  if (!entry) return key;
  return entry[lang] || entry.en || key;
}