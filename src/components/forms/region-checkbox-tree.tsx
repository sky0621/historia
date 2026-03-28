"use client";

import type { ReactNode } from "react";

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

  return (
    <div className={containerClassName}>
      {renderNodes(renderedRootOptions, 0, childrenByParentId, name, new Set(selectedIds), itemClassName)}
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

    return (
      <div key={node.id} className="space-y-3">
        <label className={itemClassName} style={{ marginLeft: `${depth * 1.25}rem` }}>
          <input type="checkbox" name={name} value={node.id} defaultChecked={selectedIds.has(node.id)} />
          {node.name}
        </label>
        {children.length > 0 ? renderNodes(children, depth + 1, childrenByParentId, name, selectedIds, itemClassName) : null}
      </div>
    );
  });
}
