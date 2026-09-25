import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronDown,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Info,
  Plus,
  RefreshCw,
  Save,
  Settings2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/mega-menu")({
  component: MegaMenuAdminPage,
});

type Section = {
  id: string;
  menu_key: string;
  title: string;
  image_url: string | null;
  sort_order: number;
  is_visible: boolean;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
};

type Item = {
  id: string;
  group_id: string;
  category_id: string | null;
  label_override: string | null;
  sort_order: number;
  is_visible: boolean;
  categories: Category | null;
};

type Group = {
  id: string;
  section_id: string;
  title: string;
  category_id: string | null;
  image_url: string | null;
  sort_order: number;
  is_visible: boolean;
  mega_menu_items: Item[];
};

const fallbackSections = [
  { menu_key: "cases", title: "Cases & Bands", sort_order: 10 },
  { menu_key: "charging", title: "Charging", sort_order: 20 },
  { menu_key: "lifestyle", title: "Lifestyle Gear", sort_order: 30 },
];

function MegaMenuAdminPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [newItemCategory, setNewItemCategory] = useState<Record<string, string>>({});
  const [settingsOpen, setSettingsOpen] = useState<Record<string, boolean>>({});

  const sortedSections = useMemo(
    () => [...sections].sort((a, b) => a.sort_order - b.sort_order),
    [sections],
  );

  const groupsBySection = useMemo(() => {
    const map: Record<string, Group[]> = {};

    for (const group of groups) {
      if (!map[group.section_id]) map[group.section_id] = [];
      map[group.section_id].push(group);
    }

    Object.values(map).forEach((list) =>
      list.sort((a, b) => a.sort_order - b.sort_order),
    );

    return map;
  }, [groups]);

  async function loadData() {
    setLoading(true);

    try {
      const [sectionsRes, groupsRes, categoriesRes] = await Promise.all([
        supabase
          .from("mega_menu_sections")
          .select("*")
          .order("sort_order"),
        supabase
          .from("mega_menu_groups")
          .select(`
            id, section_id, title, category_id, image_url, sort_order, is_visible,
            mega_menu_items (
              id, group_id, category_id, label_override, sort_order, is_visible,
              categories ( id, name, slug, parent_id )
            )
          `)
          .order("sort_order"),
        supabase
          .from("categories")
          .select("id,name,slug,parent_id")
          .order("name"),
      ]);

      if (sectionsRes.error) throw sectionsRes.error;
      if (groupsRes.error) throw groupsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;

      let nextSections = (sectionsRes.data ?? []) as Section[];

      if (!nextSections.length) {
        const { data, error } = await supabase
          .from("mega_menu_sections")
          .insert(
            fallbackSections.map((item) => ({
              ...item,
              is_visible: true,
            })),
          )
          .select("*")
          .order("sort_order");

        if (error) throw error;
        nextSections = (data ?? []) as Section[];
      }

      setSections(nextSections);

      setGroups(
        ((groupsRes.data ?? []) as any[]).map((group) => ({
          ...group,
          mega_menu_items: [...(group.mega_menu_items ?? [])].sort(
            (a, b) => a.sort_order - b.sort_order,
          ),
        })),
      );

      setCategories((categoriesRes.data ?? []) as Category[]);
    } catch (error: any) {
      toast.error(error?.message || "Không thể tải Mega Menu.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function emitUpdated() {
    window.dispatchEvent(new Event("infibetter:mega-menu-updated"));
  }

  async function saveSection(section: Section) {
    setSavingId(section.id);

    try {
      const { error } = await supabase
        .from("mega_menu_sections")
        .update({
          title: section.title,
          image_url: section.image_url || null,
          sort_order: section.sort_order,
          is_visible: section.is_visible,
        })
        .eq("id", section.id);

      if (error) throw error;

      toast.success(`Đã lưu ${section.title}.`);
      emitUpdated();
    } catch (error: any) {
      toast.error(error?.message || "Không thể lưu menu.");
    } finally {
      setSavingId(null);
    }
  }

  async function saveGroup(group: Group) {
    setSavingId(group.id);

    try {
      const { error } = await supabase
        .from("mega_menu_groups")
        .update({
          title: group.title,
          category_id: group.category_id || null,
          image_url: group.image_url || null,
          sort_order: group.sort_order,
          is_visible: group.is_visible,
        })
        .eq("id", group.id);

      if (error) throw error;

      toast.success(`Đã lưu ${group.title}.`);
      emitUpdated();
    } catch (error: any) {
      toast.error(error?.message || "Không thể lưu nhóm.");
    } finally {
      setSavingId(null);
    }
  }

  async function addGroup(section: Section) {
    const current = groupsBySection[section.id] ?? [];

    const { data, error } = await supabase
      .from("mega_menu_groups")
      .insert({
        section_id: section.id,
        title: "Nhóm mới",
        sort_order: (current.at(-1)?.sort_order ?? 0) + 10,
        is_visible: true,
      })
      .select("id,section_id,title,category_id,image_url,sort_order,is_visible")
      .single();

    if (error) {
      toast.error(error.message);
      return;
    }

    setGroups((prev) => [
      ...prev,
      { ...(data as Group), mega_menu_items: [] },
    ]);

    toast.success("Đã thêm nhóm mới.");
  }

  async function deleteGroup(group: Group) {
    if (!window.confirm(`Xóa nhóm "${group.title}" khỏi Mega Menu?`)) return;

    const { error } = await supabase
      .from("mega_menu_groups")
      .delete()
      .eq("id", group.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    setGroups((prev) => prev.filter((item) => item.id !== group.id));
    toast.success("Đã xóa nhóm khỏi Mega Menu.");
    emitUpdated();
  }

  async function addItem(group: Group) {
    const categoryId = newItemCategory[group.id];

    if (!categoryId) {
      toast.error("Hãy chọn danh mục muốn thêm.");
      return;
    }

    const current = group.mega_menu_items ?? [];

    const { data, error } = await supabase
      .from("mega_menu_items")
      .insert({
        group_id: group.id,
        category_id: categoryId,
        sort_order: (current.at(-1)?.sort_order ?? 0) + 10,
        is_visible: true,
      })
      .select(`
        id, group_id, category_id, label_override, sort_order, is_visible,
        categories ( id, name, slug, parent_id )
      `)
      .single();

    if (error) {
      toast.error(error.message);
      return;
    }

    setGroups((prev) =>
      prev.map((item) =>
        item.id === group.id
          ? {
              ...item,
              mega_menu_items: [
                ...item.mega_menu_items,
                data as any,
              ],
            }
          : item,
      ),
    );

    setNewItemCategory((prev) => ({
      ...prev,
      [group.id]: "",
    }));

    toast.success("Đã thêm mục vào Mega Menu.");
    emitUpdated();
  }

  async function saveItem(item: Item) {
    setSavingId(item.id);

    try {
      const { error } = await supabase
        .from("mega_menu_items")
        .update({
          category_id: item.category_id || null,
          label_override: item.label_override || null,
          sort_order: item.sort_order,
          is_visible: item.is_visible,
        })
        .eq("id", item.id);

      if (error) throw error;

      toast.success("Đã lưu mục menu.");
      emitUpdated();
    } catch (error: any) {
      toast.error(error?.message || "Không thể lưu mục menu.");
    } finally {
      setSavingId(null);
    }
  }

  async function deleteItem(item: Item) {
    const label =
      item.label_override ||
      item.categories?.name ||
      "mục menu";

    if (!window.confirm(`Xóa "${label}" khỏi Mega Menu?`)) return;

    const { error } = await supabase
      .from("mega_menu_items")
      .delete()
      .eq("id", item.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    setGroups((prev) =>
      prev.map((group) => ({
        ...group,
        mega_menu_items: group.mega_menu_items.filter(
          (entry) => entry.id !== item.id,
        ),
      })),
    );

    toast.success(
      "Đã xóa khỏi Mega Menu. Danh mục và sản phẩm vẫn được giữ nguyên.",
    );
    emitUpdated();
  }

  async function moveItem(
    group: Group,
    item: Item,
    direction: -1 | 1,
  ) {
    const items = [...group.mega_menu_items].sort(
      (a, b) => a.sort_order - b.sort_order,
    );

    const index = items.findIndex((entry) => entry.id === item.id);
    const targetIndex = index + direction;

    if (
      index < 0 ||
      targetIndex < 0 ||
      targetIndex >= items.length
    ) {
      return;
    }

    const target = items[targetIndex];
    const currentOrder = item.sort_order;
    const targetOrder = target.sort_order;

    const [a, b] = await Promise.all([
      supabase
        .from("mega_menu_items")
        .update({ sort_order: targetOrder })
        .eq("id", item.id),
      supabase
        .from("mega_menu_items")
        .update({ sort_order: currentOrder })
        .eq("id", target.id),
    ]);

    if (a.error || b.error) {
      toast.error(
        a.error?.message ||
          b.error?.message ||
          "Không thể đổi thứ tự.",
      );
      return;
    }

    setGroups((prev) =>
      prev.map((entry) =>
        entry.id === group.id
          ? {
              ...entry,
              mega_menu_items: entry.mega_menu_items.map(
                (row) =>
                  row.id === item.id
                    ? {
                        ...row,
                        sort_order: targetOrder,
                      }
                    : row.id === target.id
                      ? {
                          ...row,
                          sort_order: currentOrder,
                        }
                      : row,
              ),
            }
          : entry,
      ),
    );

    emitUpdated();
  }

  async function moveGroup(
    section: Section,
    group: Group,
    direction: -1 | 1,
  ) {
    const list = [
      ...(groupsBySection[section.id] ?? []),
    ].sort((a, b) => a.sort_order - b.sort_order);

    const index = list.findIndex(
      (entry) => entry.id === group.id,
    );
    const targetIndex = index + direction;

    if (
      index < 0 ||
      targetIndex < 0 ||
      targetIndex >= list.length
    ) {
      return;
    }

    const target = list[targetIndex];
    const currentOrder = group.sort_order;
    const targetOrder = target.sort_order;

    const [a, b] = await Promise.all([
      supabase
        .from("mega_menu_groups")
        .update({ sort_order: targetOrder })
        .eq("id", group.id),
      supabase
        .from("mega_menu_groups")
        .update({ sort_order: currentOrder })
        .eq("id", target.id),
    ]);

    if (a.error || b.error) {
      toast.error(
        a.error?.message ||
          b.error?.message ||
          "Không thể đổi thứ tự.",
      );
      return;
    }

    setGroups((prev) =>
      prev.map((entry) =>
        entry.id === group.id
          ? {
              ...entry,
              sort_order: targetOrder,
            }
          : entry.id === target.id
            ? {
                ...entry,
                sort_order: currentOrder,
              }
            : entry,
      ),
    );

    emitUpdated();
  }

  function updateGroup(
    id: string,
    patch: Partial<Group>,
  ) {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === id
          ? { ...group, ...patch }
          : group,
      ),
    );
  }

  function updateItem(
    groupId: string,
    itemId: string,
    patch: Partial<Item>,
  ) {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
              ...group,
              mega_menu_items:
                group.mega_menu_items.map((item) =>
                  item.id === itemId
                    ? { ...item, ...patch }
                    : item,
                ),
            }
          : group,
      ),
    );
  }

  function toggleSettings(groupId: string) {
    setSettingsOpen((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F6F7F9] px-4 py-6">
        <div className="mx-auto max-w-[1500px]">
          <div className="h-7 w-40 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-4 w-80 animate-pulse rounded bg-slate-200" />
          <div className="mt-8 h-64 animate-pulse rounded-2xl bg-white" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6F7F9] px-3 py-4 sm:px-5 lg:px-6 lg:py-5">
      <div className="mx-auto max-w-[1500px]">
        {/* PAGE HEADER */}
        <header className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Settings2 size={16} />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-blue-600">
                  Header settings
                </p>
                <h1 className="text-lg font-bold tracking-tight text-slate-900">
                  Mega Menu
                </h1>
              </div>
            </div>

            <p className="mt-2 max-w-[760px] text-[11px] leading-5 text-slate-500">
              Đây là nơi chỉnh nội dung menu trên Header. Bạn có thể
              thêm, xóa, ẩn hoặc đổi thứ tự mà không ảnh hưởng đến
              danh mục và sản phẩm.
            </p>
          </div>

          <button
            type="button"
            onClick={loadData}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCw size={13} />
            Tải lại
          </button>
        </header>

        {/* SIMPLE GUIDE */}
        <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-2.5 text-[10px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
              1
            </span>
            Chọn nhóm muốn chỉnh
          </div>
          <div className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
              2
            </span>
            Sửa tên hoặc danh mục
          </div>
          <div className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
              3
            </span>
            Bấm Lưu
          </div>
          <div className="ml-auto hidden items-center gap-1.5 text-slate-400 lg:flex">
            <Info size={13} />
            Xóa ở đây chỉ xóa khỏi Header
          </div>
        </div>

        <div className="space-y-4">
          {sortedSections.map((section) => {
            const sectionGroups =
              groupsBySection[section.id] ?? [];

            return (
              <section
                key={section.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
              >
                {/* SECTION HEADER */}
                <div className="border-b border-slate-100 px-4 py-3">
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                    <div className="flex min-w-[180px] items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <input
                        value={section.title}
                        onChange={(e) =>
                          setSections((prev) =>
                            prev.map((item) =>
                              item.id === section.id
                                ? {
                                    ...item,
                                    title: e.target.value,
                                  }
                                : item,
                            ),
                          )
                        }
                        className="h-8 min-w-0 flex-1 rounded-lg border border-transparent bg-slate-50 px-2.5 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-200 focus:bg-white"
                      />
                    </div>

                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <div className="hidden h-8 items-center rounded-lg bg-slate-50 px-2.5 text-[10px] font-semibold text-slate-400 sm:flex">
                        Banner
                      </div>
                      <input
                        value={section.image_url ?? ""}
                        onChange={(e) =>
                          setSections((prev) =>
                            prev.map((item) =>
                              item.id === section.id
                                ? {
                                    ...item,
                                    image_url:
                                      e.target.value,
                                  }
                                : item,
                            ),
                          )
                        }
                        placeholder="URL ảnh banner — có thể bỏ trống"
                        className="h-8 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 text-[10px] text-slate-600 outline-none focus:border-blue-300"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setSections((prev) =>
                            prev.map((item) =>
                              item.id === section.id
                                ? {
                                    ...item,
                                    is_visible:
                                      !item.is_visible,
                                  }
                                : item,
                            ),
                          )
                        }
                        className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[10px] font-semibold ${
                          section.is_visible
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-slate-50 text-slate-400"
                        }`}
                      >
                        {section.is_visible ? (
                          <Eye size={12} />
                        ) : (
                          <EyeOff size={12} />
                        )}
                        {section.is_visible
                          ? "Đang hiện"
                          : "Đang ẩn"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          saveSection(section)
                        }
                        disabled={
                          savingId === section.id
                        }
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-[10px] font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Save size={12} />
                        {savingId === section.id
                          ? "Đang lưu"
                          : "Lưu"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* GROUPS */}
                <div className="p-3">
                  {sectionGroups.length ? (
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3">
                      {sectionGroups.map(
                        (group, groupIndex) => {
                          const children =
                            categories.filter(
                              (cat) =>
                                cat.parent_id ===
                                group.category_id,
                            );

                          const items = [
                            ...group.mega_menu_items,
                          ].sort(
                            (a, b) =>
                              a.sort_order -
                              b.sort_order,
                          );

                          return (
                            <article
                              key={group.id}
                              className={`rounded-xl border bg-slate-50/60 ${
                                group.is_visible
                                  ? "border-slate-200"
                                  : "border-slate-200 opacity-60"
                              }`}
                            >
                              {/* GROUP TITLE */}
                              <div className="flex items-center gap-1.5 border-b border-slate-200 bg-white px-2.5 py-2">
                                <input
                                  value={group.title}
                                  onChange={(e) =>
                                    updateGroup(
                                      group.id,
                                      {
                                        title:
                                          e.target
                                            .value,
                                      },
                                    )
                                  }
                                  className="h-7 min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1.5 text-[11px] font-bold text-slate-800 outline-none hover:bg-slate-50 focus:border-blue-200 focus:bg-white"
                                />

                                <button
                                  type="button"
                                  onClick={() =>
                                    updateGroup(
                                      group.id,
                                      {
                                        is_visible:
                                          !group.is_visible,
                                      },
                                    )
                                  }
                                  title={
                                    group.is_visible
                                      ? "Ẩn nhóm"
                                      : "Hiện nhóm"
                                  }
                                  className={`flex h-7 w-7 items-center justify-center rounded-md ${
                                    group.is_visible
                                      ? "text-emerald-600 hover:bg-emerald-50"
                                      : "text-slate-400 hover:bg-slate-100"
                                  }`}
                                >
                                  {group.is_visible ? (
                                    <Eye size={13} />
                                  ) : (
                                    <EyeOff
                                      size={13}
                                    />
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    moveGroup(
                                      section,
                                      group,
                                      -1,
                                    )
                                  }
                                  disabled={
                                    groupIndex === 0
                                  }
                                  title="Đưa sang trái"
                                  className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 disabled:opacity-25"
                                >
                                  <ArrowLeft
                                    size={12}
                                  />
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    moveGroup(
                                      section,
                                      group,
                                      1,
                                    )
                                  }
                                  disabled={
                                    groupIndex ===
                                    sectionGroups.length -
                                      1
                                  }
                                  title="Đưa sang phải"
                                  className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 disabled:opacity-25"
                                >
                                  <ArrowRight
                                    size={12}
                                  />
                                </button>
                              </div>

                              <div className="p-2.5">
                                {/* CATEGORY LINK */}
                                <div>
                                  <label className="mb-1 block text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">
                                    Nhóm này dẫn tới
                                  </label>

                                  <select
                                    value={
                                      group.category_id ??
                                      ""
                                    }
                                    onChange={(e) =>
                                      updateGroup(
                                        group.id,
                                        {
                                          category_id:
                                            e.target
                                              .value ||
                                            null,
                                        },
                                      )
                                    }
                                    className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-[10px] text-slate-700 outline-none focus:border-blue-300"
                                  >
                                    <option value="">
                                      Không liên kết
                                    </option>
                                    {categories.map(
                                      (cat) => (
                                        <option
                                          key={cat.id}
                                          value={cat.id}
                                        >
                                          {cat.name}
                                        </option>
                                      ),
                                    )}
                                  </select>
                                </div>

                                {/* ITEMS */}
                                <div className="mt-3">
                                  <div className="mb-1.5 flex items-center justify-between">
                                    <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">
                                      Các mục hiển thị
                                    </span>
                                    <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-400">
                                      {items.length}
                                    </span>
                                  </div>

                                  <div className="space-y-1.5">
                                    {items.map(
                                      (
                                        item,
                                        itemIndex,
                                      ) => (
                                        <div
                                          key={
                                            item.id
                                          }
                                          className={`rounded-lg border bg-white p-1.5 ${
                                            item.is_visible
                                              ? "border-slate-200"
                                              : "border-dashed border-slate-200 opacity-55"
                                          }`}
                                        >
                                          <div className="flex items-center gap-1.5">
                                            <div className="flex shrink-0 flex-col">
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  moveItem(
                                                    group,
                                                    item,
                                                    -1,
                                                  )
                                                }
                                                disabled={
                                                  itemIndex ===
                                                  0
                                                }
                                                className="flex h-4 w-5 items-center justify-center rounded text-slate-300 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-20"
                                                title="Lên"
                                              >
                                                <ArrowUp
                                                  size={
                                                    10
                                                  }
                                                />
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  moveItem(
                                                    group,
                                                    item,
                                                    1,
                                                  )
                                                }
                                                disabled={
                                                  itemIndex ===
                                                  items.length -
                                                    1
                                                }
                                                className="flex h-4 w-5 items-center justify-center rounded text-slate-300 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-20"
                                                title="Xuống"
                                              >
                                                <ArrowDown
                                                  size={
                                                    10
                                                  }
                                                />
                                              </button>
                                            </div>

                                            <select
                                              value={
                                                item.category_id ??
                                                ""
                                              }
                                              onChange={(
                                                e,
                                              ) => {
                                                const cat =
                                                  categories.find(
                                                    (
                                                      entry,
                                                    ) =>
                                                      entry.id ===
                                                      e
                                                        .target
                                                        .value,
                                                  ) ??
                                                  null;

                                                updateItem(
                                                  group.id,
                                                  item.id,
                                                  {
                                                    category_id:
                                                      e
                                                        .target
                                                        .value ||
                                                      null,
                                                    categories:
                                                      cat,
                                                  },
                                                );
                                              }}
                                              className="h-7 min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-1.5 text-[9px] text-slate-600 outline-none focus:border-blue-300"
                                            >
                                              <option value="">
                                                Chưa chọn
                                              </option>
                                              {(
                                                children.length
                                                  ? children
                                                  : categories
                                              ).map(
                                                (
                                                  cat,
                                                ) => (
                                                  <option
                                                    key={
                                                      cat.id
                                                    }
                                                    value={
                                                      cat.id
                                                    }
                                                  >
                                                    {
                                                      cat.name
                                                    }
                                                  </option>
                                                ),
                                              )}
                                            </select>

                                            <button
                                              type="button"
                                              onClick={() =>
                                                updateItem(
                                                  group.id,
                                                  item.id,
                                                  {
                                                    is_visible:
                                                      !item.is_visible,
                                                  },
                                                )
                                              }
                                              title={
                                                item.is_visible
                                                  ? "Ẩn mục"
                                                  : "Hiện mục"
                                              }
                                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                                                item.is_visible
                                                  ? "text-emerald-600 hover:bg-emerald-50"
                                                  : "text-slate-400 hover:bg-slate-100"
                                              }`}
                                            >
                                              {item.is_visible ? (
                                                <Eye
                                                  size={
                                                    12
                                                  }
                                                />
                                              ) : (
                                                <EyeOff
                                                  size={
                                                    12
                                                  }
                                                />
                                              )}
                                            </button>

                                            <button
                                              type="button"
                                              onClick={() =>
                                                saveItem(
                                                  item,
                                                )
                                              }
                                              disabled={
                                                savingId ===
                                                item.id
                                              }
                                              title="Lưu mục"
                                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-blue-600 hover:bg-blue-50 disabled:opacity-30"
                                            >
                                              <Save
                                                size={
                                                  12
                                                }
                                              />
                                            </button>

                                            <button
                                              type="button"
                                              onClick={() =>
                                                deleteItem(
                                                  item,
                                                )
                                              }
                                              title="Xóa khỏi Mega Menu"
                                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-red-400 hover:bg-red-50 hover:text-red-600"
                                            >
                                              <Trash2
                                                size={
                                                  12
                                                }
                                              />
                                            </button>
                                          </div>

                                          <input
                                            value={
                                              item.label_override ??
                                              ""
                                            }
                                            onChange={(
                                              e,
                                            ) =>
                                              updateItem(
                                                group.id,
                                                item.id,
                                                {
                                                  label_override:
                                                    e
                                                      .target
                                                      .value ||
                                                    null,
                                                },
                                              )
                                            }
                                            placeholder={
                                              item
                                                .categories
                                                ?.name ??
                                              "Tên hiển thị trên Header"
                                            }
                                            className="mt-1 h-6 w-full rounded-md border border-transparent bg-slate-50 px-2 text-[9px] text-slate-500 outline-none focus:border-blue-200 focus:bg-white"
                                          />
                                        </div>
                                      ),
                                    )}

                                    {!items.length && (
                                      <div className="rounded-lg border border-dashed border-slate-200 bg-white px-3 py-4 text-center">
                                        <p className="text-[10px] font-medium text-slate-400">
                                          Chưa có mục nào
                                        </p>
                                        <p className="mt-0.5 text-[9px] text-slate-300">
                                          Thêm danh mục bên dưới
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* ADD ITEM */}
                                <div className="mt-2 flex gap-1.5">
                                  <select
                                    value={
                                      newItemCategory[
                                        group.id
                                      ] ?? ""
                                    }
                                    onChange={(e) =>
                                      setNewItemCategory(
                                        (prev) => ({
                                          ...prev,
                                          [group.id]:
                                            e.target
                                              .value,
                                        }),
                                      )
                                    }
                                    className="h-8 min-w-0 flex-1 rounded-lg border border-dashed border-slate-300 bg-white px-2 text-[9px] text-slate-500 outline-none focus:border-blue-300"
                                  >
                                    <option value="">
                                      + Chọn danh mục
                                    </option>
                                    {(
                                      children.length
                                        ? children
                                        : categories
                                    ).map((cat) => (
                                      <option
                                        key={cat.id}
                                        value={cat.id}
                                      >
                                        {cat.name}
                                      </option>
                                    ))}
                                  </select>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      addItem(group)
                                    }
                                    className="flex h-8 shrink-0 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-[9px] font-bold text-slate-700 hover:bg-slate-50"
                                  >
                                    <Plus size={11} />
                                    Thêm
                                  </button>
                                </div>

                                {/* ADVANCED */}
                                <div className="mt-2 border-t border-slate-200 pt-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      toggleSettings(
                                        group.id,
                                      )
                                    }
                                    className="flex w-full items-center justify-between rounded-md px-1 py-1 text-[9px] font-semibold text-slate-400 hover:bg-white hover:text-slate-600"
                                  >
                                    <span className="flex items-center gap-1">
                                      <Settings2
                                        size={11}
                                      />
                                      Cài đặt nâng cao
                                    </span>
                                    <ChevronDown
                                      size={11}
                                      className={
                                        settingsOpen[
                                          group.id
                                        ]
                                          ? "rotate-180"
                                          : ""
                                      }
                                    />
                                  </button>

                                  {settingsOpen[
                                    group.id
                                  ] && (
                                    <div className="mt-2 space-y-2 rounded-lg bg-white p-2">
                                      <div>
                                        <label className="mb-1 flex items-center gap-1 text-[9px] font-semibold text-slate-400">
                                          <ImageIcon
                                            size={10}
                                          />
                                          Ảnh nhóm
                                        </label>
                                        <input
                                          value={
                                            group.image_url ??
                                            ""
                                          }
                                          onChange={(e) =>
                                            updateGroup(
                                              group.id,
                                              {
                                                image_url:
                                                  e
                                                    .target
                                                    .value,
                                              },
                                            )
                                          }
                                          placeholder="https://..."
                                          className="h-7 w-full rounded-md border border-slate-200 px-2 text-[9px] outline-none focus:border-blue-300"
                                        />
                                      </div>

                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1 text-[9px] text-slate-400">
                                          <Info size={10} />
                                          Lưu thay đổi của nhóm
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() =>
                                            saveGroup(
                                              group,
                                            )
                                          }
                                          disabled={
                                            savingId ===
                                            group.id
                                          }
                                          className="inline-flex h-7 items-center gap-1 rounded-md bg-slate-900 px-2.5 text-[9px] font-bold text-white disabled:opacity-50"
                                        >
                                          <Save
                                            size={10}
                                          />
                                          {savingId ===
                                          group.id
                                            ? "Đang lưu"
                                            : "Lưu nhóm"}
                                        </button>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          deleteGroup(
                                            group,
                                          )
                                        }
                                        className="flex h-7 w-full items-center justify-center gap-1 rounded-md border border-red-100 text-[9px] font-semibold text-red-500 hover:bg-red-50"
                                      >
                                        <Trash2 size={10} />
                                        Xóa nhóm khỏi Header
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </article>
                          );
                        },
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                      <p className="text-xs font-semibold text-slate-500">
                        Menu này chưa có nhóm
                      </p>
                      <p className="mt-1 text-[10px] text-slate-400">
                        Bấm “Thêm nhóm” để bắt đầu.
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => addGroup(section)}
                    className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-white px-3 text-[10px] font-bold text-slate-500 transition hover:border-blue-300 hover:text-blue-600"
                  >
                    <Plus size={12} />
                    Thêm nhóm vào {section.title}
                  </button>
                </div>
              </section>
            );
          })}
        </div>

        <footer className="py-5 text-center text-[9px] text-slate-300">
          INFIBETTER · Mega Menu Manager
        </footer>
      </div>
    </main>
  );
}
