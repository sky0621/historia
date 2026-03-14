/* global process, console */

import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const databaseUrl = process.env.DATABASE_URL ?? "./.data/historia.db";
const resolvedDatabasePath = path.resolve(process.cwd(), databaseUrl);

fs.mkdirSync(path.dirname(resolvedDatabasePath), { recursive: true });

const sqlite = new Database(resolvedDatabasePath);
sqlite.pragma("foreign_keys = OFF");

const now = Date.now();

function insert(table, values) {
  const columns = Object.keys(values);
  const placeholders = columns.map((column) => `@${column}`).join(", ");
  const statement = sqlite.prepare(`INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`);
  const result = statement.run(values);
  return Number(result.lastInsertRowid);
}

function clearTables() {
  const tables = [
    "conflict_outcomes",
    "conflict_participants",
    "event_relations",
    "event_region_links",
    "event_sect_links",
    "event_religion_links",
    "event_period_links",
    "event_dynasty_links",
    "event_polity_links",
    "event_person_links",
    "events",
    "sect_founder_links",
    "religion_founder_links",
    "person_period_links",
    "person_sect_links",
    "person_religion_links",
    "sect_region_links",
    "religion_region_links",
    "period_region_links",
    "dynasty_region_links",
    "polity_region_links",
    "person_region_links",
    "role_assignments",
    "sects",
    "religions",
    "historical_periods",
    "people",
    "dynasties",
    "polities",
    "period_categories",
    "regions"
  ];

  for (const table of tables) {
    sqlite.prepare(`DELETE FROM ${table}`).run();
  }

  sqlite.prepare("DELETE FROM sqlite_sequence").run();
}

function timeColumns(prefix, values) {
  if (!values) {
    return {
      [`${prefix}_calendar_era`]: null,
      [`${prefix}_start_year`]: null,
      [`${prefix}_end_year`]: null,
      [`${prefix}_is_approximate`]: 0,
      [`${prefix}_precision`]: null,
      [`${prefix}_display_label`]: null
    };
  }

  return {
    [`${prefix}_calendar_era`]: values.calendarEra ?? "CE",
    [`${prefix}_start_year`]: values.startYear ?? null,
    [`${prefix}_end_year`]: values.endYear ?? null,
    [`${prefix}_is_approximate`]: values.isApproximate ? 1 : 0,
    [`${prefix}_precision`]: values.precision ?? "year",
    [`${prefix}_display_label`]: values.displayLabel ?? null
  };
}

function addEventBase(values) {
  return {
    title: values.title,
    event_type: values.eventType,
    description: values.description ?? null,
    ...timeColumns("time", values.timeExpression),
    start_calendar_era: values.startTimeExpression?.calendarEra ?? null,
    start_year: values.startTimeExpression?.startYear ?? null,
    end_calendar_era: values.endTimeExpression?.calendarEra ?? values.startTimeExpression?.calendarEra ?? null,
    end_year: values.endTimeExpression?.startYear ?? values.endTimeExpression?.endYear ?? null,
    created_at: now,
    updated_at: now
  };
}

