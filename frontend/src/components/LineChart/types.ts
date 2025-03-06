import { GroupChoice, GroupRelationChoice, Intentions, SingleChoice, SingleRelationChoice, Unit } from "../../types/QuerySpec";

export interface LineChartProps {
    xData: number[] | string[];
    xDataType?: "number" | Unit;
    yData: number[];
    ratio?: number;
    height?: number | string;
    title?: string;
    margin?: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    isXAxisVisible?: boolean;
    isYAxisVisible?: boolean;
    isXAxisTextVisible?: boolean;
    isYAxisTextVisible?: boolean;
    isBrush?: boolean;
    onBrush?: (start: number, end: number) => void;
    onBrushEnd?: (start: number, end: number) => void;
    brushPosition?: [number, number];
    isFill?: boolean;
    range?: [number, number];
    isShowRange?: boolean;
    split?: number[];
    isSplitMask?: boolean;
    isExpand?: boolean;
    isZoom?: boolean;
    isActive?: boolean;
    onScroll?: (delta: number) => void;
    onContextMenu?: (event: MouseEvent) => void;
    children?: React.ReactNode;
    xAxisColor?: string;
    yAxisColor?: string;
    lineColor?: string;
    textColor?: string;
    xAxisFormatter?: (date: Date) => string;
    brushColor?: string;
    resultsSplit?: {
        segments: [number, number][][];
        colors: string[];
    };
    selectedSplits?: number[];
    defaultSplits?: number[];
    isHoverable?: boolean;
    isRequesting?: boolean;
    onSplitSelect?: (splits: number[]) => void;
    onSubmitIntentions?: (intentions: Intentions) => void;
}

export interface PopoverPosition {
    x: number;
    y: number;
    type: "SingleSegment" | "SegmentGroup" | "SingleRelation" | "GroupRelation";
    ranges: [number, number][];
    groups?: [[number, number][], [number, number][]];
    rectWidth: number;
    rectHeight: number;
}

export interface IntentionLine {
    type: "SingleSegment" | "SegmentGroup" | "SingleRelation" | "GroupRelation";
    level: number;
    ranges: [number, number][];
    choices: (SingleChoice | GroupChoice | SingleRelationChoice | GroupRelationChoice)[];
}

export interface IntentionPopoverProps<T extends SingleChoice | GroupChoice | SingleRelationChoice | GroupRelationChoice> {
    type: "SingleSegment" | "SegmentGroup" | "SingleRelation" | "GroupRelation";
    choices: T[];
    selected: T[];
    onChange: (choice: T) => void;
    onCancel?: () => void;
    onConfirm: () => void;
    onDelete?: () => void;
    isExisting?: boolean;
} 