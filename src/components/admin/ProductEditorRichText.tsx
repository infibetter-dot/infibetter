import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link as LinkIcon,
  ImagePlus,
  Undo2,
  Redo2,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function ProductEditorRichText({
  value,
  onChange,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),

      Underline,

      Image,

      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),

      Placeholder.configure({
        placeholder: "Nhập nội dung mô tả sản phẩm...",
      }),

      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],

    content: value || "",

    immediatelyRender: false,

    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  /*
   * Đồng bộ nội dung khi value thay đổi từ bên ngoài.
   * Không update nếu nội dung hiện tại đã giống nhau
   * để tránh vòng lặp render.
   */
  useEffect(() => {
    if (!editor) return;

    const currentHTML = editor.getHTML();
    const nextHTML = value || "";

    if (currentHTML !== nextHTML) {
      editor.commands.setContent(nextHTML, {
        emitUpdate: false,
      });
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div className="overflow-hidden rounded-2xl border border-[#D8D8D8] bg-white">
        <div className="flex h-12 items-center px-4 text-sm text-neutral-400">
          Đang tải trình soạn thảo...
        </div>
      </div>
    );
  }

  /* =========================================================
     INSERT LINK
  ========================================================= */

  function insertLink() {
    const previousUrl = editor.getAttributes("link").href;

    const url = window.prompt(
      "Nhập URL",
      previousUrl || "https://",
    );

    if (url === null) return;

    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      editor
        .chain()
        .focus()
        .unsetLink()
        .run();

      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href: trimmedUrl,
      })
      .run();
  }

  /* =========================================================
     UPLOAD IMAGE
  ========================================================= */

  async function uploadImage(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      if (!file.type.startsWith("image/")) {
        alert("Vui lòng chọn một file hình ảnh.");
        return;
      }

      const ext =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      const fileName = `editor/${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from("website OLive")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      const { data } = supabase.storage
        .from("website OLive")
        .getPublicUrl(fileName);

      if (!data?.publicUrl) {
        throw new Error(
          "Không lấy được URL hình ảnh.",
        );
      }

      editor
        .chain()
        .focus()
        .setImage({
          src: data.publicUrl,
        })
        .run();
    } catch (error: any) {
      console.error(
        "EDITOR IMAGE UPLOAD ERROR:",
        error,
      );

      alert(
        error?.message ||
          "Không thể tải hình ảnh lên.",
      );
    } finally {
      /*
       * Cho phép chọn lại cùng một file.
       */
      e.target.value = "";
    }
  }

  /* =========================================================
     TOOLBAR BUTTON
  ========================================================= */

  const toolbarButton = (
    active = false,
    danger = false,
  ) =>
    `
      inline-flex
      h-9
      w-9
      shrink-0
      items-center
      justify-center
      rounded-lg
      border
      text-sm
      transition-all
      duration-150
      focus:outline-none
      focus:ring-2
      focus:ring-[#2D6A4F]/15

      ${
        active
          ? "border-[#2D6A4F] bg-[#2D6A4F] text-white shadow-sm"
          : danger
            ? "border-transparent bg-transparent text-neutral-500 hover:border-neutral-200 hover:bg-neutral-100 hover:text-neutral-800"
            : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
      }
    `;

  return (
    <div
      className="
        w-full
        overflow-hidden
        rounded-2xl
        border
        border-[#D8D8D8]
        bg-white
        shadow-sm
      "
    >
      {/* =====================================================
          TOOLBAR
      ====================================================== */}

      <div
        className="
          flex
          min-h-12
          flex-wrap
          items-center
          gap-1.5
          border-b
          border-neutral-200
          bg-[#FAF8F5]
          px-3
          py-2
        "
      >
        {/* HEADINGS */}

        <button
          type="button"
          className={toolbarButton(
            editor.isActive("heading", {
              level: 1,
            }),
          )}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({
                level: 1,
              })
              .run()
          }
          title="Tiêu đề H1"
          aria-label="Tiêu đề H1"
        >
          <span className="text-[11px] font-bold">
            H1
          </span>
        </button>

        <button
          type="button"
          className={toolbarButton(
            editor.isActive("heading", {
              level: 2,
            }),
          )}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({
                level: 2,
              })
              .run()
          }
          title="Tiêu đề H2"
          aria-label="Tiêu đề H2"
        >
          <span className="text-[11px] font-bold">
            H2
          </span>
        </button>

        <button
          type="button"
          className={toolbarButton(
            editor.isActive("heading", {
              level: 3,
            }),
          )}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({
                level: 3,
              })
              .run()
          }
          title="Tiêu đề H3"
          aria-label="Tiêu đề H3"
        >
          <span className="text-[11px] font-bold">
            H3
          </span>
        </button>

        <div className="mx-1.5 h-6 w-px bg-neutral-200" />

        {/* TEXT FORMAT */}

        <button
          type="button"
          className={toolbarButton(
            editor.isActive("bold"),
          )}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBold()
              .run()
          }
          title="In đậm"
          aria-label="In đậm"
        >
          <Bold className="h-4 w-4" />
        </button>

        <button
          type="button"
          className={toolbarButton(
            editor.isActive("italic"),
          )}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleItalic()
              .run()
          }
          title="In nghiêng"
          aria-label="In nghiêng"
        >
          <Italic className="h-4 w-4" />
        </button>

        <button
          type="button"
          className={toolbarButton(
            editor.isActive("underline"),
          )}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleUnderline()
              .run()
          }
          title="Gạch chân"
          aria-label="Gạch chân"
        >
          <UnderlineIcon className="h-4 w-4" />
        </button>

        <div className="mx-1.5 h-6 w-px bg-neutral-200" />

        {/* LIST */}

        <button
          type="button"
          className={toolbarButton(
            editor.isActive("bulletList"),
          )}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBulletList()
              .run()
          }
          title="Danh sách"
          aria-label="Danh sách"
        >
          <List className="h-4 w-4" />
        </button>

        <button
          type="button"
          className={toolbarButton(
            editor.isActive("orderedList"),
          )}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleOrderedList()
              .run()
          }
          title="Danh sách đánh số"
          aria-label="Danh sách đánh số"
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        {/* LINK */}

        <button
          type="button"
          className={toolbarButton(
            editor.isActive("link"),
          )}
          onClick={insertLink}
          title="Chèn liên kết"
          aria-label="Chèn liên kết"
        >
          <LinkIcon className="h-4 w-4" />
        </button>

        {/* IMAGE */}

        <label
          className={`${toolbarButton(
            false,
          )} cursor-pointer`}
          title="Chèn hình ảnh"
          aria-label="Chèn hình ảnh"
        >
          <ImagePlus className="h-4 w-4" />

          <input
            type="file"
            hidden
            accept="image/*"
            onChange={uploadImage}
          />
        </label>

        <div className="mx-1.5 h-6 w-px bg-neutral-200" />

        {/* UNDO */}

        <button
          type="button"
          className={toolbarButton(false, true)}
          onClick={() =>
            editor
              .chain()
              .focus()
              .undo()
              .run()
          }
          disabled={
            !editor.can().chain().focus().undo().run()
          }
          title="Hoàn tác"
          aria-label="Hoàn tác"
        >
          <Undo2 className="h-4 w-4" />
        </button>

        {/* REDO */}

        <button
          type="button"
          className={toolbarButton(false, true)}
          onClick={() =>
            editor
              .chain()
              .focus()
              .redo()
              .run()
          }
          disabled={
            !editor.can().chain().focus().redo().run()
          }
          title="Làm lại"
          aria-label="Làm lại"
        >
          <Redo2 className="h-4 w-4" />
        </button>
      </div>

      {/* =====================================================
          EDITOR
      ====================================================== */}

      <div
        className="
          bg-white
          px-5
          py-4
        "
      >
        <EditorContent
          editor={editor}
          className="
            tiptap
            max-w-none

            [&_.ProseMirror]:min-h-[320px]
            [&_.ProseMirror]:max-h-[420px]
            [&_.ProseMirror]:overflow-y-auto

            [&_.ProseMirror]:pr-3
            [&_.ProseMirror]:outline-none

            [&_.ProseMirror]:text-[15px]
            [&_.ProseMirror]:leading-7
            [&_.ProseMirror]:text-neutral-800

            [&_.ProseMirror_p]:mb-3

            [&_.ProseMirror_h1]:mb-4
            [&_.ProseMirror_h1]:text-2xl
            [&_.ProseMirror_h1]:font-bold
            [&_.ProseMirror_h1]:leading-tight
            [&_.ProseMirror_h1]:text-neutral-900

            [&_.ProseMirror_h2]:mb-3
            [&_.ProseMirror_h2]:text-xl
            [&_.ProseMirror_h2]:font-bold
            [&_.ProseMirror_h2]:leading-tight
            [&_.ProseMirror_h2]:text-neutral-900

            [&_.ProseMirror_h3]:mb-2
            [&_.ProseMirror_h3]:text-lg
            [&_.ProseMirror_h3]:font-semibold
            [&_.ProseMirror_h3]:leading-tight
            [&_.ProseMirror_h3]:text-neutral-900

            [&_.ProseMirror_ul]:mb-4
            [&_.ProseMirror_ul]:list-disc
            [&_.ProseMirror_ul]:pl-6

            [&_.ProseMirror_ol]:mb-4
            [&_.ProseMirror_ol]:list-decimal
            [&_.ProseMirror_ol]:pl-6

            [&_.ProseMirror_li]:mb-1

            [&_.ProseMirror_a]:text-[#2D6A4F]
            [&_.ProseMirror_a]:underline
            [&_.ProseMirror_a]:underline-offset-2

            [&_.ProseMirror_img]:my-4
            [&_.ProseMirror_img]:max-w-full
            [&_.ProseMirror_img]:rounded-xl
            [&_.ProseMirror_img]:border
            [&_.ProseMirror_img]:border-neutral-200

            [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none
            [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left
            [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0
            [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-neutral-400
            [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]
          "
        />
      </div>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <div
        className="
          flex
          items-center
          justify-between
          border-t
          border-neutral-100
          bg-neutral-50/70
          px-4
          py-2
          text-[11px]
          text-neutral-400
        "
      >
        <span>
          Nội dung sẽ hiển thị trên trang sản phẩm
        </span>

        <span>
          HTML
        </span>
      </div>
    </div>
  );
}