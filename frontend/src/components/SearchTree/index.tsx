import { useEffect, useRef } from "react";
import TreeIcon from "../../icons/Tree";
import Panel from "../Panel";
import "./index.css";
import * as d3 from "d3";
import { useAppSelector } from "../../app/hooks";
import { getColor } from "../../utils/color";
import { classnames } from "../../utils/classname";

interface TreeNode {
  name: string;
  children?: TreeNode[];
  value?: number;
}

export default function SearchTree({ className }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dataset = useAppSelector((state) => state.dataset.dataset);
  const csvName = useAppSelector((state) => state.states.querySpec?.valueColumnName);
  const timeGranularity = useAppSelector((state) => state.states.querySpec?.timeGranularity);
  const fragments = useAppSelector((state) => state.states.fragments);
  const results = useAppSelector((state) => state.results.results?.results);
  const others = useAppSelector((state) => state.results.results?.others);

  useEffect(() => {
    if (!svgRef.current || !dataset) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const data: TreeNode = { name: "Source" };

    if (csvName && timeGranularity) {
      const timeNode: TreeNode = { name: `${csvName}-${timeGranularity}`, value: fragments?.fragments?.length };
      if (!data.children) data.children = [];
      data.children.push(timeNode);

      if (results || others) {
        const resultsNode = { name: "Results", value: results?.fragments?.length };
        const othersNode = { name: "Others", value: others?.fragments?.length };
        if (!timeNode.children) timeNode.children = [];
        timeNode.children.push(resultsNode);
        timeNode.children.push(othersNode);
      }
    }

    const root = d3.hierarchy(data);

    const treeLayout = d3.tree<TreeNode>()
      .nodeSize([width / 2, height / 8])
      .separation((a, b) => (a.parent === b.parent ? 1 : 4));
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
        .attr("marker-end", "url(#arrow)")
        .attr("opacity", "0")
        .transition()
        .duration(750)
        .attr("opacity", "1");

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
        .attr("opacity", "0")
        .attr("dy", 10)
        .transition()
        .duration(750)
        .attr("dy", -5)
        .attr("opacity", "1");

      const node = g
        .selectAll(".node")
        .data(root.descendants())
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", (d) => `translate(${d.x},${d.y})`)
        .on("click", (_, d) => {
          if (d.data.name !== "Others" || !d.data.value) return;
          if (d.children) {
            d.children = undefined;
            d.data.children = undefined;
            renderTree(root);
            return;
          }
          const newChildren = Array.from({ length: d.data.value }, (_, i) => ({
            name: `Child ${i + 1}`,
          }));
          d.data.children = newChildren;
          const updatedRoot = d3.hierarchy(data);
          treeLayout(updatedRoot);
          renderTree(updatedRoot);
        });

      node
        .append("circle")
        .attr("r", 0)
        .attr("fill", (d) => getColor(d.depth % 10))
        .attr("opacity", "0")
        .transition()
        .duration(750)
        .attr("r", 10)
        .attr("opacity", "1");

      node
        .append("text")
        .attr("y", -20)
        .style("text-anchor", "middle")
        .text((d) => d.data.name === "Source" ? d.data.name : "")
        .attr("opacity", "0")
        .transition()
        .duration(750)
        .attr("opacity", "1");

      node
        .append("text")
        .attr("dy", "3em")
        .attr("opacity", "0")
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "#555")
        .text((d) => (d.data.value !== undefined ? `num: ${d.data.value}` : ""))
        .transition()
        .duration(750)
        .attr("dy", "2em")
        .attr("opacity", "1");
    }

    return () => {
      svg.on(".zoom", null);
      g.selectAll(".node").on("click", null);
      svg.selectAll("*").remove();
      resetButton?.removeEventListener("click", reset);
    };
  }, [dataset, csvName, timeGranularity, results, others, fragments]);


  return (
    <Panel className={classnames('search-tree', className)} icon={<TreeIcon />} title="Search Tree">
      <button id="reset-button">Reset</button>
      <svg ref={svgRef} width="100%" height="100%"></svg>
    </Panel>
  );
};