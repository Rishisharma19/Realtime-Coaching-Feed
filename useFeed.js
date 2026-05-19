"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { feedApi } from "../lib/api";
import { connectSocket } from "../lib/socket";

export const useFeed = () => {
  const [feeds, setFeeds] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socketStatus, setSocketStatus] = useState("disconnected");
  const [cacheStatus, setCacheStatus] = useState(null);
  const [connectedClients, setConnectedClients] = useState(0);
  const [newFeedIds, setNewFeedIds] = useState(new Set());
  const seenEventIds = useRef(new Set());

  const fetchFeeds = useCallback(async ({ page = 1, category } = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await feedApi.getAll({ page, category });
      setFeeds(result.feeds);
      setPagination(result.pagination);
      setCacheStatus({ status: result.cacheStatus, backend: result.cacheBackend });
    } catch (err) {
      setError(err.message || "Failed to load feeds");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleNewFeed = useCallback((payload) => {
    const { feed } = payload;
    const eventId = feed._id || feed.id;
    if (seenEventIds.current.has(eventId)) return;
    seenEventIds.current.add(eventId);
    if (seenEventIds.current.size > 500) {
      const arr = [...seenEventIds.current];
      seenEventIds.current = new Set(arr.slice(-200));
    }
    setFeeds((prev) => [feed, ...prev]);
    setNewFeedIds((prev) => new Set([...prev, eventId]));
    setTimeout(() => {
      setNewFeedIds((prev) => {
        const next = new Set(prev);
        next.delete(eventId);
        return next;
      });
    }, 3000);
  }, []);

  useEffect(() => {
    fetchFeeds();
    const socket = connectSocket();
    const onConnect = () => setSocketStatus("connected");
    const onDisconnect = (reason) => {
      setSocketStatus("disconnected");
      if (reason === "io server disconnect") socket.connect();
    };
    const onReconnect = () => { setSocketStatus("connected"); fetchFeeds(); };
    const onError = () => setSocketStatus("error");
    const onClientCount = ({ count }) => setConnectedClients(count);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("reconnect", onReconnect);
    socket.on("connect_error", onError);
    socket.on("new_feed", handleNewFeed);
    socket.on("client_count", onClientCount);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("reconnect", onReconnect);
      socket.off("connect_error", onError);
      socket.off("new_feed", handleNewFeed);
      socket.off("client_count", onClientCount);
    };
  }, [fetchFeeds, handleNewFeed]);

  return { feeds, pagination, loading, error, socketStatus, cacheStatus, connectedClients, newFeedIds, fetchFeeds };
};
