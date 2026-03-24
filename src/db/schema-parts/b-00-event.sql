-- 出来事種別マスタ: events.event_type が参照する種別一覧
CREATE TABLE `event_types` (
  `code` text PRIMARY KEY NOT NULL, -- 種別コード: general / war / rebellion / civil_war
  `label` text NOT NULL, -- 表示名
  `description` text -- 種別の説明
);

-- 出来事: 歴史上の事件・出来事の基本情報
CREATE TABLE `events` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, -- 出来事ID
  `title` text NOT NULL, -- 出来事名
  `event_type` text NOT NULL REFERENCES `event_types`(`code`), -- 出来事種別コード
  `description` text, -- 出来事の説明
  `note` text, -- 編集メモ・注釈
  `from_calendar_era` text, -- 開始年の紀元区分: BCE / CE
  `from_year` integer, -- 開始年
  `from_is_approximate` integer DEFAULT false, -- 開始年がおおよそか
  `to_calendar_era` text, -- 終了年の紀元区分: BCE / CE
  `to_year` integer, -- 終了年
  `to_is_approximate` integer DEFAULT false, -- 終了年がおおよそか
  `created_at` integer NOT NULL, -- 作成日時のUnixタイムスタンプ
  `updated_at` integer NOT NULL -- 更新日時のUnixタイムスタンプ
);

-- 出来事間の関連: 出来事どうしの因果・前後関係
CREATE TABLE `event_relations` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, -- 関連ID
  `from_event_id` integer NOT NULL, -- 起点となる出来事ID
  `to_event_id` integer NOT NULL, -- 終点となる出来事ID
  `relation_type` text NOT NULL -- 関連種別: before / after / cause / related
);

-- 戦争や反乱の参加主体: 紛争イベントに参加した主体
CREATE TABLE `event_conflict_participants` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, -- 参加記録ID
  `event_id` integer NOT NULL, -- 対象イベントID
  `participant_type` text NOT NULL, -- 参加主体の種別: person / polity / religion / sect
  `participant_id` integer NOT NULL, -- 参加主体のID
  `role` text NOT NULL, -- 参加時の役割: attacker / defender / leader / ally / other
  `description` text, -- 参加内容の説明
  `note` text -- 編集メモ・注釈
);

-- 戦争や反乱の結果要約: 紛争イベントの勝敗と帰結の要約
CREATE TABLE `event_conflict_outcomes` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, -- 結果要約ID
  `event_id` integer NOT NULL, -- 対象イベントID
  `resolution_summary` text, -- 全体としてどう終わったか
  `winner_summary` text, -- 勝者側が何を得たか
  `loser_summary` text -- 敗者側が何を失ったか
);

-- 戦争や反乱の勝者側・敗者側の参加主体: 結果における陣営別参加主体
CREATE TABLE `event_conflict_outcome_participants` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, -- 結果参加主体ID
  `event_id` integer NOT NULL, -- 対象イベントID
  `side` text NOT NULL, -- 陣営: winner / loser
  `participant_type` text NOT NULL, -- 参加主体の種別: person / polity / religion / sect
  `participant_id` integer NOT NULL -- 参加主体のID
);
