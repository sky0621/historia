import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteEventAction } from "@/features/events/actions";
import { getEventDetailView } from "@/server/services/events";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const view = getEventDetailView(Number(id));

  if (!view) {
    notFound();
  }

  const relatedSubjectCount =
    view.linkedTags.length +
    view.linkedPerson.length +
    view.linkedPolities.length +
    view.linkedDynasties.length +
    view.linkedPeriods.length +
    view.linkedReligions.length +
    view.linkedSects.length +
    view.linkedRegions.length;
  const relatedEventCount = view.outgoingRelations.length + view.incomingRelations.length;
  const conflictParticipantCount = view.conflictParticipants.length;

  return (
    <section className="space-y-8">
      <header className="historia-panel rounded-[14px] p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.35fr,0.65fr]">
          <div>
            <p className="historia-label">Event record</p>
            <h1 className="historia-title mt-3 text-4xl font-semibold sm:text-5xl">{view.event.title}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted-strong)] sm:text-base">
              {view.event.description || "このイベントには説明がまだありません。関連主体や出典を追加して叙述を組み立てます。"}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <HeroPill label="Type" value={view.event.eventType} />
              <HeroPill label="From" value={view.defaultFromTimeExpression ? formatDisplay(view.defaultFromTimeExpression) : "未設定"} />
              <HeroPill label="To" value={view.defaultToTimeExpression ? formatDisplay(view.defaultToTimeExpression) : "未設定"} />
            </div>

            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <AnchorLink href="#overview">概要</AnchorLink>
              <AnchorLink href="#relations">関連イベント {relatedEventCount} 件</AnchorLink>
              <AnchorLink href="#sources">出典 {view.citations.length} 件</AnchorLink>
              {(view.event.eventType !== "general" || conflictParticipantCount > 0) && (
                <AnchorLink href="#conflict-summary">参加勢力 {conflictParticipantCount} 件</AnchorLink>
              )}
            </div>
          </div>

          <div className="historia-inset rounded-[14px] p-5">
            <p className="historia-label">Archive summary</p>
            <div className="mt-4 grid gap-3">
              <SummaryCard label="関連主体" value={`${relatedSubjectCount}`} note="人物・国家・王朝・宗教・地域" />
              <SummaryCard label="関連イベント" value={`${relatedEventCount}`} note="因果・前後・派生" />
              <SummaryCard label="出典" value={`${view.citations.length}`} note="検証可能な引用情報" />
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={`/events/${view.event.id}/edit`}
                className="rounded-[14px] border border-[var(--border-strong)] bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-[var(--foreground-strong)] hover:border-[var(--accent-strong)]"
              >
                編集
              </Link>
              <form action={deleteEventAction}>
                <input type="hidden" name="id" value={view.event.id} />
                <button
                  type="submit"
                  className="rounded-[14px] border border-[color:rgba(207,107,93,0.55)] px-4 py-2 text-sm text-[var(--danger)] hover:bg-[color:rgba(207,107,93,0.08)]"
                >
                  削除
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.25fr,0.75fr]">
        <div className="space-y-6">
          <InfoSection id="overview" title="基本情報" description="イベントの叙述と関連主体をここに集約します。">
            <DetailGrid>
              <DetailItem label="説明">{view.event.description ?? "-"}</DetailItem>
              <DetailItem label="タグ">{renderLinkedItems(view.linkedTags, "tags")}</DetailItem>
              <DetailItem label="人物">{renderLinkedItems(view.linkedPerson, "person")}</DetailItem>
              <DetailItem label="国家">{renderLinkedItems(view.linkedPolities, "polities")}</DetailItem>
              <DetailItem label="王朝">{renderLinkedItems(view.linkedDynasties, "dynasties")}</DetailItem>
              <DetailItem label="時代区分">{renderLinkedItems(view.linkedPeriods, "periods")}</DetailItem>
              <DetailItem label="宗教 / 宗派">
                {view.linkedReligions.length === 0 && view.linkedSects.length === 0 ? (
                  "-"
                ) : (
                  <>
                    {renderLinkedItems(view.linkedReligions, "religions")}
                    {view.linkedReligions.length > 0 && view.linkedSects.length > 0 ? ", " : null}
                    {renderLinkedItems(view.linkedSects, "sects")}
                  </>
                )}
              </DetailItem>
              <DetailItem label="地域">{renderLinkedItems(view.linkedRegions, "regions")}</DetailItem>
            </DetailGrid>
          </InfoSection>

          <InfoSection
            id="conflict-summary"
            title="戦争・対立サマリー"
            description="交戦主体と結果を整理して、対立イベントの読み筋を明確にします。"
          >
            <div className="grid gap-4 lg:grid-cols-3">
              <InsetPanel title="参加勢力">
                {view.conflictParticipants.length === 0 ? (
                  <EmptyMessage message="参加勢力はまだありません。" />
                ) : (
                  <div className="space-y-3">
                    {view.conflictParticipants.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-[var(--border)] bg-black/10 px-4 py-3">
                        <div className="font-medium text-[var(--foreground-strong)]">
                          {renderParticipantLink(item)}
                          <span className="ml-2 text-sm text-[var(--muted)]">/ {item.role}</span>
                        </div>
                        {item.note ? <div className="mt-2 whitespace-pre-wrap text-sm text-[var(--muted-strong)]">{item.note}</div> : null}
                      </div>
                    ))}
                  </div>
                )}
              </InsetPanel>

              <InsetPanel title="勝者側">
                {view.conflictOutcome?.winnerParticipants.length ? (
                  <ParticipantStack participants={view.conflictOutcome.winnerParticipants} summary={view.conflictOutcome.winnerSummary} />
                ) : (
                  <EmptyMessage message={view.conflictOutcome?.winnerSummary ?? "未設定"} />
                )}
              </InsetPanel>

              <InsetPanel title="敗者側">
                {view.conflictOutcome?.loserParticipants.length ? (
                  <ParticipantStack participants={view.conflictOutcome.loserParticipants} summary={view.conflictOutcome.loserSummary} />
                ) : (
                  <EmptyMessage message={view.conflictOutcome?.loserSummary ?? "未設定"} />
                )}
              </InsetPanel>
            </div>

            <div className="mt-4 rounded-[14px] border border-[var(--border)] bg-black/10 p-5">
              <div className="historia-label">Resolution</div>
              <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--foreground)]">
                {view.conflictOutcome?.resolutionSummary ?? "-"}
              </div>
              {view.conflictOutcome?.note ? (
                <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--muted-strong)]">{view.conflictOutcome.note}</div>
              ) : null}
            </div>
          </InfoSection>

          <InfoSection id="relations" title="関連イベント" description="このイベントの前後関係や因果関係をたどります。">
            <div className="grid gap-4 lg:grid-cols-2">
              <RelationColumn title="このイベントから" count={view.outgoingRelations.length}>
                {view.outgoingRelations.length === 0 ? (
                  <EmptyMessage message="このイベントから参照する関連イベントはありません。" />
                ) : (
                  view.outgoingRelations.map((relation) => (
                    <RelationCard
                      key={`out-${relation.id}`}
                      relationType={relation.relationType}
                      href={`/events/${relation.toEventId}`}
                      eventName={relation.eventName}
                      relatedEventType={relation.relatedEventType}
                      relatedEventTimeLabel={relation.relatedEventTimeLabel}
                    />
                  ))
                )}
              </RelationColumn>

              <RelationColumn title="このイベントへ" count={view.incomingRelations.length}>
                {view.incomingRelations.length === 0 ? (
                  <EmptyMessage message="このイベントを参照する関連イベントはありません。" />
                ) : (
                  view.incomingRelations.map((relation) => (
                    <RelationCard
                      key={`in-${relation.id}`}
                      relationType={relation.relationType}
                      href={`/events/${relation.fromEventId}`}
                      eventName={relation.eventName}
                      relatedEventType={relation.relatedEventType}
                      relatedEventTimeLabel={relation.relatedEventTimeLabel}
                    />
                  ))
                )}
              </RelationColumn>
            </div>
          </InfoSection>
        </div>

        <div className="space-y-6">
          <InfoSection id="sources" title="出典" description="叙述の根拠となる引用情報を確認します。">
            <div className="flex justify-end">
              <Link
                href={`/citations/new?targetType=event&targetId=${view.event.id}`}
                className="rounded-[14px] border border-[var(--border-strong)] bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-[var(--foreground-strong)] hover:border-[var(--accent-strong)]"
              >
                引用を追加
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {view.citations.length === 0 ? (
                <EmptyMessage message="出典はまだありません。" />
              ) : (
                view.citations.map((citation) => (
                  <Link
                    key={citation.id}
                    href={`/sources/${citation.sourceId}`}
                    className="block rounded-[14px] border border-[var(--border)] bg-black/10 px-4 py-4 hover:border-[var(--border-strong)] hover:bg-white/4"
                  >
                    <div className="font-medium text-[var(--foreground-strong)]">
                      {citation.source?.title ?? `Source #${citation.sourceId}`}
                    </div>
                    {citation.locator ? <div className="mt-2 text-sm text-[var(--muted)]">位置: {citation.locator}</div> : null}
                    {citation.quote ? <div className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[var(--muted-strong)]">{citation.quote}</div> : null}
                  </Link>
                ))
              )}
            </div>
          </InfoSection>

          <InfoSection title="変更履歴" description="編集操作の痕跡を追跡できます。">
            <div className="space-y-3">
              {view.changeHistory.length === 0 ? (
                <EmptyMessage message="履歴はまだありません。" />
              ) : (
                view.changeHistory.map((item) => (
                  <div key={item.id} className="rounded-[14px] border border-[var(--border)] bg-black/10 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium text-[var(--foreground-strong)]">{item.action}</div>
                      <div className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{item.changedAtLabel}</div>
                    </div>
                    <div className="mt-3 text-sm leading-7 text-[var(--muted-strong)]">{item.snapshotPreview}</div>
                  </div>
                ))
              )}
            </div>
          </InfoSection>
        </div>
      </div>
    </section>
  );
}

