import { DatePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";

interface TimeProps {
    min: number | null;
    max: number | null;
    minInclusive: boolean;
    maxInclusive: boolean;
    minValue: number | null;
    maxValue: number | null;
    disabled?: boolean;
    onChange: (min: number | null, max: number | null, minInclusive: boolean, maxInclusive: boolean) => void;
}

export default function Time({ min, max, minInclusive, maxInclusive, maxValue, minValue, onChange, disabled }: TimeProps) {
    const defaultValue: [Dayjs | null, Dayjs | null] | undefined = !min && !max ? undefined : [min ? dayjs(min * 1000) : null, max ? dayjs(max * 1000) : null];
    return <DatePicker.RangePicker disabled={disabled} minDate={dayjs(minValue)} maxDate={dayjs(maxValue)} defaultValue={defaultValue} allowClear allowEmpty onChange={(dates) => {
        if (!dates) return onChange(null, null, minInclusive, maxInclusive);
        else if (dates[0] && dates[1]) return onChange(dates[0].valueOf() / 1000 || null, dates[1].valueOf() / 1000 || null, true, true);
        else if (!dates[0] && dates[1]) return onChange(null, dates[1]?.valueOf() / 1000, minInclusive, true);
        else if (!dates[1] && dates[0]) return onChange(dates[0].valueOf() / 1000, null, true, maxInclusive);
    }}></DatePicker.RangePicker>
}