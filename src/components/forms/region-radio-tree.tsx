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
  selectedId?: number | null;
  itemClassName: string;
  containerClassName?: string;
};

export function RegionRadioTree({
  name,
  options,
  selectedId,
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
      {renderNodes(renderedRootOptions, childrenByParentId, name, selectedId ?? null, itemClassName)}
    </div>
  );
}

function renderNodes(
  nodes: RegionOption[],
  childrenByParentId: Map<number | null, RegionOption[]>,
  name: string,
  selectedId: number | null,
  itemClassName: string
): ReactNode {
  return nodes.map((node) => {
    const children = childrenByParentId.get(node.id) ?? [];
    const defaultOpen = hasSelectedDescendant(node.id, childrenByParentId, selectedId, false);

    if (children.length === 0) {
      return (
        <div key={node.id}>
          <label className={itemClassName}>
            <input type="radio" name={name} value={node.id} defaultChecked={selectedId === node.id} />
            {node.name}
          </label>
        </div>
      );
    }

    return (
      <RegionTreeRadioBranch
        key={node.id}
        node={node}
        childNodes={children}
        childrenByParentId={childrenByParentId}
        name={name}
        selectedId={selectedId}
        itemClassName={itemClassName}
        defaultOpen={defaultOpen}
      />
    );
  });
}

function RegionTreeRadioBranch({
  node,
  childNodes,
  childrenByParentId,
  name,
  selectedId,
  itemClassName,
  defaultOpen
}: {
  node: RegionOption;
  childNodes: RegionOption[];
  childrenByParentId: Map<number | null, RegionOption[]>;
  name: string;
  selectedId: number | null;
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
              type="radio"
              name={name}
              value={node.id}
              defaultChecked={selectedId === node.id}
              className="pointer-events-auto"
              onClick={(event) => event.stopPropagation()}
            />
            {node.name}
          </span>
        </label>
      </summary>
      <div className="ml-6 border-l border-[var(--border)] pl-4">
        <div className="space-y-3">
          {renderNodes(childNodes, childrenByParentId, name, selectedId, itemClassName)}
        </div>
      </div>
    </details>
  );
}

function hasSelectedDescendant(
  nodeId: number,
  childrenByParentId: Map<number | null, RegionOption[]>,
  selectedId: number | null,
  includeSelf = true
): boolean {
  if (includeSelf && selectedId === nodeId) {
    return true;
  }

  const children = childrenByParentId.get(nodeId) ?? [];
  return children.some((child) => child.id === selectedId || hasSelectedDescendant(child.id, childrenByParentId, selectedId));
}