function formatDisplay(value: { displayLabel?: string; calendarEra: string; startYear?: number }) {
  if (value.displayLabel) {
    return value.displayLabel;
  }
  if (value.startYear) {
    return `${value.calendarEra === "BCE" ? "BCE " : ""}${value.startYear}`;
  }
  return "年未詳";
}

function renderLinkedItems(
  items: Array<{ id: number; name: string }>,
  route: "person" | "polities" | "dynasties" | "periods" | "religions" | "sects" | "regions" | "tags"
) {
  if (items.length === 0) {
    return "-";
  }

  return items.map((item, index) => (
    <span key={`${route}-${item.id}`}>
      {index > 0 ? ", " : null}
      <Link href={`/${route}/${item.id}`} className="underline decoration-[var(--border-strong)] underline-offset-4 hover:text-[var(--foreground-strong)]">
        {item.name}
      </Link>
    </span>
  ));
}

function renderParticipantLink(
  participant: {
    participantType: "person" | "polity" | "religion" | "sect";
    participantId: number;
    participantName: string;
  }
) {
  const routeByType = {
    person: "person",
    polity: "polities",
    religion: "religions",
    sect: "sects"
  } as const;

  return (
    <Link
      href={`/${routeByType[participant.participantType]}/${participant.participantId}`}
      className="underline decoration-[var(--border-strong)] underline-offset-4 hover:text-[var(--foreground-strong)]"
    >
      {participant.participantName}
    </Link>
  );
}

function HeroPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-[var(--border)] bg-black/10 px-4 py-2 text-sm text-[var(--muted-strong)]">
      <span className="mr-2 text-[0.68rem] uppercase tracking-[0.18em] text-[var(--muted)]">{label}</span>
      <span className="font-semibold text-[var(--foreground-strong)]">{value}</span>
    </div>
  );
}

function SummaryCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-[14px] border border-[var(--border)] bg-black/10 px-4 py-4">
      <div className="text-[0.7rem] uppercase tracking-[0.18em] text-[var(--muted)]">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-[var(--foreground-strong)]">{value}</div>
      <div className="mt-1 text-sm text-[var(--muted-strong)]">{note}</div>
    </div>
  );
}

function AnchorLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-[14px] border border-[var(--border)] bg-black/10 px-4 py-2 text-[var(--muted-strong)] hover:border-[var(--border-strong)] hover:text-[var(--foreground-strong)]"
    >
      {children}
    </Link>
  );
}

function InfoSection({
  id,
  title,
  description,
  children
}: {
  id?: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="historia-card rounded-[14px] p-6 sm:p-8">
      <div className="border-b border-[var(--border)] pb-5">
        <p className="historia-label">Section</p>
        <h2 className="mt-2 text-2xl font-semibold text-[var(--foreground-strong)]">{title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted-strong)]">{description}</p>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function DetailGrid({ children }: { children: React.ReactNode }) {
  return <dl className="grid gap-4">{children}</dl>;
}

function DetailItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[14px] border border-[var(--border)] bg-black/10 p-4">
      <dt className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{label}</dt>
      <dd className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[var(--foreground)]">{children}</dd>
    </div>
  );
}

function InsetPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[14px] border border-[var(--border)] bg-black/10 p-4">
      <div className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{title}</div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function ParticipantStack({
  participants,
  summary
}: {
  participants: Array<{ id: number; participantType: "person" | "polity" | "religion" | "sect"; participantId: number; participantName: string }>;
  summary?: string | null;
}) {
  return (
    <div className="space-y-3">
      {participants.map((participant) => (
        <div key={participant.id} className="rounded-2xl border border-[var(--border)] bg-white/3 px-4 py-3 text-sm">
          {renderParticipantLink(participant)}
        </div>
      ))}
      {summary ? <div className="text-sm leading-7 text-[var(--muted-strong)]">{summary}</div> : null}
    </div>
  );
}

function RelationColumn({
  title,
  count,
  children
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[14px] border border-[var(--border)] bg-black/10 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-[var(--foreground-strong)]">{title}</h3>
        <span className="rounded-[14px] border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]">{count} 件</span>
      </div>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

function RelationCard({
  relationType,
  href,
  eventName,
  relatedEventType,
  relatedEventTimeLabel
}: {
  relationType: string;
  href: string;
  eventName: string;
  relatedEventType: string;
  relatedEventTimeLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white/3 px-4 py-4 text-sm">
      <div>
        <Link
          href={`/events?relationType=${encodeURIComponent(relationType)}`}
          className="text-xs uppercase tracking-[0.16em] text-[var(--muted)] underline decoration-[var(--border-strong)] underline-offset-4 hover:text-[var(--foreground-strong)]"
        >
          {relationType}
        </Link>
      </div>
      <div className="mt-2">
        <Link href={href} className="text-base font-medium underline decoration-[var(--border-strong)] underline-offset-4 hover:text-[var(--foreground-strong)]">
          {eventName}
        </Link>
      </div>
      <div className="mt-2 text-[var(--muted-strong)]">
        {relatedEventType} / {relatedEventTimeLabel}
      </div>
    </div>
  );
}

function EmptyMessage({ message }: { message: string }) {
  return <p className="text-sm leading-7 text-[var(--muted-strong)]">{message}</p>;
}
