-- 出来事種別マスタ: events.event_type が参照する種別一覧
CREATE TABLE `event_types` (
  `code` text PRIMARY KEY NOT NULL, -- 種別コード
  `label` text NOT NULL, -- 表示名
  `description` text -- 種別の説明
);

-- 紀元マスタ: from_calendar_era / to_calendar_era が参照する紀元区分
CREATE TABLE `era` (
  `code` text PRIMARY KEY NOT NULL, -- 紀元コード: BCE / CE
  `label` text NOT NULL, -- 表示名
  `description` text -- 紀元区分の説明
);

-- 出来事関連種別マスタ: event_relations.relation_type が参照する関連種別
CREATE TABLE `event_relation_types` (
  `code` text PRIMARY KEY NOT NULL, -- 関連種別コード: before / after / cause / related
  `label` text NOT NULL, -- 表示名
  `description` text -- 関連種別の説明
);

-- 紛争参加主体種別マスタ: participant_type が参照する主体種別
CREATE TABLE `event_conflict_participant_types` (
  `code` text PRIMARY KEY NOT NULL, -- 参加主体種別コード: person / polity / religion / sect
  `label` text NOT NULL, -- 表示名
  `description` text -- 参加主体種別の説明
);

-- 紛争参加役割マスタ: event_conflict_participants.role が参照する役割
CREATE TABLE `event_conflict_participant_roles` (
  `code` text PRIMARY KEY NOT NULL, -- 役割コード: attacker / defender / leader / ally / other
  `label` text NOT NULL, -- 表示名
  `description` text -- 役割の説明
);

-- 紛争結果陣営マスタ: event_conflict_outcome_participants.side が参照する陣営
CREATE TABLE `event_conflict_sides` (
  `code` text PRIMARY KEY NOT NULL, -- 陣営コード: winner / loser
  `label` text NOT NULL, -- 表示名
  `description` text -- 陣営の説明
);
