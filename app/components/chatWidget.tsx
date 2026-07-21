import {useEffect, useRef, useState} from 'react';
import {IoSend} from 'react-icons/io5';
import {AiOutlineClose} from 'react-icons/ai';

interface ChatBlock {
  // user is optional — AI-only blocks can have user = null
  user?: string | null;
  responses: string[];
}

const WELCOME_MESSAGES = [
  'Hi there! 👋, my name is Zetu AI. I can help you with product discovery, order inquiries, quick FAQs on refunds, exchanges, and delivery timelines, vendor onboarding inquiries, and so much more anytime 24/7!',
  'How can I assist you today?',
];

export default function ChatWidget() {
  // Initialize blocks from localStorage so we don't lose them on reload
  const [blocks, setBlocks] = useState<ChatBlock[]>(() => {
    const saved = localStorage.getItem('zetu-chat-blocks');
    if (!saved) return [];
    try {
      return JSON.parse(saved) as ChatBlock[];
    } catch {
      return [];
    }
  });

  const chatRef = useRef<HTMLDivElement | null>(null);
  const toggleBtnRef = useRef<HTMLButtonElement | null>(null);

  // sessionId comes from storage if present; otherwise null until we create one
  const [sessionId, setSessionId] = useState<string | null>(() => {
    return localStorage.getItem('zetu-chat-session');
  });

  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // spacer ref at end so scrolling includes bottom padding
  const bottomSpacerRef = useRef<HTMLDivElement | null>(null);

  // Close when clicking outside (but ignore toggle button)
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        chatRef.current &&
        !chatRef.current.contains(target) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Persist blocks whenever they change
  useEffect(() => {
    localStorage.setItem('zetu-chat-blocks', JSON.stringify(blocks));
  }, [blocks]);

  // When chat opens for the first time and there's no sessionId -> create session & seed welcome messages
  // useEffect(() => {
  //   if (!isOpen) return;

  //   if (!sessionId) {
  //     // create new session
  //     const newId =
  //       (window.crypto?.randomUUID?.() as string) ??
  //       `sess-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  //     localStorage.setItem('zetu-chat-session', newId);
  //     setSessionId(newId);

  //     // If there are already saved blocks, keep them; otherwise seed welcome block
  //     const saved = localStorage.getItem('zetu-chat-blocks');
  //     if (!saved) {
  //       const initialBlocks: ChatBlock[] = [
  //         {user: null, responses: WELCOME_MESSAGES},
  //       ];
  //       setBlocks(initialBlocks);
  //       // localStorage will be updated by the blocks effect, but set here for immediacy
  //       localStorage.setItem('zetu-chat-blocks', JSON.stringify(initialBlocks));
  //     }
  //   }
  //   // only run when isOpen changes
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isOpen]);
  // When chat opens for the first time and there's no sessionId -> create session & seed welcome messages
  useEffect(() => {
    if (!isOpen) return;

    if (!sessionId) {
      // create new session
      const newId =
        (window.crypto?.randomUUID?.() as string) ??
        `sess-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem('zetu-chat-session', newId);
      setSessionId(newId);

      // check if blocks exist and are non-empty
      // check if blocks exist and are non-empty
      const saved = localStorage.getItem('zetu-chat-blocks');
      let parsed: ChatBlock[] = [];

      if (saved) {
        try {
          parsed = JSON.parse(saved) as ChatBlock[];
        } catch {
          parsed = []; // fallback if corrupted JSON
        }
      }

      if (parsed.length === 0) {
        const initialBlocks: ChatBlock[] = [
          {user: null, responses: WELCOME_MESSAGES},
        ];
        setBlocks(initialBlocks);
        localStorage.setItem('zetu-chat-blocks', JSON.stringify(initialBlocks));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Listen for other tabs deleting the session key (storage event)
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      // if session key removed in another tab, clear local blocks too
      if (e.key === 'zetu-chat-session' && e.newValue === null) {
        // clear local chat history and session
        setBlocks([]);
        localStorage.removeItem('zetu-chat-blocks');
        setSessionId(null);
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // scroll into view (bottom spacer) when blocks change OR when chat opens
  useEffect(() => {
    if (!isOpen) return;
    // small timeout lets layout settle; optional
    requestAnimationFrame(() => {
      bottomSpacerRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    });
  }, [blocks, isOpen]);

  // Helper: clear session and chat (Reset button)
  const clearSessionAndStartNew = () => {
    // remove from localStorage
    localStorage.removeItem('zetu-chat-session');
    localStorage.removeItem('zetu-chat-blocks');

    // clear local state
    setBlocks([]);
    setSessionId(null);

    // Immediately create a new session and seed welcome messages (keeps UX consistent)
    const newId =
      (window.crypto?.randomUUID?.() as string) ??
      `sess-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('zetu-chat-session', newId);
    setSessionId(newId);

    const initialBlocks: ChatBlock[] = [
      {user: null, responses: WELCOME_MESSAGES},
    ];
    setBlocks(initialBlocks);
    localStorage.setItem('zetu-chat-blocks', JSON.stringify(initialBlocks));
  };

  const sendMessage = async () => {
    const msg = input.trim();
    if (!msg) return;

    let sid = sessionId;
    if (!sid) {
      sid =
        (window.crypto?.randomUUID?.() as string) ??
        `sess-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem('zetu-chat-session', sid);
      setSessionId(sid);
    }

    setInput('');
    setBlocks((prev) => [...prev, {user: msg, responses: []}]);

    // show typing bubble
    setIsTyping(true);

    try {
      const res = await fetch('https://automate.shopzetu.com/webhook/chat-ai', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({chatInput: msg, sessionId: sid}),
      });

      const data: any = await res.json();

      setBlocks((prev) => {
        const updated = [...prev];
        const lastIndex = Math.max(0, updated.length - 1);
        updated[lastIndex] = {
          ...updated[lastIndex],
          responses: [...updated[lastIndex].responses, data.html ?? '…'],
        };
        return updated;
      });
    } catch (err) {
      setBlocks((prev) => {
        const updated = [...prev];
        const lastIndex = Math.max(0, updated.length - 1);
        updated[lastIndex] = {
          ...updated[lastIndex],
          responses: [
            ...updated[lastIndex].responses,
            '⚠️ Failed to reach server',
          ],
        };
        return updated;
      });
    } finally {
      // remove typing bubble
      setIsTyping(false);
    }
  };

  return (
    <div>
      {/* Floating toggle button */}
      <button
        ref={toggleBtnRef}
        onClick={() => setIsOpen((s) => !s)}
        className="fixed cursor-pointer bottom-4 right-2 md:right-4 z-50 bg-gradient-to-br from-indigo-800 via-purple-900 to-pink-600 border border-cyan-500 text-white rounded-full p-3 shadow-lg w-14 h-14 flex items-center justify-center"
      >
        {isOpen ? (
          <span className="text-2xl font-bold">
            <AiOutlineClose size={24} />
          </span>
        ) : (
          <img
            src="https://cdn.shopify.com/s/files/1/0621/5162/2875/files/ai-icon.png?v=1759061169" // put your AI image here (public folder or CDN link)
            alt="AI"
            className="w-12 h-12 object-cover"
          />
        )}
      </button>

     {/* https://cdn.shopify.com/s/files/1/0621/5162/2875/files/AI-CON.jpg?v=1759230416 */}

      {/* Chat window */}
      {isOpen && (
        <div
          ref={chatRef}
          className="fixed bottom-18 inset-x-4 md:inset-auto md:right-4 md:bottom-14 md:w-96 h-[88%] md:h-[82%] max-w-md mx-auto bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-80"
        >
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 font-semibold flex justify-between items-center">
            <span>Zetu AI</span>
            <div className="flex gap-2 items-center">
              <button
                title="Reset session (clear chat)"
                onClick={clearSessionAndStartNew}
                className="text-sm px-2 py-1 rounded bg-blue-500/90 hover:bg-blue-500/70"
              >
                New session
              </button>
              <button
                className="text-lg font-bold hover:text-gray-200"
                onClick={() => setIsOpen(false)}
              >
                ×
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto pb-8">
            {blocks.map((block, i) => (
              <div key={i} className="chat-block">
                {/* show user bubble only if present */}
                {block.user ? (
                  <div className="p-3 rounded-lg rounded-br-none max-w-[80%] text-sm leading-relaxed ml-auto bg-lime-400">
                    {block.user}
                  </div>
                ) : null}

                {/* AI responses */}
                {block.responses.map((r, j) => (
                  // <div
                  //   key={j}
                  //   className="p-3 rounded-lg rounded-tl-none rounded-br-none max-w-[90%] text-sm leading-relaxed mr-auto bg-purple-100 mt-1 prose prose-sm"
                  //   dangerouslySetInnerHTML={{ __html: r }}
                  // />
                  <div
                    key={j}
                    className="p-3 rounded-lg rounded-tl-none rounded-br-none max-w-[90%] md:text-md leading-relaxed mr-auto bg-purple-100 mt-1 [&_a]:text-blue-600 [&_a]:underline [&_a:hover]:text-blue-800 [&_a:visited]:text-purple-600"
                    dangerouslySetInnerHTML={{__html: r}}
                  />
                ))}

                {/* Typing bubble ONLY after the last block */}
                {isTyping && i === blocks.length - 1 && (
                  <div className="p-3 rounded-lg rounded-tl-none rounded-br-none max-w-[80%] text-sm leading-relaxed mr-auto bg-green-100 mt-1 italic text-gray-500">
                    Typing<span className="animate-pulse">...</span>
                  </div>
                )}
              </div>
            ))}

            {/* spacer so scrolling goes past the last message */}
            <div ref={bottomSpacerRef} className="h-20" />
          </div>

          {/* Input */}
          <div className="flex border-t">
            <input
              className="flex-1 mx-2 outline-none text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
              className="bg-blue-500 text-white px-5 text-sm font-medium"
              onClick={sendMessage}
            >
              <IoSend />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
