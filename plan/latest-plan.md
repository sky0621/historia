# 歴史年表システム 初版要件案 改訂版 6

## Summary
`historia` は、ローカル利用前提の TypeScript 製 Web アプリとして実装する。初版では、歴史イベントを中核に、人物、国家、王朝、時代区分、宗教、宗派、地域を独立主体として管理し、それらを横断的に関連付けて探索できるようにする。さらに、戦争や乱は「期間を持つイベント種別」として管理し、開始・終了年、参加勢力、結果を記録できるようにする。

必須機能は、イベント、人物、国家、王朝、時代区分、宗教、宗派、地域の一覧・詳細・作成編集と、イベント関係の全体可視化。認証は持たず、SQLite を永続化先とする。

## Key Changes
### コアモデル
- `Event` を中核にし、タイトル、説明、時間情報、タグ、関連人物、関連国家、関連王朝、関連時代区分、関連宗教・宗派、関連地域、イベント間関係を保持する。
- 時間表現は全モデルで共通の `TimeExpression` を使い、`BCE/CE`、年不詳、推定、範囲年を表現できるようにする。
- 終了していない主体や継続中の出来事は `endTimeExpression` を空にして表現する。
- 出典管理は初版では持たない。

### 人物・国家・王朝・時代区分・宗教・地域
- `Person` を独立主モデルとして持ち、氏名、生年、没年、別名、メモ、役職履歴、関連地域を管理できるようにする。
- `RoleAssignment` は人物ごとに持ち、役職名、就任年、離任年、在任中フラグ、補足メモ、所属国家、所属王朝を記録できるようにする。
- `Polity` を国家モデル、`Dynasty` を王朝モデル、`HistoricalPeriod` を時代区分モデル、`PeriodCategory` を時代区分カテゴリモデルとして持つ。
- `Religion` と `Sect` を独立主モデルとして持ち、開始終了年、説明、開祖、関連地域を管理できるようにする。宗派は必ず 1 つの宗教に属する。
- `Region` を独立主モデルとして持ち、親地域による階層構造を持てるようにする。
- イベント、人物、国家、王朝、時代区分、宗教、宗派はいずれも地域と多対多で関連付けできるようにする。

### 戦争・乱
- 戦争や乱は `Event` の種別拡張として扱い、通常イベントと同じ一覧・検索・関連付け基盤を共有する。
- `Event` に `eventType` を追加し、少なくとも `general`、`war`、`rebellion`、`civil_war` を列挙型で持てるようにする。
- 戦争・乱イベントは、共通の `timeExpression` に加えて `startTimeExpression` と `endTimeExpression` を必須級の主要項目として扱い、単発イベントよりも期間管理を優先する UI にする。
- 戦争・乱は、時代区分、人物、地域、宗教、国家と関連付けできるようにする。既存のイベント関連リンクで横断参照可能にする。
- 戦争・乱専用の `ConflictParticipant` モデルを持ち、参加主体を役割付きで複数登録できるようにする。
- `ConflictParticipant` は少なくとも国家、人物、宗教、宗派を参照対象にでき、役割として `attacker`、`defender`、`leader`、`ally`、`other` を持てるようにする。
- 戦争・乱の結果は構造化モデルで持ち、少なくとも `ConflictOutcome` として勝者側参加者、敗者側参加者、講和・停戦要約、補足メモを保持できるようにする。
- 条約や講和は必要に応じて別の通常イベントとしても登録できるようにし、戦争イベントから関連イベントとしてリンクできる設計にする。

### 関係モデルと画面
- `EventRelation` はイベント間の有向関係として持ち、少なくとも `before/after` と `cause/related` を扱う。
- 人物間、国家間、王朝間、時代区分間、宗教間、地域間の専用関係モデルは初版では持たない。
- 一覧・詳細・編集画面は、イベント、人物、国家、王朝、時代区分、宗教、宗派、地域ごとに用意する。
- イベント一覧・詳細・編集画面は `eventType` に応じて入力項目を切り替え、戦争・乱では期間、参加勢力、結果の入力欄を表示する。
- 地域一覧・詳細・編集画面では、階層、関連イベント、関連人物、関連国家、関連王朝、関連時代区分、関連宗教・宗派を確認できるようにする。
- 関係可視化は全体グラフビューとして実装し、初版ではイベント間関係の探索を主対象にする。

## Public Interfaces / Types
- `Event`
  - `id`
  - `title`
  - `eventType`
  - `description`
  - `timeExpression`
  - `startTimeExpression?`
  - `endTimeExpression?`
  - `sortKey`
  - `tags[]`
  - `personLinks[]`
  - `polityLinks[]`
  - `dynastyLinks[]`
  - `periodLinks[]`
  - `religionLinks[]`
  - `sectLinks[]`
  - `regionLinks[]`
  - `outgoingRelations[]`
  - `incomingRelations[]`
  - `conflictParticipants[]?`
  - `conflictOutcome?`
- `ConflictParticipant`
  - `id`
  - `eventId`
  - `participantType` (`polity` / `person` / `religion` / `sect`)
  - `participantId`
  - `role` (`attacker` / `defender` / `leader` / `ally` / `other`)
  - `note`
