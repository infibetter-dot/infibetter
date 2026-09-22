import { Search } from "lucide-react";

interface VoucherSearchProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
}

export default function VoucherSearch({
  keyword,
  onKeywordChange,
}: VoucherSearchProps) {
  return (
    <div className="relative w-full">
      <Search
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      />

      <input
        type="text"
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
        placeholder="Tìm theo mã voucher hoặc tiêu đề..."
        className="h-11 w-full rounded-lg border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary"
      />
    </div>
  );
}