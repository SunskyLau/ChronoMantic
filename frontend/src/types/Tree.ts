import { Results } from "../app/slice/resultsSlice";
import { FragmentList } from "./QuerySpec";

export interface TreeNode {
    name: string;
    children?: TreeNode[];
    value?: FragmentList | null;
    count?: number;
}

export interface InsertTreeNode {
    fragmentList: FragmentList;
    nodes: Results;
}