import { Box } from '@mantine/core';
import { useFloatingChatStore } from '../../stores/chatStore';
import { ChatWindow } from './ChatWindow';

export function ChatWindows() {
  const { getOpenChatWindows } = useFloatingChatStore();
  const openWindows = getOpenChatWindows();

  return (
    <Box style={{ pointerEvents: 'auto' }}>
      {openWindows.map((window) => (
        <ChatWindow
          key={window.id}
          conversationId={window.conversationId}
          position={window.position}
          size={window.size}
          zIndex={window.zIndex}
        />
      ))}
    </Box>
  );
}
