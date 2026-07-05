import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { convertWikiLinksToMarkdown } from '../../utils/wiki';

type MarkdownPreviewProps = {
  content: string;
  openOrCreateNoteByTitle: (noteTitle: string) => void;
};

function MarkdownPreview({
  content,
  openOrCreateNoteByTitle,
}: MarkdownPreviewProps) {
  return (
    <div className="preview">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
            if (href?.startsWith('#note/')) {
              const noteTitle = decodeURIComponent(href.replace('#note/', ''));

              return (
                <button
                  className="wiki-link"
                  onClick={(event) => {
                    event.preventDefault();
                    openOrCreateNoteByTitle(noteTitle);
                  }}
                >
                  {children}
                </button>
              );
            }

            return (
              <a href={href} target="_blank" rel="noreferrer">
                {children}
              </a>
            );
          },
        }}
      >
        {convertWikiLinksToMarkdown(content)}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownPreview;
