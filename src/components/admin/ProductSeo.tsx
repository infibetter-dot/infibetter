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
            "bg-emerald-500 text-white",
          bar: "bg-emerald-500",
        }
      : seoScore >= 70
        ? {
            label: "Khá",
            className:
              "bg-amber-500 text-white",
            bar: "bg-amber-500",
          }
        : {
            label: "Cần tối ưu",
            className:
              "bg-red-500 text-white",
            bar: "bg-red-500",
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

  return (
    <section
      className="
        overflow-hidden
        rounded-2xl
        border
        border-[#E7E2DA]
        bg-white
        shadow-sm
      "
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="
          flex
          items-center
          justify-between
          gap-4
          border-b
          border-[#EEEAE4]
          px-5
          py-4
        "
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-[#F5F3EE]
              text-neutral-700
            "
          >
            <Search
              className="h-4 w-4"
              strokeWidth={1.8}
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-neutral-900">
                SEO Optimization
              </h2>

              <span
                className={`
                  rounded-full
                  px-2
                  py-0.5
                  text-[10px]
                  font-semibold
                  ${scoreConfig.className}
                `}
              >
                {seoScore}/100
              </span>
            </div>

            <p className="mt-0.5 text-[11px] text-neutral-400">
              Tối ưu hiển thị sản phẩm trên Google
            </p>
          </div>
        </div>

        {/* SCORE */}

        <div className="hidden items-center gap-2 sm:flex">
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-neutral-100">
            <div
              className={`
                h-full
                rounded-full
                transition-all
                ${scoreConfig.bar}
              `}
              style={{
                width: `${seoScore}%`,
              }}
            />
          </div>

          <span className="text-[10px] font-medium text-neutral-400">
            {scoreConfig.label}
          </span>
        </div>
      </div>

      {/* =====================================================
          GOOGLE PREVIEW
      ===================================================== */}

      <div className="border-b border-[#EEEAE4] p-4">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
              Google Preview
            </p>

            <p className="mt-0.5 text-[9px] text-neutral-400">
              Xem trước cách sản phẩm có thể xuất hiện trên Google
            </p>
          </div>

          <ExternalLink
            size={12}
            className="text-neutral-300"
          />
        </div>

        <div
          className="
            rounded-xl
            border
            border-neutral-200
            bg-[#FAFAFA]
            px-4
            py-3
          "
        >
          {/* TITLE */}

          <div
            className="
              truncate
              text-[14px]
              font-medium
              text-[#1A0DAB]
            "
          >
            {seoTitle ||
              "Tiêu đề SEO sẽ hiển thị tại đây"}
          </div>

          {/* URL */}

          <div
            className="
              mt-1
              truncate
              text-[10px]
              text-[#188038]
            "
          >
            https://olivelivingvn.com/products/
            {createSlug(name)}
          </div>

          {/* DESCRIPTION */}

          <div
            className="
              mt-1.5
              line-clamp-2
              text-[10px]
              leading-5
              text-[#5F6368]
            "
          >
            {seoDescription ||
              "Meta description sẽ hiển thị tại đây."}
          </div>
        </div>
      </div>

      {/* =====================================================
          FORM
      ===================================================== */}

      <div className="space-y-4 p-4">
        {/* ===================================================
            SEO TITLE
        =================================================== */}

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-[11px] font-semibold text-neutral-700">
              SEO Title
            </label>

            <span
              className={`
                text-[10px]
                font-semibold
                ${
                  titleGood
                    ? "text-emerald-600"
                    : titleLength > 60
                      ? "text-red-500"
                      : "text-amber-500"
                }
              `}
            >
              {titleLength}/60
            </span>
          </div>

          <input
            value={seoTitle}
            onChange={(e) =>
              setSeoTitle(e.target.value)
            }
            maxLength={70}
            placeholder="Ví dụ: Ghế Butterfly Stool Gỗ Óc Chó | Olive Living"
            className="
              h-9
              w-full
              rounded-lg
              border
              border-neutral-200
              bg-white
              px-3
              text-[11px]
              text-neutral-700
              outline-none
              transition
              placeholder:text-neutral-400
              focus:border-[#6F8B5E]
              focus:ring-2
              focus:ring-[#6F8B5E]/15
            "
          />

          {/* PROGRESS */}

          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-neutral-100">
            <div
              className={`
                h-full
                rounded-full
                transition-all
                ${
                  titleGood
                    ? "bg-emerald-500"
                    : titleLength > 60
                      ? "bg-red-500"
                      : "bg-amber-400"
                }
              `}
              style={{
                width: `${Math.min(
                  (titleLength / 60) * 100,
                  100,
                )}%`,
              }}
            />
          </div>
        </div>

        {/* ===================================================
            META DESCRIPTION
        =================================================== */}

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-[11px] font-semibold text-neutral-700">
              Meta Description
            </label>

            <span
              className={`
                text-[10px]
                font-semibold
                ${
                  descriptionGood
                    ? "text-emerald-600"
                    : descLength > 160
                      ? "text-red-500"
                      : "text-amber-500"
                }
              `}
            >
              {descLength}/160
            </span>
          </div>

          <textarea
            rows={3}
            maxLength={180}
            value={seoDescription}
            onChange={(e) =>
              setSeoDescription(
                e.target.value,
              )
            }
            placeholder="Viết mô tả hấp dẫn để Google hiển thị..."
            className="
              w-full
              resize-none
              rounded-lg
              border
              border-neutral-200
              bg-white
              px-3
              py-2.5
              text-[11px]
              leading-5
              text-neutral-700
              outline-none
              transition
              placeholder:text-neutral-400
              focus:border-[#6F8B5E]
              focus:ring-2
              focus:ring-[#6F8B5E]/15
            "
          />

          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-neutral-100">
            <div
              className={`
                h-full
                rounded-full
                transition-all
                ${
                  descriptionGood
                    ? "bg-emerald-500"
                    : descLength > 160
                      ? "bg-red-500"
                      : "bg-amber-400"
                }
              `}
              style={{
                width: `${Math.min(
                  (descLength / 160) * 100,
                  100,
                )}%`,
              }}
            />
          </div>
        </div>

        {/* ===================================================
            KEYWORD + URL
        =================================================== */}

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {/* KEYWORD */}

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-[11px] font-semibold text-neutral-700">
                Từ khóa chính
              </label>

              {tags.length > 0 && (
                <span className="text-[9px] text-neutral-400">
                  {tags.length} từ khóa
                </span>
              )}
            </div>

            <div
              className="
                flex
                min-h-[36px]
                flex-wrap
                items-center
                gap-1.5
                rounded-lg
                border
                border-neutral-200
                bg-white
                px-2
                py-1.5
                transition
                focus-within:border-[#6F8B5E]
                focus-within:ring-2
                focus-within:ring-[#6F8B5E]/15
              "
            >
              {tags.map((tag, index) => (
                <div
                  key={`${tag}-${index}`}
                  className="
                    flex
                    items-center
                    gap-1
                    rounded-full
                    bg-[#2D6A4F]
                    px-2
                    py-1
                    text-[9px]
                    font-medium
                    text-white
                  "
                >
                  <span>{tag}</span>

                  <button
                    type="button"
                    onClick={() =>
                      removeKeyword(index)
                    }
                    className="
                      flex
                      h-3
                      w-3
                      items-center
                      justify-center
                      rounded-full
                      text-white/70
                      transition
                      hover:bg-white/15
                      hover:text-white
                    "
                  >
                    <X size={9} />
                  </button>
                </div>
              ))}

              <input
                value={keywordInput}
                onChange={(e) =>
                  setKeywordInput(
                    e.target.value,
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addKeyword();
                  }

                  if (
                    e.key === "," ||
                    e.key === "Tab"
                  ) {
                    if (
                      keywordInput.trim()
                    ) {
                      e.preventDefault();
                      addKeyword();
                    }
                  }
                }}
                placeholder={
                  tags.length
                    ? "Thêm từ khóa..."
                    : "Nhập từ khóa + Enter"
                }
                className="
                  min-w-[100px]
                  flex-1
                  border-none
                  bg-transparent
                  px-1
                  text-[10px]
                  text-neutral-700
                  outline-none
                  placeholder:text-neutral-400
                "
              />
            </div>
          </div>

          {/* URL */}

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-[11px] font-semibold text-neutral-700">
                URL sản phẩm
              </label>

              <span className="text-[9px] text-emerald-600">
                Tự động
              </span>
            </div>

            <div
              className="
                flex
                min-h-[36px]
                items-center
                rounded-lg
                border
                border-neutral-200
                bg-neutral-50
                px-3
                text-[10px]
                text-neutral-500
              "
            >
              <span className="truncate">
                https://olivelivingvn.com/products/
                {createSlug(name)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          CHECKLIST + SUGGESTIONS
      ===================================================== */}

      <div className="grid grid-cols-1 border-t border-[#EEEAE4] lg:grid-cols-2">
        {/* ===================================================
            CHECKLIST
        =================================================== */}

        <div className="p-4 lg:border-r lg:border-[#EEEAE4]">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-neutral-700">
                SEO Checklist
              </p>

              <p className="mt-0.5 text-[9px] text-neutral-400">
                Kiểm tra nhanh trước khi lưu
              </p>
            </div>

            <span
              className={`
                rounded-full
                px-2
                py-1
                text-[9px]
                font-semibold
                ${scoreConfig.className}
              `}
            >
              {seoScore}/100
            </span>
          </div>

          <div className="space-y-1.5">
            {/* TITLE */}

            <ChecklistRow
              valid={titleGood}
              label="SEO Title 40–60 ký tự"
              value={`${titleLength}/60`}
            />

            {/* DESCRIPTION */}

            <ChecklistRow
              valid={descriptionGood}
              label="Meta Description 120–160 ký tự"
              value={`${descLength}/160`}
            />

            {/* KEYWORD */}

            <ChecklistRow
              valid={keyword !== ""}
              label="Có từ khóa chính"
            />

            {/* TITLE KEYWORD */}

            <ChecklistRow
              valid={hasKeywordInTitle}
              label="Từ khóa trong Title"
            />

            {/* DESCRIPTION KEYWORD */}

            <ChecklistRow
              valid={hasKeywordInDesc}
              label="Từ khóa trong Description"
            />

            {/* SLUG */}

            <ChecklistRow
              valid={name.trim() !== ""}
              label="URL Slug tự động"
            />
          </div>
        </div>

        {/* ===================================================
            SUGGESTIONS
        =================================================== */}

        <div className="bg-[#FFFCF4] p-4">
          <div className="mb-3 flex items-center gap-2">
            <div
              className="
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-lg
                bg-amber-100
                text-amber-700
              "
            >
              <Lightbulb
                size={13}
              />
            </div>

            <div>
              <p className="text-[11px] font-semibold text-amber-800">
                Gợi ý tối ưu
              </p>

              <p className="text-[9px] text-amber-600/70">
                Cải thiện SEO trước khi đăng
              </p>
            </div>
          </div>

          <div className="space-y-1.5 text-[10px] leading-4 text-amber-900">
            {titleLength < 40 && (
              <Suggestion>
                Tiêu đề còn ngắn. Nên khoảng
                40–60 ký tự.
              </Suggestion>
            )}

            {titleLength > 60 && (
              <Suggestion>
                Tiêu đề quá dài, Google có thể
                cắt bớt khi hiển thị.
              </Suggestion>
            )}

            {descLength < 120 && (
              <Suggestion>
                Meta Description nên khoảng
                120–160 ký tự.
              </Suggestion>
            )}

            {descLength > 160 && (
              <Suggestion>
                Meta Description đang quá dài.
              </Suggestion>
            )}

            {keyword === "" && (
              <Suggestion>
                Hãy thêm ít nhất một từ khóa
                chính.
              </Suggestion>
            )}

            {keyword !== "" &&
              !hasKeywordInTitle && (
                <Suggestion>
                  Nên đưa từ khóa chính vào
                  SEO Title.
                </Suggestion>
              )}

            {keyword !== "" &&
              !hasKeywordInDesc && (
                <Suggestion>
                  Nên đưa từ khóa chính vào
                  Meta Description.
                </Suggestion>
              )}

            {seoScore >= 90 && (
              <div
                className="
                  flex
                  items-center
                  gap-1.5
                  rounded-lg
                  bg-emerald-50
                  px-2.5
                  py-2
                  font-medium
                  text-emerald-700
                "
              >
                <Sparkles size={11} />

                SEO đang ở mức rất tốt.
              </div>
            )}

            {seoScore < 90 &&
              titleLength > 0 &&
              descLength > 0 &&
              keyword !== "" &&
              hasKeywordInTitle &&
              hasKeywordInDesc && (
                <div
                  className="
                    flex
                    items-center
                    gap-1.5
                    rounded-lg
                    bg-emerald-50
                    px-2.5
                    py-2
                    font-medium
                    text-emerald-700
                  "
                >
                  <Check size={11} />

                  Nội dung SEO cơ bản đã đầy đủ.
                </div>
              )}
          </div>
        </div>
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
              bg-emerald-100
              text-emerald-600
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
              bg-red-50
              text-red-500
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
                ? "text-emerald-600"
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
      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-amber-500" />

      <span>{children}</span>
    </div>
  );
}