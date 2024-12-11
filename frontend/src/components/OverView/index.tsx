import Panel from "../Panel";
import "./index.css";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import OverviewIcon from "../../icons/Overview";
import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { getColor } from "../../utils/color";
import { FragmentList } from "../../types/QuerySpec";
import { TreeNode } from "../../types/Tree";
import { setNLQuery } from "../../app/slice/stateSlice";

const buildTree = (fragmentList: FragmentList): TreeNode => {
    const data: TreeNode = { name: "", children: [], count: fragmentList.fragments?.length || 0 };
    const treeMap = new Map<string, TreeNode>();
    fragmentList.fragments?.forEach((fragment) => {
        const fragmentName = "Find a trend with " + fragment.segments!.map(segment => segment.extent && segment.trend ? `${segment.extent}ly ${segment.trend}` : segment.extent ? `${segment.extent}ly anything` : segment.trend ? segment.trend : "").join(" then ") + " in " + fragmentList.value_column_name;
        const node = treeMap.get(fragmentName);
        if (node) {
            node.count! ++;
        } else {
            treeMap.set(fragmentName, { name: fragmentName, count: 1 });
        }
    })
    data.children = Array.from(treeMap.values()).sort((a, b) => b.count! - a.count!);
    return data;
};

export default function OverView() {
    const svgRef = useRef<SVGSVGElement>(null);
    const dataset = useAppSelector((state) => state.dataset.dataset);
    const csvName = useAppSelector((state) => state.states.querySpec?.valueColumnName);
    const timeGranularity = useAppSelector((state) => state.states.querySpec?.timeGranularity);
    const fragments = useAppSelector((state) => state.states.fragments);
    const currentFragments = useAppSelector((state) => state.states.currentFragments);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (!svgRef.current || !dataset || !currentFragments) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const width = svgRef.current.clientWidth;
        const height = svgRef.current.clientHeight;

        const data: TreeNode = buildTree(currentFragments);
        const root = d3.hierarchy(data);

        const treeLayout = d3.tree<TreeNode>()
            .nodeSize([width / 4, height / 6]);
        treeLayout(root);

        const g = svg.append("g").attr("transform", `translate(${width / 16}, ${height / 2})`);

        const zoom = d3.zoom<SVGSVGElement, unknown>().on("zoom", (event) => g.attr("transform", event.transform));
        svg.call(zoom).call(zoom.transform, d3.zoomIdentity.translate(width / 16, height / 2));

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
                    `M${d.source.y! + 10},${d.source.x} C${(d.source.y! + d.target.y!) / 2},${d.source.x} ${(d.source.y! + d.target.y!) / 2},${d.target.x} ${d.target.y! - 10},${d.target.x}`
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
                .attr("x", (d) => d.target.y! + 20)
                .attr("y", (d) => d.target.x! + 5)
                .text((d) => d.target.data.name)
                .style("fill", "#333")
                .style("font-size", "12px")
                .style("text-anchor", "start")
                .style("cursor", "pointer")
                .on("click", (_, d) => {
                    dispatch(setNLQuery(d.target.data.name));
                })

            const node = g
                .selectAll(".node")
                .data(root.descendants())
                .enter()
                .append("g")
                .attr("class", "node")
                .attr("transform", (d) => `translate(${d.y},${d.x})`);

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
                .text((d) => (d.parent ? "" : d.data.name))
                .attr("opacity", "0")
                .transition()
                .duration(750)
                .attr("opacity", "1");

            node
                .append("text")
                .attr("dy", "4px")
                .attr("opacity", "0")
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .style("fill", "#555")
                .text((d) => d.data.count || 0)
                .transition()
                .duration(750)
                .attr("opacity", "1");
        }


        return () => {
            svg.on(".zoom", null);
            g.selectAll(".node").on("click", null);
            svg.selectAll("*").remove();
        };
    }, [dataset, csvName, timeGranularity, fragments, currentFragments, dispatch]);

    return (
        <Panel title="Overview" className="overview" icon={<OverviewIcon />}>
            <svg ref={svgRef} width="100%" height="100%"></svg>
        </Panel>
    )
}