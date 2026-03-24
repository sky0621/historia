-- 出典: 書誌情報のマスタ
CREATE TABLE `sources` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, -- 出典ID
  `title` text NOT NULL, -- 出典タイトル
  `author` text, -- 著者・編者
  `publisher` text, -- 出版者・発行主体
  `published_at_label` text, -- 出典の刊行日（表示用文字列）
  `url` text, -- 参照URL
  `description` text, -- 出典の説明
  `note` text -- 編集メモ・注釈
);

-- 引用: 出典を各エンティティへ紐づける参照記録
CREATE TABLE `citations` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, -- 引用ID
  `source_id` integer NOT NULL, -- 出典ID
  `target_type` text NOT NULL, -- 参照先のエンティティ種別
  `target_id` integer NOT NULL, -- 参照先のエンティティID
  `locator` text, -- ページ・巻・章などの参照位置
  `quote` text, -- 引用文
  `description` text, -- 引用の説明
  `note` text -- 編集メモ・注釈
);
