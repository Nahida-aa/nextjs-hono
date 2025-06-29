import useSWRInfinite from 'swr/infinite';
import { useState } from 'react';
import { fetcher } from '~/lib/utils';
import { useSocket } from '~/components/providers/socket-provider';
import { MsgLsCursor, MsgLsCursorI } from '~/lib/routes/chats/messages';

export const useMsgQuery = (apiUrl: string) => {
  const { isConnected } = useSocket()
  const getKey = (pageIndex: number, previousPageData: MsgLsCursor) => {
    // if (previousPageData && !previousPageData.items.length) return null; // 没有更多数据
    if (previousPageData) {
      if (!previousPageData.next_cursor) return null; // 没有更多数据
      const { id, created_at } = previousPageData.next_cursor
      return `${apiUrl}?limit=10&cursor_id=${id}&cursor_created_at=${created_at}`
    }
    // 在首页时，没有 `previousPageData`
    if (pageIndex === 0) return apiUrl;
  }
  const { data, error, isLoading, size, setSize, mutate } = useSWRInfinite<MsgLsCursorI>(getKey, fetcher, {
    revalidateOnFocus: false, //窗口聚焦时自动重新验证
    refreshInterval: isConnected ? 0 : 1000, // if have ws 则不轮询
    // refreshInterval: 1000, // if have ws 则不轮询
  });

  const hasNextPage: boolean = data ? data[size - 1]?.next_cursor ? true : false : false

  const fetchNextPage = () => {
    setSize(size + 1);
    console.log('fetchNextPage::size', size)
    console.log('fetchNextPage::data', data)
  }

  return {
    data, error, isLoading, size, setSize, mutate, hasNextPage, fetchNextPage
  };
}

