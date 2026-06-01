"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  Heading2, Heading3, Quote, Undo2, Redo2,
} from "lucide-react";

interface Props {
  value: string;
  onChange: (html: string) => void;
}

const ToolButton = ({
  onClick, active, children, label,
}: {
  onClick: () => void; active: boolean; children: React.ReactNode; label: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={label}
    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
      active
        ? "bg-brand-copper/20 text-brand-copper"
        : "text-slate-500 hover:bg-brand-copper/10 hover:text-brand-copper"
    }`}
  >
    {children}
  </button>
);

export default function RichTextEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[280px] px-4 py-3 focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) return null;

  return (
    <div className="bg-cream border border-brand-copper/20 rounded-lg overflow-hidden">
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-brand-copper/10 bg-white flex-wrap">
        <ToolButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} label="Negrita">
          <Bold className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} label="Cursiva">
          <Italic className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} label="Subrayado">
          <UnderlineIcon className="w-4 h-4" />
        </ToolButton>

        <span className="w-px h-5 bg-brand-copper/10 mx-1" />

        <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} label="Título H2">
          <Heading2 className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} label="Título H3">
          <Heading3 className="w-4 h-4" />
        </ToolButton>

        <span className="w-px h-5 bg-brand-copper/10 mx-1" />

        <ToolButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} label="Lista">
          <List className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} label="Lista numerada">
          <ListOrdered className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} label="Cita">
          <Quote className="w-4 h-4" />
        </ToolButton>

        <span className="w-px h-5 bg-brand-copper/10 mx-1" />

        <ToolButton onClick={() => editor.chain().focus().undo().run()} active={false} label="Deshacer">
          <Undo2 className="w-4 h-4" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().redo().run()} active={false} label="Rehacer">
          <Redo2 className="w-4 h-4" />
        </ToolButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
