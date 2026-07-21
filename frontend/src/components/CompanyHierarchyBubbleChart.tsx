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
const minimumLabelRadius = 36;

type BubbleNode = HierarchyCircularNode<CompanyHierarchyNode>;
type BubbleTooltip = {
  node: CompanyHierarchyNode;
  childCount: number;
  x: number;
  y: number;
};

export function CompanyHierarchyBubbleChart({ data, matchedCompanies }: { data: CompanyHierarchyNode; matchedCompanies: number }) {
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
      .domain([0, 4])
      .range(["hsl(220, 48%, 94%)", "hsl(220, 50%, 36%)"])
      .interpolate(interpolateHcl);
    const root = pack<CompanyHierarchyNode>()
      .size([chartSize, chartSize])
      .padding(3)(
        hierarchy(data)
          // Each company contributes equally so packing reflects relationship branches, not company metadata.
          .sum((node) => (node.children.length ? 0 : 1))
      );
    const canShowLabel = (node: BubbleNode, target: BubbleNode) =>
      node.parent === target && node.r * (chartSize / (target.r * 2)) >= minimumLabelRadius;
    const svg = select(svgElement);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `${-chartSize / 2} ${-chartSize / 2} ${chartSize} ${chartSize}`);

    const circles = svg
      .append("g")
      .selectAll<SVGCircleElement, BubbleNode>("circle")
      .data(root.descendants().slice(1))
      .join("circle")
      .attr("fill", (node) => (node.children ? color(Math.min(node.depth, 4)) : "#FFFFFF"))
      .attr("stroke", (node) => (node.children ? "rgba(47, 82, 166, 0.45)" : "rgba(47, 82, 166, 0.38)"))
      .attr("stroke-width", 1)
      .attr("pointer-events", "all")
      .on("mouseenter", (event, node) => {
        select(event.currentTarget as SVGCircleElement).attr("stroke", "#172033").attr("stroke-width", 1.8);
        setTooltip({
          node: node.data,
          childCount: node.children?.length ?? 0,
          x: event.clientX,
          y: event.clientY
        });
      })
      .on("mouseleave", (event, node) => {
        select(event.currentTarget as SVGCircleElement)
          .attr("stroke", node.children ? "rgba(47, 82, 166, 0.45)" : "rgba(47, 82, 166, 0.38)")
          .attr("stroke-width", 1);
        setTooltip(null);
      });
    const labels = svg
      .append("g")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .style("font", "600 11px Inter, system-ui, sans-serif")
      .selectAll<SVGTextElement, BubbleNode>("text")
      .data(root.descendants())
      .join("text")
      .style("fill", "#172033")
      .style("fill-opacity", 0)
      .style("display", "none")
      .text((node) => truncate(node.data.name, 15));

    // The synthetic supply-network root is a data container, not a user-facing hierarchy level.
    const initialFocus = root.children?.length === 1 ? root.children[0] : root;
    let focus = initialFocus;
    let view: [number, number, number] = [focus.x, focus.y, focus.r * 2];

    labels
      .filter((node) => canShowLabel(node, initialFocus))
      .style("fill-opacity", 1)
      .style("display", "inline");

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

      labels.attr("transform", (node) => `translate(${(node.x - target[0]) * scale},${(node.y - target[1]) * scale})`);
      circles.attr("transform", (node) => `translate(${(node.x - target[0]) * scale},${(node.y - target[1]) * scale})`);
      circles.attr("r", (node) => node.r * scale);
    };

    const zoom = (event: MouseEvent | null, target: BubbleNode) => {
      if (focus === target) return;

      focus = target;
      updateControls();
      setTooltip(null);

      const transition = svg
        .transition()
        .duration(event?.altKey ? animationDuration * 4 : animationDuration)
        .ease(easeCubicOut)
        .tween("zoom", () => {
          const interpolate = interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
          return (time) => zoomTo(interpolate(time) as [number, number, number]);
        });
      labels
        .filter(function (node) {
          return canShowLabel(node, focus) || this.style.display === "inline";
        })
        .transition()
        .duration(event?.altKey ? animationDuration * 4 : animationDuration)
        .ease(easeCubicOut)
        .style("fill-opacity", (node) => (canShowLabel(node, focus) ? 1 : 0))
        .on("start", function (node) {
          if (canShowLabel(node, focus)) this.style.display = "inline";
        })
        .on("end", function (node) {
          if (!canShowLabel(node, focus)) this.style.display = "none";
        });

    };

    circles.on("click", (event, node) => {
      const target = getDirectChildForFocus(node, focus);

      if (target?.children && focus !== target) {
        zoom(event, target);
        event.stopPropagation();
      }
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
    updateControls();

    return () => {
      svg.interrupt();
      svg.selectAll("*").remove();
    };
  }, [data]);

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

      <Box sx={{ border: "1px solid var(--border)", borderRadius: 1, bgcolor: "rgb(246, 248, 253)", overflow: "hidden" }}>
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
            bgcolor: "rgba(255, 255, 255, 0.84)",
            boxShadow: 2
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

function truncate(value: string, limit: number) {
  return value.length > limit ? `${value.slice(0, limit - 1)}…` : value;
}

function getDirectChildForFocus(node: BubbleNode, focus: BubbleNode) {
  let current: BubbleNode | null = node;

  while (current?.parent && current.parent !== focus) {
    current = current.parent;
  }

  return current?.parent === focus ? current : null;
}
