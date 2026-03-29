"use client";

import { useState, type ReactNode } from "react";

type RegionOption = {
  id: number;
  name: string;
  parentRegionId?: number | null;
};

type Props = {
  name: string;
  options: RegionOption[];
  selectedIds: number[];
  itemClassName: string;
  containerClassName?: string;
};

export function RegionCheckboxTree({
  name,
  options,
  selectedIds,
  itemClassName,
  containerClassName = "space-y-3"
}: Props) {
  const childrenByParentId = new Map<number | null, RegionOption[]>();

  for (const option of options) {
    const key = option.parentRegionId ?? null;
    const current = childrenByParentId.get(key) ?? [];
    current.push(option);
    childrenByParentId.set(key, current);
  }

  const rootOptions = childrenByParentId.get(null) ?? [];
  const nestedOptions = options.filter((option) => option.parentRegionId != null && !options.some((candidate) => candidate.id === option.parentRegionId));
  const renderedRootOptions = rootOptions.length > 0 ? rootOptions : nestedOptions;
  const selectedIdSet = new Set(selectedIds);

  return (
    <div className={containerClassName}>
      {renderNodes(renderedRootOptions, childrenByParentId, name, selectedIdSet, itemClassName)}
    </div>
  );
}

function renderNodes(
  nodes: RegionOption[],
  childrenByParentId: Map<number | null, RegionOption[]>,
  name: string,
  selectedIds: Set<number>,
  itemClassName: string
): ReactNode {
  return nodes.map((node) => {
    const children = childrenByParentId.get(node.id) ?? [];
    const defaultOpen = hasSelectedDescendant(node.id, childrenByParentId, selectedIds, false);

    if (children.length === 0) {
      return (
        <div key={node.id}>
          <label className={itemClassName}>
            <input type="checkbox" name={name} value={node.id} defaultChecked={selectedIds.has(node.id)} />
            {node.name}
          </label>
        </div>
      );
    }

    return (
      <RegionTreeBranch
        key={node.id}
        node={node}
        childNodes={children}
        childrenByParentId={childrenByParentId}
        name={name}
        selectedIds={selectedIds}
        itemClassName={itemClassName}
        defaultOpen={defaultOpen}
      />
    );
  });
}

function RegionTreeBranch({
  node,
  childNodes,
  childrenByParentId,
  name,
  selectedIds,
  itemClassName,
  defaultOpen
}: {
  node: RegionOption;
  childNodes: RegionOption[];
  childrenByParentId: Map<number | null, RegionOption[]>;
  name: string;
  selectedIds: Set<number>;
  itemClassName: string;
  defaultOpen: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <details open={defaultOpen} onToggle={(event) => setIsOpen(event.currentTarget.open)} className="group space-y-3">
      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <label className={`${itemClassName} pointer-events-none`}>
          <span className="inline-flex items-center gap-3">
            <span className="text-[var(--muted)]">{isOpen ? "▼" : "▶"}</span>
            <input
              type="checkbox"
              name={name}
              value={node.id}
              defaultChecked={selectedIds.has(node.id)}
              className="pointer-events-auto"
              onClick={(event) => event.stopPropagation()}
            />
            {node.name}
          </span>
        </label>
      </summary>
      <div className="ml-6 border-l border-[var(--border)] pl-4">
        <div className="space-y-3">
          {renderNodes(childNodes, childrenByParentId, name, selectedIds, itemClassName)}
        </div>
      </div>
    </details>
  );
}

function hasSelectedDescendant(
  nodeId: number,
  childrenByParentId: Map<number | null, RegionOption[]>,
  selectedIds: Set<number>,
  includeSelf = true
): boolean {
  if (includeSelf && selectedIds.has(nodeId)) {
    return true;
  }

  const children = childrenByParentId.get(nodeId) ?? [];
  return children.some((child) => selectedIds.has(child.id) || hasSelectedDescendant(child.id, childrenByParentId, selectedIds));
}
