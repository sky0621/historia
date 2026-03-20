import { db } from "@/db/client";
import type { CitationInput, SourceInput } from "@/features/sources/schema";
import { getCitationsBySourceIds, getCitationsByTarget, getCitationById, createCitation, deleteCitation, deleteCitationsBySourceId, updateCitation } from "@/server/repositories/citations";
import { createSource, deleteSource, getSourceById, listSources, updateSource } from "@/server/repositories/sources";
import { getCitationTargetOptions, resolveCitationTarget } from "@/server/services/citation-targets";

export function getSourceListView(query?: string) {
  const normalizedQuery = normalizeQuery(query);

  return listSources()
    .map((source) => ({
      ...source,
      citationCount: getCitationsBySourceIds([source.id]).length
    }))
    .filter((source) =>
      matchesQuery([source.title, source.author, source.publisher, source.publishedAtLabel, source.url, source.note], normalizedQuery)
    );
}

export function getSourceView(id: number) {
  const source = getSourceById(id);
  if (!source) {
    return null;
  }

  const citations = getCitationsBySourceIds([id]).map((citation) => ({
    ...citation,
    target: resolveCitationTarget(citation.targetType as ReturnType<typeof getCitationTargetOptions>["targetTypes"][number]["value"], citation.targetId)
  }));

  return { source, citations };
}

export function getSourceFormOptions() {
  return {};
}

export function createSourceFromInput(input: SourceInput) {
  const now = new Date();
  return createSource({
    title: input.title,
    author: nullable(input.author),
    publisher: nullable(input.publisher),
    publishedAtLabel: nullable(input.publishedAtLabel),
    url: nullable(input.url),
    note: nullable(input.note),
    createdAt: now,
    updatedAt: now
  });
}

export function updateSourceFromInput(id: number, input: SourceInput) {
  updateSource(id, {
    title: input.title,
    author: nullable(input.author),
    publisher: nullable(input.publisher),
    publishedAtLabel: nullable(input.publishedAtLabel),
    url: nullable(input.url),
    note: nullable(input.note),
    updatedAt: new Date()
  });
}

export function removeSource(id: number) {
  db.transaction(() => {
    deleteCitationsBySourceId(id);
    deleteSource(id);
  });
}

export function getCitationFormView(id?: number, defaults?: { targetType?: string; targetId?: number; sourceId?: number }) {
  const citation = id ? getCitationById(id) : null;
  const options = getCitationTargetOptions();

  return {
    citation,
    options,
    sources: listSources().map((item) => ({ id: item.id, title: item.title })),
    defaults: {
      sourceId: citation?.sourceId ?? defaults?.sourceId ?? null,
      targetType: citation?.targetType ?? defaults?.targetType ?? "event",
      targetId: citation?.targetId ?? defaults?.targetId ?? null
    }
  };
}

export function createCitationFromInput(input: CitationInput) {
  const now = new Date();
  return createCitation({
    sourceId: input.sourceId,
    targetType: input.targetType,
    targetId: input.targetId,
    locator: nullable(input.locator),
    quote: nullable(input.quote),
    note: nullable(input.note),
    createdAt: now,
    updatedAt: now
  });
}

export function updateCitationFromInput(id: number, input: CitationInput) {
  updateCitation(id, {
    sourceId: input.sourceId,
    targetType: input.targetType,
    targetId: input.targetId,
    locator: nullable(input.locator),
    quote: nullable(input.quote),
    note: nullable(input.note),
    updatedAt: new Date()
  });
}

export function removeCitation(id: number) {
  deleteCitation(id);
}

export function getCitationListForTarget(targetType: CitationInput["targetType"], targetId: number) {
  const sourceById = new Map(listSources().map((source) => [source.id, source]));

  return getCitationsByTarget(targetType, targetId).map((citation) => ({
    ...citation,
    source: sourceById.get(citation.sourceId) ?? null
  }));
}

function nullable(value: string | undefined) {
  return value && value.length > 0 ? value : null;
}

function normalizeQuery(value?: string) {
  return value?.trim().toLocaleLowerCase("ja-JP") ?? "";
}

function matchesQuery(values: Array<string | null | undefined>, query: string) {
  if (query.length === 0) {
    return true;
  }

  return values.some((value) => value?.toLocaleLowerCase("ja-JP").includes(query));
}