- `ConflictOutcome`
  - `id`
  - `eventId`
  - `winnerParticipants[]`
  - `loserParticipants[]`
  - `settlementSummary`
  - `note`
- `Person`
  - `id`
  - `name`
  - `birthTimeExpression?`
  - `deathTimeExpression?`
  - `aliases[]`
  - `note`
  - `roles[]`
  - `periodLinks[]`
  - `religionLinks[]`
  - `sectLinks[]`
  - `regionLinks[]`
- `RoleAssignment`
  - `id`
  - `personId`
  - `title`
  - `polityId?`
  - `dynastyId?`
  - `startTimeExpression?`
  - `endTimeExpression?`
  - `isIncumbent`
  - `note`
- `Polity`
  - `id`
  - `name`
  - `startTimeExpression?`
  - `endTimeExpression?`
  - `aliases[]`
  - `note`
  - `periodLinks[]`
  - `religionLinks[]`
  - `sectLinks[]`
  - `regionLinks[]`
- `Dynasty`
  - `id`
  - `name`
  - `polityId`
  - `startTimeExpression?`
  - `endTimeExpression?`
  - `aliases[]`
  - `note`
  - `periodLinks[]`
  - `regionLinks[]`
- `HistoricalPeriod`
  - `id`
  - `name`
  - `categoryId`
  - `regionLabel?`
  - `polityId?`
  - `startTimeExpression?`
  - `endTimeExpression?`
  - `aliases[]`
  - `description`
  - `note`
  - `regionLinks[]`
- `PeriodCategory`
  - `id`
  - `name`
  - `description`
- `Religion`
  - `id`
  - `name`
  - `startTimeExpression?`
  - `endTimeExpression?`
  - `aliases[]`
  - `description`
  - `note`
  - `founderPersonLinks[]`
  - `regionLinks[]`
- `Sect`
  - `id`
  - `name`
  - `religionId`
  - `startTimeExpression?`
  - `endTimeExpression?`
  - `aliases[]`
  - `description`
  - `note`
  - `founderPersonLinks[]`
  - `regionLinks[]`
- `Region`
  - `id`
  - `name`
  - `parentRegionId?`
  - `aliases[]`
  - `description`
  - `note`
- `TimeExpression`
  - `calendarEra` (`BCE` / `CE`)
  - `startYear`
  - `endYear?`
  - `isApproximate`
  - `displayLabel`
  - `precision` (`year` 中心)
- `EventRelation`
  - `id`
  - `fromEventId`
  - `toEventId`
  - `relationType`

## Test Plan
- イベント、人物、国家、王朝、時代区分、カテゴリ、宗教、宗派、地域の CRUD が独立して動作し、相互参照も保存できること。
- 人物の生没年、国家・王朝・時代区分・宗教・宗派の開始終了年、戦争・乱の開始終了年で BCE、CE、推定年、範囲年、不明年を保存・表示できること。
- 戦争・乱を `eventType` 付きイベントとして作成でき、通常イベントと同じ一覧に表示しつつ専用項目も保持できること。
- 戦争・乱に国家、人物、宗教、宗派の参加者を複数登録でき、役割別に表示できること。
- 戦争・乱の結果として勝者側、敗者側、講和要約を保存できること。
- 宗教・宗派で終了年が空の場合に存続中として扱え、一覧・詳細で破綻しないこと。
- 宗教・宗派の開祖を複数人物で登録でき、人物詳細からも逆参照できること。
- 地域を階層構造で登録でき、地域詳細で親地域・子地域を辿れること。
- イベントや人物に複数地域を紐づけて保存でき、国家・王朝・時代区分・宗教・宗派にも複数地域を紐づけられること。
- 同一地域または国家に対して、異なるカテゴリの時代区分を重複登録できること。
- イベント一覧で年代、タグ、関連人物、関連国家、関連王朝、関連時代区分、関連宗教・宗派、関連地域、`eventType` の複合検索ができること。
- イベント間の前後関係・因果関係を登録でき、詳細画面とグラフビューで確認できること。
- SQLite のローカル DB だけで起動・保存・再起動後の再表示ができること。

## Assumptions
- フレームワーク既定は `Next.js App Router`。
- ORM は `Prisma` または `Drizzle` のどちらか一方を採用し、実装時に統一する。
- 初版の時間粒度は年単位を中心にし、月日 UI は必須にしない。
- 役職履歴は国家または王朝のどちらか一方、必要に応じて両方を参照可能にする。
- 時代区分の対象範囲は `regionLabel` と `polityId` の両対応にし、広域史観と国家史観の両方を扱えるようにする。
- 地域は地理的・文化的なまとまりを同一モデルで扱い、厳密な GIS や座標管理は初版対象外。
- 宗教の内部系譜、宗派の分派ツリー、国家・王朝の継承関係、時代区分同士の包含関係、地域間の専用関係モデルは初版対象外。
- 戦争・乱の参加者は初版では国家、人物、宗教、宗派に限定し、王朝や地域を専用参加者型には含めない。必要な場合は通常の関連リンクで表現する。
- データ投入は Web UI の直接編集のみを対象とし、import/export は後続フェーズに回す。