function runSeed() {
  clearTables();

  const regionIds = {};
  regionIds.world = insert("regions", {
    name: "世界",
    parent_region_id: null,
    aliases: null,
    description: "歴史データ全体の最上位地域。",
    note: null
  });
  regionIds.asia = insert("regions", {
    name: "アジア",
    parent_region_id: regionIds.world,
    aliases: null,
    description: "東アジアや南アジアを含む広域地域。",
    note: null
  });
  regionIds.eastAsia = insert("regions", {
    name: "東アジア",
    parent_region_id: regionIds.asia,
    aliases: null,
    description: "日本・朝鮮・中国などを含む地域。",
    note: null
  });
  regionIds.japan = insert("regions", {
    name: "日本",
    parent_region_id: regionIds.eastAsia,
    aliases: "日本列島",
    description: "日本史の主要舞台。",
    note: null
  });
  regionIds.kyoto = insert("regions", {
    name: "京都",
    parent_region_id: regionIds.japan,
    aliases: "平安京",
    description: "平安京および京都周辺。",
    note: null
  });
  regionIds.europe = insert("regions", {
    name: "ヨーロッパ",
    parent_region_id: regionIds.world,
    aliases: "欧州",
    description: "西欧・中欧・東欧を含む地域。",
    note: null
  });
  regionIds.italy = insert("regions", {
    name: "イタリア",
    parent_region_id: regionIds.europe,
    aliases: null,
    description: "ルネサンスの主要舞台の一つ。",
    note: null
  });
  regionIds.florence = insert("regions", {
    name: "フィレンツェ",
    parent_region_id: regionIds.italy,
    aliases: null,
    description: "ルネサンス都市国家の中心地。",
    note: null
  });
  regionIds.levant = insert("regions", {
    name: "レバント",
    parent_region_id: regionIds.asia,
    aliases: null,
    description: "十字軍関連の主要戦域。",
    note: null
  });
  regionIds.jerusalem = insert("regions", {
    name: "エルサレム",
    parent_region_id: regionIds.levant,
    aliases: null,
    description: "宗教史・戦争史の重要都市。",
    note: null
  });

  const categoryIds = {};
  categoryIds.japan = insert("period_categories", {
    name: "日本史区分",
    description: "日本史の通史的な時代区分。"
  });
  categoryIds.western = insert("period_categories", {
    name: "西洋史区分",
    description: "西洋史の通史的な時代区分。"
  });

  const polityIds = {};
  polityIds.japan = insert("polities", {
    name: "日本",
    aliases: "日本国",
    note: "日本列島を基盤とする国家。",
    ...timeColumns("time", {
      calendarEra: "CE",
      startYear: 660,
      isApproximate: true,
      precision: "year",
      displayLabel: "紀元前660年頃 - 現在"
    })
  });
  insert("polity_region_links", { polity_id: polityIds.japan, region_id: regionIds.japan });
  insert("polity_region_links", { polity_id: polityIds.japan, region_id: regionIds.kyoto });

  polityIds.florence = insert("polities", {
    name: "フィレンツェ共和国",
    aliases: null,
    note: "中世からルネサンスにかけての都市国家。",
    ...timeColumns("time", {
      calendarEra: "CE",
      startYear: 1115,
      endYear: 1532,
      precision: "year",
      displayLabel: "1115年 - 1532年"
    })
  });
  insert("polity_region_links", { polity_id: polityIds.florence, region_id: regionIds.florence });

  polityIds.france = insert("polities", {
    name: "フランス王国",
    aliases: null,
    note: "中世ヨーロッパの主要王国。",
    ...timeColumns("time", {
      calendarEra: "CE",
      startYear: 987,
      endYear: 1792,
      precision: "year",
      displayLabel: "987年 - 1792年"
    })
  });
  insert("polity_region_links", { polity_id: polityIds.france, region_id: regionIds.europe });

  const dynastyIds = {};
  dynastyIds.imperial = insert("dynasties", {
    polity_id: polityIds.japan,
    name: "天皇家",
    aliases: "皇室",
    note: "日本の皇統。",
    ...timeColumns("time", {
      calendarEra: "CE",
      startYear: 660,
      isApproximate: true,
      precision: "year",
      displayLabel: "紀元前660年頃 - 現在"
    })
  });
  insert("dynasty_region_links", { dynasty_id: dynastyIds.imperial, region_id: regionIds.japan });

  dynastyIds.medici = insert("dynasties", {
    polity_id: polityIds.florence,
    name: "メディチ家",
    aliases: null,
    note: "フィレンツェを代表する有力家系。",
    ...timeColumns("time", {
      calendarEra: "CE",
      startYear: 1434,
      endYear: 1737,
      precision: "year",
      displayLabel: "1434年 - 1737年"
    })
  });
  insert("dynasty_region_links", { dynasty_id: dynastyIds.medici, region_id: regionIds.florence });

  const personIds = {};
  personIds.shaka = insert("people", {
    name: "釈迦",
    aliases: "ゴータマ・シッダールタ",
    note: "仏教の開祖。",
    ...timeColumns("birth", {
      calendarEra: "BCE",
      startYear: 563,
      isApproximate: true,
      precision: "year",
      displayLabel: "紀元前563年頃"
    }),
    ...timeColumns("death", {
      calendarEra: "BCE",
      startYear: 483,
      isApproximate: true,
      precision: "year",
      displayLabel: "紀元前483年頃"
    })
  });
  personIds.saicho = insert("people", {
    name: "最澄",
    aliases: "伝教大師",
    note: "日本天台宗の開祖。",
    ...timeColumns("birth", { calendarEra: "CE", startYear: 767, precision: "year", displayLabel: "767年" }),
    ...timeColumns("death", { calendarEra: "CE", startYear: 822, precision: "year", displayLabel: "822年" })
  });
  personIds.kanmu = insert("people", {
    name: "桓武天皇",
    aliases: null,
    note: "平安京遷都を行った天皇。",
    ...timeColumns("birth", { calendarEra: "CE", startYear: 737, precision: "year", displayLabel: "737年" }),
    ...timeColumns("death", { calendarEra: "CE", startYear: 806, precision: "year", displayLabel: "806年" })
  });
  personIds.yoshimasa = insert("people", {
    name: "足利義政",
    aliases: null,
    note: "応仁の乱期の室町幕府将軍。",
    ...timeColumns("birth", { calendarEra: "CE", startYear: 1436, precision: "year", displayLabel: "1436年" }),
    ...timeColumns("death", { calendarEra: "CE", startYear: 1490, precision: "year", displayLabel: "1490年" })
  });
  personIds.jesus = insert("people", {
    name: "イエス・キリスト",
    aliases: null,
    note: "キリスト教の中心人物。",
    ...timeColumns("birth", {
      calendarEra: "BCE",
      startYear: 4,
      isApproximate: true,
      precision: "year",
      displayLabel: "紀元前4年頃"
    }),
    ...timeColumns("death", {
      calendarEra: "CE",
      startYear: 30,
      isApproximate: true,
      precision: "year",
      displayLabel: "30年頃"
    })
  });
  personIds.urban = insert("people", {
    name: "ウルバヌス2世",
    aliases: null,
    note: "第1回十字軍を呼びかけた教皇。",
    ...timeColumns("birth", {
      calendarEra: "CE",
      startYear: 1035,
      isApproximate: true,
      precision: "year",
      displayLabel: "1035年頃"
    }),
    ...timeColumns("death", { calendarEra: "CE", startYear: 1099, precision: "year", displayLabel: "1099年" })
  });
  personIds.lorenzo = insert("people", {
    name: "ロレンツォ・デ・メディチ",
    aliases: "ロレンツォ豪華王",
    note: "ルネサンス期フィレンツェの有力者。",
    ...timeColumns("birth", { calendarEra: "CE", startYear: 1449, precision: "year", displayLabel: "1449年" }),
    ...timeColumns("death", { calendarEra: "CE", startYear: 1492, precision: "year", displayLabel: "1492年" })
  });
  personIds.leonardo = insert("people", {
    name: "レオナルド・ダ・ヴィンチ",
    aliases: null,
    note: "ルネサンス期の芸術家・技術者。",
    ...timeColumns("birth", { calendarEra: "CE", startYear: 1452, precision: "year", displayLabel: "1452年" }),
    ...timeColumns("death", { calendarEra: "CE", startYear: 1519, precision: "year", displayLabel: "1519年" })
  });

  for (const personId of [personIds.saicho, personIds.kanmu, personIds.yoshimasa]) {
    insert("person_region_links", { person_id: personId, region_id: regionIds.japan });
  }
  insert("person_region_links", { person_id: personIds.saicho, region_id: regionIds.kyoto });
  insert("person_region_links", { person_id: personIds.kanmu, region_id: regionIds.kyoto });
  for (const personId of [personIds.lorenzo, personIds.leonardo]) {
    insert("person_region_links", { person_id: personId, region_id: regionIds.florence });
  }
  insert("person_region_links", { person_id: personIds.urban, region_id: regionIds.europe });

  insert("role_assignments", {
    person_id: personIds.kanmu,
    title: "天皇",
    polity_id: polityIds.japan,
    dynasty_id: dynastyIds.imperial,
    note: "第50代天皇。",
    is_incumbent: 0,
    ...timeColumns("time", { calendarEra: "CE", startYear: 781, endYear: 806, precision: "year", displayLabel: "781年 - 806年" })
  });
  insert("role_assignments", {
    person_id: personIds.yoshimasa,
    title: "征夷大将軍",
    polity_id: polityIds.japan,
    dynasty_id: null,
    note: "第8代室町幕府将軍。",
    is_incumbent: 0,
    ...timeColumns("time", { calendarEra: "CE", startYear: 1449, endYear: 1473, precision: "year", displayLabel: "1449年 - 1473年" })
  });
  insert("role_assignments", {
    person_id: personIds.lorenzo,
    title: "フィレンツェの事実上の統治者",
    polity_id: polityIds.florence,
    dynasty_id: dynastyIds.medici,
    note: "メディチ家の当主。",
    is_incumbent: 0,
    ...timeColumns("time", { calendarEra: "CE", startYear: 1469, endYear: 1492, precision: "year", displayLabel: "1469年 - 1492年" })
  });
  insert("role_assignments", {
    person_id: personIds.urban,
    title: "ローマ教皇",
    polity_id: null,
    dynasty_id: null,
    note: null,
    is_incumbent: 0,
    ...timeColumns("time", { calendarEra: "CE", startYear: 1088, endYear: 1099, precision: "year", displayLabel: "1088年 - 1099年" })
  });

  const religionIds = {};
  religionIds.buddhism = insert("religions", {
    name: "仏教",
    aliases: null,
    description: "釈迦を開祖とする宗教。",
    note: "東アジアを含む広域に展開。",
    ...timeColumns("time", {
      calendarEra: "BCE",
      startYear: 5,
      isApproximate: true,
      precision: "year",
      displayLabel: "紀元前5世紀頃 - 現在"
    })
  });
  religionIds.christianity = insert("religions", {
    name: "キリスト教",
    aliases: null,
    description: "イエス・キリストを中心とする宗教。",
    note: "西洋史に大きな影響を持つ。",
    ...timeColumns("time", {
      calendarEra: "CE",
      startYear: 1,
      isApproximate: true,
      precision: "year",
      displayLabel: "1世紀頃 - 現在"
    })
  });
  insert("religion_region_links", { religion_id: religionIds.buddhism, region_id: regionIds.eastAsia });
  insert("religion_region_links", { religion_id: religionIds.christianity, region_id: regionIds.europe });
  insert("religion_founder_links", { religion_id: religionIds.buddhism, person_id: personIds.shaka });
  insert("religion_founder_links", { religion_id: religionIds.christianity, person_id: personIds.jesus });

  const sectIds = {};
  sectIds.tendai = insert("sects", {
    religion_id: religionIds.buddhism,
    name: "天台宗",
    aliases: null,
    description: "最澄が日本で体系化した仏教宗派。",
    note: null,
    ...timeColumns("time", { calendarEra: "CE", startYear: 806, precision: "year", displayLabel: "806年 - 現在" })
  });
  sectIds.catholic = insert("sects", {
    religion_id: religionIds.christianity,
    name: "カトリック教会",
    aliases: "ローマ・カトリック教会",
    description: "西方キリスト教の主要教派。",
    note: null,
    ...timeColumns("time", {
      calendarEra: "CE",
      startYear: 1,
      isApproximate: true,
      precision: "year",
      displayLabel: "1世紀頃 - 現在"
    })
  });
  insert("sect_region_links", { sect_id: sectIds.tendai, region_id: regionIds.japan });
  insert("sect_region_links", { sect_id: sectIds.catholic, region_id: regionIds.europe });
  insert("sect_founder_links", { sect_id: sectIds.tendai, person_id: personIds.saicho });

  insert("person_religion_links", { person_id: personIds.saicho, religion_id: religionIds.buddhism });
  insert("person_religion_links", { person_id: personIds.urban, religion_id: religionIds.christianity });
  insert("person_sect_links", { person_id: personIds.saicho, sect_id: sectIds.tendai });
  insert("person_sect_links", { person_id: personIds.urban, sect_id: sectIds.catholic });

  const periodIds = {};
  periodIds.heian = insert("historical_periods", {
    category_id: categoryIds.japan,
    polity_id: polityIds.japan,
    name: "平安時代",
    region_label: "日本",
    aliases: null,
    description: "平安京遷都から鎌倉幕府成立前後までの時代区分。",
    note: null,
    ...timeColumns("time", { calendarEra: "CE", startYear: 794, endYear: 1185, precision: "year", displayLabel: "794年 - 1185年" })
  });
  periodIds.muromachi = insert("historical_periods", {
    category_id: categoryIds.japan,
    polity_id: polityIds.japan,
    name: "室町時代",
    region_label: "日本",
    aliases: null,
    description: "足利将軍家の時代区分。",
    note: null,
    ...timeColumns("time", { calendarEra: "CE", startYear: 1336, endYear: 1573, precision: "year", displayLabel: "1336年 - 1573年" })
  });
  periodIds.renaissance = insert("historical_periods", {
    category_id: categoryIds.western,
    polity_id: null,
    name: "ルネサンス",
    region_label: "イタリア・ヨーロッパ",
    aliases: null,
    description: "古典古代文化の再評価と芸術・学問の発展期。",
    note: "開始・終了年には幅がある。",
    ...timeColumns("time", {
      calendarEra: "CE",
      startYear: 1300,
      endYear: 1600,
      isApproximate: true,
      precision: "year",
      displayLabel: "1300年頃 - 1600年頃"
    })
  });
  insert("period_region_links", { period_id: periodIds.heian, region_id: regionIds.japan });
  insert("period_region_links", { period_id: periodIds.heian, region_id: regionIds.kyoto });
  insert("period_region_links", { period_id: periodIds.muromachi, region_id: regionIds.japan });
  insert("period_region_links", { period_id: periodIds.renaissance, region_id: regionIds.italy });
  insert("period_region_links", { period_id: periodIds.renaissance, region_id: regionIds.florence });

  insert("person_period_links", { person_id: personIds.kanmu, period_id: periodIds.heian });
  insert("person_period_links", { person_id: personIds.saicho, period_id: periodIds.heian });
  insert("person_period_links", { person_id: personIds.yoshimasa, period_id: periodIds.muromachi });
  insert("person_period_links", { person_id: personIds.lorenzo, period_id: periodIds.renaissance });
  insert("person_period_links", { person_id: personIds.leonardo, period_id: periodIds.renaissance });

  const eventIds = {};
  eventIds.heianCapital = insert("events", addEventBase({
    title: "平安京遷都",
    eventType: "general",
    description: "桓武天皇が都を平安京へ移した。",
    timeExpression: { calendarEra: "CE", startYear: 794, precision: "year", displayLabel: "794年" }
  }));
  eventIds.tendai = insert("events", addEventBase({
    title: "天台宗の公認",
    eventType: "general",
    description: "最澄の活動を背景に日本天台宗が公認された。",
    timeExpression: { calendarEra: "CE", startYear: 806, precision: "year", displayLabel: "806年" }
  }));
  eventIds.crusade = insert("events", addEventBase({
    title: "第1回十字軍",
    eventType: "war",
    description: "ウルバヌス2世の呼びかけを受けて行われた十字軍遠征。",
    timeExpression: { calendarEra: "CE", startYear: 1096, endYear: 1099, precision: "year", displayLabel: "1096年 - 1099年" },
    startTimeExpression: { calendarEra: "CE", startYear: 1096 },
    endTimeExpression: { calendarEra: "CE", startYear: 1099 }
  }));
  eventIds.onin = insert("events", addEventBase({
    title: "応仁の乱",
    eventType: "civil_war",
    description: "京都を主戦場とした室町幕府期の内乱。",
    timeExpression: { calendarEra: "CE", startYear: 1467, endYear: 1477, precision: "year", displayLabel: "1467年 - 1477年" },
    startTimeExpression: { calendarEra: "CE", startYear: 1467 },
    endTimeExpression: { calendarEra: "CE", startYear: 1477 }
  }));
  eventIds.monalisa = insert("events", addEventBase({
    title: "『モナ・リザ』制作開始",
    eventType: "general",
    description: "レオナルド・ダ・ヴィンチが『モナ・リザ』の制作を開始した時期。",
    timeExpression: { calendarEra: "CE", startYear: 1503, isApproximate: true, precision: "year", displayLabel: "1503年頃" }
  }));

  insert("event_person_links", { event_id: eventIds.heianCapital, person_id: personIds.kanmu });
  insert("event_person_links", { event_id: eventIds.tendai, person_id: personIds.saicho });
  insert("event_person_links", { event_id: eventIds.crusade, person_id: personIds.urban });
  insert("event_person_links", { event_id: eventIds.onin, person_id: personIds.yoshimasa });
  insert("event_person_links", { event_id: eventIds.monalisa, person_id: personIds.leonardo });

  insert("event_polity_links", { event_id: eventIds.heianCapital, polity_id: polityIds.japan });
  insert("event_polity_links", { event_id: eventIds.tendai, polity_id: polityIds.japan });
  insert("event_polity_links", { event_id: eventIds.crusade, polity_id: polityIds.france });
  insert("event_polity_links", { event_id: eventIds.onin, polity_id: polityIds.japan });
  insert("event_polity_links", { event_id: eventIds.monalisa, polity_id: polityIds.florence });

  insert("event_dynasty_links", { event_id: eventIds.heianCapital, dynasty_id: dynastyIds.imperial });
  insert("event_dynasty_links", { event_id: eventIds.monalisa, dynasty_id: dynastyIds.medici });

  insert("event_period_links", { event_id: eventIds.heianCapital, period_id: periodIds.heian });
  insert("event_period_links", { event_id: eventIds.tendai, period_id: periodIds.heian });
  insert("event_period_links", { event_id: eventIds.onin, period_id: periodIds.muromachi });
  insert("event_period_links", { event_id: eventIds.monalisa, period_id: periodIds.renaissance });

  insert("event_religion_links", { event_id: eventIds.tendai, religion_id: religionIds.buddhism });
  insert("event_religion_links", { event_id: eventIds.crusade, religion_id: religionIds.christianity });
  insert("event_sect_links", { event_id: eventIds.tendai, sect_id: sectIds.tendai });
  insert("event_sect_links", { event_id: eventIds.crusade, sect_id: sectIds.catholic });

  insert("event_region_links", { event_id: eventIds.heianCapital, region_id: regionIds.kyoto });
  insert("event_region_links", { event_id: eventIds.tendai, region_id: regionIds.kyoto });
  insert("event_region_links", { event_id: eventIds.crusade, region_id: regionIds.europe });
  insert("event_region_links", { event_id: eventIds.crusade, region_id: regionIds.jerusalem });
  insert("event_region_links", { event_id: eventIds.onin, region_id: regionIds.kyoto });
  insert("event_region_links", { event_id: eventIds.monalisa, region_id: regionIds.florence });

  insert("event_relations", { from_event_id: eventIds.heianCapital, to_event_id: eventIds.tendai, relation_type: "before" });
  insert("event_relations", { from_event_id: eventIds.crusade, to_event_id: eventIds.onin, relation_type: "before" });
  insert("event_relations", { from_event_id: eventIds.onin, to_event_id: eventIds.monalisa, relation_type: "before" });
  insert("event_relations", { from_event_id: eventIds.heianCapital, to_event_id: eventIds.tendai, relation_type: "cause" });

  insert("conflict_participants", {
    event_id: eventIds.crusade,
    participant_type: "religion",
    participant_id: religionIds.christianity,
    role: "attacker",
    note: "西欧キリスト教勢力。"
  });
  insert("conflict_participants", {
    event_id: eventIds.crusade,
    participant_type: "person",
    participant_id: personIds.urban,
    role: "leader",
    note: "呼びかけを行った教皇。"
  });
  insert("conflict_participants", {
    event_id: eventIds.crusade,
    participant_type: "polity",
    participant_id: polityIds.france,
    role: "ally",
    note: "主要な参加勢力の一つ。"
  });
  insert("conflict_outcomes", {
    event_id: eventIds.crusade,
    settlement_summary: "1099年にエルサレムが攻略され、十字軍国家が成立した。",
    note: "その後の十字軍運動の端緒となった。"
  });

  insert("conflict_participants", {
    event_id: eventIds.onin,
    participant_type: "polity",
    participant_id: polityIds.japan,
    role: "defender",
    note: "内乱の舞台となった。"
  });
  insert("conflict_participants", {
    event_id: eventIds.onin,
    participant_type: "person",
    participant_id: personIds.yoshimasa,
    role: "leader",
    note: "将軍として乱の時代背景に関与。"
  });
  insert("conflict_outcomes", {
    event_id: eventIds.onin,
    settlement_summary: "京都は荒廃し、室町幕府の権威は大きく低下した。",
    note: "戦国時代への移行を促した。"
  });

  console.log(`Seeded historia database: ${resolvedDatabasePath}`);
}

try {
  runSeed();
} finally {
  sqlite.close();
}
