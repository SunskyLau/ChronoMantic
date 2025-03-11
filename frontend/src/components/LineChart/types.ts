import { GroupChoice, GroupRelationChoice, Intentions, SingleChoice, SingleRelationChoice, Unit } from "../../types/QuerySpec";

export interface LineChartProps {
    xData: number[] | string[];
    xDataType?: Unit;
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
    isExpand?: boolean;
    isZoom?: boolean;
    isActive?: boolean;
    onScroll?: (delta: number, position: number) => void;
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
    isSelectable?: boolean;
    onSplitSelect?: (splits: number[]) => void;
    onCancelSplit?: () => void;
    /**
     * @param mode true 表示 refine，false 表示 author
     */
    onSubmitIntentions?: (intentions: Intentions, mode?: boolean) => void;
}

export type ChoiceType = "SingleSegment" | "SegmentGroup" | "SingleRelation" | "GroupRelation";

export interface PopoverPosition {
    x: number;
    y: number;
    type: ChoiceType;
    ranges: [number, number][];
    groups?: [[number, number][], [number, number][]];
    rectWidth: number;
    rectHeight: number;
}

export interface IntentionLine {
    type: ChoiceType;
    level: number;
    ranges: [number, number][];
    choices: (SingleChoice | GroupChoice | SingleRelationChoice | GroupRelationChoice)[];
}

export interface IntentionPopoverProps<T extends SingleChoice | GroupChoice | SingleRelationChoice | GroupRelationChoice> {
    type: ChoiceType;
    choices: T[];
    selected: T[];
    onChange: (choice: T) => void;
    onCancel?: () => void;
    onConfirm: () => void;
    onDelete?: () => void;
    isExisting?: boolean;
} 