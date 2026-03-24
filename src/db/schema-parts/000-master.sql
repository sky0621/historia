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
