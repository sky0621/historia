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
      {renderNodes(renderedRootOptions, 0, childrenByParentId, name, selectedIdSet, itemClassName)}
    </div>
  );
}

function renderNodes(
  nodes: RegionOption[],
  depth: number,
  childrenByParentId: Map<number | null, RegionOption[]>,
  name: string,
  selectedIds: Set<number>,
  itemClassName: string
): ReactNode {
  return nodes.map((node) => {
    const children = childrenByParentId.get(node.id) ?? [];
    const defaultOpen = hasSelectedDescendant(node.id, childrenByParentId, selectedIds);

    if (children.length === 0) {
      return (
        <div key={node.id} className="space-y-3">
          <label className={itemClassName} style={{ marginLeft: `${depth * 1.25}rem` }}>
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
        depth={depth}
        children={children}
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
  depth,
  children,
  childrenByParentId,
  name,
  selectedIds,
  itemClassName,
  defaultOpen
}: {
  node: RegionOption;
  depth: number;
  children: RegionOption[];
  childrenByParentId: Map<number | null, RegionOption[]>;
  name: string;
  selectedIds: Set<number>;
  itemClassName: string;
  defaultOpen: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <details
      open={defaultOpen}
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
      className="space-y-3"
      style={{ marginLeft: `${depth * 1.25}rem` }}
    >
      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <label className={`${itemClassName} pointer-events-none`}>
          <input
            type="checkbox"
            name={name}
            value={node.id}
            defaultChecked={selectedIds.has(node.id)}
            className="pointer-events-auto"
            onClick={(event) => event.stopPropagation()}
          />
          <span className="inline-flex items-center gap-2">
            <span className="text-[var(--muted)]">{isOpen ? "▼" : "▶"}</span>
            {node.name}
          </span>
        </label>
      </summary>
      <div className="space-y-3">
        {renderNodes(children, depth + 1, childrenByParentId, name, selectedIds, itemClassName)}
      </div>
    </details>
  );
}

function hasSelectedDescendant(
  nodeId: number,
  childrenByParentId: Map<number | null, RegionOption[]>,
  selectedIds: Set<number>
): boolean {
  if (selectedIds.has(nodeId)) {
    return true;
  }

  const children = childrenByParentId.get(nodeId) ?? [];
  return children.some((child) => hasSelectedDescendant(child.id, childrenByParentId, selectedIds));
}
