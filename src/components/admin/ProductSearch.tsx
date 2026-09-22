interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function ProductSearch({
  value,
  onChange,
}: Props) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) =>
        onChange(e.target.value)
      }
      placeholder="Tìm theo tên sản phẩm..."
      className="
        block
        h-11
        w-full
        rounded-xl
        border
        border-neutral-200
        bg-white
        px-4
        text-sm
        text-neutral-900
        placeholder:text-neutral-400
        outline-none
        transition
        focus:border-neutral-300
        focus:ring-2
        focus:ring-neutral-900/5
      "
    />
  );
}