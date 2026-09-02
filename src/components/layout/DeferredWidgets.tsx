'use client';  
  
import dynamic from 'next/dynamic';  
  
const ChatWidget = dynamic(() => import('@/components/chat/ChatWidget'), { ssr: false });  
const BackToTop = dynamic(() => import('@/components/BackToTop'), { ssr: false });  
  
export default function DeferredWidgets({  
  chatEnabled,  
  chatStoreName,  
  chatStoreIcon,  
}: {  
  chatEnabled: boolean;  
  chatStoreName: string;  
  chatStoreIcon: string;  
}) {  
  return (  
    <>  
      <ChatWidget  
        enabled={chatEnabled}  
        storeName={chatStoreName}  
        storeIcon={chatStoreIcon}  
      />  
      <BackToTop />  
    </>  
  );  
} 
