"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { useCallback, useEffect } from 'react';
import { 
  Bold, Italic, Underline as UnderlineIcon, AlignLeft, AlignCenter, 
  AlignRight, List, ListOrdered, Heading1, Heading2, 
  RemoveFormatting, Link2
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface TiptapEditorProps {
  content: string;
  onChange?: (content: string) => void;
  className?: string;
}

const TiptapEditor = ({ content, onChange, className }: TiptapEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image.configure({
        inline: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base mx-auto focus:outline-none p-4 min-h-[150px]',
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  // Update content when content prop changes externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={cn("border rounded-md flex flex-col", className)}>
      <div className="flex flex-wrap gap-1 p-2 border-b dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 rounded-t-md">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={cn(
            "p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800",
            editor.isActive('bold') ? 'bg-neutral-200 dark:bg-neutral-800' : ''
          )}
          type="button"
          aria-label="Bold"
        >
          <Bold size={16} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={cn(
            "p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800",
            editor.isActive('italic') ? 'bg-neutral-200 dark:bg-neutral-800' : ''
          )}
          type="button"
          aria-label="Italic"
        >
          <Italic size={16} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn(
            "p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800",
            editor.isActive('underline') ? 'bg-neutral-200 dark:bg-neutral-800' : ''
          )}
          type="button"
          aria-label="Underline"
        >
          <UnderlineIcon size={16} />
        </button>

        <div className="w-px h-6 mx-1 bg-neutral-300 dark:bg-neutral-700 self-center" />
        
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={cn(
            "p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800",
            editor.isActive('heading', { level: 1 }) ? 'bg-neutral-200 dark:bg-neutral-800' : ''
          )}
          type="button"
          aria-label="Heading 1"
        >
          <Heading1 size={16} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn(
            "p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800",
            editor.isActive('heading', { level: 2 }) ? 'bg-neutral-200 dark:bg-neutral-800' : ''
          )}
          type="button"
          aria-label="Heading 2"
        >
          <Heading2 size={16} />
        </button>

        <div className="w-px h-6 mx-1 bg-neutral-300 dark:bg-neutral-700 self-center" />
        
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            "p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800",
            editor.isActive('bulletList') ? 'bg-neutral-200 dark:bg-neutral-800' : ''
          )}
          type="button"
          aria-label="Bullet List"
        >
          <List size={16} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            "p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800",
            editor.isActive('orderedList') ? 'bg-neutral-200 dark:bg-neutral-800' : ''
          )}
          type="button"
          aria-label="Ordered List"
        >
          <ListOrdered size={16} />
        </button>

        <div className="w-px h-6 mx-1 bg-neutral-300 dark:bg-neutral-700 self-center" />
        
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={cn(
            "p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800",
            editor.isActive({ textAlign: 'left' }) ? 'bg-neutral-200 dark:bg-neutral-800' : ''
          )}
          type="button"
          aria-label="Align Left"
        >
          <AlignLeft size={16} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={cn(
            "p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800",
            editor.isActive({ textAlign: 'center' }) ? 'bg-neutral-200 dark:bg-neutral-800' : ''
          )}
          type="button"
          aria-label="Align Center"
        >
          <AlignCenter size={16} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={cn(
            "p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800",
            editor.isActive({ textAlign: 'right' }) ? 'bg-neutral-200 dark:bg-neutral-800' : ''
          )}
          type="button"
          aria-label="Align Right"
        >
          <AlignRight size={16} />
        </button>

        <div className="w-px h-6 mx-1 bg-neutral-300 dark:bg-neutral-700 self-center" />
        
        <button
          onClick={setLink}
          className={cn(
            "p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800",
            editor.isActive('link') ? 'bg-neutral-200 dark:bg-neutral-800' : ''
          )}
          type="button"
          aria-label="Link"
        >
          <Link2 size={16} />
        </button>

        <div className="flex-grow"></div>
        
        <button
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800"
          type="button"
          aria-label="Clear Formatting"
        >
          <RemoveFormatting size={16} />
        </button>
      </div>

      <EditorContent editor={editor} className="flex-grow" />
    </div>
  );
};

export default TiptapEditor;