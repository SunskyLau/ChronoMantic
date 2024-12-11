import { useEffect, useRef } from "react";
import TreeIcon from "../../icons/Tree";
import Panel from "../Panel";
import "./index.css";
import * as d3 from "d3";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { getColor } from "../../utils/color";
import { classnames } from "../../utils/classname";
import { setCurrentFragments } from "../../app/slice/stateSlice";
import { TreeNode } from "../../types/Tree";

export default function SearchTree({ className }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dataset = useAppSelector((state) => state.dataset.dataset);
  const csvName = useAppSelector((state) => state.states.querySpec?.valueColumnName);
  const timeGranularity = useAppSelector((state) => state.states.querySpec?.timeGranularity);
  const fragments = useAppSelector((state) => state.states.fragments);
  const results = useAppSelector((state) => state.results.results?.results);
  const others = useAppSelector((state) => state.results.results?.others);
  const currentFragments = useAppSelector((state) => state.states.currentFragments);
  const treeData = useAppSelector((state) => state.states.treeData);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!svgRef.current || !dataset || !treeData) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const root = d3.hierarchy(treeData);

    const treeLayout = d3.tree<TreeNode>()
      .nodeSize([width / 2, height / 4]);
    treeLayout(root);

    const g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 4})`);

    const zoom = d3.zoom<SVGSVGElement, unknown>().on("zoom", (event) => g.attr("transform", event.transform));
    svg.call(zoom).call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 4));

    const resetButton = document.getElementById("reset-button");
    resetButton?.addEventListener("click", reset);

    function reset() {
      svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 4));
      renderTree(root);
    }

    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 9)
      .attr("refY", 5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 Z")
      .attr("fill", "#ccc");

    renderTree(root);

    function renderTree(root: d3.HierarchyNode<TreeNode>) {
      g.selectAll("*").remove();

      g.selectAll(".link")
        .data(root.links())
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("d", (d) =>
          `M${d.source.x},${d.source.y! + 10} C${d.source.x},${(d.source.y! + d.target.y!) / 2} ${d.target.x},${(d.source.y! + d.target.y!) / 2} ${d.target.x},${d.target.y! - 10}`
        )
        .attr("fill", "none")
        .attr("stroke", "#ccc")
        .attr("stroke-width", 2)
        .attr("marker-end", "url(#arrow)");

      g.selectAll(".link-label")
        .data(root.links())
        .enter()
        .append("text")
        .attr("class", "link-label")
        .attr("x", (d) => (d.source.x! + d.target.x!) / 2)
        .attr("y", (d) => (d.source.y! + d.target.y!) / 2)
        .text((d) => d.target.data.name)
        .style("fill", "#333")
        .style("font-size", "12px")
        .style("text-anchor", "middle")
        .attr("dy", -5);

      const node = g
        .selectAll(".node")
        .data(root.descendants())
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", (d) => `translate(${d.x},${d.y})`)
        .on("click", (_, d) => {
          dispatch(setCurrentFragments(d.data.value || null))
        });

      node
        .append("circle")
        .attr("fill", (d) => getColor(d.depth % 10))
        .attr("r", (d) => d.data.value === currentFragments || !d.data.value && !currentFragments ? 10 : 5);

      node
        .append("text")
        .attr("y", -20)
        .style("text-anchor", "middle")
        .text((d) => d.data.name === "Source" ? d.data.name : "");

      node
        .append("text")
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "#555")
        .text((d) => (d.data.value ? `num: ${d.data.value?.fragments?.length}` : ""))
        .attr("dy", "2em")
    }

    return () => {
      svg.on(".zoom", null);
      g.selectAll(".node").on("click", null);
      svg.selectAll("*").remove();
      resetButton?.removeEventListener("click", reset);
    };
  }, [dataset, csvName, timeGranularity, results, others, fragments, currentFragments, dispatch, treeData]);


  return (
    <Panel className={classnames('search-tree', className)} icon={<TreeIcon />} title="Search Tree">
      <button id="reset-button">Reset</button>
      <svg ref={svgRef} width="100%" height="100%"></svg>
    </Panel>
  );
};