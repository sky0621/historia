import type { TagInput } from "@/features/tags/schema";
import { listEvents } from "@/server/repositories/events";
import { getRelatedEvents } from "@/server/services/event-references";
import {
  createTag,
  deleteTag,
  getEventTagLinks,
  getTagById,
  listTags,
  updateTag
} from "@/server/repositories/tags";

type TagListFilters = {
  query?: string;
  hasEvents?: boolean;
};

export function getTagList(filters: TagListFilters = {}) {
  const normalizedQuery = normalizeQuery(filters.query);
  const tags = listTags();
  const eventLinks = getEventTagLinks(listEvents().map((event) => event.id));

  return tags
    .map((tag) => ({
      ...tag,
      eventCount: eventLinks.filter((link) => link.tagId === tag.id).length
    }))
    .filter((tag) => {
      if (filters.hasEvents && tag.eventCount === 0) {
        return false;
      }

      return true;
    })
    .filter((tag) => matchesQuery(tag.name, normalizedQuery));
}

export function getTagView(id: number) {
  const tag = getTagById(id);
  if (!tag) {
    return null;
  }

  return {
    tag,
    relatedEvents: getRelatedEvents({ tagId: id })
  };
}

export function createTagFromInput(input: TagInput) {
  return createTag(input.name);
}

export function updateTagFromInput(id: number, input: TagInput) {
  updateTag(id, input.name);
}

export function deleteTagById(id: number) {
  deleteTag(id);
}

function normalizeQuery(value?: string) {
  return value?.trim().toLocaleLowerCase("ja-JP") ?? "";
}

function matchesQuery(value: string, query: string) {
  if (query.length === 0) {
    return true;
  }

  return value.toLocaleLowerCase("ja-JP").includes(query);
}
