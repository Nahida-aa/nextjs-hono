'use client'
import { useEffect, useRef, useState, type RefObject } from 'react';

  // 内容发送变化时自动滚动到底部
  // const chatView = messagesContainerRef.current
  // if (chatView)  chatView.scrollTop = chatView.scrollHeight - chatView.clientHeight;
export function useScrollToBottom<T extends HTMLElement>() {
  const containerRef = useRef<T>(null);
  const endRef = useRef<T>(null);

  useEffect(() => { // 在 组件 挂载时运行
    console.log('useScrollToBottom::useEffect');
    const container = containerRef.current;
    const end = endRef.current;

    if (container && end) {
      end.scrollIntoView({ behavior: 'instant', block: 'end' }); // 初始渲染时滚动到底部
      
      const observer = new MutationObserver(() => { // 创建一个 MutationObserver 实例，用于监听 container 元素的 DOM 变化
        end.scrollIntoView({ behavior: 'instant', block: 'end' });
      });

      observer.observe(container, { // 当 container 元素的子节点、属性或字符数据发生变化时，触发回调函数，将结束元素滚动到视图的底部
        childList: true, // 子节点
        subtree: true, // 子节点
        attributes: true, // 属性
        characterData: true, // 文本数据(节点)
      });

      return () => observer.disconnect(); // 在 组件 卸载时运行 停止监听
    }
  }, []);

  return [containerRef, endRef]; // 返回 containerRef 和 endRef，以便在组件中使用这些引用
}

export const useMsgScroll = ({
  msgLsRef, bottomRef, shouldLoadMore, loadMore, count,
}: {
  msgLsRef: RefObject<HTMLDivElement|null>,
  bottomRef: RefObject<HTMLDivElement|null>,
  shouldLoadMore: boolean,
  loadMore: () => void,
  count: number,
}) => {
  const [hasInitialized, setHasInitialized] = useState(false); // 状态用于跟踪是否已经初始化滚动到底部

  useEffect(() => { // 监听 msgLsRef 容器的滚动事件
    console.log('useMsgScroll::useEffect1');
    const topDiv = msgLsRef.current;

    const handleScroll = () => {
      const scrollTop = topDiv?.scrollTop;
      console.log('scrollTop:', scrollTop);
      if (scrollTop === 0 && shouldLoadMore) { //当容器滚动到顶部, shouldLoadMore=rue
        console.log('useMsgScroll::useEffect1::handleScroll');
        loadMore(); // 调用 loadMore 函数加载更多消息
      }
    }

    topDiv?.addEventListener('scroll', handleScroll); // 添加滚动事件监听

    return () => {
      topDiv?.removeEventListener('scroll', handleScroll); // 在组件卸载时移除滚动事件监听
    }

  }, [msgLsRef, shouldLoadMore, loadMore]); // 依赖数组是 useEffect 钩子的第二个参数，当依赖数组中的任何一个值发生变化时，useEffect 钩子就会重新运行

  useEffect(() => {
    const bottomDiv = bottomRef.current;
    const topDiv = msgLsRef.current;
    const shouldAutoScroll = () => {
      if (!hasInitialized && bottomDiv) {
        setHasInitialized(true);
        return true;
      }
      if (!topDiv) return false;

      const disconnectFromBottom = topDiv.scrollHeight - topDiv.scrollTop - topDiv.clientHeight;
      return disconnectFromBottom < 100;
    }

    if (shouldAutoScroll()) {
      setTimeout(() => {
        bottomDiv?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
    
  }, [msgLsRef, bottomRef, hasInitialized, count]);
}
