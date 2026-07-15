import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TipTapImage from '@tiptap/extension-image';
import TipTapLink from '@tiptap/extension-link';
import { useEffect, useRef, useCallback } from 'react';

interface Props {
  value: string;
  onChange: (html: string) => void;
}

export default function BlogEditor({ value, onChange }: Props) {
  const hasLoaded = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TipTapImage.configure({ inline: false, allowBase64: false }),
      TipTapLink.configure({ openOnClick: false }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Load existing content once (for edit page)
  useEffect(() => {
    if (editor && value && !hasLoaded.current) {
      editor.commands.setContent(value);
      hasLoaded.current = true;
    }
  }, [editor, value]);

  const insertImage = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !editor) return;
      const fd = new FormData();
      fd.append('image', file);
      try {
        const r = await fetch('/api/upload', { method: 'POST', body: fd });
        if (!r.ok) throw new Error();
        const { url } = await r.json();
        editor.chain().focus().setImage({ src: url }).run();
      } catch {
        alert('Image upload failed. Try again.');
      }
    };
    input.click();
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Enter URL:', previous ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
        <Btn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>Bold</Btn>
        <Btn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>Italic</Btn>
        <Sep />
        <Btn active={editor.isActive('heading', { level: 2 })} onClick={() => { const a = editor.state.selection.anchor; editor.chain().focus().setTextSelection(a).toggleHeading({ level: 2 }).run(); }}>H2</Btn>
        <Btn active={editor.isActive('heading', { level: 3 })} onClick={() => { const a = editor.state.selection.anchor; editor.chain().focus().setTextSelection(a).toggleHeading({ level: 3 }).run(); }}>H3</Btn>
        <Btn active={editor.isActive('heading', { level: 4 })} onClick={() => { const a = editor.state.selection.anchor; editor.chain().focus().setTextSelection(a).toggleHeading({ level: 4 }).run(); }}>H4</Btn>
        <Sep />
        <Btn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>• Bullet</Btn>
        <Btn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. Numbered</Btn>
        <Sep />
        <Btn active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>❝ Quote</Btn>
        <Btn active={false} onClick={() => editor.chain().focus().setHorizontalRule().run()}>― Divider</Btn>
        <Sep />
        <Btn active={editor.isActive('link')} onClick={setLink}>🔗 Link</Btn>
        <Btn active={false} onClick={insertImage}>🖼 Image</Btn>
      </div>

      {/* Editor area */}
      <EditorContent
        editor={editor}
        className="blog-editor-content"
        onPaste={() => {
          // Collapse selection after paste so heading/format buttons only affect
          // the current paragraph, not the entire pasted block.
          setTimeout(() => {
            editor?.commands.setTextSelection(editor.state.selection.to);
          }, 0);
        }}
      />
    </div>
  );
}

function Btn({ active, onClick, children }: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 text-sm rounded font-medium transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="w-px h-5 bg-gray-300 mx-0.5" />;
}
