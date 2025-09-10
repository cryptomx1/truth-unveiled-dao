import { useState, useEffect, useCallback } from 'react';
// Constants
const STORAGE_KEY = 'pendingReplayQueue';
const MAX_QUEUE_SIZE = 25;
const MAX_RETRIES = 3;
// Queue management utility
const saveQueue = (queue) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    }
    catch (error) {
        console.warn('📥 Failed to save replay queue:', error);
    }
};
const loadQueue = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    }
    catch (error) {
        console.warn('📥 Failed to load replay queue:', error);
        return [];
    }
};
export const useOfflineReplayBuffer = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [queue, setQueue] = useState(() => loadQueue());
    const [isProcessing, setIsProcessing] = useState(false);
    // Monitor online status
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            console.log('🌐 Connection restored - preparing to flush replay queue');
        };
        const handleOffline = () => {
            setIsOnline(false);
            console.log('🌐 Connection lost - replay actions will be queued');
        };
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);
    // Auto-flush queue when coming online
    useEffect(() => {
        if (isOnline && queue.length > 0 && !isProcessing) {
            console.log(`📤 Auto-flushing ${queue.length} queued replay actions`);
            flushQueue();
        }
    }, [isOnline, queue.length, isProcessing]);
    // Save queue to localStorage whenever it changes
    useEffect(() => {
        saveQueue(queue);
    }, [queue]);
    // Add action to offline queue
    const addToQueue = useCallback((action) => {
        if (isOnline) {
            // If online, execute immediately (this would normally call replayFromMemory)
            console.log('🔄 Executing replay action immediately (online)');
            return;
        }
        if (queue.length >= MAX_QUEUE_SIZE) {
            console.warn('⚠️ Replay buffer limit exceeded (cap at 25 items)');
            // Remove oldest item to make room
            setQueue(prev => prev.slice(1));
        }
        const replayAction = {
            id: `replay_${Date.now()}_${Math.random().toString(36).substring(2)}`,
            timestamp: Date.now(),
            retries: 0,
            ...action
        };
        setQueue(prev => [...prev, replayAction]);
        console.log('📥 Queued replay action for later sync');
    }, [isOnline, queue.length]);
    // Flush queue when online
    const flushQueue = useCallback(async () => {
        if (!isOnline || queue.length === 0 || isProcessing) {
            return;
        }
        setIsProcessing(true);
        console.log(`📤 Flushing offline replay queue (${queue.length} actions)`);
        const failedActions = [];
        for (const action of queue) {
            try {
                // Simulate replay execution with delay
                await new Promise(resolve => setTimeout(resolve, 100));
                // Mock replay execution success
                console.log(`🔄 Replayed action: ${action.type} (${action.id})`);
                // In real implementation, this would call the actual replay function
                // await replayFromMemory(action.data);
            }
            catch (error) {
                console.warn(`❌ Failed to replay action ${action.id}:`, error);
                if (action.retries < MAX_RETRIES) {
                    failedActions.push({
                        ...action,
                        retries: action.retries + 1
                    });
                }
                else {
                    console.error(`🚫 Dropping action ${action.id} after ${MAX_RETRIES} retries`);
                }
            }
        }
        // Update queue with only failed actions (for retry)
        setQueue(failedActions);
        setIsProcessing(false);
        if (failedActions.length === 0) {
            console.log('📤 Flushed offline replay queue successfully');
        }
        else {
            console.log(`📤 Flushed offline replay queue with ${failedActions.length} retries pending`);
        }
    }, [isOnline, queue, isProcessing]);
    // Clear entire queue
    const clearQueue = useCallback(() => {
        setQueue([]);
        localStorage.removeItem(STORAGE_KEY);
        console.log('🗑️ Replay queue cleared');
    }, []);
    // Get queue status
    const getQueueStatus = useCallback(() => {
        const pending = queue.filter(action => action.retries === 0).length;
        const failed = queue.filter(action => action.retries > 0).length;
        return { pending, failed };
    }, [queue]);
    return {
        isOnline,
        queueLength: queue.length,
        isProcessing,
        addToQueue,
        flushQueue,
        clearQueue,
        getQueueStatus
    };
};
