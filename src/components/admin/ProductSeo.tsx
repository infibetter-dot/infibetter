import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Check,
  CircleAlert,
  ExternalLink,
  Lightbulb,
  Search,
  Sparkles,
  X,
} from "lucide-react";

interface Props {
  name: string;

  seoTitle: string;
  setSeoTitle: Dispatch<SetStateAction<string>>;

  seoDescription: string;
  setSeoDescription: Dispatch<SetStateAction<string>>;

  seoKeywords: string;
  setSeoKeywords: Dispatch<SetStateAction<string>>;

  createSlug: (text: string) => string;
}

export default function ProductSeo({
  name,
  seoTitle,
  setSeoTitle,
  seoDescription,
  setSeoDescription,
  seoKeywords,
  setSeoKeywords,
  createSlug,
}: Props) {
  /* =========================================================
     BASIC DATA
  ========================================================= */

  const titleLength = seoTitle.length;
  const descLength = seoDescription.length;

  const keyword = seoKeywords.trim().toLowerCase();

  /* =========================================================
     KEYWORDS
  ========================================================= */

  const [keywordInput, setKeywordInput] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  const [tags, setTags] = useState<string[]>(() =>
    seoKeywords
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  );

  /*
   * Đồng bộ tags → seoKeywords
   */
  useEffect(() => {
    setSeoKeywords(tags.join(", "));
  }, [tags, setSeoKeywords]);

  /*
   * Nếu seoKeywords được thay đổi từ bên ngoài
   * thì cập nhật lại tags.
   */
  useEffect(() => {
    const nextTags = seoKeywords
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const current = tags.join(", ");
    const next = nextTags.join(", ");

    if (current !== next) {
      setTags(nextTags);
    }
  }, [seoKeywords]);

  /* =========================================================
     KEYWORD CHECK
  ========================================================= */

  const hasKeywordInTitle =
    keyword !== "" &&
    seoTitle
      .toLowerCase()
      .includes(keyword);

  const hasKeywordInDesc =
    keyword !== "" &&
    seoDescription
      .toLowerCase()
      .includes(keyword);

  /* =========================================================
     SEO SCORE
  ========================================================= */

  const seoScore = useMemo(() => {
    let score = 0;

    /*
     * SEO Title
     */
    if (
      titleLength >= 40 &&
      titleLength <= 60
    ) {
      score += 25;
    } else if (
      titleLength >= 30 &&
      titleLength <= 70
    ) {
      score += 15;
    } else {
      score += 5;
    }

    /*
     * Meta Description
     */
    if (
      descLength >= 120 &&
      descLength <= 160
    ) {
      score += 25;
    } else if (
      descLength >= 100 &&
      descLength <= 180
    ) {
      score += 15;
    } else {
      score += 5;
    }

    /*
     * Keyword
     */
    if (keyword !== "") {
      score += 20;
    }

    /*
     * Keyword in title
     */
    if (hasKeywordInTitle) {
      score += 15;
    }

    /*
     * Keyword in description
     */
    if (hasKeywordInDesc) {
      score += 15;
    }

    return Math.min(score, 100);
  }, [
    titleLength,
    descLength,
    keyword,
    hasKeywordInTitle,
    hasKeywordInDesc,
  ]);

  /* =========================================================
     SCORE STYLE
  ========================================================= */

  const scoreConfig =
    seoScore >= 90
      ? {
          label: "Tốt",
          className:
            "bg-[#00B67A] text-white",
          bar: "bg-[#00B67A]",
        }
      : seoScore >= 70
        ? {
            label: "Khá",
            className:
              "bg-[#B8B8B8] text-[#252525]",
            bar: "bg-[#777777]",
          }
        : {
            label: "Cần tối ưu",
            className:
              "border border-[#D9DDE2] bg-[#F5F5F5] text-[#555555]",
            bar: "bg-[#B8B8B8]",
          };

  /* =========================================================
     ADD KEYWORD
  ========================================================= */

  function addKeyword() {
    const value = keywordInput.trim();

    if (!value) return;

    const exists = tags.some(
      (tag) =>
        tag.toLowerCase() ===
        value.toLowerCase(),
    );

    if (exists) {
      setKeywordInput("");
      return;
    }

    setTags([...tags, value]);
    setKeywordInput("");
  }

  /* =========================================================
     REMOVE KEYWORD
  ========================================================= */

  function removeKeyword(index: number) {
    setTags(
      tags.filter((_, i) => i !== index),
    );
  }

  /* =========================================================
     TITLE STATUS
  ========================================================= */

  const titleGood =
    titleLength >= 40 &&
    titleLength <= 60;

  const descriptionGood =
    descLength >= 120 &&
    descLength <= 160;

  /* =========================================================
     RENDER
  ========================================================= */

  const pageUrl = `https://infibetter.com/products/${createSlug(name)}`;

  return (
    <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
      <header className="relative flex flex-wrap items-center justify-between gap-3 overflow-hidden px-4 py-4 sm:px-5">
        <div className="absolute inset-y-0 left-0 w-1 bg-[#00B67A]" aria-hidden="true" />
        <div className="flex min-w-0 items-center gap-3 pl-1">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#BFEBDD] bg-[#EAF8F2] text-[#00A86B] shadow-sm">
            <Sparkles size={17} strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight text-[#252525]">
                <Search size={14} strokeWidth={2} className="text-[#00A86B]" />
                SEO Optimization
              </h2>
              <span className="inline-flex items-center rounded-full border border-[#00A86B] bg-[#00B67A] px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm">
                {seoScore}/100 · {scoreConfig.label}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-[#777777]">Quản lý cách sản phẩm xuất hiện trên công cụ tìm kiếm</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden w-24 sm:block">
            <div className="h-1.5 overflow-hidden rounded-full bg-[#F5F5F5]">
              <div className="h-full rounded-full bg-[#00B67A] transition-all" style={{ width: `${seoScore}%` }} />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Mở rộng SEO Optimization" : "Thu gọn SEO Optimization"}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[11px] font-semibold text-[#252525] transition hover:bg-[#F5F5F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8B8B8]"
          >
            {collapsed ? "Mở rộng" : "Thu gọn"}
            <span className={`text-sm leading-none transition-transform ${collapsed ? "rotate-180" : ""}`}>⌃</span>
          </button>
        </div>
      </header>

      <div className="border-t border-[#D8F0E6] bg-[#F4FBF7] p-4 sm:p-5">
        <div>
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#008F62]">Search preview</p>
                <p className="mt-1 text-[11px] text-[#777777]">Bản xem trước nội dung tìm kiếm</p>
              </div>
              <ExternalLink size={14} className="text-[#00A86B]" />
            </div>
            <div className="rounded-xl border border-[#CDEBDD] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <p className="truncate text-[11px] font-semibold text-[#008F62]">INFIBETTER</p>
              <p className="mt-1 line-clamp-1 text-base font-medium leading-6 text-[#252525]">{seoTitle || "Tiêu đề SEO sẽ hiển thị tại đây"}</p>
              <p className="mt-1 truncate text-[11px] text-[#008F62]">{pageUrl}</p>
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#555555]">{seoDescription || "Meta description sẽ hiển thị tại đây."}</p>
            </div>
        </div>

        {!collapsed && (
          <div className="mt-5 space-y-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="text-xs font-semibold text-[#252525]">SEO Title</label>
                <span className={`text-[11px] font-semibold tabular-nums ${titleGood ? "text-[#252525]" : "text-[#777777]"}`}>{titleLength}/60</span>
              </div>
              <input
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                maxLength={70}
                placeholder="Ví dụ: INFI Magnetic Power Bank 10000mAh"
                className="h-11 w-full rounded-xl border border-[#D9DDE2] bg-white px-3.5 text-sm text-[#252525] outline-none transition placeholder:text-[#B8B8B8] focus:border-[#777777] focus:ring-2 focus:ring-[#B8B8B8]/20"
              />
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#F5F5F5]">
                <div className="h-full rounded-full bg-[#00B67A] transition-all" style={{ width: `${Math.min((titleLength / 60) * 100, 100)}%` }} />
              </div>
              <p className="mt-1.5 text-[10px] text-[#999999]">Độ dài khuyến nghị: 40–60 ký tự</p>
            </div>

            <div className="lg:col-span-2">
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="text-xs font-semibold text-[#252525]">Meta Description</label>
                <span className={`text-[11px] font-semibold tabular-nums ${descriptionGood ? "text-[#252525]" : "text-[#777777]"}`}>{descLength}/160</span>
              </div>
              <textarea
                rows={3}
                maxLength={180}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Mô tả ngắn gọn lợi ích và điểm nổi bật của sản phẩm..."
                className="w-full resize-y rounded-xl border border-[#D9DDE2] bg-white px-3.5 py-3 text-sm leading-6 text-[#252525] outline-none transition placeholder:text-[#B8B8B8] focus:border-[#777777] focus:ring-2 focus:ring-[#B8B8B8]/20"
              />
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#F5F5F5]">
                <div className="h-full rounded-full bg-[#00B67A] transition-all" style={{ width: `${Math.min((descLength / 160) * 100, 100)}%` }} />
              </div>
              <p className="mt-1.5 text-[10px] text-[#999999]">Độ dài khuyến nghị: 120–160 ký tự</p>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-semibold text-[#252525]">Từ khóa chính</label>
                <span className="text-[10px] text-[#999999]">{tags.length} từ khóa</span>
              </div>
              <div className="flex min-h-11 flex-wrap items-center gap-2 rounded-xl border border-[#D9DDE2] bg-white p-2.5 transition focus-within:border-[#777777] focus-within:ring-2 focus-within:ring-[#B8B8B8]/20">
                {tags.map((tag, index) => (
                  <span key={`${tag}-${index}`} className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-[#F5F5F5] px-2.5 py-1.5 text-[11px] font-medium text-[#252525]">
                    {tag}
                    <button type="button" onClick={() => removeKeyword(index)} aria-label={`Xóa từ khóa ${tag}`} className="grid h-4 w-4 place-items-center rounded text-[#777777] hover:bg-[#E5E7EB] hover:text-[#252525]">
                      <X size={11} />
                    </button>
                  </span>
                ))}
                <input
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addKeyword();
                    }
                  }}
                  placeholder={tags.length ? "Thêm từ khóa..." : "Nhập từ khóa rồi nhấn Enter"}
                  className="min-w-[130px] flex-1 border-0 bg-transparent px-1 py-1 text-xs text-[#252525] outline-none placeholder:text-[#B8B8B8]"
                />
              </div>
              <p className="mt-1.5 text-[10px] text-[#999999]">Nhấn Enter hoặc dấu phẩy để thêm từ khóa</p>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-semibold text-[#252525]">URL sản phẩm</label>
                <span className="text-[10px] font-medium text-[#777777]">Tự động</span>
              </div>
              <div className="flex min-h-11 items-center rounded-xl border border-[#E5E7EB] bg-[#F5F5F5] px-3.5 py-2.5">
                <span className="break-all text-xs leading-5 text-[#777777]">{pageUrl}</span>
              </div>
              <p className="mt-1.5 text-[10px] text-[#999999]">URL được tạo từ slug của sản phẩm</p>
            </div>
          </div>

          <div className="grid gap-4 border-t border-[#E5E7EB] pt-5 lg:grid-cols-2">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-[#252525]">SEO Checklist</h3>
                  <p className="mt-1 text-[10px] text-[#999999]">Các tiêu chí tối ưu cơ bản</p>
                </div>
                <span className="rounded-lg bg-[#F5F5F5] px-2.5 py-1 text-[11px] font-semibold text-[#252525]">{seoScore}/100</span>
              </div>
              <div className="space-y-2">
                <ChecklistRow valid={titleGood} label="SEO Title 40–60 ký tự" value={`${titleLength}/60`} />
                <ChecklistRow valid={descriptionGood} label="Meta Description 120–160 ký tự" value={`${descLength}/160`} />
                <ChecklistRow valid={keyword !== ""} label="Đã thêm từ khóa chính" />
                <ChecklistRow valid={hasKeywordInTitle} label="Từ khóa xuất hiện trong Title" />
                <ChecklistRow valid={hasKeywordInDesc} label="Từ khóa xuất hiện trong Description" />
                <ChecklistRow valid={name.trim() !== ""} label="URL Slug đã được tạo" />
              </div>
            </div>

            <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#F5F5F5] text-[#555555]"><Lightbulb size={15} /></div>
                <div>
                  <h3 className="text-xs font-semibold text-[#252525]">Gợi ý tối ưu</h3>
                  <p className="mt-0.5 text-[10px] text-[#999999]">Những điểm cần hoàn thiện</p>
                </div>
              </div>
              <div className="space-y-2 text-[11px] leading-5 text-[#555555]">
                {titleLength < 40 && <Suggestion>Tiêu đề nên dài khoảng 40–60 ký tự.</Suggestion>}
                {titleLength > 60 && <Suggestion>Tiêu đề hơi dài; hãy cân nhắc rút gọn.</Suggestion>}
                {descLength < 120 && <Suggestion>Meta Description nên dài khoảng 120–160 ký tự.</Suggestion>}
                {descLength > 160 && <Suggestion>Meta Description đang dài hơn mức khuyến nghị.</Suggestion>}
                {keyword === "" && <Suggestion>Thêm từ khóa chính mô tả đúng sản phẩm.</Suggestion>}
                {keyword !== "" && !hasKeywordInTitle && <Suggestion>Đưa từ khóa chính vào SEO Title một cách tự nhiên.</Suggestion>}
                {keyword !== "" && !hasKeywordInDesc && <Suggestion>Đề cập từ khóa chính trong Meta Description.</Suggestion>}
                {seoScore >= 90 && <div className="flex items-center gap-2 rounded-lg border border-[#D9DDE2] bg-white px-3 py-2 font-medium text-[#252525]"><Sparkles size={13} />Các tiêu chí SEO cơ bản đã được đáp ứng.</div>}
                {seoScore < 90 && titleLength > 0 && descLength > 0 && keyword !== "" && hasKeywordInTitle && hasKeywordInDesc && <div className="flex items-center gap-2 rounded-lg border border-[#D9DDE2] bg-white px-3 py-2 font-medium text-[#252525]"><Check size={13} />Nội dung SEO cơ bản đã đầy đủ.</div>}
              </div>
            </div>
          </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* =========================================================
   CHECKLIST ROW
========================================================= */

function ChecklistRow({
  valid,
  label,
  value,
}: {
  valid: boolean;
  label: string;
  value?: string;
}) {
  return (
    <div
      className="
        flex
        min-h-[30px]
        items-center
        justify-between
        rounded-lg
        border
        border-neutral-100
        bg-neutral-50/60
        px-2.5
      "
    >
      <div className="flex min-w-0 items-center gap-2">
        {valid ? (
          <span
            className="
              flex
              h-4
              w-4
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-[#00B67A]
              text-white
            "
          >
            <Check size={9} strokeWidth={2.5} />
          </span>
        ) : (
          <span
            className="
              flex
              h-4
              w-4
              shrink-0
              items-center
              justify-center
              rounded-full
              border border-[#D9DDE2]
              bg-white
              text-[#777777]
            "
          >
            <CircleAlert
              size={10}
            />
          </span>
        )}

        <span
          className={`
            truncate
            text-[9px]
            font-medium
            ${
              valid
                ? "text-neutral-600"
                : "text-neutral-500"
            }
          `}
        >
          {label}
        </span>
      </div>

      {value && (
        <span
          className={`
            ml-2
            shrink-0
            text-[9px]
            font-semibold
            ${
              valid
                ? "text-[#00A86B]"
                : "text-neutral-400"
            }
          `}
        >
          {value}
        </span>
      )}
    </div>
  );
}

/* =========================================================
   SUGGESTION
========================================================= */

function Suggestion({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#777777]" />

      <span>{children}</span>
    </div>
  );
}