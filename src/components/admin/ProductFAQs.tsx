import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Plus,
  Save,
  Trash2,
  HelpCircle,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

interface ProductFAQ {
  id: string;
  product_id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_visible: boolean;
}

interface ProductFAQsProps {
  productId?: string;
}

const emptyFAQ = {
  question: "",
  answer: "",
  is_visible: true,
};

export default function ProductFAQs({ productId }: ProductFAQsProps) {
  const [items, setItems] = useState<ProductFAQ[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function loadFAQs() {
    if (!productId) {
      setItems([]);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("product_faqs")
      .select(
        "id, product_id, question, answer, sort_order, is_visible"
      )
      .eq("product_id", productId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.error("LOAD PRODUCT FAQ ERROR:", error);
      setLoading(false);
      return;
    }

    setItems((data ?? []) as ProductFAQ[]);
    setLoading(false);
  }

  useEffect(() => {
    loadFAQs();
  }, [productId]);

  function updateLocal(
    id: string,
    field: keyof ProductFAQ,
    value: string | boolean,
  ) {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  }

  async function saveFAQ(item: ProductFAQ) {
    if (!item.question.trim() || !item.answer.trim()) {
      alert("Please enter both the question and answer.");
      return;
    }

    setSavingId(item.id);

    const { error } = await supabase
      .from("product_faqs")
      .update({
        question: item.question.trim(),
        answer: item.answer.trim(),
        is_visible: item.is_visible,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id);

    setSavingId(null);

    if (error) {
      console.error("SAVE PRODUCT FAQ ERROR:", error);
      alert(error.message);
      return;
    }

    await loadFAQs();
  }

  async function addFAQ() {
    if (!productId) {
      alert("Please save the product first, then add FAQs.");
      return;
    }

    setCreating(true);

    const nextSort =
      items.length > 0
        ? Math.max(...items.map((item) => Number(item.sort_order) || 0)) + 1
        : 0;

    const { data, error } = await supabase
      .from("product_faqs")
      .insert({
        product_id: productId,
        question: emptyFAQ.question,
        answer: emptyFAQ.answer,
        is_visible: emptyFAQ.is_visible,
        sort_order: nextSort,
      })
      .select(
        "id, product_id, question, answer, sort_order, is_visible"
      )
      .single();

    setCreating(false);

    if (error) {
      console.error("CREATE PRODUCT FAQ ERROR:", error);
      alert(error.message);
      return;
    }

    setItems((current) => [...current, data as ProductFAQ]);
  }

  async function deleteFAQ(id: string) {
    if (!confirm("Delete this FAQ?")) return;

    const { error } = await supabase
      .from("product_faqs")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("DELETE PRODUCT FAQ ERROR:", error);
      alert(error.message);
      return;
    }

    setItems((current) => current.filter((item) => item.id !== id));
  }

  async function moveFAQ(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= items.length) return;

    const next = [...items];
    [next[index], next[targetIndex]] = [
      next[targetIndex],
      next[index],
    ];

    const normalized = next.map((item, position) => ({
      ...item,
      sort_order: position,
    }));

    setItems(normalized);

    const updates = normalized.map((item) =>
      supabase
        .from("product_faqs")
        .update({
          sort_order: item.sort_order,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id),
    );

    const results = await Promise.all(updates);
    const failed = results.find((result) => result.error);

    if (failed?.error) {
      console.error("REORDER PRODUCT FAQ ERROR:", failed.error);
      await loadFAQs();
    }
  }

  if (!productId) {
    return (
      <section className="rounded-2xl border border-neutral-200 bg-white">
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100">
            <HelpCircle className="h-4 w-4 text-neutral-600" />
          </div>

          <div>
            <h2 className="text-sm font-bold text-neutral-900">
              Product FAQs
            </h2>
            <p className="text-[11px] text-neutral-500">
              Save the product first to add product-specific questions.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white">
      <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
            <HelpCircle className="h-4 w-4 text-neutral-700" />
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-bold text-neutral-900">
              Product FAQs
              <span className="ml-2 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600">
                {items.length}
              </span>
            </h2>

            <p className="mt-0.5 text-[11px] text-neutral-500">
              Questions and answers shown in “Need to know more?”
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={addFAQ}
          disabled={creating}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-neutral-900 px-3.5 text-[11px] font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
          {creating ? "Adding..." : "Add FAQ"}
        </button>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="rounded-xl border border-dashed border-neutral-200 py-10 text-center text-xs text-neutral-500">
            Loading FAQs...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50/60 py-10 text-center">
            <HelpCircle className="mx-auto h-5 w-5 text-neutral-400" />
            <p className="mt-2 text-xs font-medium text-neutral-700">
              No FAQs yet
            </p>
            <p className="mt-1 text-[11px] text-neutral-500">
              Add product-specific questions and answers.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="rounded-xl border border-neutral-200 bg-white"
              >
                <div className="flex items-center justify-between gap-3 border-b border-neutral-100 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-neutral-300" />
                    <span className="text-[11px] font-semibold text-neutral-700">
                      FAQ #{index + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveFAQ(index, "up")}
                      className="grid h-7 w-7 place-items-center rounded-lg text-neutral-500 hover:bg-neutral-100 disabled:opacity-25"
                      title="Move up"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      disabled={index === items.length - 1}
                      onClick={() => moveFAQ(index, "down")}
                      className="grid h-7 w-7 place-items-center rounded-lg text-neutral-500 hover:bg-neutral-100 disabled:opacity-25"
                      title="Move down"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteFAQ(item.id)}
                      className="grid h-7 w-7 place-items-center rounded-lg text-neutral-400 hover:bg-red-50 hover:text-red-600"
                      title="Delete FAQ"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 p-4">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                      Question
                    </label>

                    <input
                      value={item.question}
                      onChange={(event) =>
                        updateLocal(
                          item.id,
                          "question",
                          event.target.value,
                        )
                      }
                      placeholder="e.g. Does it support MagSafe charging?"
                      className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-xs text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                      Answer
                    </label>

                    <textarea
                      value={item.answer}
                      onChange={(event) =>
                        updateLocal(
                          item.id,
                          "answer",
                          event.target.value,
                        )
                      }
                      rows={4}
                      placeholder="Write a clear, product-specific answer..."
                      className="w-full resize-y rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-xs leading-5 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <label className="flex cursor-pointer items-center gap-2 text-[11px] text-neutral-700">
                      <input
                        type="checkbox"
                        checked={item.is_visible}
                        onChange={(event) =>
                          updateLocal(
                            item.id,
                            "is_visible",
                            event.target.checked,
                          )
                        }
                        className="h-3.5 w-3.5 rounded border-neutral-300"
                      />
                      Show on product page
                    </label>

                    <button
                      type="button"
                      onClick={() => saveFAQ(item)}
                      disabled={savingId === item.id}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-neutral-900 px-3 text-[11px] font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Save className="h-3.5 w-3.5" />
                      {savingId === item.id ? "Saving..." : "Save FAQ"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
