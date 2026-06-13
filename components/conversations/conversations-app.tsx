"use client";

import { useState } from "react";
import { CONVERSATIONS, conversationById } from "@/lib/conversation-data";
import { ConversationList } from "@/components/conversations/conversation-list";
import { ConversationDetail } from "@/components/conversations/conversation-detail";
import { ContextDrawer } from "@/components/conversations/context-drawer";

export function ConversationsApp() {
  const [activeId, setActiveId] = useState(CONVERSATIONS[0]?.id ?? "");
  const [contextOpen, setContextOpen] = useState(true);
  const cv = conversationById(activeId);

  return (
    <div className="flex h-full min-w-0">
      <ConversationList activeId={activeId} onSelect={setActiveId} />
      {cv ? (
        <>
          <ConversationDetail
            cv={cv}
            contextOpen={contextOpen}
            onToggleContext={() => setContextOpen((o) => !o)}
          />
          {contextOpen ? <ContextDrawer cv={cv} /> : null}
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center text-slate-400">
          Select a conversation
        </div>
      )}
    </div>
  );
}
