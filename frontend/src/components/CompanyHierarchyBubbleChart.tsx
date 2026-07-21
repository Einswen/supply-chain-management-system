"use client";

import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import { Box, Chip, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import {
  easeCubicOut,
  hierarchy,
  interpolateHcl,
  interpolateZoom,
  pack,
  scaleLinear,
  select,
  type HierarchyCircularNode
} from "d3";
import { useEffect, useRef, useState } from "react";
import { type CompanyHierarchyNode, formatCompactCurrency, formatCompactNumber } from "@/lib/dashboard-data";

const chartSize = 760;
const animationDuration = 700;

type BubbleNode = HierarchyCircularNode<CompanyHierarchyNode>;
type BubbleTooltip = {
  node: CompanyHierarchyNode;
  childCount: number;
  x: number;
  y: number;
};
export function CompanyHierarchyBubbleChart({
  data,
  matchedCompanies,
  hasActiveFilters
}: {
  data: CompanyHierarchyNode;
  matchedCompanies: number;
  hasActiveFilters: boolean;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomInRef = useRef<() => void>(() => undefined);
  const zoomOutRef = useRef<() => void>(() => undefined);
  const resetRef = useRef<() => void>(() => undefined);
  const [focusName, setFocusName] = useState(data.name);
  const [zoomState, setZoomState] = useState({ canZoomIn: false, canZoomOut: false, isRoot: true });
  const [tooltip, setTooltip] = useState<BubbleTooltip | null>(null);

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    const color = scaleLinear<string>()
      .domain([0, 5])
      .range(["hsl(198, 84%, 92%)", "hsl(204, 56%, 70%)"])
      .interpolate(interpolateHcl);
    const root = pack<CompanyHierarchyNode>()
      .size([chartSize, chartSize])
      .padding(26)(
        hierarchy(data)
          // Emphasize revenue differences while preserving the relative ordering.
          // Parent bubbles aggregate their own and downstream weighted revenue.
          .sum((node) => Math.pow(Math.max(node.annualRevenue, 1), 1.8))
          .sort((left, right) => (right.value ?? 0) - (left.value ?? 0))
      );
    const svg = select(svgElement);
    svg.selectAll("*").remove();
    svg
      .attr("viewBox", `${-chartSize / 2} ${-chartSize / 2} ${chartSize} ${chartSize}`)
      .style("background", "white");

    // The synthetic supply-network root is a data container, not a user-facing hierarchy level.
    const initialFocus = root.children?.length === 1 ? root.children[0] : root;
    let focus = initialFocus;
    let view: [number, number, number] = [focus.x, focus.y, focus.r * 2];

    const getBubbleFill = (node: BubbleNode) => color(Math.max(node.depth - (node.children ? 0 : 0.35), 0));
    const getBubbleStroke = (node: BubbleNode) => (node.depth <= 1 ? "none" : "rgb(89, 170, 207)");
    const getBubbleStrokeWidth = (node: BubbleNode) => (node.depth <= 1 ? 0 : 1.6);
    const isInSelectedBranch = (node: BubbleNode, selected: BubbleNode) =>
      node === selected || node.ancestors().includes(selected);
    const getLabelPathId = (node: BubbleNode) => `company-bubble-label-${node.data.companyCode}`;
    const getLabelArc = (centerX: number, centerY: number, radius: number) => {
      // A long clockwise arc centred on the upper-left quadrant.
      // `large-arc-flag: 1` is essential here: the short arc would run on the wrong side of the circle.
      const startAngle = (105 * Math.PI) / 180;
      const endAngle = (345 * Math.PI) / 180;
      const startX = centerX + radius * Math.cos(startAngle);
      const startY = centerY + radius * Math.sin(startAngle);
      const endX = centerX + radius * Math.cos(endAngle);
      const endY = centerY + radius * Math.sin(endAngle);
      return `M ${startX} ${startY} A ${radius} ${radius} 0 1 1 ${endX} ${endY}`;
    };
    // Follow the parent bubble closely while keeping the text just beyond its outline.
    const getOuterLabelRadius = (radius: number) => radius + Math.max(8, radius * 0.03);
    const halos = svg
      .append("g")
      .attr("pointer-events", "none")
      .selectAll<SVGCircleElement, BubbleNode>("circle")
      .data(root.descendants().slice(1))
      .join("circle")
      .attr("fill", getBubbleFill)
      .attr("fill-opacity", 0);

    const circles = svg
      .append("g")
      .selectAll<SVGCircleElement, BubbleNode>("circle")
      .data(root.descendants().slice(1))
      .join("circle")
      .attr("fill", getBubbleFill)
      .attr("stroke", getBubbleStroke)
      .attr("stroke-width", getBubbleStrokeWidth)
      .on("mouseenter", (event, node) => {
        circles.interrupt().transition().duration(360).attr("opacity", (item) => (isInSelectedBranch(item, node) ? 1 : 0.32));
        leafLabels.interrupt().transition().duration(360).style("opacity", (item) => (isInSelectedBranch(item, node) ? 1 : 0.36));
        groupLabels.interrupt().transition().duration(360).style("opacity", (item) => (isInSelectedBranch(item, node) ? 1 : 0.36));
        revealDeferredLabel(node);
        halos
          .interrupt()
          .transition()
          .duration(260)
          .attr("fill-opacity", (item) => (item === node ? 0.18 : 0));
        setTooltip({
          node: node.data,
          childCount: node.children?.length ?? 0,
          x: event.clientX,
          y: event.clientY
        });
      })
      .on("mouseleave", () => {
        circles.interrupt().transition().duration(480).attr("opacity", 1);
        syncLabels(focus);
        halos.interrupt().transition().duration(360).attr("fill-opacity", 0);
        setTooltip(null);
      });
    const labelArcs = svg
      .append("g")
      .attr("pointer-events", "none")
      .selectAll<SVGPathElement, BubbleNode>("path")
      .data(root.descendants())
      .join("path")
      .attr("id", getLabelPathId)
      .attr("fill", "none")
      .attr("stroke", "none")
      .attr("d", (node) => getLabelArc(node.x, node.y, getOuterLabelRadius(node.r)));
    const leafLabels = svg
      .append("g")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .style("font", "600 10px Inter, system-ui, sans-serif")
      .selectAll<SVGTextElement, BubbleNode>("text")
      .data(root.descendants())
      .join("text")
      .style("fill", "rgb(20, 20, 20)")
      .style("paint-order", "stroke")
      .style("stroke", "rgba(255, 255, 255, 0.92)")
      .style("stroke-width", "2px")
      .style("stroke-linejoin", "round")
      .attr("dy", "0.35em")
      .style("fill-opacity", 0)
      .style("display", "none")
      .text((node) => node.data.name);
    const groupLabels = svg
      .append("g")
      .attr("pointer-events", "none")
      .style("font", "650 11px Inter, system-ui, sans-serif")
      .selectAll<SVGTextElement, BubbleNode>("text")
      .data(root.descendants())
      .join("text")
      .style("fill", "rgb(29, 32, 43)")
      .style("fill-opacity", 0)
      .style("display", "none");

    groupLabels
      .append("textPath")
      .attr("href", (node) => `#${getLabelPathId(node)}`)
      .attr("xlink:href", (node) => `#${getLabelPathId(node)}`)
      .attr("startOffset", "50%")
      .attr("text-anchor", "middle")
      .text((node) => node.data.name);

    // Only the currently visible relationship layer handles pointer events.
    // Deeper circles let the event reach their visible parent, preventing hover flicker.
    const updateInteractiveNodes = () => {
      circles.attr("pointer-events", (node) => (node.parent === focus ? "all" : "none"));
    };
    const deferDenseLevelLabels = (node: BubbleNode, target: BubbleNode) =>
      hasActiveFilters && node.data.level >= 3 && (target.children?.filter((child) => child.data.level >= 3).length ?? 0) >= 12;
    const syncLabels = (target: BubbleNode) => {
      leafLabels
        .interrupt()
        .style("display", (node) => (node.parent === target && !node.children && !deferDenseLevelLabels(node, target) ? "inline" : "none"))
        .style("fill-opacity", (node) => (node.parent === target && !node.children && !deferDenseLevelLabels(node, target) ? 1 : 0))
        .style("opacity", 1);
      groupLabels
        .interrupt()
        .style("display", (node) => (node.parent === target && node.children && !deferDenseLevelLabels(node, target) ? "inline" : "none"))
        .style("fill-opacity", (node) => (node.parent === target && node.children && !deferDenseLevelLabels(node, target) ? 1 : 0))
        .style("opacity", 1);
    };
    const revealDeferredLabel = (node: BubbleNode) => {
      if (!deferDenseLevelLabels(node, focus)) return;

      (node.children ? groupLabels : leafLabels)
        .filter((item) => item === node)
        .interrupt()
        .style("display", "inline")
        .style("fill-opacity", 1)
        .style("opacity", 1);
    };
    syncLabels(initialFocus);

    const updateControls = () => {
      setFocusName(focus.data.name);
      setZoomState({
        canZoomIn: Boolean(focus.children?.length),
        canZoomOut: Boolean(focus.parent && focus.parent !== root),
        isRoot: focus === initialFocus
      });
    };

    const zoomTo = (target: [number, number, number]) => {
      const scale = chartSize / target[2];
      view = target;

      leafLabels.attr("transform", (node) => `translate(${(node.x - target[0]) * scale},${(node.y - target[1]) * scale})`);
      circles.attr("transform", (node) => `translate(${(node.x - target[0]) * scale},${(node.y - target[1]) * scale})`);
      circles.attr("r", (node) => node.r * scale);
      halos.attr("transform", (node) => `translate(${(node.x - target[0]) * scale},${(node.y - target[1]) * scale})`);
      halos.attr("r", (node) => node.r * scale * 1.14);
      labelArcs.attr("d", (node) =>
        getLabelArc((node.x - target[0]) * scale, (node.y - target[1]) * scale, getOuterLabelRadius(node.r * scale))
      );
    };

    const zoom = (event: MouseEvent | null, target: BubbleNode) => {
      if (focus === target) return;

      focus = target;
      updateControls();
      updateInteractiveNodes();
      syncLabels(focus);
      setTooltip(null);

      const transition = svg
        .transition()
        .duration(event?.altKey ? animationDuration * 4 : animationDuration)
        .ease(easeCubicOut)
        .tween("zoom", () => {
          const interpolate = interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
          return (time) => zoomTo(interpolate(time) as [number, number, number]);
        });
    };

    circles.on("click", (event, node) => {
      const target = getDirectChildForFocus(node, focus);

      if (target?.children && focus !== target) {
        zoom(event, target);
      }

      event.stopPropagation();
    });
    svg.on("click", (event) => zoom(event, initialFocus));

    zoomInRef.current = () => {
      const target = focus.children?.[0];
      if (target) zoom(null, target);
    };
    zoomOutRef.current = () => {
      if (focus.parent && focus.parent !== root) zoom(null, focus.parent);
    };
    resetRef.current = () => zoom(null, initialFocus);

    zoomTo(view);
    updateInteractiveNodes();
    updateControls();

    return () => {
      svg.interrupt();
      svg.selectAll("*").remove();
    };
  }, [data, hasActiveFilters]);

  return (
    <Box sx={{ minWidth: 0 }}>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 1.25 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", minWidth: 0 }}>
          <Chip color="primary" variant="outlined" label={`${matchedCompanies.toLocaleString("en-US")} companies`} size="small" />
          <Typography color="text.secondary" noWrap sx={{ fontSize: 13 }}>
            {focusName}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Zoom out">
            <span>
              <IconButton aria-label="Zoom out" size="small" disabled={!zoomState.canZoomOut} onClick={() => zoomOutRef.current()}>
                <ZoomOutIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Zoom in">
            <span>
              <IconButton aria-label="Zoom in" size="small" disabled={!zoomState.canZoomIn} onClick={() => zoomInRef.current()}>
                <ZoomInIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Reset hierarchy view">
            <span>
              <IconButton aria-label="Reset hierarchy view" size="small" disabled={zoomState.isRoot} onClick={() => resetRef.current()}>
                <RestartAltIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>

      <Box
        sx={{
          border: "1px solid var(--border)",
          borderRadius: 1,
          bgcolor: "rgb(255, 255, 255)",
          overflow: "hidden"
        }}
      >
        <svg
          ref={svgRef}
          aria-label="Company relationship bubble chart"
          role="img"
          preserveAspectRatio="xMidYMid meet"
          style={{ display: "block", width: "100%", height: "auto", aspectRatio: "1 / 1", cursor: "pointer" }}
        />
      </Box>

      {tooltip ? (
        <Box
          sx={{
            position: "fixed",
            top: tooltip.y + 14,
            left: tooltip.x + 14,
            zIndex: (theme) => theme.zIndex.tooltip,
            p: 1.25,
            maxWidth: 250,
            pointerEvents: "none",
            border: "1px solid var(--border)",
            borderRadius: 1,
            bgcolor: "rgba(255, 255, 255, 0.94)",
            backdropFilter: "blur(8px)",
            boxShadow: "0 10px 26px rgba(29, 32, 43, 0.16)"
          }}
        >
          <BubbleTooltipContent tooltip={tooltip} />
        </Box>
      ) : null}
    </Box>
  );
}

function BubbleTooltipContent({ tooltip }: { tooltip: BubbleTooltip }) {
  const { node, childCount } = tooltip;

  return (
    <Stack spacing={0.35}>
      <Typography sx={{ fontSize: 13, fontWeight: 750 }}>{node.name}</Typography>
      <Typography color="text.secondary" sx={{ fontSize: 12 }}>
        Level {node.level} · {node.city ?? "Unknown city"}, {node.country ?? "Unknown country"}
      </Typography>
      <Typography color="text.secondary" sx={{ fontSize: 12 }}>
        Founded {node.foundedYear ?? "Unknown"} · {formatCompactNumber(node.employees)} employees
      </Typography>
      <Typography color="text.secondary" sx={{ fontSize: 12 }}>
        {formatCompactCurrency(node.annualRevenue)} annual revenue
      </Typography>
      {childCount ? <Typography color="text.secondary" sx={{ fontSize: 12 }}>{childCount} direct suppliers</Typography> : null}
    </Stack>
  );
}

function getDirectChildForFocus(node: BubbleNode, focus: BubbleNode) {
  let current: BubbleNode | null = node;

  while (current?.parent && current.parent !== focus) {
    current = current.parent;
  }

  return current?.parent === focus ? current : null;
}
