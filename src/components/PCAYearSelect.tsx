import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface PCAYearSelectProps {
    value?: string;
    onValueChange?: (value: string) => void;
    className?: string;
}

export const PCAYearSelect = ({ value, onValueChange, className }: PCAYearSelectProps) => {
    const nextYear = new Date().getFullYear() + 1;
    const currentYear = new Date().getFullYear();
    const defaultValue = `pca-${nextYear}`;

    return (
        <div className={className || "w-[180px]"}>
            <Select
                defaultValue={defaultValue}
                value={value}
                onValueChange={onValueChange}
            >
                <SelectTrigger>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={`pca-${nextYear}`}>PCA {nextYear} - Em elaboração</SelectItem>
                    <SelectItem value={`pca-${currentYear}`}>PCA {currentYear} - Em execução</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
};
